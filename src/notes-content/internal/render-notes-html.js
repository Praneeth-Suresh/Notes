"use strict";

const ALLOWED_URL_PROTOCOLS = new Set(["http:", "https:", "mailto:"]);
const ALLOWED_ASSET_URL_PROTOCOLS = new Set(["http:", "https:"]);
const ALLOWED_RASTER_DATA_IMAGE_PATTERN =
  /^data:image\/(?:gif|png|jpe?g|webp);base64,[a-z0-9+/]+={0,2}$/iu;
const NOTION_COLOR_PATTERN = /^[a-z]+(?:_background)?$/u;
const CHILD_AWARE_RENDERERS = new Set([
  "callout",
  "child_database",
  "column",
  "column_list",
  "synced_block",
  "table_of_contents",
  "template",
  "to_do",
  "toggle",
]);

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function sanitizeHref(href) {
  if (href == null) {
    return null;
  }

  if (typeof href !== "string") {
    throw new Error("Rich text href must be a string when provided.");
  }

  const trimmed = href.trim();
  if (trimmed === "") {
    return null;
  }

  if (trimmed.startsWith("#") || trimmed.startsWith("/")) {
    return trimmed;
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(trimmed);
  } catch (error) {
    throw new Error(`Invalid URL in rich text href: ${trimmed}`);
  }

  if (!ALLOWED_URL_PROTOCOLS.has(parsedUrl.protocol)) {
    throw new Error(`Unsupported URL protocol in rich text href: ${parsedUrl.protocol}`);
  }

  return parsedUrl.toString();
}

function sanitizeAssetUrl(url, { allowDataImage = false } = {}) {
  if (url == null) {
    throw new Error("Asset URL must be a non-empty URL.");
  }

  if (typeof url !== "string") {
    throw new Error("Asset URL must be a string.");
  }

  const trimmed = url.trim();
  if (trimmed === "") {
    throw new Error("Asset URL must be a non-empty URL.");
  }

  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  if (trimmed.toLowerCase().startsWith("data:")) {
    if (!allowDataImage || !ALLOWED_RASTER_DATA_IMAGE_PATTERN.test(trimmed)) {
      throw new Error("Unsupported asset data URL.");
    }

    return trimmed;
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(trimmed);
  } catch (error) {
    throw new Error(`Invalid asset URL: ${trimmed}`);
  }

  if (!ALLOWED_ASSET_URL_PROTOCOLS.has(parsedUrl.protocol)) {
    throw new Error(`Unsupported URL protocol in asset URL: ${parsedUrl.protocol}`);
  }

  return parsedUrl.toString();
}

function notionColorClass(color) {
  if (typeof color !== "string" || color === "" || color === "default") {
    return "";
  }

  if (!NOTION_COLOR_PATTERN.test(color)) {
    throw new Error(`Unsupported Notion color value: ${color}`);
  }

  return ` notion-color-${color}`;
}

function notionBlockIdAttribute(block) {
  return typeof block.blockId === "string" && block.blockId.trim() !== ""
    ? ` data-notion-block-id="${escapeHtml(block.blockId)}"`
    : "";
}

function notionBlockClass(block, notionType, extraClasses = "") {
  return `notion-block notion-${notionType}${extraClasses}${notionColorClass(block.color)}`;
}

function wrapWithAnnotations(content, annotations) {
  const resolved = annotations && typeof annotations === "object" ? annotations : {};
  let output = content;

  if (resolved.code) {
    output = `<code class="note-inline-code">${output}</code>`;
  }
  if (resolved.bold) {
    output = `<strong>${output}</strong>`;
  }
  if (resolved.italic) {
    output = `<em>${output}</em>`;
  }
  if (resolved.underline) {
    output = `<u>${output}</u>`;
  }
  if (resolved.strikethrough) {
    output = `<s>${output}</s>`;
  }
  if (resolved.color && resolved.color !== "default") {
    output = `<span class="notion-rich-text${notionColorClass(resolved.color)}">${output}</span>`;
  }

  return output;
}

