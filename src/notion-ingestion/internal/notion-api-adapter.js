"use strict";

const NOTION_API_BASE_URL = "https://api.notion.com/v1";
const DEFAULT_NOTION_VERSION = "2022-06-28";
const DEFAULT_MAX_REQUEST_RETRIES = 3;
const DEFAULT_RETRY_DELAY_MS = 500;
const MAX_RETRY_AFTER_DELAY_MS = 30000;

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

function createNotionApiError({ status, statusText, path, body }) {
  let guidance = "";
  if (status === 401) {
    guidance = " Check NOTION_API_TOKEN.";
  } else if (status === 403 || status === 404) {
    guidance = " Check the Notion page ID and confirm the integration has access to the page.";
  } else if (status === 429) {
    guidance = " Notion rate limit persisted after retries.";
  }

  const message = `Notion API request failed (${status} ${statusText}) for ${path}: ${body}${guidance}`;
  const error = new Error(message);
  error.name = "NotionApiError";
  error.status = status;
  error.path = path;
  return error;
}

function getHeader(headers, headerName) {
  if (!headers || typeof headers.get !== "function") {
    return null;
  }

  return headers.get(headerName);
}

function parseRetryAfterMs(value) {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const trimmed = value.trim();
  const seconds = Number(trimmed);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.min(seconds * 1000, MAX_RETRY_AFTER_DELAY_MS);
  }

  const retryAt = Date.parse(trimmed);
  if (Number.isNaN(retryAt)) {
    return null;
  }

  return Math.min(Math.max(retryAt - Date.now(), 0), MAX_RETRY_AFTER_DELAY_MS);
}

function isRetryableStatus(status) {
  return status === 429 || status === 408 || status === 500 || status === 502 || status === 503 || status === 504;
}

function isRetryableFetchError(error) {
  return (
    error instanceof TypeError ||
    error?.code === "ETIMEDOUT" ||
    error?.code === "ECONNRESET" ||
    error?.code === "ENOTFOUND" ||
    error?.code === "EAI_AGAIN"
  );
}

function calculateRetryDelayMs({ attempt, response, retryDelayMs }) {
  const retryAfterMs = parseRetryAfterMs(getHeader(response?.headers, "retry-after"));
  if (retryAfterMs !== null) {
    return retryAfterMs;
  }

  return retryDelayMs * 2 ** attempt;
}

function createReadWarning({ operation, blockId, pageId, error }) {
  const target = blockId ? `block ${blockId}` : `page ${pageId}`;
  return `Warning: Notion read failed while running ${operation} for ${target}: ${error.message}`;
}

async function requestReadAction({
  handleReadError,
  operation,
  blockId,
  pageId,
  error,
}) {
  if (typeof handleReadError !== "function") {
    throw error;
  }

  const warning = createReadWarning({ operation, blockId, pageId, error });
  const action = await handleReadError({
    operation,
    blockId,
    pageId,
    error,
    warning,
    choices: ["retry", "skip", "abort"],
  });
  const normalizedAction = typeof action === "string" ? action.trim().toLowerCase() : "";

  if (
    normalizedAction !== "retry" &&
    normalizedAction !== "skip" &&
    normalizedAction !== "abort"
  ) {
    throw new Error(`Invalid Notion read recovery action: ${action}`);
  }

  if (normalizedAction === "abort") {
    throw error;
  }

  return normalizedAction;
}

async function runRecoverableRead({
  operation,
  blockId,
  pageId,
  requestOptions,
  skipValue,
  read,
}) {
  while (true) {
    try {
      return await read();
    } catch (error) {
      const action = await requestReadAction({
        handleReadError: requestOptions?.handleReadError,
        operation,
        blockId,
        pageId,
        error,
      });

      if (action === "skip") {
        return skipValue;
      }
    }
  }
}

