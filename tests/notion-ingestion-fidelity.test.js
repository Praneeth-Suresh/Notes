"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const { createNotionIngestionContext } = require("../src/notion-ingestion");

function jsonResponse({ status = 200, statusText = "OK", body, headers = {} }) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    headers: {
      get(name) {
        return headers[name.toLowerCase()] ?? null;
      },
    },
    async json() {
      return body;
    },
    async text() {
      return typeof body === "string" ? body : JSON.stringify(body);
    },
  };
}

test("recursively pulls pages from a child database", async () => {
  const fetchImpl = async (url) => {
    if (url.includes("/pages/page-db")) {
      return jsonResponse({
        body: {
          properties: {
            Name: { type: "title", title: [{ plain_text: "Database Topic" }] },
          },
        },
      });
    }

    if (url.includes("/blocks/page-db/children")) {
      return jsonResponse({
        body: {
          results: [
            {
              id: "database-1",
              type: "child_database",
              child_database: { title: "Subtopics" },
            },
          ],
          has_more: false,
        },
      });
    }

    if (url.includes("/databases/database-1/query")) {
      return jsonResponse({
        body: {
          results: [
            {
              id: "entry-1",
              properties: {
                Name: { type: "title", title: [{ plain_text: "Database Entry 1" }] },
              },
            },
          ],
          has_more: false,
        },
      });
    }

    if (url.includes("/blocks/entry-1/children")) {
      return jsonResponse({
        body: {
          results: [
            {
              id: "block-entry-1",
              type: "paragraph",
              paragraph: {
                rich_text: [{ type: "text", text: { content: "Entry Content" } }],
              },
            },
          ],
          has_more: false,
        },
      });
    }

    throw new Error(`Unexpected URL: ${url}`);
  };

  const notionContext = createNotionIngestionContext({ fetchImpl });

  const normalized = await notionContext.pullTopicFromNotion({
    pageId: "page-db",
    notionToken: "secret",
  });

  assert.equal(normalized.blocks[0].type, "child_database");
  assert.equal(normalized.blocks[0].children[0].type, "child_page");
  assert.equal(normalized.blocks[0].children[0].title, "Database Entry 1");
  assert.equal(normalized.blocks[0].children[0].children[0].richText[0].content, "Entry Content");
});

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

test("retries transient fetch failures when pulling from notion", async () => {
  const delays = [];
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(url);

    if (calls.length === 1) {
      throw new TypeError("fetch failed");
    }

    if (url.includes("/pages/page-3")) {
      return jsonResponse({
        body: {
          properties: {
            Name: {
              type: "title",
              title: [{ plain_text: "Retry Topic" }],
            },
          },
        },
      });
    }

    return jsonResponse({
      body: {
        results: [
          {
            id: "block-1",
            type: "paragraph",
            paragraph: {
              rich_text: [{ type: "text", text: { content: "Recovered" } }],
            },
          },
        ],
        has_more: false,
      },
    });
  };

  const notionContext = createNotionIngestionContext({
    fetchImpl,
    retryDelayMs: 25,
    delayImpl: async (ms) => {
      delays.push(ms);
    },
  });

  const normalized = await notionContext.pullTopicFromNotion({
    pageId: "page-3",
    notionToken: "secret",
  });

  assert.deepEqual(delays, [25]);
  assert.equal(normalized.title, "Retry Topic");
  assert.equal(normalized.blocks[0].richText[0].content, "Recovered");
});

test("honors retry-after when notion rate limits a request", async () => {
  const delays = [];
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(url);

    if (calls.length === 1) {
      return jsonResponse({
        status: 429,
        statusText: "Too Many Requests",
        headers: { "retry-after": "2" },
        body: { message: "rate limited" },
      });
    }

    if (url.includes("/pages/page-4")) {
      return jsonResponse({
        body: {
          properties: {
            Name: {
              type: "title",
              title: [{ plain_text: "Rate Limited Topic" }],
            },
          },
        },
      });
    }

    return jsonResponse({
      body: {
        results: [],
        has_more: false,
      },
    });
  };

  const notionContext = createNotionIngestionContext({
    fetchImpl,
    retryDelayMs: 25,
    delayImpl: async (ms) => {
      delays.push(ms);
    },
  });

  const normalized = await notionContext.pullTopicFromNotion({
    pageId: "page-4",
    notionToken: "secret",
  });

  assert.deepEqual(delays, [2000]);
  assert.equal(normalized.title, "Rate Limited Topic");
  assert.equal(normalized.blocks.length, 0);
});

