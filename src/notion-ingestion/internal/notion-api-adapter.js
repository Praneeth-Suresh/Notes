"use strict";

const NOTION_API_BASE_URL = "https://api.notion.com/v1";
const DEFAULT_NOTION_VERSION = "2022-06-28";

function assertNonEmptyString(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${label} must be a non-empty string.`);
  }

  return value.trim();
}

function buildNotionHeaders({ notionToken, notionVersion }) {
  return {
    Authorization: `Bearer ${assertNonEmptyString(notionToken, "notionToken")}`,
    "Notion-Version": notionVersion ?? DEFAULT_NOTION_VERSION,
    "Content-Type": "application/json",
  };
}

async function notionRequest({ fetchImpl, path, notionToken, notionVersion }) {
  if (typeof fetchImpl !== "function") {
    throw new Error("fetchImpl must be a function.");
  }

  const response = await fetchImpl(`${NOTION_API_BASE_URL}${path}`, {
    method: "GET",
    headers: buildNotionHeaders({ notionToken, notionVersion }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Notion API request failed (${response.status} ${response.statusText}) for ${path}: ${body}`,
    );
  }

  return response.json();
}

async function getPage({ fetchImpl, pageId, notionToken, notionVersion }) {
  const encodedPageId = encodeURIComponent(assertNonEmptyString(pageId, "pageId"));
  return notionRequest({
    fetchImpl,
    path: `/pages/${encodedPageId}`,
    notionToken,
    notionVersion,
  });
}

async function listBlockChildrenPage({
  fetchImpl,
  blockId,
  notionToken,
  notionVersion,
  startCursor,
}) {
  const encodedBlockId = encodeURIComponent(assertNonEmptyString(blockId, "blockId"));
  const params = new URLSearchParams({ page_size: "100" });

  if (startCursor) {
    params.set("start_cursor", startCursor);
  }

  return notionRequest({
    fetchImpl,
    path: `/blocks/${encodedBlockId}/children?${params.toString()}`,
    notionToken,
    notionVersion,
  });
}

async function listAllBlockChildren({ fetchImpl, blockId, notionToken, notionVersion }) {
  const results = [];
  let cursor;

  while (true) {
    const page = await listBlockChildrenPage({
      fetchImpl,
      blockId,
      notionToken,
      notionVersion,
      startCursor: cursor,
    });

    if (!Array.isArray(page.results)) {
      throw new Error(`Notion API children response for block ${blockId} is invalid.`);
    }

    results.push(...page.results);

    if (!page.has_more) {
      break;
    }

    cursor = page.next_cursor;
  }

  return results;
}

async function getBlockChildrenTree({ fetchImpl, blockId, notionToken, notionVersion }) {
  const children = await listAllBlockChildren({
    fetchImpl,
    blockId,
    notionToken,
    notionVersion,
  });

  const withNestedChildren = [];

  for (const child of children) {
    if (child && child.has_children) {
      const nestedChildren = await getBlockChildrenTree({
        fetchImpl,
        blockId: child.id,
        notionToken,
        notionVersion,
      });

      withNestedChildren.push({
        ...child,
        children: nestedChildren,
      });
      continue;
    }

    withNestedChildren.push({
      ...child,
      children: [],
    });
  }

  return withNestedChildren;
}

function extractPageTitle(page) {
  if (!page || typeof page !== "object") {
    return null;
  }

  const properties = page.properties;
  if (!properties || typeof properties !== "object") {
    return null;
  }

  for (const value of Object.values(properties)) {
    if (
      value &&
      value.type === "title" &&
      Array.isArray(value.title) &&
      value.title.length > 0
    ) {
      const title = value.title.map((part) => part?.plain_text ?? "").join("");
      if (title.trim() !== "") {
        return title;
      }
    }
  }

  return null;
}

module.exports = {
  DEFAULT_NOTION_VERSION,
  extractPageTitle,
  getBlockChildrenTree,
  getPage,
};

