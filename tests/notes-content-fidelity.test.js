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

test("throws on unsupported block types to avoid silent fidelity loss", () => {
  const notesContext = createNotesContentContext();
  const topic = makeTopic([
    {
      type: "table",
    },
  ]);

  assert.throws(
    () => notesContext.renderTopicBody(topic),
    /Unsupported block type "table"/,
  );
});