test("does not retry authorization failures and reports token guidance", async () => {
  const delays = [];
  let calls = 0;
  const notionContext = createNotionIngestionContext({
    fetchImpl: async () => {
      calls += 1;
      return jsonResponse({
        status: 401,
        statusText: "Unauthorized",
        body: { message: "invalid token" },
      });
    },
    delayImpl: async (ms) => {
      delays.push(ms);
    },
  });

  await assert.rejects(
    () =>
      notionContext.pullTopicFromNotion({
        pageId: "page-auth",
        notionToken: "bad-token",
      }),
    /Check NOTION_API_TOKEN/,
  );
  assert.equal(calls, 1);
  assert.deepEqual(delays, []);
});

test("requests user action and skips a failing nested block read", async () => {
  const recoveries = [];
  const fetchImpl = async (url) => {
    if (url.includes("/pages/page-recover")) {
      return jsonResponse({
        body: {
          properties: {
            Name: {
              type: "title",
              title: [{ plain_text: "Recoverable Topic" }],
            },
          },
        },
      });
    }

    if (url.includes("/blocks/page-recover/children")) {
      return jsonResponse({
        body: {
          results: [
            {
              id: "parent-1",
              type: "paragraph",
              has_children: true,
              paragraph: {
                rich_text: [{ type: "text", text: { content: "Keep parent" } }],
              },
            },
            {
              id: "sibling-1",
              type: "paragraph",
              paragraph: {
                rich_text: [{ type: "text", text: { content: "Keep sibling" } }],
              },
            },
          ],
          has_more: false,
        },
      });
    }

    if (url.includes("/blocks/parent-1/children")) {
      return jsonResponse({
        status: 500,
        statusText: "Internal Server Error",
        body: { message: "temporary nested failure" },
      });
    }

    throw new Error(`Unexpected URL: ${url}`);
  };

  const notionContext = createNotionIngestionContext({
    fetchImpl,
    maxRequestRetries: 0,
    handleReadError: async (event) => {
      recoveries.push(event);
      return "skip";
    },
  });

  const normalized = await notionContext.pullTopicFromNotion({
    pageId: "page-recover",
    notionToken: "secret",
  });

  assert.equal(recoveries.length, 1);
  assert.equal(recoveries[0].operation, "listBlockChildren");
  assert.equal(recoveries[0].blockId, "parent-1");
  assert.match(recoveries[0].warning, /Warning: Notion read failed/);
  assert.equal(normalized.blocks.length, 2);
  assert.equal(normalized.blocks[0].richText[0].content, "Keep parent");
  assert.equal(normalized.blocks[0].children, undefined);
  assert.equal(normalized.blocks[1].richText[0].content, "Keep sibling");
});

test("requests user action and retries a failed page read", async () => {
  const recoveries = [];
  let pageCalls = 0;
  const fetchImpl = async (url) => {
    if (url.includes("/pages/page-retry")) {
      pageCalls += 1;
      if (pageCalls === 1) {
        return jsonResponse({
          status: 503,
          statusText: "Service Unavailable",
          body: { message: "try again" },
        });
      }

      return jsonResponse({
        body: {
          properties: {
            Name: {
              type: "title",
              title: [{ plain_text: "Retried Topic" }],
            },
          },
        },
      });
    }

    if (url.includes("/blocks/page-retry/children")) {
      return jsonResponse({
        body: {
          results: [],
          has_more: false,
        },
      });
    }

    throw new Error(`Unexpected URL: ${url}`);
  };

  const notionContext = createNotionIngestionContext({
    fetchImpl,
    maxRequestRetries: 0,
    handleReadError: async (event) => {
      recoveries.push(event);
      return "retry";
    },
  });

  const normalized = await notionContext.pullTopicFromNotion({
    pageId: "page-retry",
    notionToken: "secret",
  });

  assert.equal(pageCalls, 2);
  assert.equal(recoveries.length, 1);
  assert.equal(recoveries[0].operation, "getPage");
  assert.equal(normalized.title, "Retried Topic");
});

test("requests user action and aborts a failed block read", async () => {
  const fetchImpl = async (url) => {
    if (url.includes("/pages/page-abort")) {
      return jsonResponse({
        body: {
          properties: {
            Name: {
              type: "title",
              title: [{ plain_text: "Abort Topic" }],
            },
          },
        },
      });
    }

    if (url.includes("/blocks/page-abort/children")) {
      return jsonResponse({
        status: 403,
        statusText: "Forbidden",
        body: { message: "missing page access" },
      });
    }

    throw new Error(`Unexpected URL: ${url}`);
  };

  const notionContext = createNotionIngestionContext({
    fetchImpl,
    handleReadError: async () => "abort",
  });

  await assert.rejects(
    () =>
      notionContext.pullTopicFromNotion({
        pageId: "page-abort",
        notionToken: "secret",
      }),
    /missing page access/,
  );
});

