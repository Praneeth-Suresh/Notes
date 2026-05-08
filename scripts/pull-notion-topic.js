#!/usr/bin/env node
"use strict";

const path = require("node:path");
const readline = require("node:readline/promises");

const { createNotionIngestionContext } = require("../src/notion-ingestion");

function assertNonEmptyString(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${label} must be a non-empty string.`);
  }
  return value.trim();
}

function parseArgs(argv) {
  const args = {
    pageId: null,
    slug: null,
    out: null,
    title: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];

    if (item === "--page-id") {
      args.pageId = assertNonEmptyString(argv[index + 1], "--page-id value");
      index += 1;
      continue;
    }

    if (item === "--slug") {
      args.slug = assertNonEmptyString(argv[index + 1], "--slug value");
      index += 1;
      continue;
    }

    if (item === "--out") {
      args.out = assertNonEmptyString(argv[index + 1], "--out value");
      index += 1;
      continue;
    }

    if (item === "--title") {
      args.title = assertNonEmptyString(argv[index + 1], "--title value");
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${item}`);
  }

  if (!args.pageId) {
    throw new Error("Missing required argument: --page-id");
  }

  if (!args.slug) {
    throw new Error("Missing required argument: --slug");
  }

  if (!/^[a-z0-9-]+$/u.test(args.slug)) {
    throw new Error("--slug must use lowercase letters, digits, and hyphens only.");
  }

  if (!args.out) {
    args.out = path.join("content", "topics", `${args.slug}.normalized.json`);
  }

  return args;
}

function createCliReadErrorPrompt() {
  let rl;

  async function handleReadError(event) {
    console.warn(event.warning);

    if (!rl) {
      rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rl.once("close", () => {
        rl = null;
      });
    }

    while (true) {
      const answer = await rl.question("Choose an action: retry, skip, or abort: ");
      const action = answer.trim().toLowerCase();

      if (action === "retry" || action === "skip" || action === "abort") {
        if (action === "abort") {
          rl.close();
        }
        return action;
      }

      console.warn("Invalid action. Enter retry, skip, or abort.");
    }
  }

  function close() {
    if (rl) {
      rl.close();
      rl = null;
    }
  }

  return {
    close,
    handleReadError,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const notionToken = process.env.NOTION_API_TOKEN;

  if (!notionToken) {
    throw new Error("NOTION_API_TOKEN is required to pull from Notion.");
  }

  const readErrorPrompt = createCliReadErrorPrompt();
  const notionContext = createNotionIngestionContext({
    handleReadError: readErrorPrompt.handleReadError,
  });
  const topicDocument = await notionContext
    .pullTopicFromNotion({
      pageId: args.pageId,
      notionToken,
    })
    .finally(() => {
      readErrorPrompt.close();
    });

  if (args.title) {
    topicDocument.title = args.title;
  }

  await notionContext.writeNormalizedTopicFile({
    topicDocument,
    filePath: args.out,
  });

  console.log(`Wrote normalized topic file: ${args.out}`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`pull-notion-topic failed: ${error.message}`);
    process.exitCode = 1;
  });
}
