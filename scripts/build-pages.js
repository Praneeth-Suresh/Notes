#!/usr/bin/env node
"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");

const { createNotionIngestionContext } = require("../src/notion-ingestion");
const { createNotesContentContext } = require("../src/notes-content");
const { createSiteStylingContext } = require("../src/site-styling");

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
const STATIC_ARTIFACTS = [
  "np-completeness-reduction-template.tex",
];
const DEFAULT_PORTFOLIO_DATA_PATH = "content/portfolio-repositories.json";
const DEFAULT_RESEARCH_TASTE_DATA_PATH = "content/research-taste.json";
const DEFAULT_PROJECTS_DATA_PATH = "content/projects.json";
const DEFAULT_BLOG_MANIFEST_PATH = "content/blog/blog-manifest.json";
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
    siteTitle: "Computer Science Notes",
    siteUrl: DEFAULT_SITE_URL,
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

function renderRssFeed({ siteTitle, siteUrl, feedItems }) {
  const items = feedItems
    .map((item) => {
      const absoluteUrl = absoluteSiteUrl(siteUrl, item.urlPath);
      const description = item.description && item.description.trim() !== ""
        ? item.description.trim()
        : `Read ${item.title} on ${siteTitle}.`;

      return `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(absoluteUrl)}</link>
      <guid>${escapeXml(absoluteUrl)}</guid>
      <description>${escapeXml(description)}</description>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteTitle)}</title>
    <link>${escapeXml(siteUrl)}/</link>
    <atom:link href="${escapeXml(siteUrl)}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Rigorous computer science notes across algorithms, systems, AI engineering, and software engineering.</description>
${items}
  </channel>
</rss>
`;
}

function uniqueSitemapItems(items) {
  const seen = new Set();
  return items.filter((item) => {
    const pathPart = typeof item.urlPath === "string" && item.urlPath.startsWith("/")
      ? item.urlPath
      : null;
    if (!pathPart || seen.has(pathPart)) {
      return false;
    }

    seen.add(pathPart);
    return true;
  });
}

function renderSitemapXml({ siteUrl, sitemapItems }) {
  const urls = uniqueSitemapItems(sitemapItems)
    .map((item) => `  <url>
    <loc>${escapeXml(absoluteSiteUrl(siteUrl, item.urlPath))}</loc>
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
  siteTitle,
  siteUrl = DEFAULT_SITE_URL,
  mathJaxSourcePath = DEFAULT_MATHJAX_SOURCE_PATH,
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
      pillar: manifestEntry.pillar,
      topicDocument,
    });
  }

  await fs.mkdir(outputParentDir, { recursive: true });
  const buildOutputDir = await fs.mkdtemp(path.join(outputParentDir, `.${outputBaseName}.tmp-`));
  let committedOutput = false;

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
    for (const artifactFile of STATIC_ARTIFACTS) {
      await copyFileToOutput({
        sourcePath: path.join("content", "artifacts", artifactFile),
        outputDir: buildOutputDir,
        outputRelativePath: path.join("artifacts", artifactFile),
        label: `static artifact ${artifactFile}`,
      });
    }

    const searchIndex = [];
    const feedItems = topics.map((topic) => ({
      title: topic.title,
      description: topic.description,
      urlPath: `/topics/${topic.slug}/`,
    }));
    const sitemapItems = [
      { urlPath: "/" },
      { urlPath: "/start-here/" },
      { urlPath: "/research-taste/" },
      { urlPath: "/errata/" },
      { urlPath: "/subscribe/" },
      { urlPath: "/about/" },
      { urlPath: "/projects/" },
      { urlPath: "/contact/" },
      { urlPath: "/collaborate/" },
    ];

    for (const topic of topics) {
      const pageRecords = collectPageRecords({
        rootDocument: topic.topicDocument,
        topicSlug: topic.slug,
        topicTitle: topic.title,
        topicDescription: topic.description,
      });

      for (const pageRecord of pageRecords) {
        const pageRecordIndex = pageRecords.indexOf(pageRecord);
        const nextPageRecord = pageRecords[pageRecordIndex + 1] || null;
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
            pillar: pageRecord.parentTitle ? null : topic.pillar,
            nextReading: nextPageRecord
              ? {
                  title: nextPageRecord.title,
                  urlPath: nextPageRecord.urlPath,
                  parentTitle: nextPageRecord.parentTitle,
                }
              : null,
          },
          topicContentHtml: topicBodyHtml,
          topics,
        });

        const topicPath = path.join(buildOutputDir, ...pageRecord.outputSegments, "index.html");
        await writeUtf8File(topicPath, topicPageHtml);
        sitemapItems.push({ urlPath: pageRecord.urlPath });

        searchIndex.push({
          ...notesContentContext.createSearchEntry({
            slug: pageRecord.slug,
            topicDocument: pageRecord.topicDocument,
          }),
          urlPath: pageRecord.urlPath,
          parentTitle: pageRecord.parentTitle,
          labels: pageRecord.labels,
        });
      }
    }

    const indexHtml = stylingContext.renderHomePage({
      siteTitle,
      siteUrl: normalizedSiteUrl,
      topics,
      searchEntries: searchIndex,
      projectsData,
    });
    const personalHtml = stylingContext.renderPersonalPage({
      siteTitle,
      siteUrl: normalizedSiteUrl,
      portfolioData,
    });
    const startHereHtml = stylingContext.renderStartHerePage({
      siteTitle,
      siteUrl: normalizedSiteUrl,
      topics,
      searchEntries: searchIndex,
    });
    const researchTasteHtml = stylingContext.renderResearchTastePage({
      siteTitle,
      siteUrl: normalizedSiteUrl,
      researchTasteData,
    });
    const errataHtml = stylingContext.renderErrataPage({
      siteTitle,
      siteUrl: normalizedSiteUrl,
    });
    const subscribeHtml = stylingContext.renderSubscribePage({
      siteTitle,
      siteUrl: normalizedSiteUrl,
    });
    const projectsHtml = stylingContext.renderProjectsIndexPage({
      siteTitle,
      siteUrl: normalizedSiteUrl,
      projectsData,
    });
    const contactHtml = stylingContext.renderContactPage({
      siteTitle,
      siteUrl: normalizedSiteUrl,
    });
    const collaborateHtml = stylingContext.renderCollaboratePage({
      siteTitle,
      siteUrl: normalizedSiteUrl,
    });

    await writeUtf8File(path.join(buildOutputDir, "index.html"), indexHtml);
    await writeUtf8File(path.join(buildOutputDir, "start-here", "index.html"), startHereHtml);
    await writeUtf8File(path.join(buildOutputDir, "research-taste", "index.html"), researchTasteHtml);
    await writeUtf8File(path.join(buildOutputDir, "errata", "index.html"), errataHtml);
    await writeUtf8File(path.join(buildOutputDir, "subscribe", "index.html"), subscribeHtml);
    await writeUtf8File(path.join(buildOutputDir, "about", "index.html"), personalHtml);
    await writeUtf8File(path.join(buildOutputDir, "projects", "index.html"), projectsHtml);
    await writeUtf8File(path.join(buildOutputDir, "contact", "index.html"), contactHtml);
    await writeUtf8File(path.join(buildOutputDir, "collaborate", "index.html"), collaborateHtml);

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
      sitemapItems.push({ urlPath: `/projects/${slug}/` });
    }

    // Blog
    const blogManifestPath = path.resolve(manifestDir, "blog", "blog-manifest.json");
    const blogManifest = await readOptionalJsonFromFile(blogManifestPath, "blog manifest");
    if (blogManifest) {
      const blogContentDir = path.dirname(blogManifestPath);

      // Render home/index page
      let homeContentHtml = "";
      if (blogManifest.home && blogManifest.home.markdownFile) {
        const homeMd = await fs.readFile(path.join(blogContentDir, blogManifest.home.markdownFile), "utf8");
        homeContentHtml = notesContentContext.renderBlogBody(homeMd);
      }
      const blogIndexHtml = stylingContext.renderBlogIndexPage({
        siteTitle,
        siteUrl: normalizedSiteUrl,
        blogManifest,
        homeContentHtml,
      });
      await writeUtf8File(path.join(buildOutputDir, "blog", "index.html"), blogIndexHtml);
      sitemapItems.push({ urlPath: "/blog/" });

      // Render each post
      for (const section of blogManifest.sections) {
        for (const post of section.posts) {
          const postMd = await fs.readFile(path.join(blogContentDir, post.markdownFile), "utf8");
          const blogContentHtml = notesContentContext.renderBlogBody(postMd);
          const postHtml = stylingContext.renderBlogPostPage({
            siteTitle,
            siteUrl: normalizedSiteUrl,
            post,
            section: section.title,
            blogContentHtml,
            blogManifest,
          });
          await writeUtf8File(path.join(buildOutputDir, "blog", post.slug, "index.html"), postHtml);
          sitemapItems.push({ urlPath: `/blog/${post.slug}/` });

          feedItems.push({
            title: post.title,
            description: post.description || section.subtitle || section.title,
            urlPath: `/blog/${post.slug}/`,
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
            labels: [],
          });
        }
      }

      // Copy blog images
      const blogImagesDir = path.join(blogContentDir, "images");
      if (await pathExists(blogImagesDir)) {
        const imageFiles = await fs.readdir(blogImagesDir);
        for (const imgFile of imageFiles) {
          await copyFileToOutput({
            sourcePath: path.join(blogImagesDir, imgFile),
            outputDir: buildOutputDir,
            outputRelativePath: path.join("blog", "images", imgFile),
            label: `blog image ${imgFile}`,
          });
        }
      }
    }

    await writeUtf8File(
      path.join(buildOutputDir, "search-index.json"),
      `${JSON.stringify(searchIndex, null, 2)}\n`,
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
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  buildPagesSite({
    manifestPath: args.manifest,
    outputDir: args.out,
    portfolioDataPath: args.portfolioData,
    projectsDataPath: args.projectsData,
    researchTasteDataPath: args.researchTasteData,
    siteTitle: args.siteTitle,
    siteUrl: args.siteUrl,
  }).catch((error) => {
    console.error(`build-pages failed: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = {
  buildPagesSite,
};