test("normalizes mention rich text and empty equations without losing surrounding content", () => {
  const notionContext = createNotionIngestionContext({
    fetchImpl: async () => {
      throw new Error("fetch should not be called for normalization unit test");
    },
  });

  const normalized = notionContext.normalizeRawNotionPayload({
    pageId: "page-5",
    title: "Mentions and Equations",
    blocks: [
      {
        type: "paragraph",
        paragraph: {
          rich_text: [
            { type: "text", text: { content: "See " }, annotations: {} },
            {
              type: "mention",
              plain_text: "Graph Theory",
              href: "https://notion.so/graph-theory",
              annotations: { bold: true },
            },
            { type: "text", text: { content: " for " }, annotations: {} },
            { type: "equation", equation: {}, annotations: {} },
          ],
        },
      },
      {
        id: "empty-equation-block",
        type: "equation",
        equation: {},
      },
    ],
  });

  assert.equal(normalized.blocks[0].richText[1].type, "text");
  assert.equal(normalized.blocks[0].richText[1].content, "Graph Theory");
  assert.equal(normalized.blocks[0].richText[1].href, "https://notion.so/graph-theory");
  assert.equal(normalized.blocks[0].richText[3].type, "equation");
  assert.equal(normalized.blocks[0].richText[3].expression, "");
  assert.equal(normalized.blocks[1].expression, "");
});

test("normalizes notion tables, child databases, and assets", () => {
  const notionContext = createNotionIngestionContext({
    fetchImpl: async () => {
      throw new Error("fetch should not be called for normalization unit test");
    },
  });

  const normalized = notionContext.normalizeRawNotionPayload({
    pageId: "page-6",
    title: "Structured Blocks",
    blocks: [
      {
        id: "table-1",
        type: "table",
        table: { table_width: 2, has_column_header: true, has_row_header: false },
        children: [
          {
            id: "row-1",
            type: "table_row",
            table_row: {
              cells: [
                [{ type: "text", text: { content: "Term" }, annotations: { bold: true } }],
                [{ type: "text", text: { content: "Meaning" }, annotations: {} }],
              ],
            },
          },
          {
            id: "row-2",
            type: "table_row",
            table_row: {
              cells: [
                [{ type: "text", text: { content: "DP" }, annotations: {} }],
                [{ type: "equation", equation: { expression: "O(n^2)" }, annotations: {} }],
              ],
            },
          },
        ],
      },
      {
        id: "database-1",
        type: "child_database",
        child_database: { title: "Reading List" },
      },
      {
        id: "image-1",
        type: "image",
        image: {
          type: "external",
          external: { url: "https://example.com/diagram.png" },
          caption: [{ type: "text", text: { content: "State diagram" }, annotations: {} }],
        },
      },
      {
        id: "file-1",
        type: "file",
        file: {
          type: "file",
          name: "proof.pdf",
          file: { url: "https://example.com/proof.pdf" },
          caption: [{ type: "text", text: { content: "Full proof" }, annotations: {} }],
        },
      },
    ],
  });

  assert.equal(normalized.blocks[0].type, "table");
  assert.equal(normalized.blocks[0].hasColumnHeader, true);
  assert.equal(normalized.blocks[0].rows[0].cells[0][0].content, "Term");
  assert.equal(normalized.blocks[0].rows[1].cells[1][0].expression, "O(n^2)");
  assert.equal(normalized.blocks[1].type, "child_database");
  assert.equal(normalized.blocks[1].title, "Reading List");
  assert.equal(normalized.blocks[2].type, "asset");
  assert.equal(normalized.blocks[2].kind, "image");
  assert.equal(normalized.blocks[2].caption[0].content, "State diagram");
  assert.equal(normalized.blocks[3].type, "asset");
  assert.equal(normalized.blocks[3].kind, "file");
  assert.equal(normalized.blocks[3].name, "proof.pdf");
});

