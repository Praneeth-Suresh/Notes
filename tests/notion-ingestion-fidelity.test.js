"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const { createNotionIngestionContext } = require("../src/notion-ingestion");

test("normalizes code and equation blocks from notion payload", () => {
  const notionContext = createNotionIngestionContext({
    fetchImpl: async () => {
      throw new Error("fetch should not be called for normalization unit test");
    },
  });

  const normalized = notionContext.normalizeRawNotionPayload({
    pageId: "page-1",
    title: "Algorithms",
    blocks: [
      {
        type: "paragraph",
        paragraph: {
          rich_text: [
            {
              type: "text",
              text: { content: "The recurrence is " },
              annotations: {},
              href: null,
            },
            {
              type: "equation",
              equation: { expression: "T(n)=2T(n/2)+n" },
              annotations: {},
              href: null,
            },
          ],
        },
      },
      {
        type: "code",
        code: {
          language: "python",
          rich_text: [
            {
              type: "text",
              text: { content: "print('hello')\n" },
              annotations: {},
              href: null,
            },
          ],
        },
      },
      {
        type: "equation",
        equation: { expression: "\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}" },
      },
    ],
  });

  assert.equal(normalized.title, "Algorithms");
  assert.equal(normalized.blocks[0].type, "paragraph");
  assert.equal(normalized.blocks[0].richText[1].type, "equation");
  assert.equal(normalized.blocks[1].type, "code");
  assert.equal(normalized.blocks[1].code, "print('hello')\n");
  assert.equal(normalized.blocks[2].expression, "\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}");
});

test("fails on unsupported block types in strict fidelity mode", () => {
  const notionContext = createNotionIngestionContext({
    fetchImpl: async () => {
      throw new Error("fetch should not be called for normalization unit test");
    },
    strictMode: true,
  });

  assert.throws(
    () =>
      notionContext.normalizeRawNotionPayload({
        pageId: "page-2",
        title: "Unsupported",
        blocks: [{ type: "table", table: {} }],
      }),
    /Unsupported notion block type "table"/,
  );
});