function renderInlineNode(node) {
  if (!node || typeof node !== "object") {
    throw new Error("Inline rich text node must be an object.");
  }

  if (node.type === "equation") {
    if (typeof node.expression !== "string") {
      throw new Error("Equation inline node is missing expression.");
    }

    const expression = escapeHtml(node.expression);
    return `<span class="note-inline-equation" data-latex="${expression}">\\(${expression}\\)</span>`;
  }

  if (node.type === "text") {
    if (typeof node.content !== "string") {
      throw new Error("Text inline node is missing content.");
    }

    const href = sanitizeHref(node.href ?? null);
    let output = wrapWithAnnotations(escapeHtml(node.content), node.annotations);

    if (href) {
      output = `<a href="${escapeHtml(href)}" rel="noreferrer noopener">${output}</a>`;
    }

    return output;
  }

  throw new Error(`Unsupported inline rich text node type: ${node.type}`);
}

function renderRichText(richText) {
  if (!Array.isArray(richText)) {
    throw new Error("richText must be an array.");
  }

  return richText.map((node) => renderInlineNode(node)).join("");
}

function plainTextFromRichText(richText) {
  if (!Array.isArray(richText)) {
    return "";
  }

  return richText
    .map((node) => {
      if (node?.type === "text" && typeof node.content === "string") {
        return node.content;
      }

      if (node?.type === "equation" && typeof node.expression === "string") {
        return node.expression;
      }

      return "";
    })
    .join("");
}