test("normalizes all documented notion block types without silent fidelity loss", () => {
  const notionContext = createNotionIngestionContext({
    fetchImpl: async () => {
      throw new Error("fetch should not be called for normalization unit test");
    },
  });
  const richText = (content) => [
    {
      type: "text",
      text: { content },
      annotations: { bold: true, color: "blue" },
    },
  ];

  const normalized = notionContext.normalizeRawNotionPayload({
    pageId: "page-all-blocks",
    title: "All Blocks",
    blocks: [
      { id: "audio-1", type: "audio", audio: { type: "external", external: { url: "https://example.com/a.mp3" }, caption: richText("Audio") } },
      { id: "bookmark-1", type: "bookmark", bookmark: { url: "https://example.com", caption: richText("Bookmark") } },
      { id: "breadcrumb-1", type: "breadcrumb", breadcrumb: {} },
      { id: "callout-1", type: "callout", callout: { rich_text: richText("Callout"), icon: { emoji: "!" }, color: "yellow_background" } },
      { id: "child-page-1", type: "child_page", child_page: { title: "Child Page" } },
      { id: "column-list-1", type: "column_list", column_list: {}, children: [{ id: "column-1", type: "column", column: { width_ratio: 0.5 } }] },
      { id: "embed-1", type: "embed", embed: { url: "https://example.com/embed" } },
      { id: "heading-4-1", type: "heading_4", heading_4: { rich_text: richText("Heading 4"), color: "green", is_toggleable: true } },
      { id: "link-preview-1", type: "link_preview", link_preview: { url: "https://example.com/preview" } },
      { id: "meeting-1", type: "meeting_notes", meeting_notes: { title: richText("Meeting"), status: "notes_ready", children: { summary_block_id: "summary-1" }, calendar_event: { start_time: "2026-01-01T00:00:00.000Z" }, recording: { start_time: "2026-01-01T00:00:00.000Z" } } },
      { id: "pdf-1", type: "pdf", pdf: { type: "external", external: { url: "https://example.com/doc.pdf" }, caption: richText("PDF") } },
      { id: "synced-1", type: "synced_block", synced_block: { synced_from: { type: "block_id", block_id: "source-1" } } },
      { id: "toc-1", type: "table_of_contents", table_of_contents: { color: "gray" } },
      { id: "table-row-1", type: "table_row", table_row: { cells: [richText("Cell")] } },
      { id: "tab-1", type: "tab", tab: {}, children: [{ id: "tab-label-1", type: "paragraph", paragraph: { rich_text: richText("Tab Label") } }] },
      { id: "template-1", type: "template", template: { rich_text: richText("Template") } },
      { id: "todo-1", type: "to_do", to_do: { rich_text: richText("Task"), checked: true, color: "red" } },
      { id: "toggle-1", type: "toggle", toggle: { rich_text: richText("Toggle"), color: "purple" } },
      { id: "transcription-1", type: "transcription", transcription: { title: richText("Transcript"), status: "notes_ready", children: { transcript_block_id: "transcript-1" } } },
      { id: "unsupported-1", type: "unsupported", unsupported: { block_type: "button" } },
      { id: "video-1", type: "video", video: { type: "external", external: { url: "https://example.com/video.mp4" }, caption: richText("Video") } },
    ],
  });

  const byId = new Map(normalized.blocks.map((block) => [block.blockId, block]));

  assert.equal(byId.get("audio-1").type, "asset");
  assert.equal(byId.get("audio-1").kind, "audio");
  assert.equal(byId.get("bookmark-1").type, "bookmark");
  assert.equal(byId.get("breadcrumb-1").type, "breadcrumb");
  assert.equal(byId.get("callout-1").icon.emoji, "!");
  assert.equal(byId.get("callout-1").richText[0].annotations.color, "blue");
  assert.equal(byId.get("child-page-1").title, "Child Page");
  assert.equal(byId.get("column-list-1").children[0].type, "column");
  assert.equal(byId.get("column-list-1").children[0].widthRatio, 0.5);
  assert.equal(byId.get("embed-1").url, "https://example.com/embed");
  assert.equal(byId.get("heading-4-1").level, 4);
  assert.equal(byId.get("heading-4-1").isToggleable, true);
  assert.equal(byId.get("link-preview-1").url, "https://example.com/preview");
  assert.equal(byId.get("meeting-1").title[0].content, "Meeting");
  assert.equal(byId.get("meeting-1").sectionBlockIds.summary, "summary-1");
  assert.equal(byId.get("pdf-1").kind, "pdf");
  assert.equal(byId.get("synced-1").syncedFrom.block_id, "source-1");
  assert.equal(byId.get("toc-1").color, "gray");
  assert.equal(byId.get("table-row-1").cells[0][0].content, "Cell");
  assert.equal(byId.get("tab-1").children[0].richText[0].content, "Tab Label");
  assert.equal(byId.get("template-1").richText[0].content, "Template");
  assert.equal(byId.get("todo-1").checked, true);
  assert.equal(byId.get("toggle-1").richText[0].content, "Toggle");
  assert.equal(byId.get("transcription-1").notionType, "transcription");
  assert.equal(byId.get("unsupported-1").blockType, "button");
  assert.equal(byId.get("video-1").kind, "video");
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
        blocks: [{ type: "unsupported_embed", unsupported_embed: {} }],
      }),
    /Unsupported notion block type "unsupported_embed"/,
  );
});