async function defaultDelay(ms) {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function notionRequest({
  fetchImpl,
  path,
  method = "GET",
  body,
  notionToken,
  notionVersion,
  maxRequestRetries = DEFAULT_MAX_REQUEST_RETRIES,
  retryDelayMs = DEFAULT_RETRY_DELAY_MS,
  delayImpl = defaultDelay,
}) {
  if (typeof fetchImpl !== "function") {
    throw new Error("fetchImpl must be a function.");
  }

  let lastRetryableError = null;

  for (let attempt = 0; attempt <= maxRequestRetries; attempt += 1) {
    let response;

    try {
      response = await fetchImpl(`${NOTION_API_BASE_URL}${path}`, {
        method,
        headers: buildNotionHeaders({ notionToken, notionVersion }),
        body,
      });
    } catch (error) {
      if (attempt >= maxRequestRetries || !isRetryableFetchError(error)) {
        throw error;
      }

      lastRetryableError = error;
      await delayImpl(calculateRetryDelayMs({ attempt, retryDelayMs }));
      continue;
    }

    if (response.ok) {
      return response.json();
    }

    const errorBody = await response.text();
    const apiError = createNotionApiError({
      status: response.status,
      statusText: response.statusText,
      path,
      body: errorBody,
    });

    if (attempt >= maxRequestRetries || !isRetryableStatus(response.status)) {
      throw apiError;
    }

    lastRetryableError = apiError;
    await delayImpl(calculateRetryDelayMs({ attempt, response, retryDelayMs }));
  }

  throw lastRetryableError ?? new Error(`Notion API request failed for ${path}.`);
}

async function getPage({ fetchImpl, pageId, notionToken, notionVersion, requestOptions }) {
  const encodedPageId = encodeURIComponent(assertNonEmptyString(pageId, "pageId"));
  const normalizedPageId = assertNonEmptyString(pageId, "pageId");
  return runRecoverableRead({
    operation: "getPage",
    pageId: normalizedPageId,
    requestOptions,
    skipValue: null,
    read: () =>
      notionRequest({
        fetchImpl,
        path: `/pages/${encodedPageId}`,
        notionToken,
        notionVersion,
        ...requestOptions,
      }),
  });
}

async function listBlockChildrenPage({
  fetchImpl,
  blockId,
  notionToken,
  notionVersion,
  startCursor,
  requestOptions,
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
    ...requestOptions,
  });
}

async function listAllBlockChildren({ fetchImpl, blockId, notionToken, notionVersion, requestOptions }) {
  const results = [];
  let cursor;

  while (true) {
    const page = await runRecoverableRead({
      operation: "listBlockChildren",
      blockId,
      requestOptions,
      skipValue: {
        results: [],
        has_more: false,
        next_cursor: null,
      },
      read: async () => {
        const page = await listBlockChildrenPage({
          fetchImpl,
          blockId,
          notionToken,
          notionVersion,
          startCursor: cursor,
          requestOptions,
        });

        if (!Array.isArray(page.results)) {
          throw new Error(`Notion API children response for block ${blockId} is invalid.`);
        }

        return page;
      },
    });

    results.push(...page.results);

    if (!page.has_more) {
      break;
    }

    cursor = page.next_cursor;
  }

  return results;
}

async function listDatabasePagesPage({
  fetchImpl,
  databaseId,
  notionToken,
  notionVersion,
  startCursor,
  requestOptions,
}) {
  const encodedDatabaseId = encodeURIComponent(assertNonEmptyString(databaseId, "databaseId"));
  const body = { page_size: 100 };

  if (startCursor) {
    body.start_cursor = startCursor;
  }

  return notionRequest({
    fetchImpl,
    path: `/databases/${encodedDatabaseId}/query`,
    method: "POST",
    body: JSON.stringify(body),
    notionToken,
    notionVersion,
    ...requestOptions,
  });
}

