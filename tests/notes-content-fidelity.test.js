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
