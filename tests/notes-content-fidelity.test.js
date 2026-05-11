"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const { createNotesContentContext } = require("../src/notes-content");

function makeTopic(blocks) {
  return {
    title: "Topic",
    description: "Description",
    blocks,
  };
}

test("renders inline and block LaTeX while preserving source expression", () => {
  const notesContext = createNotesContentContext();
  const topic = makeTopic([
    {
      type: "paragraph",
      richText: [
        { type: "text", content: "Inline math: ", annotations: {}, href: null },
        { type: "equation", expression: "E=mc^2" },
      ],
    },
    {
      type: "equation",
      expression: "\\int_0^1 x^2 dx = \\frac{1}{3}",
    },
  ]);

  const html = notesContext.renderTopicBody(topic);

  assert.ok(html.includes('data-latex="E=mc^2"'));
  assert.ok(html.includes("\\(E=mc^2\\)"));
  assert.ok(html.includes("data-latex=\"\\int_0^1 x^2 dx = \\frac{1}{3}\""));
  assert.ok(html.includes("\\[\\int_0^1 x^2 dx = \\frac{1}{3}\\]"));
});

test("preserves code block content and escapes HTML-sensitive characters", () => {
  const notesContext = createNotesContentContext();
  const code = "if (a < b) {\n  return a;\n}\n";
  const topic = makeTopic([
    {
      type: "code",
      language: "javascript",
      code,
    },
  ]);

  const html = notesContext.renderTopicBody(topic);

  assert.ok(html.includes('data-language="javascript"'));
  assert.ok(html.includes("if (a &lt; b) {\n  return a;\n}\n"));
});

test("renders normalized notion tables and assets", () => {
  const notesContext = createNotesContentContext();
  const topic = makeTopic([
    {
      type: "table",
      hasColumnHeader: true,
      rows: [
        {
          cells: [
            [{ type: "text", content: "Term", annotations: { bold: true }, href: null }],
            [{ type: "text", content: "Meaning", annotations: {}, href: null }],
          ],
        },
        {
          cells: [
            [{ type: "text", content: "DP", annotations: {}, href: null }],
            [{ type: "equation", expression: "O(n^2)" }],
          ],
        },
      ],
    },
    {
      type: "child_database",
      title: "Reading List",
      blockId: "database-1",
    },
    {
      type: "asset",
      kind: "image",
      url: "https://example.com/diagram.png",
      caption: [{ type: "text", content: "State diagram", annotations: {}, href: null }],
    },
    {
      type: "asset",
      kind: "file",
      name: "proof.pdf",
      url: "https://example.com/proof.pdf",
      caption: [{ type: "text", content: "Full proof", annotations: {}, href: null }],
    },
  ]);

  const html = notesContext.renderTopicBody(topic);

  assert.ok(html.includes("<table"));
  assert.ok(html.includes("<th><strong>Term</strong></th>"));
  assert.ok(html.includes("\\(O(n^2)\\)"));
  assert.ok(html.includes('class="note-child-database"'));
  assert.ok(html.includes("Reading List"));
  assert.ok(html.includes('<img src="https://example.com/diagram.png" alt="State diagram"'));
  assert.ok(html.includes('href="https://example.com/proof.pdf"'));
  assert.ok(html.includes("proof.pdf"));
});

test("allows safe raster data image assets without relaxing rich text links", () => {
  const notesContext = createNotesContentContext();
  const safeDataImage =
    "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";
  const topic = makeTopic([
    {
      type: "asset",
      kind: "image",
      url: safeDataImage,
      caption: [{ type: "text", content: "Inline Notion image", annotations: {}, href: null }],
    },
  ]);

  const html = notesContext.renderTopicBody(topic);

  assert.ok(html.includes(`src="${safeDataImage}"`));
  assert.throws(
    () =>
      notesContext.renderTopicBody(
        makeTopic([
          {
            type: "paragraph",
            richText: [
              {
                type: "text",
                content: "unsafe link",
                annotations: {},
                href: safeDataImage,
              },
            ],
          },
        ]),
      ),
    /Unsupported URL protocol in rich text href: data:/,
  );
  assert.throws(
    () =>
      notesContext.renderTopicBody(
        makeTopic([
          {
            type: "asset",
            kind: "image",
            url: "data:image/svg+xml;base64,PHN2Zy8+",
            caption: [],
          },
        ]),
      ),
    /Unsupported asset data URL/,
  );
});

