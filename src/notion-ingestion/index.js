"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");

const {
  DEFAULT_NOTION_VERSION,
  extractPageTitle,
  getBlockChildrenTree,
  getPage,
} = require("./internal/notion-api-adapter");
const { normalizeNotionTopic } = require("./internal/normalize-notion-tree");

function assertNonEmptyString(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${label} must be a non-empty string.`);
  }

  return value.trim();
}

function validateNormalizedTopicDocument(topicDocument) {
  if (!topicDocument || typeof topicDocument !== "object") {
    throw new Error("Normalized topic document must be an object.");
  }

  if (typeof topicDocument.title !== "string" || topicDocument.title.trim() === "") {
    throw new Error("Normalized topic document must contain a non-empty title.");
  }

  if (!Array.isArray(topicDocument.blocks)) {
    throw new Error("Normalized topic document must contain a blocks array.");
  }
}

async function readJsonFromFile(absolutePath) {
  const raw = await fs.readFile(absolutePath, "utf8");

  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`Failed to parse JSON file ${absolutePath}: ${error.message}`);
  }
}

function createNotionIngestionContext({ fetchImpl = globalThis.fetch, strictMode = true } = {}) {
  if (typeof fetchImpl !== "function") {
    throw new Error("A fetch implementation is required for Notion ingestion.");
  }

  async function pullTopicFromNotion({
    pageId,
    notionToken,
    notionVersion = DEFAULT_NOTION_VERSION,
  }) {
    const normalizedPageId = assertNonEmptyString(pageId, "pageId");
    const normalizedToken = assertNonEmptyString(notionToken, "notionToken");
    const page = await getPage({
      fetchImpl,
      pageId: normalizedPageId,
      notionToken: normalizedToken,
      notionVersion,
    });

    const title = extractPageTitle(page) ?? normalizedPageId;
    const blocks = await getBlockChildrenTree({
      fetchImpl,
      blockId: normalizedPageId,
      notionToken: normalizedToken,
      notionVersion,
    });

    return normalizeNotionTopic({
      pageId: normalizedPageId,
      title,
      blocks,
      strictMode,
    });
  }

  function normalizeRawNotionPayload({ pageId, title, blocks }) {
    return normalizeNotionTopic({
      pageId,
      title,
      blocks,
      strictMode,
    });
  }

  async function readNormalizedTopicFile({ filePath }) {
    const absolutePath = path.resolve(process.cwd(), assertNonEmptyString(filePath, "filePath"));
    const parsed = await readJsonFromFile(absolutePath);
    validateNormalizedTopicDocument(parsed);
    return parsed;
  }

  async function writeNormalizedTopicFile({ topicDocument, filePath }) {
    validateNormalizedTopicDocument(topicDocument);
    const absolutePath = path.resolve(process.cwd(), assertNonEmptyString(filePath, "filePath"));
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(`${absolutePath}`, `${JSON.stringify(topicDocument, null, 2)}\n`, "utf8");
  }

  return {
    normalizeRawNotionPayload,
    pullTopicFromNotion,
    readNormalizedTopicFile,
    writeNormalizedTopicFile,
  };
}

module.exports = {
  createNotionIngestionContext,
};

