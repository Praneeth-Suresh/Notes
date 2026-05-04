"use strict";

function normalizeAnnotations(input) {
  const annotations = input && typeof input === "object" ? input : {};

  return {
    bold: Boolean(annotations.bold),
    italic: Boolean(annotations.italic),
    strikethrough: Boolean(annotations.strikethrough),
    underline: Boolean(annotations.underline),
    code: Boolean(annotations.code),
  };
}

function normalizeRichTextNode(node, index) {
  if (!node || typeof node !== "object") {
    throw new Error(`Rich text item at index ${index} must be an object.`);
  }

  switch (node.type) {
    case "text": {
      const textContent = node.text?.content ?? "";
      const href = node.href ?? node.text?.link?.url ?? null;

      return {
        type: "text",
        content: textContent,
        annotations: normalizeAnnotations(node.annotations),
        href,
      };
    }
    case "equation": {
      const expression = node.equation?.expression;
      if (typeof expression !== "string") {
        throw new Error(`Equation rich text at index ${index} is missing expression.`);
      }

      return {
        type: "equation",
        expression,
      };
    }
    case "mention": {
      return {
        type: "text",
        content: node.plain_text ?? "",
        annotations: normalizeAnnotations(node.annotations),
        href: node.href ?? null,
      };
    }
    default:
      throw new Error(`Unsupported rich text type: ${node.type}`);
  }
}

function normalizeRichTextArray(richText) {
  if (!Array.isArray(richText)) {
    return [];
  }

  return richText.map((node, index) => normalizeRichTextNode(node, index));
}

function flattenCodeText(richText) {
  if (!Array.isArray(richText)) {
    return "";
  }

  return richText
    .map((node) => {
      if (!node || typeof node !== "object") {
        throw new Error("Code rich_text item must be an object.");
      }

      if (node.type === "text") {
        return node.text?.content ?? "";
      }

      if (node.type === "equation") {
        return node.equation?.expression ?? "";
      }

      if (node.type === "mention") {
        return node.plain_text ?? "";
      }

      throw new Error(`Unsupported rich_text type inside code block: ${node.type}`);
    })
    .join("");
}

function normalizeHeadingLevel(type) {
  if (type === "heading_1") {
    return 1;
  }

  if (type === "heading_2") {
    return 2;
  }

  if (type === "heading_3") {
    return 3;
  }

  throw new Error(`Unsupported heading type: ${type}`);
}

function normalizeBlockCore(block, strictMode) {
  if (!block || typeof block !== "object") {
    throw new Error("Notion block must be an object.");
  }

  switch (block.type) {
    case "paragraph":
      return {
        type: "paragraph",
        richText: normalizeRichTextArray(block.paragraph?.rich_text),
      };
    case "heading_1":
    case "heading_2":
    case "heading_3":
      return {
        type: "heading",
        level: normalizeHeadingLevel(block.type),
        richText: normalizeRichTextArray(block[block.type]?.rich_text),
      };
    case "quote":
      return {
        type: "quote",
        richText: normalizeRichTextArray(block.quote?.rich_text),
      };
    case "divider":
      return {
        type: "divider",
      };
    case "equation": {
      const expression = block.equation?.expression;
      if (typeof expression !== "string") {
        throw new Error(`Equation block ${block.id ?? "(unknown)"} is missing expression.`);
      }

      return {
        type: "equation",
        expression,
      };
    }
    case "code":
      return {
        type: "code",
        language: block.code?.language ?? "plain text",
        code: flattenCodeText(block.code?.rich_text),
      };
    case "bulleted_list_item":
      return {
        type: "list_item",
        ordered: false,
        richText: normalizeRichTextArray(block.bulleted_list_item?.rich_text),
      };
    case "numbered_list_item":
      return {
        type: "list_item",
        ordered: true,
        richText: normalizeRichTextArray(block.numbered_list_item?.rich_text),
      };
    default:
      if (strictMode) {
        throw new Error(
          `Unsupported notion block type "${block.type}" in strict fidelity mode. Block id: ${block.id ?? "unknown"}.`,
        );
      }
      return null;
  }
}

function normalizeBlocks(blocks, strictMode) {
  if (!Array.isArray(blocks)) {
    throw new Error("blocks must be an array.");
  }

  const normalizedBlocks = [];

  for (const block of blocks) {
    const normalized = normalizeBlockCore(block, strictMode);
    if (!normalized) {
      continue;
    }

    const children = Array.isArray(block.children)
      ? normalizeBlocks(block.children, strictMode)
      : [];

    if (children.length > 0) {
      normalized.children = children;
    }

    normalizedBlocks.push(normalized);
  }

  return normalizedBlocks;
}

function normalizeNotionTopic({ pageId, title, blocks, strictMode = true }) {
  if (typeof pageId !== "string" || pageId.trim() === "") {
    throw new Error("pageId must be a non-empty string.");
  }

  if (typeof title !== "string" || title.trim() === "") {
    throw new Error("title must be a non-empty string.");
  }

  return {
    source: {
      kind: "notion",
      pageId,
    },
    title: title.trim(),
    blocks: normalizeBlocks(blocks, strictMode),
  };
}

module.exports = {
  normalizeNotionTopic,
};

