"use strict";

const ALLOWED_URL_PROTOCOLS = new Set(["http:", "https:", "mailto:"]);

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
      const level = Number.isInteger(block.level) ? Math.min(Math.max(block.level, 1), 3) : 2;
      return `<h${level} class="note-heading note-heading-${level}">${renderRichText(block.richText ?? [])}</h${level}>`;
    }
    case "paragraph":
      return `<p class="note-paragraph">${renderRichText(block.richText ?? [])}</p>`;
    case "quote":
      return `<blockquote class="note-quote">${renderRichText(block.richText ?? [])}</blockquote>`;
    case "divider":
      return '<hr class="note-divider" />';
    case "equation": {
      if (typeof block.expression !== "string") {
        throw new Error("Equation block is missing expression.");
      }

      const expression = escapeHtml(block.expression);
      return `<div class="note-equation" data-latex="${expression}">\\[${expression}\\]</div>`;
    }
    case "code": {
      if (typeof block.code !== "string") {
        throw new Error("Code block is missing code string.");
      }

      const language = normalizeLanguageClass(block.language);
      return `<pre class="note-code-block" data-language="${escapeHtml(language)}"><code class="language-${escapeHtml(language)}">${escapeHtml(block.code)}</code></pre>`;
    }
    default:
      throw new Error(`Unsupported block type "${block.type}" in notes-content renderer.`);
  }
}

function renderListItem(item) {
  let output = renderRichText(item.richText ?? []);
  if (Array.isArray(item.children) && item.children.length > 0) {
    output += renderBlocks(item.children);
  }

  return `<li class="note-list-item">${output}</li>`;
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

      html += `<${tag} class="note-list">${items.join("")}</${tag}>`;
      continue;
    }

    html += renderBlock(block);
    if (Array.isArray(block.children) && block.children.length > 0) {
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

    if (typeof block.expression === "string") {
      pieces.push(block.expression);
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

  return `<article class="note-article">${renderBlocks(topicDocument.blocks)}</article>`;
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

