"use strict";

// pages-build: join stable local media (and alt text) to Notion image blocks and
// guarantee no expiring Notion/S3 URL reaches the generated site.

const fs = require("node:fs");
const path = require("node:path");

const { isExpiringMediaUrl } = require("../../src/notion-ingestion");
const { segmentsToRichText } = require("./rich-text");

const MEDIA_PUBLIC_PREFIX = "/assets/notes-media/";
const ORIGINS = new Set(["notion-original", "replacement"]);
const SRC_PATTERN = /^\/assets\/notes-media\/[a-z0-9-]+\/[a-f0-9-]+\.(?:png|jpe?g|gif|webp|svg)$/u;

function validateMediaManifest(data, { mediaDir }) {
  if (!data || typeof data !== "object" || !data.images || typeof data.images !== "object") {
    throw new Error("Media manifest must be an object with an images map.");
  }

  const images = new Map();
  for (const [rawId, entry] of Object.entries(data.images)) {
    const id = rawId.toLowerCase();
    if (images.has(id)) {
      throw new Error(`Duplicate media manifest id ${rawId}.`);
    }
    if (!entry || typeof entry !== "object") {
      throw new Error(`Media manifest entry ${rawId} must be an object.`);
    }
    if (typeof entry.src !== "string" || !SRC_PATTERN.test(entry.src)) {
      throw new Error(`Media manifest entry ${rawId} has invalid src ${entry.src}.`);
    }
    if (typeof entry.alt !== "string" || entry.alt.trim().length < 10) {
      throw new Error(`Media manifest entry ${rawId} needs descriptive alt text.`);
    }
    if (!ORIGINS.has(entry.origin)) {
      throw new Error(`Media manifest entry ${rawId} origin must be notion-original or replacement.`);
    }
    if (entry.origin === "replacement" && (typeof entry.caption !== "string" || entry.caption.trim() === "")) {
      throw new Error(`Media manifest entry ${rawId} is a replacement and needs a visible provenance caption.`);
    }
    const relative = entry.src.slice(MEDIA_PUBLIC_PREFIX.length);
    const filePath = path.join(mediaDir, relative);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Media manifest entry ${rawId} points at missing file ${filePath}.`);
    }
    images.set(id, { ...entry, alt: entry.alt.trim(), filePath, relative });
  }

  return images;
}

/**
 * Returns a copy of topicDocument where every image block listed in the media manifest
 * uses its stable local src and alt text. Records which manifest ids were used.
 * Throws if any asset still has an expiring Notion-hosted URL.
 */
function applyMediaToTopic({ topicSlug, topicDocument, images, usedIds }) {
  const expiring = [];

  function mapBlocks(blocks) {
    if (!Array.isArray(blocks)) {
      return blocks;
    }
    return blocks.map((block) => {
      let next = block;
      if (block?.type === "asset") {
        const key = typeof block.blockId === "string" ? block.blockId.toLowerCase() : null;
        const media = key ? images.get(key) : null;
        if (media && block.kind === "image") {
          next = { ...block, url: media.src, alt: media.alt };
          if (Number.isInteger(media.width) && Number.isInteger(media.height)) {
            next.width = media.width;
            next.height = media.height;
          }
          if (media.caption && (!Array.isArray(block.caption) || block.caption.length === 0)) {
            next.caption = segmentsToRichText([{ text: media.caption }], `media ${key} caption`);
          }
          usedIds.add(key);
        }
        if (isExpiringMediaUrl(next.url)) {
          expiring.push(block.blockId ?? "(no blockId)");
        }
      }
      if (Array.isArray(next.children)) {
        next = { ...next, children: mapBlocks(next.children) };
      }
      return next;
    });
  }

  const blocks = mapBlocks(topicDocument.blocks);
  if (expiring.length > 0) {
    throw new Error(
      `Topic "${topicSlug}" still references expiring Notion media URLs for blocks: ${expiring.join(", ")}. Run scripts/persist-topic-media.js or add the image to content/media/media-manifest.json.`,
    );
  }

  return { ...topicDocument, blocks };
}

function assertAllMediaUsed(images, usedIds) {
  const unused = [...images.keys()].filter((id) => !usedIds.has(id));
  if (unused.length > 0) {
    throw new Error(`Media manifest lists image blocks that no topic contains: ${unused.join(", ")}.`);
  }
}

module.exports = {
  MEDIA_PUBLIC_PREFIX,
  applyMediaToTopic,
  assertAllMediaUsed,
  validateMediaManifest,
};
