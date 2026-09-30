"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");

// Notion-hosted files are served through short-lived signed URLs. Anything matching
// this pattern must never reach checked-in normalized content or generated HTML.
const EXPIRING_MEDIA_URL_PATTERN =
  /(?:prod-files-secure\.s3\.[a-z0-9-]+\.amazonaws\.com|s3\.[a-z0-9-]+\.amazonaws\.com\/secure\.notion-static\.com|[?&]X-Amz-(?:Signature|Expires)=)/iu;

const RASTER_SIGNATURES = [
  { ext: "png", mime: "image/png", test: (b) => b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  { ext: "jpg", mime: "image/jpeg", test: (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: "gif", mime: "image/gif", test: (b) => b.length > 6 && b.subarray(0, 4).toString("ascii") === "GIF8" },
  {
    ext: "webp",
    mime: "image/webp",
    test: (b) => b.length > 12 && b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP",
  },
];

const MAX_MEDIA_BYTES = 15 * 1024 * 1024;
const MEDIA_ID_PATTERN = /^[a-f0-9-]{32,36}$/iu;

function isExpiringMediaUrl(url) {
  return typeof url === "string" && EXPIRING_MEDIA_URL_PATTERN.test(url);
}

function detectRasterImage(buffer) {
  const match = RASTER_SIGNATURES.find((signature) => signature.test(buffer));
  return match ? { ext: match.ext, mime: match.mime } : null;
}

function collectImageAssets(blocks, found = []) {
  if (!Array.isArray(blocks)) {
    return found;
  }

  for (const block of blocks) {
    if (block?.type === "asset" && block.kind === "image") {
      found.push(block);
    }
    collectImageAssets(block?.children, found);
  }

  return found;
}

function findExpiringMediaUrls(topicDocument) {
  const hits = [];
  function walk(blocks) {
    if (!Array.isArray(blocks)) {
      return;
    }
    for (const block of blocks) {
      if (block?.type === "asset" && isExpiringMediaUrl(block.url)) {
        hits.push({ blockId: block.blockId ?? null, kind: block.kind });
      }
      walk(block?.children);
    }
  }
  walk(topicDocument?.blocks);
  return hits;
}

function mediaFileName(blockId, ext) {
  if (typeof blockId !== "string" || !MEDIA_ID_PATTERN.test(blockId)) {
    throw new Error(`Cannot persist media for block with invalid id: ${blockId}`);
  }
  return `${blockId.toLowerCase()}.${ext}`;
}

/**
 * Replace every Notion-hosted (expiring) image URL in a normalized topic document with a
 * stable, checked-in local asset path. Captions (used as alt text) are left untouched.
 *
 * - resolveFreshUrl(block) returns a currently valid download URL for the block (e.g. by
 *   re-reading the block from the Notion API).
 * - Downloaded bytes must be a PNG, JPEG, GIF, or WebP image; anything else fails.
 */
async function persistNotionMedia({
  topicDocument,
  topicSlug,
  mediaDir,
  publicBasePath,
  fetchImpl = globalThis.fetch,
  resolveFreshUrl,
  continueOnError = false,
}) {
  if (!/^[a-z0-9-]+$/u.test(topicSlug ?? "")) {
    throw new Error("topicSlug must use lowercase letters, digits, and hyphens.");
  }

  const targetDir = path.join(mediaDir, topicSlug);
  const persisted = [];
  const failures = [];

  for (const block of collectImageAssets(topicDocument?.blocks)) {
    if (!isExpiringMediaUrl(block.url)) {
      continue;
    }

    try {
      persisted.push(await persistOne(block));
    } catch (error) {
      if (!continueOnError) {
        throw error;
      }
      failures.push({ blockId: block.blockId, error: error.message });
    }
  }

  return continueOnError ? { persisted, failures } : persisted;

  async function persistOne(block) {
    const freshUrl = resolveFreshUrl ? await resolveFreshUrl(block) : block.url;
    if (typeof freshUrl !== "string" || freshUrl.trim() === "") {
      throw new Error(`No downloadable URL available for image block ${block.blockId}.`);
    }

    const response = await fetchImpl(freshUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image block ${block.blockId}: HTTP ${response.status}.`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length === 0 || buffer.length > MAX_MEDIA_BYTES) {
      throw new Error(`Image block ${block.blockId} has unsupported size ${buffer.length} bytes.`);
    }

    const detected = detectRasterImage(buffer);
    if (!detected) {
      throw new Error(`Image block ${block.blockId} is not a supported raster image.`);
    }

    const fileName = mediaFileName(block.blockId, detected.ext);
    await fs.mkdir(targetDir, { recursive: true });
    await fs.writeFile(path.join(targetDir, fileName), buffer);

    block.url = `${publicBasePath.replace(/\/+$/u, "")}/${topicSlug}/${fileName}`;
    return { blockId: block.blockId, url: block.url, bytes: buffer.length };
  }
}

module.exports = {
  detectRasterImage,
  findExpiringMediaUrls,
  isExpiringMediaUrl,
  persistNotionMedia,
};
