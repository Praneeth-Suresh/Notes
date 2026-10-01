"use strict";

const ALLOWED_URL_PROTOCOLS = new Set(["http:", "https:", "mailto:"]);
const ALLOWED_ASSET_URL_PROTOCOLS = new Set(["http:", "https:"]);
const ALLOWED_RASTER_DATA_IMAGE_PATTERN =
  /^data:image\/(?:gif|png|jpe?g|webp);base64,[a-z0-9+/]+={0,2}$/iu;
const NOTION_ROOT_RELATIVE_PAGE_PATTERN = /^\/[a-f0-9]{32}(?:[?#].*)?$/iu;
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

  if (NOTION_ROOT_RELATIVE_PAGE_PATTERN.test(trimmed)) {
    return new URL(trimmed, "https://www.notion.so").toString();
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

function notionLabelColorClass(color) {
  const normalized = typeof color === "string" && color.trim() !== "" ? color.trim() : "default";
  if (!NOTION_COLOR_PATTERN.test(normalized)) {
    throw new Error(`Unsupported Notion label color value: ${color}`);
  }

  return ` notion-label-color-${normalized}`;
}

function renderLabels(labels) {
  if (!Array.isArray(labels) || labels.length === 0) {
    return "";
  }

  const items = labels
    .map((label) => {
      if (!label || typeof label !== "object") {
        return "";
      }

      const name = typeof label.name === "string" && label.name.trim() !== ""
        ? label.name.trim()
        : "";
      if (!name) {
        return "";
      }

      return `<span class="note-label${notionLabelColorClass(label.color)}">${escapeHtml(name)}</span>`;
    })
    .filter(Boolean)
    .join("");

  return items ? `<span class="note-labels">${items}</span>` : "";
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


function slugifyHeading(value) {
  const slug = String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-+|-+$/gu, "");
  return slug || "section";
}

function prepareBlocksForRendering(blocks) {
  const state = { firstSourceLevel: null, previousHtmlLevel: 1, ids: new Map() };
  const uniqueId = (preferred) => {
    const base = preferred || "section";
    const count = state.ids.get(base) || 0;
    state.ids.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  };
  const visit = (items) => (items || []).map((block) => {
    const prepared = { ...block };
    if (block.type === "heading") {
      const sourceLevel = Number.isInteger(block.level) ? Math.min(Math.max(block.level, 1), 6) : 2;
      if (state.firstSourceLevel == null) state.firstSourceLevel = sourceLevel;
      const relativeLevel = Math.max(2, Math.min(6, 2 + sourceLevel - state.firstSourceLevel));
      prepared.htmlHeadingLevel = Math.min(relativeLevel, state.previousHtmlLevel + 1);
      state.previousHtmlLevel = prepared.htmlHeadingLevel;
      const blockId = typeof block.blockId === "string" && block.blockId.trim() ? block.blockId.trim() : "";
      prepared.headingId = uniqueId(blockId || slugifyHeading(plainTextFromRichText(block.richText)));
    }
    if (Array.isArray(block.children)) prepared.children = visit(block.children);
    return prepared;
  });
  return visit(blocks);
}

function renderBlock(block) {
  if (!block || typeof block !== "object") {
    throw new Error("Block must be an object.");
  }

  switch (block.type) {
    case "heading": {
      const sourceLevel = Number.isInteger(block.level) ? Math.min(Math.max(block.level, 1), 6) : 2;
      const htmlLevel = Number.isInteger(block.htmlHeadingLevel) ? block.htmlHeadingLevel : Math.min(sourceLevel + 1, 6);
      const classes = notionBlockClass(block, "heading", ` notion-heading-${Math.max(1, htmlLevel - 1)}`);
      const id = block.headingId || slugifyHeading(plainTextFromRichText(block.richText));
      return `<h${htmlLevel} id="${escapeHtml(id)}" class="${classes}"${notionBlockIdAttribute(block)} data-source-heading-level="${sourceLevel}">${renderRichText(block.richText ?? [])}</h${htmlLevel}>`;
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
      return `<figure class="${notionBlockClass(block, "code", " code-block")}"${notionBlockIdAttribute(block)}><div class="code-block-header"><span class="code-language">${escapeHtml(language)}</span><button class="copy-action" type="button" data-copy-code>Copy</button><span class="visually-hidden" aria-live="polite" data-copy-status></span></div><pre class="note-code-block" data-language="${escapeHtml(language)}" tabindex="0" role="region" aria-label="${escapeHtml(language)} code"><code class="language-${escapeHtml(language)}">${escapeHtml(block.code)}</code></pre>${caption}</figure>`;
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
  return `<figure class="${notionBlockClass(block, block.type.replaceAll("_", "-"))}"${notionBlockIdAttribute(block)}><a class="note-link-preview" href="${escapeHtml(url)}" rel="noreferrer noopener">${escapeHtml(describeUrl(url))}</a>${caption}</figure>`;
}

// Bookmarks and embeds have no link text in Notion, so show a readable host + path
// instead of the raw query-laden URL (the full URL stays in href).
function describeUrl(url) {
  try {
    const parsed = new URL(url);
    const pathPart = decodeURIComponent(parsed.pathname).replace(/\/+$/u, "");
    const trimmedPath = pathPart.length > 60 ? `${pathPart.slice(0, 57)}…` : pathPart;
    return `${parsed.hostname.replace(/^www\./u, "")}${trimmedPath}`;
  } catch (error) {
    return url;
  }
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

  // Wide tables scroll inside their own focusable region instead of clipping the page.
  return `<div class="note-scroll note-table-scroll" role="region" aria-label="Table" tabindex="0"><table class="${notionBlockClass(block, "table")}"${notionBlockIdAttribute(block)}><tbody>${rows.join("")}</tbody></table></div>`;
}

function renderChildDatabase(block) {
  const title = typeof block.title === "string" && block.title.trim() !== ""
    ? block.title
    : "Linked database";
  const blockId = typeof block.blockId === "string" ? ` data-notion-block-id="${escapeHtml(block.blockId)}"` : "";
  return `<section class="note-child-database"${blockId}><h2 class="note-child-database-title">${escapeHtml(title)}</h2><div class="note-database-entries">${renderNestedChildren(block)}</div></section>`;
}

const PUBLICATION_STATUS_SLUGS = new Set(["working", "reviewed", "archived"]);

function renderPublicationBadge(publication) {
  if (!publication || typeof publication !== "object" || typeof publication.status !== "string") {
    return "";
  }
  const slug = PUBLICATION_STATUS_SLUGS.has(publication.statusSlug) ? publication.statusSlug : "working";
  const type = typeof publication.contentType === "string" && publication.contentType !== ""
    ? `<span class="note-type">${escapeHtml(publication.contentType)}</span>`
    : "";
  const visibleStatus = slug === "working"
    ? ""
    : `<span class="note-status note-status-${slug}">${escapeHtml(publication.status)}</span>`;
  return `<span class="note-publication" aria-label="${escapeHtml(publication.status)}${publication.contentType ? `, ${escapeHtml(publication.contentType)}` : ""}">${visibleStatus}${type}</span>`;
}

function renderChildPage(block) {
  const title = typeof block.title === "string" && block.title.trim() !== ""
    ? block.title.trim()
    : "Untitled subpage";
  const href = sanitizeHref(block.href ?? null);
  const blockId = typeof block.blockId === "string" ? ` data-notion-block-id="${escapeHtml(block.blockId)}"` : "";
  const publication = renderPublicationBadge(block.publication);

  if (!href) {
    return `<section class="note-child-page"${blockId}><h3>${escapeHtml(title)}</h3>${renderLabels(block.labels)}${publication}</section>`;
  }

  return `<section class="note-child-page"${blockId}><a class="note-child-page-link" href="${escapeHtml(href)}">${escapeHtml(title)}</a>${renderLabels(block.labels)}${publication}</section>`;
}

function renderAsset(block) {
  const url = sanitizeAssetUrl(block.url, { allowDataImage: block.kind === "image" });
  const caption = Array.isArray(block.caption) && block.caption.length > 0
    ? `<figcaption>${renderRichText(block.caption)}</figcaption>`
    : "";

  if (block.kind === "image") {
    // Explicit alt text (joined from the media sidecar) wins; otherwise fall back to the caption.
    const altSource = typeof block.alt === "string" && block.alt.trim() !== ""
      ? block.alt.trim()
      : plainTextFromRichText(block.caption);
    const alt = escapeHtml(altSource);
    const dimensions = Number.isInteger(block.width) && Number.isInteger(block.height) && block.width > 0 && block.height > 0
      ? ` width="${block.width}" height="${block.height}"`
      : "";
    return `<figure class="${notionBlockClass(block, "asset", " note-asset note-asset-image")}"${notionBlockIdAttribute(block)}><img src="${escapeHtml(url)}" alt="${alt}"${dimensions} loading="lazy" decoding="async" />${caption}</figure>`;
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

    if (block.type === "child_page" && Array.isArray(block.labels)) {
      for (const label of block.labels) {
        if (typeof label?.name === "string") {
          pieces.push(label.name);
        }
      }
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

  return `<article id="overview" class="note-article notion-page-content">${renderBlocks(prepareBlocksForRendering(topicDocument.blocks))}</article>`;
}

function createSearchEntry({ slug, topicDocument }) {
  if (typeof slug !== "string" || slug.trim() === "") {
    throw new Error("slug must be a non-empty string.");
  }

  if (!topicDocument || typeof topicDocument !== "object" || !Array.isArray(topicDocument.blocks)) {
    throw new Error("topicDocument must include a blocks array.");
  }

  const pieces = [topicDocument.title ?? "", topicDocument.description ?? ""];
  if (Array.isArray(topicDocument.labels)) {
    for (const label of topicDocument.labels) {
      if (typeof label?.name === "string") {
        pieces.push(label.name);
      }
    }
  }
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
