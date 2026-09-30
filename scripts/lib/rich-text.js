"use strict";

// pages-build: rich-text helpers shared by build-time sidecars.

const EMPTY_ANNOTATIONS = Object.freeze({
  bold: false,
  italic: false,
  strikethrough: false,
  underline: false,
  code: false,
  color: "default",
});

function plainTextOf(richText) {
  if (!Array.isArray(richText)) {
    return "";
  }
  return richText
    .map((node) => (node?.type === "equation" ? node.expression ?? "" : node?.content ?? ""))
    .join("");
}

function normalizeWhitespace(value) {
  return String(value ?? "").replace(/\s+/gu, " ").trim();
}

/**
 * Convert compact sidecar segments into canonical rich-text nodes.
 *   { "text": "..." }                 plain text
 *   { "text": "...", "href": "..." }  link
 *   { "code": "..." }                 inline code
 *   { "math": "..." }                 inline LaTeX
 *   { "bold": "..." } / { "italic": "..." }
 */
function segmentsToRichText(segments, label) {
  if (!Array.isArray(segments) || segments.length === 0) {
    throw new Error(`${label} must be a non-empty array of rich-text segments.`);
  }

  return segments.map((segment, index) => {
    if (!segment || typeof segment !== "object") {
      throw new Error(`${label}[${index}] must be an object.`);
    }
    if (typeof segment.math === "string") {
      return { type: "equation", expression: segment.math };
    }
    const kinds = ["text", "code", "bold", "italic"].filter((key) => typeof segment[key] === "string");
    if (kinds.length !== 1) {
      throw new Error(`${label}[${index}] must have exactly one of text, code, bold, italic, or math.`);
    }
    const kind = kinds[0];
    const href = typeof segment.href === "string" && segment.href.trim() !== "" ? segment.href.trim() : null;
    if (href && !/^(?:https:\/\/|\/)/u.test(href)) {
      throw new Error(`${label}[${index}].href must be an https:// URL or a site-relative path.`);
    }
    return {
      type: "text",
      content: segment[kind],
      annotations: {
        ...EMPTY_ANNOTATIONS,
        code: kind === "code",
        bold: kind === "bold",
        italic: kind === "italic",
      },
      href,
    };
  });
}

module.exports = {
  normalizeWhitespace,
  plainTextOf,
  segmentsToRichText,
};
