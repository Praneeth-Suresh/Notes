#!/usr/bin/env node
"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");

const { createNotionIngestionContext } = require("../src/notion-ingestion");
const { createNotesContentContext } = require("../src/notes-content");
const { createSiteStylingContext } = require("../src/site-styling");
const { applyCorrectionsToTopic, validateCorrections } = require("./lib/content-corrections");
const {
  MEDIA_PUBLIC_PREFIX,
  applyMediaToTopic,
  assertAllMediaUsed,
  validateMediaManifest,
} = require("./lib/note-media");
const {
  STATUSES,
  joinPublication,
  normalizeNoteId,
  validatePublicationSidecar,
} = require("./lib/publication-metadata");

const { computeNextReadings } = require("./lib/reading-paths");
const { fingerprint, resolveRouteDates, validateRouteDates } = require("./lib/route-dates");
const { assertRedirectsConsistent, renderRedirectsFile, validateRedirects } = require("./lib/redirects");

const DEFAULT_PUBLICATION_PATH = "content/publication/notes.json";
const DEFAULT_CORRECTIONS_PATH = "content/publication/corrections.json";
const DEFAULT_MEDIA_DIR = "content/media";

const DEFAULT_MATHJAX_SOURCE_PATH = path.resolve(
  __dirname,
  "..",
  "vendor",
  "mathjax",
  "tex-svg-full.js",
);
const MATHJAX_ASSET_PATH = path.join("assets", "vendor", "mathjax", "tex-svg-full.js");
const SOCIAL_PREVIEW_SOURCE_PATH = path.join("content", "social", "theoretical-cs-preview.svg");
const SOCIAL_PREVIEW_ASSET_PATH = path.join("assets", "social", "theoretical-cs-preview.svg");
const CV_SOURCE_PATH = "cv.pdf";
const CV_ASSET_PATH = "cv.pdf";
const STATIC_ARTIFACTS = [
  "deep-learning-paper-trail.md",
  "np-completeness-reduction-template.tex",
];
const DEFAULT_PORTFOLIO_DATA_PATH = "content/portfolio-repositories.json";
const DEFAULT_RESEARCH_TASTE_DATA_PATH = "content/research-taste.json";
const DEFAULT_PROJECTS_DATA_PATH = "content/projects.json";
const DEFAULT_BLOG_MANIFEST_PATH = "content/blog/blog-manifest.json";
const DEFAULT_SITE_METADATA_PATH = "content/site-metadata.json";
const DEFAULT_SITE_URL = "https://notes.praneeth-suresh-s.workers.dev";

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
    portfolioData: DEFAULT_PORTFOLIO_DATA_PATH,
    projectsData: DEFAULT_PROJECTS_DATA_PATH,
    researchTasteData: DEFAULT_RESEARCH_TASTE_DATA_PATH,
    siteMetadata: DEFAULT_SITE_METADATA_PATH,
    siteTitle: "Praneeth's CS Field Notes",
    siteUrl: DEFAULT_SITE_URL,
    publication: DEFAULT_PUBLICATION_PATH,
    corrections: DEFAULT_CORRECTIONS_PATH,
    mediaDir: DEFAULT_MEDIA_DIR,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];

    if (item === "--publication") {
      args.publication = assertNonEmptyString(argv[index + 1], "--publication value");
      index += 1;
      continue;
    }

    if (item === "--corrections") {
      args.corrections = assertNonEmptyString(argv[index + 1], "--corrections value");
      index += 1;
      continue;
    }

    if (item === "--media-dir") {
      args.mediaDir = assertNonEmptyString(argv[index + 1], "--media-dir value");
      index += 1;
      continue;
    }

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

    if (item === "--portfolio-data") {
      args.portfolioData = assertNonEmptyString(argv[index + 1], "--portfolio-data value");
      index += 1;
      continue;
    }

    if (item === "--projects-data") {
      args.projectsData = assertNonEmptyString(argv[index + 1], "--projects-data value");
      index += 1;
      continue;
    }

    if (item === "--research-taste-data") {
      args.researchTasteData = assertNonEmptyString(argv[index + 1], "--research-taste-data value");
      index += 1;
      continue;
    }

    if (item === "--site-metadata") {
      args.siteMetadata = assertNonEmptyString(argv[index + 1], "--site-metadata value");
      index += 1;
      continue;
    }

    if (item === "--site-url") {
      args.siteUrl = assertNonEmptyString(argv[index + 1], "--site-url value");
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

function normalizePillarLinks(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => item && typeof item === "object")
    .map((item) => ({
      title: typeof item.title === "string" ? item.title.trim() : "",
      description: typeof item.description === "string" ? item.description.trim() : "",
      href: typeof item.href === "string" ? item.href.trim() : "",
    }))
    .filter((item) => item.title !== "" && item.href.startsWith("/"));
}

function normalizePillarConfig(value) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const startHere = normalizePillarLinks(value.startHere);
  const readingPath = Array.isArray(value.readingPath)
    ? value.readingPath
        .filter((section) => section && typeof section === "object")
        .map((section) => ({
          label: typeof section.label === "string" ? section.label.trim() : "",
          links: normalizePillarLinks(section.links),
        }))
        .filter((section) => section.label !== "" && section.links.length > 0)
    : [];

  if (startHere.length === 0 && readingPath.length === 0) {
    return null;
  }

  return { startHere, readingPath };
}

function normalizeSiteUrl(siteUrl) {
  const normalized = assertNonEmptyString(siteUrl, "siteUrl").replace(/\/+$/u, "");
  try {
    const url = new URL(normalized);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      throw new Error("protocol must be http or https");
    }
    return normalized;
  } catch (error) {
    throw new Error(`siteUrl must be an absolute HTTP(S) URL: ${error.message}`);
  }
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function absoluteSiteUrl(siteUrl, urlPath) {
  const pathPart = typeof urlPath === "string" && urlPath.startsWith("/")
    ? urlPath
    : `/${urlPath || ""}`;
  return `${siteUrl}${pathPart}`;
}

