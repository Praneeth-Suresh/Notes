#!/usr/bin/env node
"use strict";

// Repairs checked-in normalized topic files whose image blocks still point at expiring
// Notion/S3 signed URLs: re-reads each block from Notion for a fresh URL, stores the
// image under content/media/<slug>/, and rewrites the block URL to a stable local path.
//
// Usage: NOTION_API_TOKEN=... node scripts/persist-topic-media.js [--manifest path] [--media-dir path]

const path = require("node:path");
const fs = require("node:fs/promises");

const { createNotionIngestionContext } = require("../src/notion-ingestion");

async function main() {
  const argv = process.argv.slice(2);
  let manifestPath = "content/topic-manifest.json";
  let mediaDir = path.join("content", "media");
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--manifest") {
      manifestPath = argv[++index];
    } else if (argv[index] === "--media-dir") {
      mediaDir = argv[++index];
    } else {
      throw new Error(`Unknown argument: ${argv[index]}`);
    }
  }

  const notionToken = process.env.NOTION_API_TOKEN;
  if (!notionToken) {
    throw new Error("NOTION_API_TOKEN is required to refresh expired Notion media URLs.");
  }

  const absoluteManifestPath = path.resolve(process.cwd(), manifestPath);
  const manifest = JSON.parse(await fs.readFile(absoluteManifestPath, "utf8"));
  const context = createNotionIngestionContext();
  let failed = 0;

  for (const entry of manifest) {
    if (entry?.source?.kind !== "normalized-file") {
      continue;
    }
    const filePath = path.resolve(path.dirname(absoluteManifestPath), entry.source.path);
    const topicDocument = await context.readNormalizedTopicFile({ filePath });
    const { persisted, failures } = await context.persistTopicMedia({
      topicDocument,
      topicSlug: entry.slug,
      mediaDir,
      notionToken,
      continueOnError: true,
    });
    for (const failure of failures) {
      failed += 1;
      console.error(`${entry.slug}: FAILED ${failure.blockId}: ${failure.error}`);
    }
    if (persisted.length > 0) {
      await context.writeNormalizedTopicFile({ topicDocument, filePath });
      for (const item of persisted) {
        console.log(`${entry.slug}: ${item.blockId} -> ${item.url} (${item.bytes} bytes)`);
      }
    }
  }

  if (failed > 0) {
    throw new Error(`${failed} image(s) could not be refreshed; see messages above.`);
  }
}

main().catch((error) => {
  console.error(`persist-topic-media failed: ${error.message}`);
  process.exitCode = 1;
});