async function listAllDatabasePages({ fetchImpl, databaseId, notionToken, notionVersion, requestOptions }) {
  const results = [];
  let cursor;

  while (true) {
    const page = await runRecoverableRead({
      operation: "queryDatabase",
      pageId: databaseId,
      requestOptions,
      skipValue: {
        results: [],
        has_more: false,
        next_cursor: null,
      },
      read: async () => {
        const page = await listDatabasePagesPage({
          fetchImpl,
          databaseId,
          notionToken,
          notionVersion,
          startCursor: cursor,
          requestOptions,
        });

        if (!Array.isArray(page.results)) {
          throw new Error(`Notion API database query response for database ${databaseId} is invalid.`);
        }

        return page;
      },
    });

    results.push(...page.results);

    if (!page.has_more) {
      break;
    }

    cursor = page.next_cursor;
  }

  return results;
}

function normalizeLabelPropertyNames(databaseLabelProperties) {
  if (!Array.isArray(databaseLabelProperties)) {
    return [];
  }

  return databaseLabelProperties
    .filter((propertyName) => typeof propertyName === "string" && propertyName.trim() !== "")
    .map((propertyName) => propertyName.trim());
}

function normalizeLabelOption(option) {
  if (!option || typeof option !== "object") {
    return null;
  }

  const name = typeof option.name === "string" && option.name.trim() !== ""
    ? option.name.trim()
    : null;
  if (!name) {
    return null;
  }

  return {
    name,
    color:
      typeof option.color === "string" && option.color.trim() !== ""
        ? option.color.trim()
        : "default",
  };
}

function extractPageLabels(page, databaseLabelProperties = []) {
  const propertyNames = normalizeLabelPropertyNames(databaseLabelProperties);
  if (propertyNames.length === 0 || !page || typeof page !== "object") {
    return [];
  }

  const properties = page.properties;
  if (!properties || typeof properties !== "object") {
    return [];
  }

  const labels = [];
  const seen = new Set();

  function pushLabel(option) {
    const label = normalizeLabelOption(option);
    if (!label) {
      return;
    }

    const key = `${label.name}\u0000${label.color}`;
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    labels.push(label);
  }

  for (const propertyName of propertyNames) {
    const property = properties[propertyName];
    if (!property || typeof property !== "object") {
      continue;
    }

    if (property.type === "select") {
      pushLabel(property.select);
      continue;
    }

    if (property.type === "multi_select" && Array.isArray(property.multi_select)) {
      for (const option of property.multi_select) {
        pushLabel(option);
      }
    }
  }

  return labels;
}

async function getBlockChildrenTree({
  fetchImpl,
  blockId,
  notionToken,
  notionVersion,
  requestOptions,
  databaseLabelProperties = [],
}) {
  const children = await listAllBlockChildren({
    fetchImpl,
    blockId,
    notionToken,
    notionVersion,
    requestOptions,
  });

  const withNestedChildren = [];

  for (const child of children) {
    if (!child) {
      continue;
    }

    if (child.type === "child_database") {
      const databasePages = await listAllDatabasePages({
        fetchImpl,
        databaseId: child.id,
        notionToken,
        notionVersion,
        requestOptions,
      });

      const syntheticChildren = [];
      for (const page of databasePages) {
        const title = extractPageTitle(page) ?? "Untitled Database Entry";
        const blocks = await getBlockChildrenTree({
          fetchImpl,
          blockId: page.id,
          notionToken,
          notionVersion,
          requestOptions,
          databaseLabelProperties,
        });

        syntheticChildren.push({
          id: page.id,
          type: "child_page",
          child_page: { title },
          labels: extractPageLabels(page, databaseLabelProperties),
          has_children: blocks.length > 0,
          children: blocks,
        });
      }

      withNestedChildren.push({
        ...child,
        children: syntheticChildren,
      });
      continue;
    }

    if (child.has_children) {
      const nestedChildren = await getBlockChildrenTree({
        fetchImpl,
        blockId: child.id,
        notionToken,
        notionVersion,
        requestOptions,
        databaseLabelProperties,
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
  extractPageLabels,
  extractPageTitle,
  getBlockChildrenTree,
  getPage,
};
