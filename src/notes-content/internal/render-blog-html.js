"use strict";

const { marked } = require("../../../vendor/marked/marked.cjs");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// The shell owns H1. Remap the first body heading to H2, preserve relative
// hierarchy, and constrain downward jumps so irregular Markdown remains logical.
function slugifyHeading(value) {
  const text = String(value || "").replace(/<[^>]+>/gu, " ");
  return text.normalize("NFKD").replace(/[\u0300-\u036f]/gu, "").toLowerCase()
    .replace(/&[a-z0-9#]+;/gu, "-").replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-+|-+$/gu, "") || "section";
}

function normalizeHeadings(html) {
  let firstSourceLevel = null;
  let previousHtmlLevel = 1;
  const ids = new Map();
  return html.replace(/<h([1-6])([^>]*)>([\s\S]*?)<\/h\1>/gu, (match, rawLevel, rawAttributes, body) => {
    const sourceLevel = Number(rawLevel);
    if (firstSourceLevel == null) firstSourceLevel = sourceLevel;
    const relative = Math.max(2, Math.min(6, 2 + sourceLevel - firstSourceLevel));
    const level = Math.min(relative, previousHtmlLevel + 1);
    previousHtmlLevel = level;
    const existingId = rawAttributes.match(/\sid="([^"]+)"/u)?.[1];
    const base = existingId || slugifyHeading(body);
    const count = ids.get(base) || 0;
    ids.set(base, count + 1);
    const id = count === 0 ? base : `${base}-${count + 1}`;
    const attributes = rawAttributes.replace(/\sid="[^"]+"/gu, "");
    return `<h${level}${attributes} id="${escapeHtml(id)}" data-source-heading-level="${sourceLevel}">${body}</h${level}>`;
  });
}

// Wide tables and code blocks scroll locally. Code remains selectable without JS;
// the shared enhancement provides copy feedback when the Clipboard API is available.
function wrapScrollables(html) {
  return html
    .replace(/<table>/gu, '<div class="note-scroll note-table-scroll" role="region" aria-label="Table" tabindex="0"><table>')
    .replace(/<\/table>/gu, "</table></div>")
    .replace(/<pre><code(?: class="language-([^"]+)")?>([\s\S]*?)<\/code><\/pre>/gu, (match, language = "plain-text", code) =>
      `<figure class="code-block"><div class="code-block-header"><span class="code-language">${escapeHtml(language)}</span><button class="copy-action" type="button" data-copy-code>Copy</button><span class="visually-hidden" aria-live="polite" data-copy-status></span></div><pre tabindex="0" role="region" aria-label="${escapeHtml(language)} code"><code class="language-${escapeHtml(language)}">${code}</code></pre></figure>`,
    );
}

/**
 * imageInfo(src) may return { src, width, height } to swap in an optimized file and
 * give the browser intrinsic dimensions (prevents layout shift).
 */
function enhanceImages(html, imageInfo) {
  return html.replace(/<img src="([^"]*)"([^>]*?)\s*\/?>/gu, (match, src, rest) => {
    const info = typeof imageInfo === "function" ? imageInfo(src) : null;
    // `src` is already attribute-escaped by marked; a replacement path is ours and escaped here.
    const resolvedSrc = info && typeof info.src === "string" ? escapeHtml(info.src) : src;
    const dimensions = info && Number.isInteger(info.width) && Number.isInteger(info.height)
      ? ` width="${info.width}" height="${info.height}"`
      : "";
    return `<img src="${resolvedSrc}"${rest}${dimensions} loading="lazy" decoding="async">`;
  });
}

function renderBlogBody(markdownString, { imageInfo } = {}) {
  if (typeof markdownString !== "string") {
    throw new Error("renderBlogBody expects a markdown string.");
  }
  const html = enhanceImages(wrapScrollables(normalizeHeadings(marked.parse(markdownString))), imageInfo);
  return `<article class="blog-article">${html}</article>`;
}

function createBlogSearchEntry({ slug, title, description = "", markdownString }) {
  if (typeof slug !== "string" || slug.trim() === "") {
    throw new Error("slug must be a non-empty string.");
  }
  const resolvedDescription = typeof description === "string" ? description.trim() : "";
  const text = (markdownString || "").replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/[#*_`>\[\]()~-]/g, " ").replace(/\s+/g, " ").trim();
  return {
    slug: `blog/${slug}`,
    title: title || slug,
    description: resolvedDescription,
    searchableText: `${title || ""} ${text}`.trim(),
  };
}

module.exports = { renderBlogBody, createBlogSearchEntry };
