#!/usr/bin/env node
"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");

const { createNotionIngestionContext } = require("../src/notion-ingestion");
const { createNotesContentContext } = require("../src/notes-content");
const { createSiteStylingContext } = require("../src/site-styling");

function assertNonEmptyString(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${label} must be a non-empty string.`);
  }

  return value.trim();
}

function parseArgs(argv) {
  const args = {
    manifest: "content/topic-manifest.json",
    out: "dist",
    siteTitle: "Computer Science Notes",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];

    if (item === "--manifest") {
      args.manifest = assertNonEmptyString(argv[index + 1], "--manifest value");
      index += 1;
      continue;
    }

    if (item === "--out") {
      args.out = assertNonEmptyString(argv[index + 1], "--out value");
      index += 1;
      continue;
    }

    if (item === "--site-title") {
      args.siteTitle = assertNonEmptyString(argv[index + 1], "--site-title value");
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${item}`);
  }

  return args;
}

async function readJsonFromFile(absolutePath, label) {
  const raw = await fs.readFile(absolutePath, "utf8");
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`Failed to parse ${label} (${absolutePath}): ${error.message}`);
  }
}

function validateSlug(slug) {
  const normalized = assertNonEmptyString(slug, "topic.slug");
  if (!/^[a-z0-9-]+$/u.test(normalized)) {
    throw new Error(`topic.slug "${slug}" is invalid. Use lowercase letters, digits, and hyphens.`);
  }
  return normalized;
}

function validateManifestEntry(entry) {
  if (!entry || typeof entry !== "object") {
    throw new Error("Each manifest entry must be an object.");
  }

  const slug = validateSlug(entry.slug);
  const title = typeof entry.title === "string" && entry.title.trim() !== "" ? entry.title.trim() : null;
  const description =
    typeof entry.description === "string" && entry.description.trim() !== ""
      ? entry.description.trim()
      : "";

  if (!entry.source || typeof entry.source !== "object") {
    throw new Error(`Manifest entry "${slug}" must include source.`);
  }

  if (entry.source.kind !== "normalized-file" && entry.source.kind !== "notion-page") {
    throw new Error(
      `Manifest entry "${slug}" has unsupported source.kind "${entry.source.kind}".`,
    );
  }

  return {
    slug,
    title,
    description,
    source: entry.source,
  };
}

async function loadTopicDocument({ manifestEntry, notionContext, manifestDir }) {
  if (manifestEntry.source.kind === "normalized-file") {
    const relativePath = assertNonEmptyString(manifestEntry.source.path, "source.path");
    const absolutePath = path.resolve(manifestDir, relativePath);
    const document = await readJsonFromFile(absolutePath, `topic source for ${manifestEntry.slug}`);
    return document;
  }

  const pageId = assertNonEmptyString(manifestEntry.source.pageId, "source.pageId");
  const notionToken = process.env.NOTION_API_TOKEN;
  if (!notionToken) {
    throw new Error(
      `Manifest entry "${manifestEntry.slug}" requires NOTION_API_TOKEN for notion-page source.`,
    );
  }

  const notionVersion = manifestEntry.source.notionVersion;
  return notionContext.pullTopicFromNotion({
    pageId,
    notionToken,
    notionVersion,
  });
}

function normalizeTopicDocument(document, manifestEntry) {
  if (!document || typeof document !== "object") {
    throw new Error(`Topic "${manifestEntry.slug}" source did not produce an object.`);
  }

  if (!Array.isArray(document.blocks)) {
    throw new Error(`Topic "${manifestEntry.slug}" source must include a blocks array.`);
  }

  const resolvedTitle =
    manifestEntry.title ??
    (typeof document.title === "string" && document.title.trim() !== ""
      ? document.title.trim()
      : manifestEntry.slug);

  const resolvedDescription =
    manifestEntry.description ||
    (typeof document.description === "string" ? document.description : "");

  return {
    ...document,
    title: resolvedTitle,
    description: resolvedDescription,
  };
}

async function writeUtf8File(absolutePath, content) {
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, content, "utf8");
}

async function buildPagesSite({ manifestPath, outputDir, siteTitle }) {
  const absoluteManifestPath = path.resolve(process.cwd(), manifestPath);
  const manifestDir = path.dirname(absoluteManifestPath);
  const absoluteOutputDir = path.resolve(process.cwd(), outputDir);

  const manifest = await readJsonFromFile(absoluteManifestPath, "topic manifest");
  if (!Array.isArray(manifest)) {
    throw new Error("Topic manifest must be an array.");
  }

  const notionContext = createNotionIngestionContext();
  const notesContentContext = createNotesContentContext();
  const stylingContext = createSiteStylingContext();

  const topics = [];
  for (const rawEntry of manifest) {
    const manifestEntry = validateManifestEntry(rawEntry);
    const loadedDocument = await loadTopicDocument({
      manifestEntry,
      notionContext,
      manifestDir,
    });
    const topicDocument = normalizeTopicDocument(loadedDocument, manifestEntry);
    topics.push({
      slug: manifestEntry.slug,
      title: topicDocument.title,
      description: topicDocument.description,
      topicDocument,
    });
  }

  await fs.rm(absoluteOutputDir, { recursive: true, force: true });
  await fs.mkdir(absoluteOutputDir, { recursive: true });

  const cssPath = path.join(absoluteOutputDir, "assets", "site.css");
  await writeUtf8File(cssPath, stylingContext.getSiteCss());

  const searchIndex = [];

  for (const topic of topics) {
    const topicBodyHtml = notesContentContext.renderTopicBody(topic.topicDocument);
    const topicPageHtml = stylingContext.renderTopicPage({
      siteTitle,
      topic,
      topicContentHtml: topicBodyHtml,
      topics,
    });

    const topicPath = path.join(absoluteOutputDir, "topics", topic.slug, "index.html");
    await writeUtf8File(topicPath, topicPageHtml);

    searchIndex.push(
      notesContentContext.createSearchEntry({
        slug: topic.slug,
        topicDocument: topic.topicDocument,
      }),
    );
  }

  const indexHtml = stylingContext.renderHomePage({
    siteTitle,
    topics,
  });

  await writeUtf8File(path.join(absoluteOutputDir, "index.html"), indexHtml);
  await writeUtf8File(
    path.join(absoluteOutputDir, "search-index.json"),
    `${JSON.stringify(searchIndex, null, 2)}\n`,
  );
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  buildPagesSite({
    manifestPath: args.manifest,
    outputDir: args.out,
    siteTitle: args.siteTitle,
  }).catch((error) => {
    console.error(`build-pages failed: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = {
  buildPagesSite,
};

