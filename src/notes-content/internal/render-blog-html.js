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

// The page shell renders the post title as the single <h1>; Markdown headings nest
// one level below it.
function demoteHeadings(html) {
  return html.replace(/<(\/?)h([1-5])(\s|>)/gu, (match, slash, level, rest) => `<${slash}h${Number(level) + 1}${rest}`);
}

// Wide tables and code blocks scroll inside their own focusable region instead of
// being clipped on narrow screens.
function wrapScrollables(html) {
  return html
    .replace(/<table>/gu, '<div class="note-scroll note-table-scroll" role="region" aria-label="Table" tabindex="0"><table>')
    .replace(/<\/table>/gu, "</table></div>")
    .replace(/<pre>/gu, '<pre tabindex="0">');
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
  const html = enhanceImages(wrapScrollables(demoteHeadings(marked.parse(markdownString))), imageInfo);
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
