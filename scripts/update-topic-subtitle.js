#!/usr/bin/env node
"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");

function assertNonEmptyString(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${label} must be a non-empty string.`);
  }

  return value.trim();
}

function parseArgs(argv) {
  const args = {
    manifest: "content/topic-manifest.json",
    slug: null,
    subtitle: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];

    if (item === "--manifest") {
      args.manifest = assertNonEmptyString(argv[index + 1], "--manifest value");
      index += 1;
      continue;
    }

    if (item === "--slug") {
      args.slug = assertNonEmptyString(argv[index + 1], "--slug value");
      index += 1;
      continue;
    }

    if (item === "--subtitle") {
      args.subtitle = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${item}`);
  }

  if (!args.slug) {
    throw new Error("Missing required argument: --slug");
  }

  if (args.subtitle == null) {
    throw new Error("Missing required argument: --subtitle");
  }

  return args;
}

async function updateTopicSubtitle({ manifestPath, slug, subtitle }) {
  const normalizedSlug = assertNonEmptyString(slug, "slug");
  const absoluteManifestPath = path.resolve(
    process.cwd(),
    assertNonEmptyString(manifestPath, "manifestPath"),
  );
  const raw = await fs.readFile(absoluteManifestPath, "utf8");
  const manifest = JSON.parse(raw);

  if (!Array.isArray(manifest)) {
    throw new Error("Topic manifest must be an array.");
  }

  const entry = manifest.find((item) => item?.slug === normalizedSlug);
  if (!entry) {
    throw new Error(`No topic manifest entry found for slug "${normalizedSlug}".`);
  }

  entry.description = typeof subtitle === "string" ? subtitle.trim() : "";
  await fs.writeFile(absoluteManifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  await updateTopicSubtitle({
    manifestPath: args.manifest,
    slug: args.slug,
    subtitle: args.subtitle,
  });
  console.log(`Updated subtitle for ${args.slug} in ${args.manifest}`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`update-topic-subtitle failed: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = {
  parseArgs,
  updateTopicSubtitle,
};