test("renders normalized toggle and callout blocks with nested content", () => {
  const notesContext = createNotesContentContext();
  const topic = makeTopic([
    {
      type: "toggle",
      richText: [{ type: "text", content: "Why this works", annotations: {}, href: null }],
      children: [
        {
          type: "paragraph",
          richText: [{ type: "text", content: "Nested explanation", annotations: {}, href: null }],
        },
      ],
    },
    {
      type: "callout",
      icon: { emoji: "!" },
      richText: [{ type: "text", content: "Important detail", annotations: {}, href: null }],
      children: [
        {
          type: "paragraph",
          richText: [{ type: "text", content: "Callout child", annotations: {}, href: null }],
        },
      ],
    },
  ]);

  const html = notesContext.renderTopicBody(topic);
  const searchEntry = notesContext.createSearchEntry({ slug: "topic", topicDocument: topic });

  assert.ok(html.includes("<details"));
  assert.ok(html.includes("<summary>Why this works</summary>"));
  assert.ok(html.includes("Nested explanation"));
  assert.ok(html.includes('class="note-callout"'));
  assert.ok(html.includes('class="note-callout-icon"'));
  assert.ok(html.includes("Important detail"));
  assert.ok(searchEntry.searchableText.includes("Nested explanation"));
  assert.ok(searchEntry.searchableText.includes("Important detail"));
});

test("renders notion-compatible formatting structure for layout and annotations", () => {
  const notesContext = createNotesContentContext();
  const topic = makeTopic([
    {
      type: "heading",
      level: 4,
      blockId: "heading-4",
      color: "blue_background",
      richText: [{ type: "text", content: "Detailed Aside", annotations: {}, href: null }],
    },
    {
      type: "paragraph",
      color: "gray",
      richText: [
        {
          type: "text",
          content: "Colored emphasis",
          annotations: { bold: true, color: "red" },
          href: null,
        },
      ],
    },
    {
      type: "to_do",
      blockId: "todo-1",
      checked: true,
      richText: [{ type: "text", content: "Verify proof", annotations: {}, href: null }],
    },
    {
      type: "column_list",
      children: [
        {
          type: "column",
          widthRatio: 0.35,
          children: [
            {
              type: "paragraph",
              richText: [{ type: "text", content: "Left column", annotations: {}, href: null }],
            },
          ],
        },
        {
          type: "column",
          widthRatio: 0.65,
          children: [
            {
              type: "paragraph",
              richText: [{ type: "text", content: "Right column", annotations: {}, href: null }],
            },
          ],
        },
      ],
    },
    {
      type: "code",
      language: "javascript",
      code: "const x = 1;\n",
      caption: [{ type: "text", content: "Executable sketch", annotations: {}, href: null }],
    },
  ]);

  const html = notesContext.renderTopicBody(topic);
  const searchEntry = notesContext.createSearchEntry({ slug: "topic", topicDocument: topic });

  assert.ok(html.includes('class="note-article notion-page-content"'));
  assert.ok(html.includes('data-notion-block-id="heading-4"'));
  assert.ok(html.includes('class="notion-block notion-heading notion-heading-4 notion-color-blue_background"'));
  assert.ok(html.includes('class="notion-rich-text notion-color-red"'));
  assert.ok(html.includes('class="notion-block notion-paragraph notion-color-gray"'));
  assert.ok(html.includes('class="notion-block notion-to-do notion-to-do-checked"'));
  assert.ok(html.includes('type="checkbox" checked disabled'));
  assert.ok(html.includes('class="notion-column-list"'));
  assert.ok(html.includes('style="--notion-column-width: 35%;"'));
  assert.ok(html.includes('style="--notion-column-width: 65%;"'));
  assert.ok(html.includes('<figcaption class="notion-caption">Executable sketch</figcaption>'));
  assert.ok(searchEntry.searchableText.includes("Executable sketch"));
  assert.ok(searchEntry.searchableText.includes("Left column"));
  assert.ok(searchEntry.searchableText.includes("Verify proof"));
});

test("renders child page links and includes subpage titles in search text", () => {
  const notesContext = createNotesContentContext();
  const topic = makeTopic([
    {
      type: "child_page",
      blockId: "child-page-1",
      title: "Dynamic Programming",
      href: "/topics/algorithms/dynamic-programming/",
    },
    {
      type: "child_page",
      blockId: "child-page-2",
      title: "",
    },
  ]);

  const html = notesContext.renderTopicBody(topic);
  const searchEntry = notesContext.createSearchEntry({ slug: "algorithms", topicDocument: topic });

  assert.ok(html.includes('class="note-child-page-link"'));
  assert.ok(html.includes('href="/topics/algorithms/dynamic-programming/"'));
  assert.ok(html.includes("Dynamic Programming"));
  assert.ok(html.includes("Untitled subpage"));
  assert.ok(searchEntry.searchableText.includes("Dynamic Programming"));
});

test("throws on unsupported block types to avoid silent fidelity loss", () => {
  const notesContext = createNotesContentContext();
  const topic = makeTopic([
    {
      type: "unsupported_embed",
    },
  ]);

  assert.throws(
    () => notesContext.renderTopicBody(topic),
    /Unsupported block type "unsupported_embed"/,
  );
});
