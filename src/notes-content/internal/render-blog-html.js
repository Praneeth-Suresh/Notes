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

function renderBlogBody(markdownString) {
  if (typeof markdownString !== "string") {
    throw new Error("renderBlogBody expects a markdown string.");
  }
  return `<article class="blog-article">${marked.parse(markdownString)}</article>`;
}

function createBlogSearchEntry({ slug, title, markdownString }) {
  if (typeof slug !== "string" || slug.trim() === "") {
    throw new Error("slug must be a non-empty string.");
  }
  const text = (markdownString || "").replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/[#*_`>\[\]()~-]/g, " ").replace(/\s+/g, " ").trim();
  return {
    slug: `blog/${slug}`,
    title: title || slug,
    description: "",
    searchableText: `${title || ""} ${text}`.trim(),
  };
}

module.exports = { renderBlogBody, createBlogSearchEntry };