function normalizeLastModified(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const normalized = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(normalized)) {
    throw new Error(`${label} must use YYYY-MM-DD format.`);
  }

  const parsed = new Date(`${normalized}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== normalized) {
    throw new Error(`${label} must be a valid calendar date.`);
  }

  return normalized;
}

function latestLastModified(values) {
  return values.filter(Boolean).sort().at(-1) || null;
}

function renderRssFeed({ siteTitle, siteUrl, feedItems }) {
  const items = feedItems
    .map((item) => {
      const absoluteUrl = absoluteSiteUrl(siteUrl, item.urlPath);
      const description = item.description && item.description.trim() !== ""
        ? item.description.trim()
        : `Read ${item.title} on ${siteTitle}.`;

      const pubDate = item.date ? `
      <pubDate>${new Date(`${item.date}T00:00:00.000Z`).toUTCString()}</pubDate>` : "";
      return `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(absoluteUrl)}</link>
      <guid>${escapeXml(absoluteUrl)}</guid>
      <description>${escapeXml(description)}</description>${pubDate}
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteTitle)}</title>
    <link>${escapeXml(siteUrl)}/</link>
    <atom:link href="${escapeXml(siteUrl)}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Praneeth Suresh's public computer science notes and writing: algorithms, systems, AI engineering, and software engineering.</description>
${items}
  </channel>
</rss>
`;
}

function uniqueSitemapItems(items) {
  const uniqueItems = new Map();
  for (const item of items) {
    const pathPart = typeof item.urlPath === "string" && item.urlPath.startsWith("/")
      ? item.urlPath
      : null;
    if (!pathPart) {
      continue;
    }

    const existing = uniqueItems.get(pathPart);
    uniqueItems.set(pathPart, {
      urlPath: pathPart,
      lastModified: latestLastModified([existing?.lastModified, item.lastModified]),
    });
  }

  return [...uniqueItems.values()];
}

function renderSitemapXml({ siteUrl, sitemapItems }) {
  const urls = uniqueSitemapItems(sitemapItems)
    .map((item) => `  <url>
    <loc>${escapeXml(absoluteSiteUrl(siteUrl, item.urlPath))}</loc>${item.lastModified ? `
    <lastmod>${escapeXml(item.lastModified)}</lastmod>` : ""}
  </url>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function renderRobotsTxt({ siteUrl }) {
  return `User-agent: *
Allow: /

Sitemap: ${absoluteSiteUrl(siteUrl, "/sitemap.xml")}
`;
}

function slugifyPathSegment(value, fallback) {
  const base = typeof value === "string" && value.trim() !== "" ? value : fallback;
  const slug = String(base)
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-+|-+$/g, "");

  return slug || fallback;
}

function uniqueSegment(baseSegment, usedSegments) {
  let candidate = baseSegment;
  let counter = 2;

  while (usedSegments.has(candidate)) {
    candidate = `${baseSegment}-${counter}`;
    counter += 1;
  }

  usedSegments.add(candidate);
  return candidate;
}

async function pathExists(absolutePath) {
  try {
    await fs.access(absolutePath);
    return true;
  } catch (error) {
    return false;
  }
}