function normalizeLanguageClass(language) {
  const normalized = typeof language === "string" ? language.trim().toLowerCase() : "plain-text";
  const safe = normalized.replace(/[^a-z0-9#+-]/g, "-");
  return safe.length > 0 ? safe : "plain-text";
}

function renderBlock(block) {
  if (!block || typeof block !== "object") {
    throw new Error("Block must be an object.");
  }

  switch (block.type) {
    case "heading": {
      const level = Number.isInteger(block.level) ? Math.min(Math.max(block.level, 1), 6) : 2;
      const htmlLevel = Math.min(level, 6);
      const classes = notionBlockClass(block, "heading", ` notion-heading-${level}`);
      return `<h${htmlLevel} class="${classes}"${notionBlockIdAttribute(block)}>${renderRichText(block.richText ?? [])}</h${htmlLevel}>`;
    }
    case "paragraph":
      return `<p class="${notionBlockClass(block, "paragraph")}"${notionBlockIdAttribute(block)}>${renderRichText(block.richText ?? [])}</p>`;
    case "quote":
      return `<blockquote class="${notionBlockClass(block, "quote")}"${notionBlockIdAttribute(block)}>${renderRichText(block.richText ?? [])}</blockquote>`;
    case "divider":
      return `<hr class="${notionBlockClass(block, "divider")}"${notionBlockIdAttribute(block)} />`;
    case "equation": {
      if (typeof block.expression !== "string") {
        throw new Error("Equation block is missing expression.");
      }

      const expression = escapeHtml(block.expression);
      return `<div class="${notionBlockClass(block, "equation")}"${notionBlockIdAttribute(block)} data-latex="${expression}">\\[${expression}\\]</div>`;
    }
    case "code": {
      if (typeof block.code !== "string") {
        throw new Error("Code block is missing code string.");
      }

      const language = normalizeLanguageClass(block.language);
      const caption = renderCaption(block.caption);
      return `<figure class="${notionBlockClass(block, "code")}"${notionBlockIdAttribute(block)}><pre class="note-code-block" data-language="${escapeHtml(language)}"><code class="language-${escapeHtml(language)}">${escapeHtml(block.code)}</code></pre>${caption}</figure>`;
    }
    case "table":
      return renderTable(block);
    case "child_database":
      return renderChildDatabase(block);
    case "child_page":
      return renderChildPage(block);
    case "asset":
      return renderAsset(block);
    case "toggle":
      return renderToggle(block);
    case "callout":
      return renderCallout(block);
    case "to_do":
      return renderToDo(block);
    case "column_list":
      return renderColumnList(block);
    case "column":
      return renderColumn(block);
    case "bookmark":
    case "embed":
    case "link_preview":
      return renderLinkPreviewBlock(block);
    case "breadcrumb":
      return `<nav class="${notionBlockClass(block, "breadcrumb")}"${notionBlockIdAttribute(block)} aria-label="Notion breadcrumb"></nav>`;
    case "synced_block":
      return `<section class="${notionBlockClass(block, "synced-block")}"${notionBlockIdAttribute(block)}>${renderNestedChildren(block)}</section>`;
    case "table_of_contents":
      return `<nav class="${notionBlockClass(block, "table-of-contents")}"${notionBlockIdAttribute(block)} aria-label="Table of contents">${renderNestedChildren(block)}</nav>`;
    case "template":
      return `<section class="${notionBlockClass(block, "template")}"${notionBlockIdAttribute(block)}>${renderRichText(block.richText ?? [])}${renderNestedChildren(block)}</section>`;
    default:
      throw new Error(`Unsupported block type "${block.type}" in notes-content renderer.`);
  }
}

function renderNestedChildren(block) {
  if (!Array.isArray(block.children) || block.children.length === 0) {
    return "";
  }

  return renderBlocks(block.children);
}

function renderToggle(block) {
  return `<details class="${notionBlockClass(block, "toggle")}"${notionBlockIdAttribute(block)}><summary>${renderRichText(block.richText ?? [])}</summary>${renderNestedChildren(block)}</details>`;
}

function renderCalloutIcon(icon) {
  if (!icon || typeof icon !== "object") {
    return "";
  }

  if (typeof icon.emoji === "string") {
    return `<span class="note-callout-icon" aria-hidden="true">${escapeHtml(icon.emoji)}</span>`;
  }

  return "";
}

function renderCallout(block) {
  const icon = renderCalloutIcon(block.icon);
  return `<div class="${notionBlockClass(block, "callout")}"${notionBlockIdAttribute(block)}><aside class="note-callout">${icon}<div class="note-callout-body">${renderRichText(block.richText ?? [])}${renderNestedChildren(block)}</div></aside></div>`;
}

function renderCaption(caption) {
  if (!Array.isArray(caption) || caption.length === 0) {
    return "";
  }

  return `<figcaption class="notion-caption">${renderRichText(caption)}</figcaption>`;
}

function renderToDo(block) {
  const checked = Boolean(block.checked);
  const checkedAttribute = checked ? " checked" : "";
  const classes = notionBlockClass(block, "to-do", checked ? " notion-to-do-checked" : "");
  return `<div class="${classes}"${notionBlockIdAttribute(block)}><input class="notion-to-do-checkbox" type="checkbox"${checkedAttribute} disabled /><div class="notion-to-do-body">${renderRichText(block.richText ?? [])}${renderNestedChildren(block)}</div></div>`;
}

function renderColumnList(block) {
  return `<div class="notion-column-list"${notionBlockIdAttribute(block)}>${renderNestedChildren(block)}</div>`;
}

function renderColumn(block) {
  const widthRatio = typeof block.widthRatio === "number" && Number.isFinite(block.widthRatio)
    ? Math.min(Math.max(block.widthRatio, 0), 1)
    : null;
  const widthStyle = widthRatio == null
    ? ""
    : ` style="--notion-column-width: ${escapeHtml(`${Math.round(widthRatio * 100)}%`)};"`;

  return `<div class="${notionBlockClass(block, "column")}"${notionBlockIdAttribute(block)}${widthStyle}>${renderNestedChildren(block)}</div>`;
}

function renderLinkPreviewBlock(block) {
  const url = sanitizeAssetUrl(block.url);
  const caption = renderCaption(block.caption);
  return `<figure class="${notionBlockClass(block, block.type.replaceAll("_", "-"))}"${notionBlockIdAttribute(block)}><a href="${escapeHtml(url)}" rel="noreferrer noopener">${escapeHtml(url)}</a>${caption}</figure>`;
}

function renderTableCell(cell, tag) {
  if (!Array.isArray(cell)) {
    throw new Error("Table cell must be a rich text array.");
  }

  return `<${tag}>${renderRichText(cell)}</${tag}>`;
}

function renderTable(block) {
  if (!Array.isArray(block.rows)) {
    throw new Error("Table block is missing rows.");
  }

  const rows = block.rows.map((row, rowIndex) => {
    if (!row || !Array.isArray(row.cells)) {
      throw new Error("Table row is missing cells.");
    }

    const cellTag = block.hasColumnHeader && rowIndex === 0 ? "th" : "td";
    const cells = row.cells.map((cell, cellIndex) => {
      const tag = block.hasRowHeader && cellIndex === 0 ? "th" : cellTag;
      return renderTableCell(cell, tag);
    });

    return `<tr>${cells.join("")}</tr>`;
  });

  return `<table class="${notionBlockClass(block, "table")}"${notionBlockIdAttribute(block)}><tbody>${rows.join("")}</tbody></table>`;
}

function renderChildDatabase(block) {
  const title = typeof block.title === "string" && block.title.trim() !== ""
    ? block.title
    : "Linked database";
  const blockId = typeof block.blockId === "string" ? ` data-notion-block-id="${escapeHtml(block.blockId)}"` : "";
  return `<section class="note-child-database"${blockId}><h3>${escapeHtml(title)}</h3><div class="note-database-entries">${renderNestedChildren(block)}</div></section>`;
}

function renderChildPage(block) {
  const title = typeof block.title === "string" && block.title.trim() !== ""
    ? block.title.trim()
    : "Untitled subpage";
  const href = sanitizeHref(block.href ?? null);
  const blockId = typeof block.blockId === "string" ? ` data-notion-block-id="${escapeHtml(block.blockId)}"` : "";

  if (!href) {
    return `<section class="note-child-page"${blockId}><h3>${escapeHtml(title)}</h3></section>`;
  }

  return `<section class="note-child-page"${blockId}><a class="note-child-page-link" href="${escapeHtml(href)}">${escapeHtml(title)}</a></section>`;
}

function renderAsset(block) {
  const url = sanitizeAssetUrl(block.url, { allowDataImage: block.kind === "image" });
  const caption = Array.isArray(block.caption) && block.caption.length > 0
    ? `<figcaption>${renderRichText(block.caption)}</figcaption>`
    : "";

  if (block.kind === "image") {
    const alt = escapeHtml(plainTextFromRichText(block.caption));
    return `<figure class="${notionBlockClass(block, "asset", " note-asset note-asset-image")}"${notionBlockIdAttribute(block)}><img src="${escapeHtml(url)}" alt="${alt}" />${caption}</figure>`;
  }

  if (block.kind === "file") {
    const name = typeof block.name === "string" && block.name.trim() !== "" ? block.name : url;
    return `<figure class="${notionBlockClass(block, "asset", " note-asset note-asset-file")}"${notionBlockIdAttribute(block)}><a href="${escapeHtml(url)}" rel="noreferrer noopener">${escapeHtml(name)}</a>${caption}</figure>`;
  }

  if (block.kind === "audio") {
    return `<figure class="${notionBlockClass(block, "asset", " note-asset note-asset-audio")}"${notionBlockIdAttribute(block)}><audio controls src="${escapeHtml(url)}"></audio>${caption}</figure>`;
  }

  if (block.kind === "video") {
    return `<figure class="${notionBlockClass(block, "asset", " note-asset note-asset-video")}"${notionBlockIdAttribute(block)}><video controls src="${escapeHtml(url)}"></video>${caption}</figure>`;
  }

  if (block.kind === "pdf") {
    return `<figure class="${notionBlockClass(block, "asset", " note-asset note-asset-pdf")}"${notionBlockIdAttribute(block)}><object type="application/pdf" data="${escapeHtml(url)}"><a href="${escapeHtml(url)}" rel="noreferrer noopener">${escapeHtml(url)}</a></object>${caption}</figure>`;
  }

  throw new Error(`Unsupported asset kind "${block.kind}".`);
}

function renderListItem(item) {
  let output = renderRichText(item.richText ?? []);
  if (Array.isArray(item.children) && item.children.length > 0) {
    output += renderBlocks(item.children);
  }

  return `<li class="${notionBlockClass(item, "list-item", " note-list-item")}"${notionBlockIdAttribute(item)}>${output}</li>`;
}

function rendererConsumesChildren(block) {
  return CHILD_AWARE_RENDERERS.has(block.type);
}

function renderBlocks(blocks) {
  if (!Array.isArray(blocks)) {
    throw new Error("blocks must be an array.");
  }

  let index = 0;
  let html = "";

  while (index < blocks.length) {
    const block = blocks[index];
    if (block.type === "list_item") {
      const ordered = Boolean(block.ordered);
      const tag = ordered ? "ol" : "ul";
      const items = [];

      while (
        index < blocks.length &&
        blocks[index].type === "list_item" &&
        Boolean(blocks[index].ordered) === ordered
      ) {
        items.push(renderListItem(blocks[index]));
        index += 1;
      }

      html += `<${tag} class="notion-block notion-${ordered ? "numbered-list" : "bulleted-list"} note-list">${items.join("")}</${tag}>`;
      continue;
    }

    html += renderBlock(block);
    if (
      !rendererConsumesChildren(block) &&
      Array.isArray(block.children) &&
      block.children.length > 0
    ) {
      html += renderBlocks(block.children);
    }
    index += 1;
  }

  return html;
}

function collectSearchTextFromInline(inlineNode, pieces) {
  if (inlineNode.type === "text" && typeof inlineNode.content === "string") {
    pieces.push(inlineNode.content);
    return;
  }

  if (inlineNode.type === "equation" && typeof inlineNode.expression === "string") {
    pieces.push(inlineNode.expression);
    return;
  }

  throw new Error(`Unsupported inline node for search extraction: ${inlineNode.type}`);
}

function collectSearchTextFromBlocks(blocks, pieces) {
  for (const block of blocks) {
    if (Array.isArray(block.richText)) {
      for (const inlineNode of block.richText) {
        collectSearchTextFromInline(inlineNode, pieces);
      }
    }

    if (typeof block.code === "string") {
      pieces.push(block.code);
    }

    if (block.type === "code" && Array.isArray(block.caption)) {
      for (const inlineNode of block.caption) {
        collectSearchTextFromInline(inlineNode, pieces);
      }
    }

    if (typeof block.expression === "string") {
      pieces.push(block.expression);
    }

    if (block.type === "table" && Array.isArray(block.rows)) {
      for (const row of block.rows) {
        for (const cell of row.cells ?? []) {
          for (const inlineNode of cell) {
            collectSearchTextFromInline(inlineNode, pieces);
          }
        }
      }
    }

    if (block.type === "asset" && Array.isArray(block.caption)) {
      for (const inlineNode of block.caption) {
        collectSearchTextFromInline(inlineNode, pieces);
      }
    }

    if (block.type === "child_database" && typeof block.title === "string") {
      pieces.push(block.title);
    }

    if (block.type === "child_page" && typeof block.title === "string") {
      pieces.push(block.title);
    }

    if (
      (block.type === "toggle" || block.type === "callout") &&
      Array.isArray(block.richText)
    ) {
      for (const inlineNode of block.richText) {
        collectSearchTextFromInline(inlineNode, pieces);
      }
    }

    if (Array.isArray(block.children) && block.children.length > 0) {
      collectSearchTextFromBlocks(block.children, pieces);
    }
  }
}

function renderTopicBody(topicDocument) {
  if (!topicDocument || typeof topicDocument !== "object") {
    throw new Error("topicDocument must be an object.");
  }

  if (!Array.isArray(topicDocument.blocks)) {
    throw new Error("topicDocument.blocks must be an array.");
  }

  return `<article class="note-article notion-page-content">${renderBlocks(topicDocument.blocks)}</article>`;
}

function createSearchEntry({ slug, topicDocument }) {
  if (typeof slug !== "string" || slug.trim() === "") {
    throw new Error("slug must be a non-empty string.");
  }

  if (!topicDocument || typeof topicDocument !== "object" || !Array.isArray(topicDocument.blocks)) {
    throw new Error("topicDocument must include a blocks array.");
  }

  const pieces = [topicDocument.title ?? "", topicDocument.description ?? ""];
  collectSearchTextFromBlocks(topicDocument.blocks, pieces);

  return {
    slug,
    title: topicDocument.title ?? slug,
    description: topicDocument.description ?? "",
    searchableText: pieces.filter(Boolean).join(" "),
  };
}

module.exports = {
  createSearchEntry,
  renderTopicBody,
};
