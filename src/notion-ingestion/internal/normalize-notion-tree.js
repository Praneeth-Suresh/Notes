"use strict";

function normalizeAnnotations(input) {
  const annotations = input && typeof input === "object" ? input : {};

  return {
    bold: Boolean(annotations.bold),
    italic: Boolean(annotations.italic),
    strikethrough: Boolean(annotations.strikethrough),
    underline: Boolean(annotations.underline),
    code: Boolean(annotations.code),
    color: annotations.color ?? "default",
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
      return {
        type: "equation",
        expression: node.equation?.expression ?? "",
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

  if (type === "heading_4") {
    return 4;
  }

  throw new Error(`Unsupported heading type: ${type}`);
}

function blockId(block) {
  return block.id ?? null;
}

function blockColor(payload) {
  return payload?.color ?? "default";
}

function normalizeIcon(icon) {
  if (!icon || typeof icon !== "object") {
    return null;
  }

  return icon;
}

function normalizeLabels(labels) {
  if (!Array.isArray(labels)) {
    return [];
  }

  return labels
    .map((label) => {
      if (!label || typeof label !== "object") {
        return null;
      }

      const name = typeof label.name === "string" && label.name.trim() !== ""
        ? label.name.trim()
        : null;
      if (!name) {
        return null;
      }

      return {
        name,
        color:
          typeof label.color === "string" && label.color.trim() !== ""
            ? label.color.trim()
            : "default",
      };
    })
    .filter(Boolean);
}

function normalizeTableRows(children) {
  if (!Array.isArray(children)) {
    return [];
  }

  return children
    .filter((child) => child?.type === "table_row")
    .map((row) => ({
      cells: Array.isArray(row.table_row?.cells)
        ? row.table_row.cells.map((cell) => normalizeRichTextArray(cell))
        : [],
    }));
}

function extractNotionFileUrl(filePayload) {
  if (!filePayload || typeof filePayload !== "object") {
    return null;
  }

  if (filePayload.type === "external") {
    return filePayload.external?.url ?? null;
  }

  if (filePayload.type === "file") {
    return filePayload.file?.url ?? null;
  }

  return filePayload.external?.url ?? filePayload.file?.url ?? null;
}

function normalizeAssetBlock({ block, kind, payload }) {
  const url = extractNotionFileUrl(payload);
  const normalized = {
    type: "asset",
    kind,
    blockId: blockId(block),
    url,
    caption: normalizeRichTextArray(payload?.caption),
  };

  if (kind === "file") {
    normalized.name = payload?.name ?? filenameFromUrl(url);
  }

  return normalized;
}

function normalizeLinkBlock({ block, type, payload }) {
  return {
    type,
    blockId: blockId(block),
    url: payload?.url ?? null,
    caption: normalizeRichTextArray(payload?.caption),
  };
}

function normalizeMeetingNotesBlock(block) {
  const payload = block[block.type] ?? {};
  const children = payload.children && typeof payload.children === "object"
    ? payload.children
    : {};

  return {
    type: "meeting_notes",
    notionType: block.type,
    blockId: blockId(block),
    title: normalizeRichTextArray(payload.title),
    status: payload.status ?? null,
    sectionBlockIds: {
      summary: children.summary_block_id ?? null,
      notes: children.notes_block_id ?? null,
      transcript: children.transcript_block_id ?? null,
    },
    calendarEvent: payload.calendar_event ?? null,
    recording: payload.recording ?? null,
  };
}

function filenameFromUrl(url) {
  if (typeof url !== "string" || url.trim() === "") {
    return "file";
  }

  try {
    const parsedUrl = new URL(url);
    const lastSegment = parsedUrl.pathname.split("/").filter(Boolean).at(-1);
    return lastSegment ? decodeURIComponent(lastSegment) : "file";
  } catch (error) {
    const lastSegment = url.split("/").filter(Boolean).at(-1);
    return lastSegment || "file";
  }
}

function normalizeBlockCore(block, strictMode) {
  if (!block || typeof block !== "object") {
    throw new Error("Notion block must be an object.");
  }

  switch (block.type) {
    case "paragraph":
      return {
        type: "paragraph",
        blockId: blockId(block),
        richText: normalizeRichTextArray(block.paragraph?.rich_text),
        color: blockColor(block.paragraph),
      };
    case "heading_1":
    case "heading_2":
    case "heading_3":
    case "heading_4":
      return {
        type: "heading",
        notionType: block.type,
        blockId: blockId(block),
        level: normalizeHeadingLevel(block.type),
        richText: normalizeRichTextArray(block[block.type]?.rich_text),
        color: blockColor(block[block.type]),
        isToggleable: Boolean(block[block.type]?.is_toggleable),
      };
    case "quote":
      return {
        type: "quote",
        blockId: blockId(block),
        richText: normalizeRichTextArray(block.quote?.rich_text),
        color: blockColor(block.quote),
      };
    case "divider":
      return {
        type: "divider",
        blockId: blockId(block),
      };
    case "equation": {
      return {
        type: "equation",
        blockId: blockId(block),
        expression: block.equation?.expression ?? "",
      };
    }
    case "code":
      return {
        type: "code",
        blockId: blockId(block),
        language: block.code?.language ?? "plain text",
        code: flattenCodeText(block.code?.rich_text),
        caption: normalizeRichTextArray(block.code?.caption),
      };
    case "bulleted_list_item":
      return {
        type: "list_item",
        notionType: block.type,
        blockId: blockId(block),
        ordered: false,
        richText: normalizeRichTextArray(block.bulleted_list_item?.rich_text),
        color: blockColor(block.bulleted_list_item),
      };
    case "numbered_list_item":
      return {
        type: "list_item",
        notionType: block.type,
        blockId: blockId(block),
        ordered: true,
        richText: normalizeRichTextArray(block.numbered_list_item?.rich_text),
        color: blockColor(block.numbered_list_item),
      };
    case "audio":
      return normalizeAssetBlock({ block, kind: "audio", payload: block.audio });
    case "bookmark":
      return normalizeLinkBlock({ block, type: "bookmark", payload: block.bookmark });
    case "breadcrumb":
      return {
        type: "breadcrumb",
        blockId: blockId(block),
      };
    case "callout":
      return {
        type: "callout",
        blockId: blockId(block),
        richText: normalizeRichTextArray(block.callout?.rich_text),
        icon: normalizeIcon(block.callout?.icon),
        color: blockColor(block.callout),
      };
    case "child_page":
      return {
        type: "child_page",
        blockId: blockId(block),
        title: block.child_page?.title ?? "",
        labels: normalizeLabels(block.labels),
      };
    case "column_list":
      return {
        type: "column_list",
        blockId: blockId(block),
      };
    case "column":
      return {
        type: "column",
        blockId: blockId(block),
        widthRatio: typeof block.column?.width_ratio === "number" ? block.column.width_ratio : null,
      };
    case "embed":
      return normalizeLinkBlock({ block, type: "embed", payload: block.embed });
    case "table":
      return {
        type: "table",
        blockId: blockId(block),
        hasColumnHeader: Boolean(block.table?.has_column_header),
        hasRowHeader: Boolean(block.table?.has_row_header),
        rows: normalizeTableRows(block.children),
      };
    case "table_row":
      return {
        type: "table_row",
        blockId: blockId(block),
        cells: Array.isArray(block.table_row?.cells)
          ? block.table_row.cells.map((cell) => normalizeRichTextArray(cell))
          : [],
      };
    case "child_database":
      return {
        type: "child_database",
        blockId: blockId(block),
        title: block.child_database?.title ?? "",
      };
    case "file":
      return normalizeAssetBlock({ block, kind: "file", payload: block.file });
    case "image":
      return normalizeAssetBlock({ block, kind: "image", payload: block.image });
    case "link_preview":
      return {
        type: "link_preview",
        blockId: blockId(block),
        url: block.link_preview?.url ?? null,
      };
    case "meeting_notes":
    case "transcription":
      return normalizeMeetingNotesBlock(block);
    case "pdf":
      return normalizeAssetBlock({ block, kind: "pdf", payload: block.pdf });
    case "synced_block":
      return {
        type: "synced_block",
        blockId: blockId(block),
        syncedFrom: block.synced_block?.synced_from ?? null,
      };
    case "table_of_contents":
      return {
        type: "table_of_contents",
        blockId: blockId(block),
        color: blockColor(block.table_of_contents),
      };
    case "tab":
      return {
        type: "tab",
        blockId: blockId(block),
      };
    case "template":
      return {
        type: "template",
        blockId: blockId(block),
        richText: normalizeRichTextArray(block.template?.rich_text),
      };
    case "to_do":
      return {
        type: "to_do",
        blockId: blockId(block),
        richText: normalizeRichTextArray(block.to_do?.rich_text),
        checked: Boolean(block.to_do?.checked),
        color: blockColor(block.to_do),
      };
    case "toggle":
      return {
        type: "toggle",
        blockId: blockId(block),
        richText: normalizeRichTextArray(block.toggle?.rich_text),
        color: blockColor(block.toggle),
      };
    case "unsupported":
      return {
        type: "unsupported",
        blockId: blockId(block),
        blockType: block.unsupported?.block_type ?? "unknown",
      };
    case "video":
      return normalizeAssetBlock({ block, kind: "video", payload: block.video });
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

    const children = normalized.type !== "table" && Array.isArray(block.children)
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