async function readOptionalJsonFromFile(absolutePath, label) {
  if (!(await pathExists(absolutePath))) {
    return null;
  }

  return readJsonFromFile(absolutePath, label);
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
    updatedAt: normalizeLastModified(entry.updatedAt, `Manifest entry "${slug}" updatedAt`),
    databaseLabelProperties: Array.isArray(entry.databaseLabelProperties)
      ? entry.databaseLabelProperties
          .filter((propertyName) => typeof propertyName === "string" && propertyName.trim() !== "")
          .map((propertyName) => propertyName.trim())
      : [],
    pillar: normalizePillarConfig(entry.pillar),
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
    databaseLabelProperties: manifestEntry.databaseLabelProperties,
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

function cloneBlockForPage(block, childPageRecords, parentUrlPath) {
  const cloned = { ...block };

  if (block.type !== "child_page") {
    if (Array.isArray(block.children)) {
      cloned.children = block.children.map((child) =>
        cloneBlockForPage(child, childPageRecords, parentUrlPath),
      );
    }

    return cloned;
  }

  const record = childPageRecords.get(block);
  if (record) {
    cloned.href = record.urlPath;
  } else {
    const fallbackSegment = block.blockId ? slugifyPathSegment(block.blockId, "subpage") : "subpage";
    cloned.href = `${parentUrlPath}${fallbackSegment}/`;
  }

  delete cloned.children;
  return cloned;
}

const GATEWAY_ROUTES = [
  "/",
  "/start-here/",
  "/research-taste/",
  "/errata/",
  "/subscribe/",
  "/about/",
  "/notes/",
  "/projects/",
  "/contact/",
];
const GATEWAY_TITLES = {
  "/": "Home",
  "/start-here/": "Start here",
  "/research-taste/": "Research questions",
  "/errata/": "Errata",
  "/subscribe/": "Follow by RSS",
  "/about/": "About",
  "/notes/": "Notes",
  "/projects/": "Projects",
  "/contact/": "Contact",
  "/blog/": "Writing",
};

function ancestorsOf(record, recordsByUrl) {
  const chain = [];
  let parentUrl = record.parentUrlPath;
  while (parentUrl) {
    const parent = recordsByUrl.get(parentUrl);
    if (!parent) {
      break;
    }
    chain.unshift({ title: parent.title, urlPath: parent.urlPath });
    parentUrl = parent.parentUrlPath;
  }
  return chain;
}

// Blog images: prefer the checked-in optimized WebP (content/blog/images-optimized,
// produced by scripts/optimize-images.py) and give <img> its intrinsic size.
async function loadBlogImageInfo(blogContentDir) {
  const manifestPath = path.join(blogContentDir, "images-optimized", "manifest.json");
  const optimized = (await readOptionalJsonFromFile(manifestPath, "optimized blog images"))?.images || {};
  function lookup(src) {
    const match = /^\/blog\/images\/([^/?#]+)$/u.exec(src);
    const entry = match ? optimized[decodeURIComponent(match[1])] : null;
    return entry
      ? { src: `/blog/images/${entry.file}`, width: entry.width, height: entry.height }
      : null;
  }
  return { optimized, lookup };
}

async function copyBlogImages({ blogContentDir, outputDir, imageInfo }) {
  const sourceDir = path.join(blogContentDir, "images");
  if (!(await pathExists(sourceDir))) {
    return;
  }
  const files = await fs.readdir(sourceDir, { withFileTypes: true });
  for (const file of files) {
    if (!file.isFile()) {
      continue;
    }
    const optimized = imageInfo.optimized[file.name];
    await copyFileToOutput({
      sourcePath: optimized
        ? path.join(blogContentDir, "images-optimized", optimized.file)
        : path.join(sourceDir, file.name),
      outputDir,
      outputRelativePath: path.join("blog", "images", optimized ? optimized.file : file.name),
      label: `blog image ${file.name}`,
    });
  }
}

// The blog index shows its own heading; drop the Markdown intro's heading and banner image.
function stripLeadingHeadingAndImage(markdown) {
  return markdown
    .replace(/^\s*#\s+[^\n]*\n+/u, "")
    .replace(/^\s*!\[[^\]]*\]\([^)]*\)\s*\n+/u, "");
}

function compactSearchEntry(entry) {
  const compact = {
    slug: entry.slug,
    title: entry.title,
    description: entry.description,
    searchableText: String(entry.searchableText || "").replace(/\s+/gu, " ").trim(),
    urlPath: entry.urlPath,
    parentTitle: entry.parentTitle || "",
    topicTitle: entry.topicTitle || "",
    labels: entry.labels || [],
    status: entry.status || null,
    contentType: entry.contentType || null,
    reviewedAt: entry.reviewedAt || null,
  };
  return compact;
}

function defaultPublication(record) {
  // Used only when no publication sidecar is configured (e.g. isolated fixture builds).
  // The safe default is always Working note; nothing is ever promoted automatically.
  return {
    id: normalizeNoteId(record.noteId),
    route: record.urlPath,
    status: "Working note",
    statusSlug: STATUSES["Working note"].slug,
    statusSummary: STATUSES["Working note"].summary,
    contentType: record.parentTitle ? "Explainer" : "Topic overview",
    reviewedAt: null,
    knownGaps: [],
    related: [],
    archiveReason: null,
  };
}

function publicationSummary(publication) {
  if (!publication) {
    return null;
  }
  return {
    status: publication.status,
    statusSlug: publication.statusSlug,
    contentType: publication.contentType,
    reviewedAt: publication.reviewedAt,
  };
}

function publicationSearchFields(publication) {
  return {
    status: publication?.status ?? null,
    contentType: publication?.contentType ?? null,
    reviewedAt: publication?.reviewedAt ?? null,
  };
}

function annotateChildPagePublication(blocks, recordsByUrl) {
  if (!Array.isArray(blocks)) {
    return blocks;
  }
  return blocks.map((block) => {
    if (block?.type === "child_page") {
      const record = typeof block.href === "string" ? recordsByUrl.get(block.href) : null;
      return record ? { ...block, publication: publicationSummary(record.publication) } : block;
    }
    if (Array.isArray(block?.children)) {
      return { ...block, children: annotateChildPagePublication(block.children, recordsByUrl) };
    }
    return block;
  });
}

function collectPageRecords({ rootDocument, topicSlug, topicTitle, topicDescription }) {
  const childPageRecords = new Map();
  const pageRecords = [];
  const usedSegmentsByParentRoute = new Map();

  function usedSegmentsForParent(parentSegments) {
    const key = parentSegments.join("/");
    if (!usedSegmentsByParentRoute.has(key)) {
      usedSegmentsByParentRoute.set(key, new Set());
    }

    return usedSegmentsByParentRoute.get(key);
  }

  function collectChildPages(blocks, parentSegments, parentTitle, parentDescription) {
    if (!Array.isArray(blocks)) {
      return;
    }

    for (const block of blocks) {
      if (block.type !== "child_page") {
        collectChildPages(block.children, parentSegments, parentTitle, parentDescription);
        continue;
      }

      const fallback = block.blockId ? slugifyPathSegment(block.blockId, "subpage") : "subpage";
      const segment = uniqueSegment(
        slugifyPathSegment(block.title, fallback),
        usedSegmentsForParent(parentSegments),
      );
      const routeSegments = [...parentSegments, segment];
      const parentUrlPath = parentSegments.length > 0
        ? `/topics/${topicSlug}/${parentSegments.join("/")}/`
        : `/topics/${topicSlug}/`;
      const title = typeof block.title === "string" && block.title.trim() !== ""
        ? block.title.trim()
        : "Untitled subpage";
      const urlPath = `/topics/${topicSlug}/${routeSegments.join("/")}/`;
      const childBlocks = Array.isArray(block.children) ? block.children : [];
      const record = {
        key: `${topicSlug}/${routeSegments.join("/")}`,
        slug: `${topicSlug}/${routeSegments.join("/")}`,
        urlPath,
        outputSegments: ["topics", topicSlug, ...routeSegments],
        title,
        description: parentDescription,
        labels: Array.isArray(block.labels) ? block.labels : [],
        parentTitle,
        parentUrlPath,
        noteId: typeof block.blockId === "string" ? block.blockId : null,
        sourceBlock: block,
        sourceBlocks: childBlocks,
      };

      childPageRecords.set(block, record);
      pageRecords.push(record);
      collectChildPages(childBlocks, routeSegments, title, parentDescription);
    }
  }

  collectChildPages(rootDocument.blocks, [], topicTitle, topicDescription);

  const rootRecord = {
    key: topicSlug,
    slug: topicSlug,
    urlPath: `/topics/${topicSlug}/`,
    outputSegments: ["topics", topicSlug],
    title: topicTitle,
    description: topicDescription,
    labels: Array.isArray(rootDocument.labels) ? rootDocument.labels : [],
    parentTitle: null,
    noteId: typeof rootDocument.source?.pageId === "string" ? rootDocument.source.pageId : null,
    sourceBlock: null,
    sourceBlocks: rootDocument.blocks,
  };

  return [rootRecord, ...pageRecords].map((record) => ({
    ...record,
    topicDocument: {
      ...rootDocument,
      title: record.title,
      description: record.description,
      labels: record.labels,
      blocks: record.sourceBlocks.map((block) =>
        cloneBlockForPage(block, childPageRecords, record.urlPath),
      ),
    },
  }));
}

async function writeUtf8File(absolutePath, content) {
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, content, "utf8");
}

async function copyFileToOutput({ sourcePath, outputDir, outputRelativePath, label }) {
  const absoluteSourcePath = path.resolve(process.cwd(), sourcePath);
  const absoluteDestinationPath = path.join(outputDir, outputRelativePath);

  try {
    await fs.mkdir(path.dirname(absoluteDestinationPath), { recursive: true });
    await fs.copyFile(absoluteSourcePath, absoluteDestinationPath);
  } catch (error) {
    throw new Error(`Failed to copy ${label} from ${absoluteSourcePath}: ${error.message}`);
  }
}

async function copyDirectoryFilesToOutput({ sourceDir, outputDir, outputRelativeDir, label }) {
  if (!(await pathExists(sourceDir))) {
    return;
  }

  const files = await fs.readdir(sourceDir, { withFileTypes: true });
  for (const file of files) {
    if (!file.isFile()) {
      continue;
    }

    await copyFileToOutput({
      sourcePath: path.join(sourceDir, file.name),
      outputDir,
      outputRelativePath: path.join(outputRelativeDir, file.name),
      label: `${label} ${file.name}`,
    });
  }
}

async function replaceDirectoryAtomically({ sourceDir, targetDir }) {
  const parentDir = path.dirname(targetDir);
  const baseName = path.basename(targetDir);
  const backupDir = path.join(parentDir, `.${baseName}.previous-${process.pid}-${Date.now()}`);
  const hadExistingTarget = await pathExists(targetDir);

  if (hadExistingTarget) {
    await fs.rename(targetDir, backupDir);
  }

  try {
    await fs.rename(sourceDir, targetDir);
  } catch (error) {
    if (hadExistingTarget) {
      await fs.rename(backupDir, targetDir);
    }
    throw error;
  }

  if (hadExistingTarget) {
    await fs.rm(backupDir, { recursive: true, force: true });
  }
}

async function buildPagesSite({
  manifestPath,
  outputDir,
  portfolioDataPath = DEFAULT_PORTFOLIO_DATA_PATH,
  projectsDataPath = DEFAULT_PROJECTS_DATA_PATH,
  researchTasteDataPath = DEFAULT_RESEARCH_TASTE_DATA_PATH,
  siteMetadataPath = DEFAULT_SITE_METADATA_PATH,
  siteTitle,
  siteUrl = DEFAULT_SITE_URL,
  mathJaxSourcePath = DEFAULT_MATHJAX_SOURCE_PATH,
  publicationPath = null,
  correctionsPath = null,
  mediaDir = null,
  routeDatesMode = "enforce",
}) {
  const absoluteManifestPath = path.resolve(process.cwd(), manifestPath);
  const manifestDir = path.dirname(absoluteManifestPath);
  const absoluteOutputDir = path.resolve(process.cwd(), outputDir);
  const normalizedSiteUrl = normalizeSiteUrl(siteUrl);
  const outputParentDir = path.dirname(absoluteOutputDir);
  const outputBaseName = path.basename(absoluteOutputDir);

  const manifest = await readJsonFromFile(absoluteManifestPath, "topic manifest");
  if (!Array.isArray(manifest)) {
    throw new Error("Topic manifest must be an array.");
  }

  const notionContext = createNotionIngestionContext();
  const notesContentContext = createNotesContentContext();
  const stylingContext = createSiteStylingContext();
  const portfolioData = await readOptionalJsonFromFile(
    path.resolve(process.cwd(), portfolioDataPath),
    "portfolio repository data",
  );
  const projectsData = await readOptionalJsonFromFile(
    path.resolve(process.cwd(), projectsDataPath),
    "projects data",
  );
  const researchTasteData = await readOptionalJsonFromFile(
    path.resolve(process.cwd(), researchTasteDataPath),
    "research taste data",
  );
  const siteMetadata = await readOptionalJsonFromFile(
    path.resolve(process.cwd(), siteMetadataPath),
    "site metadata",
  );
  // One public site name for HTML, JSON-LD, and RSS: content/site-metadata.json wins over
  // the CLI flag so a deployment's build command cannot drift from the checked-in name.
  if (typeof siteMetadata?.siteTitle === "string" && siteMetadata.siteTitle.trim() !== "") {
    siteTitle = siteMetadata.siteTitle.trim();
  }
  const configuredSiteLastModified = normalizeLastModified(
    siteMetadata?.lastModified,
    "site metadata lastModified",
  );

  // Checked-in sidecars live beside the topic manifest (content/publication/*.json,
  // content/media/). Explicit paths must exist; otherwise adjacent files are discovered.
  // Isolated fixture builds without sidecars fall back to Working note for every page.
  const adjacent = async (explicitPath, relativeToManifest) => {
    if (explicitPath) {
      return path.resolve(process.cwd(), explicitPath);
    }
    const candidate = path.join(manifestDir, relativeToManifest);
    return (await pathExists(candidate)) ? candidate : null;
  };
  const resolvedCorrectionsPath = await adjacent(correctionsPath, path.join("publication", "corrections.json"));
  const resolvedPublicationPath = await adjacent(publicationPath, path.join("publication", "notes.json"));
  const absoluteMediaDir = await adjacent(mediaDir, "media");

  const corrections = resolvedCorrectionsPath
    ? validateCorrections(await readJsonFromFile(resolvedCorrectionsPath, "content corrections"))
    : [];
  const mediaImages = absoluteMediaDir
    ? validateMediaManifest(
        await readJsonFromFile(path.join(absoluteMediaDir, "media-manifest.json"), "media manifest"),
        { mediaDir: absoluteMediaDir },
      )
    : new Map();
  const usedMediaIds = new Set();
  const publicationSidecar = resolvedPublicationPath
    ? validatePublicationSidecar(await readJsonFromFile(resolvedPublicationPath, "publication sidecar"))
    : null;

  const topics = [];
  for (const rawEntry of manifest) {
    const manifestEntry = validateManifestEntry(rawEntry);
    const loadedDocument = await loadTopicDocument({
      manifestEntry,
      notionContext,
      manifestDir,
    });
    const normalizedDocument = normalizeTopicDocument(loadedDocument, manifestEntry);
    const correctedDocument = applyCorrectionsToTopic({
      topicSlug: manifestEntry.slug,
      topicDocument: normalizedDocument,
      corrections,
    });
    const topicDocument = applyMediaToTopic({
      topicSlug: manifestEntry.slug,
      topicDocument: correctedDocument,
      images: mediaImages,
      usedIds: usedMediaIds,
    });
    topics.push({
      slug: manifestEntry.slug,
      title: topicDocument.title,
      description: topicDocument.description,
      updatedAt: manifestEntry.updatedAt,
      pillar: manifestEntry.pillar,
      topicDocument,
    });
  }

  const blogManifestPath = path.resolve(manifestDir, "blog", "blog-manifest.json");
  const blogManifest = await readOptionalJsonFromFile(blogManifestPath, "blog manifest");
  const blogPosts = Array.isArray(blogManifest?.sections)
    ? blogManifest.sections.flatMap((section) => Array.isArray(section?.posts) ? section.posts : [])
    : [];
  const siteLastModified = latestLastModified([
    configuredSiteLastModified,
    ...topics.map((topic) => topic.updatedAt),
    ...(Array.isArray(projectsData?.projects)
      ? projectsData.projects.map((project) =>
          normalizeLastModified(project?.updatedAt, `Project "${project?.slug || "unknown"}" updatedAt`),
        )
      : []),
    ...blogPosts.map((post) =>
      normalizeLastModified(
        post?.updatedAt || post?.publishedAt,
        `Blog post "${post?.slug || "unknown"}" modified date`,
      ),
    ),
  ]);
  if (!siteLastModified) {
    throw new Error(
      "A sitemap freshness date is required. Set content/site-metadata.json lastModified or add dated content metadata.",
    );
  }

  assertAllMediaUsed(mediaImages, usedMediaIds);
  const loadedTopicSlugs = new Set(topics.map((topic) => topic.slug));
  for (const entry of corrections) {
    if (!loadedTopicSlugs.has(entry.topic)) {
      throw new Error(`Correction "${entry.id}" targets unknown topic "${entry.topic}".`);
    }
  }

  // Collect every note route, then join publication metadata across the whole archive
  // so missing, duplicate, or stale ids fail before any output is written.
  const recordsByTopic = new Map();
  let allRecords = [];
  for (const topic of topics) {
    const pageRecords = collectPageRecords({
      rootDocument: topic.topicDocument,
      topicSlug: topic.slug,
      topicTitle: topic.title,
      topicDescription: topic.description,
    });
    recordsByTopic.set(topic.slug, pageRecords);
    allRecords = allRecords.concat(pageRecords);
  }

  const joinedRecords = publicationSidecar
    ? joinPublication({ pageRecords: allRecords, sidecar: publicationSidecar })
    : allRecords.map((record) => ({ ...record, publication: defaultPublication(record) }));
  const joinedByUrl = new Map(joinedRecords.map((record) => [record.urlPath, record]));
  const recordByNoteId = new Map(joinedRecords.map((record) => [normalizeNoteId(record.noteId), record]));

  for (const [slug, pageRecords] of recordsByTopic) {
    recordsByTopic.set(
      slug,
      pageRecords.map((record) => {
        const joined = joinedByUrl.get(record.urlPath);
        return {
          ...joined,
          // Fingerprint the page's own content before listing annotations are added.
          contentFingerprint: fingerprint({
            title: joined.title,
            description: joined.description,
            labels: joined.labels,
            blocks: joined.topicDocument.blocks,
            publication: {
              status: joined.publication?.status ?? null,
              reviewedAt: joined.publication?.reviewedAt ?? null,
              contentType: joined.publication?.contentType ?? null,
              knownGaps: joined.publication?.knownGaps ?? [],
              archiveReason: joined.publication?.archiveReason ?? null,
            },
          }),
          topicDocument: {
            ...joined.topicDocument,
            blocks: annotateChildPagePublication(joined.topicDocument.blocks, joinedByUrl),
          },
        };
      }),
    );
  }

  // Topic-level summaries used by listings (Home, Notes, topic roots).
  for (const topic of topics) {
    const records = recordsByTopic.get(topic.slug);
    topic.publication = publicationSummary(joinedByUrl.get(`/topics/${topic.slug}/`)?.publication);
    topic.noteCount = records.length - 1;
    topic.statusCounts = records.slice(1).reduce((counts, record) => {
      const status = record.publication?.status ?? "Working note";
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    }, {});
    topic.notes = records.slice(1).map((record) => ({
      title: record.title,
      urlPath: record.urlPath,
      parentTitle: record.parentTitle,
      depth: record.outputSegments.length - 2,
      publication: publicationSummary(record.publication),
    }));
    // Pillar links resolve against generated routes so a rename cannot leave a stale path.
    if (topic.pillar) {
      for (const link of [...topic.pillar.startHere, ...topic.pillar.readingPath.flatMap((section) => section.links)]) {
        if (link.href.startsWith("/topics/") && !joinedByUrl.has(link.href)) {
          throw new Error(`Topic "${topic.slug}" reading path links to ${link.href}, which is not a generated note.`);
        }
      }
    }
  }

  // Dates on which a route's own content changed through a sidecar: its corrections
  // (including silent wording fixes), a renamed child page, or a replaced image.
  const changeDatesByUrl = new Map();
  const addChangeDate = (urlPath, date) => {
    if (urlPath && date) {
      changeDatesByUrl.set(urlPath, [...(changeDatesByUrl.get(urlPath) || []), date]);
    }
  };
  for (const entry of corrections) {
    const record = recordByNoteId.get(normalizeNoteId(entry.noteId));
    addChangeDate(record?.urlPath, entry.date);
    if (entry.edits.some((edit) => edit.action === "retitle")) {
      addChangeDate(record?.parentUrlPath, entry.date);
    }
  }
  for (const record of joinedRecords) {
    (function visit(blocks) {
      for (const block of blocks || []) {
        const media = block?.type === "asset" && typeof block.blockId === "string"
          ? mediaImages.get(block.blockId.toLowerCase())
          : null;
        if (media?.updatedAt) {
          addChangeDate(record.urlPath, media.updatedAt);
        }
        if (block?.type !== "child_page") {
          visit(block?.children);
        }
      }
    })(record.topicDocument.blocks);
  }

  const correctionsByNoteId = new Map();
  const errataEntries = [];
  for (const entry of corrections) {
    const record = recordByNoteId.get(normalizeNoteId(entry.noteId));
    if (!record) {
      throw new Error(`Correction "${entry.id}" references note ${entry.noteId}, which is not a published route.`);
    }
    if (entry.kind === "Wording") {
      continue;
    }
    const errataEntry = {
      id: entry.id,
      date: entry.date,
      kind: entry.kind,
      summary: entry.summary,
      original: entry.original,
      corrected: entry.corrected,
      noteTitle: record.title,
      noteUrlPath: record.urlPath,
      topicTitle: topics.find((topic) => topic.slug === entry.topic)?.title ?? entry.topic,
    };
    const key = normalizeNoteId(entry.noteId);
    correctionsByNoteId.set(key, [...(correctionsByNoteId.get(key) || []), errataEntry]);
    errataEntries.push(errataEntry);
  }
  errataEntries.sort((a, b) => (a.date === b.date ? a.noteUrlPath.localeCompare(b.noteUrlPath) : b.date.localeCompare(a.date)));

  function describeLink(href) {
    const target = joinedByUrl.get(href.split("#")[0]);
    return target
      ? { title: target.title, publication: publicationSummary(target.publication) }
      : { title: null, publication: null };
  }

  function annotatePillar(pillar) {
    if (!pillar) {
      return pillar;
    }
    const annotate = (link) => {
      const described = describeLink(link.href);
      return { ...link, title: described.title || link.title, publication: described.publication };
    };
    return {
      startHere: pillar.startHere.map(annotate),
      readingPath: pillar.readingPath.map((section) => ({ ...section, links: section.links.map(annotate) })),
    };
  }

  function resolveRelated(publication) {
    return (publication?.related || []).map((link) => {
      const described = describeLink(link.href);
      return {
        href: link.href,
        reason: link.reason,
        title: described.title || link.href,
        publication: described.publication,
      };
    });
  }

  const nextReadingByUrl = new Map();
  for (const topic of topics) {
    const computed = computeNextReadings({
      topic,
      records: recordsByTopic.get(topic.slug),
      recordsByUrl: joinedByUrl,
    });
    for (const [urlPath, next] of computed) {
      nextReadingByUrl.set(urlPath, next ? { ...next, publication: publicationSummary(next.publication) } : null);
    }
  }

  // Blog entries resolved up front so gateway pages can reference them.
  const blogEntries = new Map();
  const blogImageInfo = await loadBlogImageInfo(path.dirname(blogManifestPath));
  if (blogManifest) {
    for (const section of blogManifest.sections) {
      for (const post of section.posts) {
        blogEntries.set(`/blog/${post.slug}/`, { post, section });
      }
    }
  }

  const readingPathsData = await readOptionalJsonFromFile(
    path.join(manifestDir, "reading-paths.json"),
    "reading paths",
  );
  const generatedRouteSet = new Set([
    ...joinedByUrl.keys(),
    ...blogEntries.keys(),
    ...GATEWAY_ROUTES,
    "/blog/",
    "/cv.pdf",
    ...(Array.isArray(projectsData?.projects) ? projectsData.projects.map((project) => `/projects/${project.slug}/`) : []),
  ]);
  function resolveCuratedLink(step, label) {
    if (!generatedRouteSet.has(step.href)) {
      throw new Error(`${label} links to ${step.href}, which the build does not generate.`);
    }
    const described = describeLink(step.href);
    const blog = blogEntries.get(step.href);
    const project = Array.isArray(projectsData?.projects)
      ? projectsData.projects.find((candidate) => `/projects/${candidate.slug}/` === step.href)
      : null;
    return {
      href: step.href,
      note: step.note || "",
      title: step.title || described.title || blog?.post.title || project?.title || GATEWAY_TITLES[step.href] || step.href,
      kind: step.href.startsWith("/topics/") ? "Note" : blog ? "Writing" : project ? "Project" : "Page",
      publication: described.publication,
    };
  }
  const readingPaths = Array.isArray(readingPathsData?.paths)
    ? readingPathsData.paths.map((pathEntry) => ({
        ...pathEntry,
        steps: pathEntry.steps.map((step) => resolveCuratedLink(step, `Reading path "${pathEntry.id}"`)),
      }))
    : [];
  const homeReadings = Array.isArray(readingPathsData?.homeReadings)
    ? readingPathsData.homeReadings.map((step) => resolveCuratedLink(step, "Home reading"))
    : [];
  const homeProjectSlugs = Array.isArray(readingPathsData?.homeProjects) ? readingPathsData.homeProjects : [];

  const redirectsData = await readOptionalJsonFromFile(
    path.join(manifestDir, "publication", "redirects.json"),
    "redirects",
  );
  const redirects = redirectsData ? validateRedirects(redirectsData) : [];

  const routeDatesPath = path.join(manifestDir, "publication", "route-dates.json");
  const routeDatesLedger = routeDatesMode === "enforce" && (await pathExists(routeDatesPath))
    ? validateRouteDates(await readJsonFromFile(routeDatesPath, "route dates"))
    : null;

  // Gateway pages are fingerprinted from their rendered HTML, independent of the
  // deployment origin so preview and production builds agree.
  const htmlFingerprint = (html) => fingerprint(html.replaceAll(normalizedSiteUrl, ""));

  await fs.mkdir(outputParentDir, { recursive: true });
  const buildOutputDir = await fs.mkdtemp(path.join(outputParentDir, `.${outputBaseName}.tmp-`));
  let committedOutput = false;
  const routeFingerprints = [];

  try {
    const cssPath = path.join(buildOutputDir, "assets", "site.css");
    await writeUtf8File(cssPath, stylingContext.getSiteCss());
    await copyFileToOutput({
      sourcePath: mathJaxSourcePath,
      outputDir: buildOutputDir,
      outputRelativePath: MATHJAX_ASSET_PATH,
      label: "MathJax vendor asset",
    });
    await copyFileToOutput({
      sourcePath: SOCIAL_PREVIEW_SOURCE_PATH,
      outputDir: buildOutputDir,
      outputRelativePath: SOCIAL_PREVIEW_ASSET_PATH,
      label: "social preview asset",
    });
    await copyFileToOutput({
      sourcePath: CV_SOURCE_PATH,
      outputDir: buildOutputDir,
      outputRelativePath: CV_ASSET_PATH,
      label: "CV",
    });
    for (const artifactFile of STATIC_ARTIFACTS) {
      await copyFileToOutput({
        sourcePath: path.join("content", "artifacts", artifactFile),
        outputDir: buildOutputDir,
        outputRelativePath: path.join("artifacts", artifactFile),
        label: `static artifact ${artifactFile}`,
      });
    }
    for (const media of mediaImages.values()) {
      await copyFileToOutput({
        sourcePath: media.filePath,
        outputDir: buildOutputDir,
        outputRelativePath: path.join(MEDIA_PUBLIC_PREFIX.slice(1), media.relative),
        label: `note media ${media.relative}`,
      });
    }

    const searchIndex = [];
    const feedItems = topics.map((topic) => ({
      title: topic.title,
      description: topic.description,
      urlPath: `/topics/${topic.slug}/`,
    }));

    for (const topic of topics) {
      const pageRecords = recordsByTopic.get(topic.slug);

      for (const pageRecord of pageRecords) {
        const topicBodyHtml = notesContentContext.renderTopicBody(pageRecord.topicDocument);
        const topicPageHtml = stylingContext.renderTopicPage({
          siteTitle,
          siteUrl: normalizedSiteUrl,
          topic: {
            ...topic,
            slug: pageRecord.slug,
            urlPath: pageRecord.urlPath,
            title: pageRecord.title,
            description: pageRecord.description,
            labels: pageRecord.labels,
            parentTitle: pageRecord.parentTitle,
            parentUrlPath: pageRecord.parentUrlPath,
            ancestors: ancestorsOf(pageRecord, joinedByUrl),
            publication: pageRecord.publication,
            related: resolveRelated(pageRecord.publication),
            corrections: correctionsByNoteId.get(normalizeNoteId(pageRecord.noteId)) || [],
            pillar: pageRecord.parentTitle ? null : annotatePillar(topic.pillar),
            nextReading: nextReadingByUrl.get(pageRecord.urlPath) || null,
          },
          topicContentHtml: topicBodyHtml,
          topics,
        });

        const topicPath = path.join(buildOutputDir, ...pageRecord.outputSegments, "index.html");
        await writeUtf8File(topicPath, topicPageHtml);
        routeFingerprints.push({
          urlPath: pageRecord.urlPath,
          fingerprint: pageRecord.contentFingerprint,
          fallbackDate: latestLastModified([
            topic.updatedAt || siteLastModified,
            pageRecord.publication?.reviewedAt,
            ...(changeDatesByUrl.get(pageRecord.urlPath) || []),
          ]),
        });

        searchIndex.push({
          ...notesContentContext.createSearchEntry({
            slug: pageRecord.slug,
            topicDocument: pageRecord.topicDocument,
          }),
          urlPath: pageRecord.urlPath,
          parentTitle: pageRecord.parentTitle,
          topicTitle: topic.title,
          labels: pageRecord.labels,
          ...publicationSearchFields(pageRecord.publication),
        });
      }
    }

    const gatewayContext = {
      siteTitle,
      siteUrl: normalizedSiteUrl,
      topics,
      projectsData,
      readingPaths,
      homeReadings,
      homeProjectSlugs,
      errataEntries,
    };
    const gatewayPages = [
      ["/", "index.html", stylingContext.renderHomePage(gatewayContext)],
      ["/start-here/", "start-here/index.html", stylingContext.renderStartHerePage(gatewayContext)],
      ["/research-taste/", "research-taste/index.html", stylingContext.renderResearchTastePage({ siteTitle, siteUrl: normalizedSiteUrl, researchTasteData })],
      ["/errata/", "errata/index.html", stylingContext.renderErrataPage({ siteTitle, siteUrl: normalizedSiteUrl, errataEntries })],
      ["/subscribe/", "subscribe/index.html", stylingContext.renderSubscribePage({ siteTitle, siteUrl: normalizedSiteUrl })],
      ["/about/", "about/index.html", stylingContext.renderPersonalPage({ siteTitle, siteUrl: normalizedSiteUrl, portfolioData, projectsData })],
      ["/notes/", "notes/index.html", stylingContext.renderNotesIndexPage({ ...gatewayContext, searchEntries: searchIndex })],
      ["/projects/", "projects/index.html", stylingContext.renderProjectsIndexPage({ siteTitle, siteUrl: normalizedSiteUrl, projectsData })],
      ["/contact/", "contact/index.html", stylingContext.renderContactPage({ siteTitle, siteUrl: normalizedSiteUrl })],
    ];
    for (const [urlPath, relativePath, html] of gatewayPages) {
      await writeUtf8File(path.join(buildOutputDir, relativePath), html);
      routeFingerprints.push({ urlPath, fingerprint: htmlFingerprint(html), fallbackDate: siteLastModified });
    }
    await writeUtf8File(
      path.join(buildOutputDir, "404.html"),
      stylingContext.renderNotFoundPage({ siteTitle, siteUrl: normalizedSiteUrl }),
    );

    const projectItems = Array.isArray(projectsData?.projects) ? projectsData.projects : [];
    for (const project of projectItems) {
      if (!project || typeof project !== "object" || typeof project.slug !== "string") {
        continue;
      }
      const slug = project.slug.trim();
      if (!/^[a-z0-9-]+$/u.test(slug)) {
        continue;
      }
      const projectHtml = stylingContext.renderProjectPage({
        siteTitle,
        siteUrl: normalizedSiteUrl,
        project,
        projectsData,
      });
      await writeUtf8File(path.join(buildOutputDir, "projects", slug, "index.html"), projectHtml);
      routeFingerprints.push({
        urlPath: `/projects/${slug}/`,
        fingerprint: fingerprint(project),
        fallbackDate: normalizeLastModified(project.updatedAt, `Project "${slug}" updatedAt`) || siteLastModified,
      });
    }

    // Blog
    if (blogManifest) {
      const blogContentDir = path.dirname(blogManifestPath);
      const renderMarkdown = (markdown) =>
        notesContentContext.renderBlogBody(markdown, { imageInfo: blogImageInfo.lookup });

      let homeContentHtml = "";
      if (blogManifest.home && blogManifest.home.markdownFile) {
        const homeMd = await fs.readFile(path.join(blogContentDir, blogManifest.home.markdownFile), "utf8");
        homeContentHtml = renderMarkdown(stripLeadingHeadingAndImage(homeMd));
      }
      const blogIndexHtml = stylingContext.renderBlogIndexPage({
        siteTitle,
        siteUrl: normalizedSiteUrl,
        blogManifest,
        homeContentHtml,
      });
      await writeUtf8File(path.join(buildOutputDir, "blog", "index.html"), blogIndexHtml);
      routeFingerprints.push({ urlPath: "/blog/", fingerprint: htmlFingerprint(blogIndexHtml), fallbackDate: siteLastModified });

      for (const section of blogManifest.sections) {
        for (const post of section.posts) {
          const postMd = await fs.readFile(path.join(blogContentDir, post.markdownFile), "utf8");
          const blogContentHtml = renderMarkdown(postMd);
          const postHtml = stylingContext.renderBlogPostPage({
            siteTitle,
            siteUrl: normalizedSiteUrl,
            post,
            section: section.title,
            blogContentHtml,
            blogManifest,
          });
          await writeUtf8File(path.join(buildOutputDir, "blog", post.slug, "index.html"), postHtml);
          routeFingerprints.push({
            urlPath: `/blog/${post.slug}/`,
            fingerprint: fingerprint({ markdown: postMd, post }),
            fallbackDate: normalizeLastModified(
              post.updatedAt || post.publishedAt,
              `Blog post "${post.slug}" modified date`,
            ) || siteLastModified,
          });

          feedItems.push({
            title: post.title,
            description: post.description || section.subtitle || section.title,
            urlPath: `/blog/${post.slug}/`,
            date: post.updatedAt || post.publishedAt || null,
          });

          searchIndex.push({
            ...notesContentContext.createBlogSearchEntry({
              slug: post.slug,
              title: post.title,
              description: post.description,
              markdownString: postMd,
            }),
            urlPath: `/blog/${post.slug}/`,
            parentTitle: section.title,
            topicTitle: "Writing",
            labels: [],
            status: null,
            contentType: "Essay",
            reviewedAt: null,
          });
        }
      }

      await copyBlogImages({ blogContentDir, outputDir: buildOutputDir, imageInfo: blogImageInfo });
    }

    const sitemapItems = resolveRouteDates({ items: routeFingerprints, ledger: routeDatesLedger });
    assertRedirectsConsistent({ redirects, generatedRoutes: sitemapItems.map((item) => item.urlPath) });

    await writeUtf8File(
      path.join(buildOutputDir, "search-index.json"),
      `${JSON.stringify(searchIndex.map(compactSearchEntry))}\n`,
    );
    await writeUtf8File(
      path.join(buildOutputDir, "feed.xml"),
      renderRssFeed({ siteTitle, siteUrl: normalizedSiteUrl, feedItems }),
    );
    await writeUtf8File(
      path.join(buildOutputDir, "sitemap.xml"),
      renderSitemapXml({ siteUrl: normalizedSiteUrl, sitemapItems }),
    );
    await writeUtf8File(
      path.join(buildOutputDir, "robots.txt"),
      renderRobotsTxt({ siteUrl: normalizedSiteUrl }),
    );
    if (redirects.length > 0) {
      await writeUtf8File(path.join(buildOutputDir, "_redirects"), renderRedirectsFile(redirects));
    }
    await replaceDirectoryAtomically({
      sourceDir: buildOutputDir,
      targetDir: absoluteOutputDir,
    });
    committedOutput = true;
  } finally {
    if (!committedOutput) {
      await fs.rm(buildOutputDir, { recursive: true, force: true });
    }
  }

  return { routeFingerprints };
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  buildPagesSite({
    manifestPath: args.manifest,
    outputDir: args.out,
    portfolioDataPath: args.portfolioData,
    projectsDataPath: args.projectsData,
    researchTasteDataPath: args.researchTasteData,
    siteMetadataPath: args.siteMetadata,
    siteTitle: args.siteTitle,
    siteUrl: args.siteUrl,
    publicationPath: args.publication,
    correctionsPath: args.corrections,
    mediaDir: args.mediaDir,
  }).catch((error) => {
    console.error(`build-pages failed: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = {
  buildPagesSite,
  collectPageRecords,
};
