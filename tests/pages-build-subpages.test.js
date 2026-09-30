"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const vm = require("node:vm");

const { buildPagesSite } = require("../scripts/build-pages");
const { renderHomePage, renderPersonalPage } = require("../src/site-styling/internal/shell");

const OBFUSCATED_CONTACT_EMAIL = "praneeth[dot]suresh[dot]s [at] gmail[dot]com";
const RAW_CONTACT_EMAIL = ["praneeth", "suresh", "s@gmail.com"].join(".");

function parseJsonLd(html) {
  return Array.from(html.matchAll(/<script type="application\/ld\+json">([^<]+)<\/script>/gu), (match) =>
    JSON.parse(match[1]),
  );
}

function schemaTypes(schema) {
  return Array.isArray(schema?.["@type"]) ? schema["@type"] : [schema?.["@type"]];
}

function findSchemaByType(html, type) {
  return parseJsonLd(html).find((schema) => schemaTypes(schema).includes(type));
}

function extractSitemapLocations(xml) {
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/gu), (match) => match[1]);
}

function extractSitemapEntries(xml) {
  return Array.from(xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>\s*<\/url>/gu),
    (match) => ({ location: match[1], lastModified: match[2] }));
}

async function collectHtmlRoutePaths(rootDir) {
  const routes = [];

  async function visit(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const absolutePath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await visit(absolutePath);
        continue;
      }

      if (entry.name !== "index.html") {
        continue;
      }

      const relativeDir = path.relative(rootDir, dir).split(path.sep).filter(Boolean).join("/");
      routes.push(relativeDir ? `/${relativeDir}/` : "/");
    }
  }

  await visit(rootDir);
  return routes.sort();
}

async function withTempDir(callback) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "notes-pages-build-"));
  try {
    return await callback(root);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
}

function createThemeScriptHarness({ savedTheme = null, systemTheme = "light", disabled = false } = {}) {
  const listeners = new Map();
  const attributes = new Map();
  const themeToggle = {
    disabled,
    textContent: "",
    setAttribute(name, value) {
      attributes.set(name, String(value));
    },
    getAttribute(name) {
      return attributes.get(name) || null;
    },
    addEventListener(name, callback) {
      listeners.set(name, callback);
    },
    click() {
      listeners.get("click")?.();
    },
  };
  const storedValues = new Map(savedTheme ? [["notes-theme", savedTheme]] : []);
  const root = { dataset: {} };
  const document = {
    body: { dataset: {} },
    documentElement: root,
    querySelector(selector) {
      return selector === ".theme-toggle" ? themeToggle : null;
    },
    addEventListener() {},
  };
  const window = {
    CustomEvent: class CustomEvent {
      constructor(name, options) {
        this.name = name;
        this.detail = options?.detail;
      }
    },
    HTMLElement: class HTMLElement {},
    Element: class Element {},
    location: { pathname: "/" },
    localStorage: {
      getItem(name) {
        return storedValues.get(name) || null;
      },
      setItem(name, value) {
        storedValues.set(name, value);
      },
    },
    matchMedia() {
      return { matches: systemTheme === "dark" };
    },
    dispatchEvent() {},
  };

  return { attributes, document, root, storedValues, themeToggle, window };
}

function executeGeneratedThemeScript(harness, renderPage = renderPersonalPage) {
  const html = renderPage({ siteTitle: "Praneeth's CS Field Notes" });
  const scriptMatch = html.match(/<script>\s*\(\(\) => \{\s*window\.notesAnalyticsEvents[\s\S]*?\n\s*\}\)\(\);\s*<\/script>/u);
  assert.ok(scriptMatch, "expected the shared client script in generated home HTML");
  const script = scriptMatch[0].replace(/^<script>\s*/u, "").replace(/\s*<\/script>$/u, "");
  vm.runInNewContext(script, {
    CustomEvent: harness.window.CustomEvent,
    Element: harness.window.Element,
    HTMLElement: harness.window.HTMLElement,
    document: harness.document,
    window: harness.window,
  });
}

function executeGeneratedThemeBootstrap(harness, renderPage = renderPersonalPage) {
  const html = renderPage({ siteTitle: "Praneeth's CS Field Notes" });
  const scriptMatch = html.match(/<script>\s*\(\(\) => \{\s*try \{\s*const savedTheme[\s\S]*?\n\s*\}\)\(\);\s*<\/script>/u);
  assert.ok(scriptMatch, "expected the pre-stylesheet theme bootstrap in generated home HTML");
  const script = scriptMatch[0].replace(/^<script>\s*/u, "").replace(/\s*<\/script>$/u, "");
  vm.runInNewContext(script, {
    document: harness.document,
    window: harness.window,
  });
}

test("icon-only theme toggle applies and persists the visitor's explicit color preference", () => {
  const darkHarness = createThemeScriptHarness({ systemTheme: "dark" });
  executeGeneratedThemeBootstrap(darkHarness);
  executeGeneratedThemeScript(darkHarness);

  assert.equal(darkHarness.themeToggle.textContent, "");
  assert.equal(darkHarness.attributes.get("aria-pressed"), "true");
  assert.equal(darkHarness.attributes.get("aria-label"), "Switch to light mode");

  darkHarness.themeToggle.click();
  assert.equal(darkHarness.root.dataset.theme, "light");
  assert.equal(darkHarness.storedValues.get("notes-theme"), "light");
  assert.equal(darkHarness.themeToggle.textContent, "");
  assert.equal(darkHarness.attributes.get("aria-pressed"), "false");
  assert.equal(darkHarness.attributes.get("aria-label"), "Switch to dark mode");

  const reloadedHarness = createThemeScriptHarness({ savedTheme: "light", systemTheme: "dark" });
  executeGeneratedThemeBootstrap(reloadedHarness);
  executeGeneratedThemeScript(reloadedHarness);
  assert.equal(reloadedHarness.root.dataset.theme, "light");
  assert.equal(reloadedHarness.themeToggle.textContent, "");
  assert.equal(reloadedHarness.attributes.get("aria-pressed"), "false");
});

test("home follows the visitor's color preference like every other page", () => {
  // Audit design proposal: no forced dark Home or per-section themes.
  const homeHtml = renderHomePage({ siteTitle: "Praneeth's CS Field Notes" });
  assert.ok(homeHtml.includes('<html lang="en">'));
  assert.ok(!homeHtml.includes("theme-toggle--locked"));
  assert.ok(homeHtml.includes('<button class="theme-toggle" type="button" aria-pressed="false"'));

  const homeHarness = createThemeScriptHarness({ savedTheme: "light", systemTheme: "dark" });
  executeGeneratedThemeBootstrap(homeHarness, renderHomePage);
  executeGeneratedThemeScript(homeHarness, renderHomePage);
  assert.equal(homeHarness.root.dataset.theme, "light");
  homeHarness.themeToggle.click();
  assert.equal(homeHarness.root.dataset.theme, "dark");
});

test("builds child_page routes and makes subpages searchable", async () => {
  await withTempDir(async (root) => {
    const contentDir = path.join(root, "content");
    const topicsDir = path.join(contentDir, "topics");
    const outDir = path.join(root, "dist");
    const mathJaxSourcePath = path.join(root, "mathjax-source.js");
    const portfolioDataPath = path.join(contentDir, "portfolio-repositories.json");
    const projectsDataPath = path.join(contentDir, "projects.json");
    const researchTasteDataPath = path.join(contentDir, "research-taste.json");
    await fs.mkdir(topicsDir, { recursive: true });
    await fs.writeFile(mathJaxSourcePath, "window.MathJax = window.MathJax || {};\n", "utf8");

    const topicDocument = {
      title: "Algorithms",
      description: "Algorithm notes",
      blocks: [
        {
          type: "paragraph",
          richText: [{ type: "text", content: "Parent overview", annotations: {}, href: null }],
        },
        {
          type: "child_page",
          blockId: "child-page-1",
          title: "Dynamic Programming",
          labels: [
            { name: "Graphs", color: "blue" },
            { name: "Reviewed", color: "green" },
          ],
          children: [
            {
              type: "paragraph",
              richText: [
                { type: "text", content: "Optimal substructure", annotations: {}, href: null },
              ],
            },
            {
              type: "equation",
              expression: "dp[i]=\\min_j(dp[j]+c)",
            },
          ],
        },
      ],
    };

    await fs.writeFile(
      path.join(topicsDir, "algorithms.normalized.json"),
      `${JSON.stringify(topicDocument, null, 2)}\n`,
      "utf8",
    );
    await fs.writeFile(
      path.join(contentDir, "topic-manifest.json"),
      `${JSON.stringify([
        {
          slug: "algorithms",
          title: "Algorithms",
          updatedAt: "2026-05-23",
          description:
            "Algorithms explained with intuition, formal models, proof sketches, and implementation tradeoffs.",
          pillar: {
            startHere: [
              {
                title: "Dynamic Programming",
                description: "Learn how states, transitions, and optimal substructure organize hard problems.",
                href: "/topics/algorithms/dynamic-programming/",
              },
            ],
            readingPath: [
              {
                label: "Foundations",
                links: [
                  { title: "Dynamic Programming", href: "/topics/algorithms/dynamic-programming/" },
                ],
              },
            ],
          },
          source: { kind: "normalized-file", path: "topics/algorithms.normalized.json" },
        },
      ], null, 2)}\n`,
      "utf8",
    );
    await fs.writeFile(
      portfolioDataPath,
      `${JSON.stringify(
        {
          generatedAt: "2026-05-23T00:00:00.000Z",
          source: { provider: "github", username: "Praneeth-Suresh" },
          reviewedRepositoryCount: 1,
          portfolioProjects: [
            {
              name: "NewRepo",
              href: "https://github.com/Praneeth-Suresh/NewRepo",
              kind: "Applied software tool",
              language: "TypeScript",
              summary: "A newly refreshed public repository.",
            },
          ],
          repositoryGroups: [
            {
              label: "Software and app systems",
              repos: [
                { name: "NewRepo", href: "https://github.com/Praneeth-Suresh/NewRepo" },
              ],
            },
          ],
        },
        null,
        2,
      )}\n`,
      "utf8",
    );
    await fs.writeFile(
      projectsDataPath,
      `${JSON.stringify(
        {
          projects: [
            {
              slug: "ai-society-corpus",
              title: "AI Society Corpus",
              status: "active · NUS AI Society",
              updatedAt: "2026-08-10",
              summary: "An interactive AI/ML knowledge graph.",
              problem: "AI/ML learners need connected study paths.",
              method: "Generate prerequisite, similarity, and backlink edges from Markdown topics.",
              result: "Readers can inspect a navigable concept network.",
              codeUrl: "https://github.com/NUSAISoc/aisoc-corpus",
              tags: ["knowledge-graph", "astro"],
            },
            {
              slug: "beryl",
              title: "Beryl",
              status: "active · developer tooling",
              updatedAt: "2026-08-10",
              summary: "A repository-owned guarantee layer for AI-assisted development.",
              problem: "Agents need one source of truth and reviewable evidence.",
              method: "Install task routing, deterministic checks, and test-manifest protection.",
              result: "Teams can inspect a repeatable intent-to-signoff loop.",
              codeUrl: "https://github.com/Praneeth-Suresh/Beryl",
              writeupUrl: "/blog/beryl-02-what-i-built/",
              tags: ["agentic-coding", "testing"],
            },
            {
              slug: "notes",
              title: "Notes — this site",
              status: "active · current site",
              updatedAt: "2026-08-10",
              summary: "The site you are reading.",
              problem: "Technical notes need source fidelity and durable discovery.",
              method: "Normalize Notion topic trees into static Cloudflare Pages artifacts.",
              result: "The site preserves LaTeX, code blocks, paths, search, and RSS.",
              codeUrl: "https://github.com/Praneeth-Suresh/Notes",
              writeupUrl: "/notes/",
              tags: ["static-site", "notion"],
            },
            {
              slug: "siap",
              title: "SIAP",
              status: "active · research manuscript",
              updatedAt: "2026-08-10",
              summary: "A theory-backed agentic systems book.",
              problem: "Agent engineering needs explicit system semantics.",
              method: "Build a Markdown manuscript into a static reader and print artifacts.",
              result: "The project publishes a MathJax book with PDF outputs and editorial checks.",
              codeUrl: "https://github.com/Praneeth-Suresh/SIAP",
              tags: ["agentic-systems", "technical-writing"],
            },
          ],
        },
        null,
        2,
      )}\n`,
      "utf8",
    );
    await fs.writeFile(
      researchTasteDataPath,
      `${JSON.stringify(
        {
          topics: [
            {
              title: "Deep learning foundations",
              rationale:
                "A route into AI research through universal approximation, convolutional architectures, and self-attention.",
              sources: [
                {
                  label: "George Cybenko, Approximation by Superpositions of a Sigmoidal Function",
                  href: "https://doi.org/10.1007/BF02551274",
                },
                {
                  label: "Essay: The mental models of deep learning",
                  href: "/blog/tracing-the-mental-models-of-deep-learning-lessons-from-foundational-papers/",
                },
              ],
            },
            {
              title: "Mechanistic interpretability",
              rationale:
                "A research thread for reverse-engineering the computations inside modern neural networks.",
              sources: [
                {
                  label: "Elhage et al., A Mathematical Framework for Transformer Circuits",
                  href: "https://transformer-circuits.pub/2021/framework/index.html",
                },
              ],
            },
          ],
        },
        null,
        2,
      )}\n`,
      "utf8",
    );

    await buildPagesSite({
      manifestPath: path.join(contentDir, "topic-manifest.json"),
      outputDir: outDir,
      siteTitle: "Praneeth's CS Field Notes",
      mathJaxSourcePath,
      portfolioDataPath,
      projectsDataPath,
      researchTasteDataPath,
      siteUrl: "https://example.test",
    });

    const parentHtml = await fs.readFile(
      path.join(outDir, "topics", "algorithms", "index.html"),
      "utf8",
    );
    const childHtml = await fs.readFile(
      path.join(outDir, "topics", "algorithms", "dynamic-programming", "index.html"),
      "utf8",
    );
    const homeHtml = await fs.readFile(path.join(outDir, "index.html"), "utf8");
    const notesHtml = await fs.readFile(path.join(outDir, "notes", "index.html"), "utf8");
    const startHereHtml = await fs.readFile(path.join(outDir, "start-here", "index.html"), "utf8");
    const researchTasteHtml = await fs.readFile(path.join(outDir, "research-taste", "index.html"), "utf8");
    const errataHtml = await fs.readFile(path.join(outDir, "errata", "index.html"), "utf8");
    const subscribeHtml = await fs.readFile(path.join(outDir, "subscribe", "index.html"), "utf8");
    const personalHtml = await fs.readFile(path.join(outDir, "about", "index.html"), "utf8");
    const projectsHtml = await fs.readFile(path.join(outDir, "projects", "index.html"), "utf8");
    const corpusProjectHtml = await fs.readFile(
      path.join(outDir, "projects", "ai-society-corpus", "index.html"),
      "utf8",
    );
    const notesProjectHtml = await fs.readFile(
      path.join(outDir, "projects", "notes", "index.html"),
      "utf8",
    );
    const siapProjectHtml = await fs.readFile(
      path.join(outDir, "projects", "siap", "index.html"),
      "utf8",
    );
    await assert.rejects(fs.access(path.join(outDir, "projects", "agentic-coding", "index.html")));
    await assert.rejects(fs.access(path.join(outDir, "projects", "computer-science-notes", "index.html")));
    const contactHtml = await fs.readFile(path.join(outDir, "contact", "index.html"), "utf8");
    // /collaborate/ is retired in favour of a redirect to /contact/.
    await assert.rejects(fs.access(path.join(outDir, "collaborate", "index.html")));
    const siteCss = await fs.readFile(path.join(outDir, "assets", "site.css"), "utf8");
    const feedXml = await fs.readFile(path.join(outDir, "feed.xml"), "utf8");
    const sitemapXml = await fs.readFile(path.join(outDir, "sitemap.xml"), "utf8");
    const robotsTxt = await fs.readFile(path.join(outDir, "robots.txt"), "utf8");
    const notFoundHtml = await fs.readFile(path.join(outDir, "404.html"), "utf8");
    const searchIndex = JSON.parse(
      await fs.readFile(path.join(outDir, "search-index.json"), "utf8"),
    );
    const mathJaxAsset = await fs.readFile(
      path.join(outDir, "assets", "vendor", "mathjax", "tex-svg-full.js"),
      "utf8",
    );
    const socialPreviewAsset = await fs.readFile(
      path.join(outDir, "assets", "social", "theoretical-cs-preview.svg"),
      "utf8",
    );
    const cvStat = await fs.stat(path.join(outDir, "cv.pdf"));
    assert.ok(cvStat.size > 0);
    // Audit C10: Home no longer ships the five decorative showcase PNGs.
    await assert.rejects(fs.access(path.join(outDir, "assets", "home")));

    for (const renderedHtml of [
      parentHtml,
      childHtml,
      homeHtml,
      notesHtml,
      startHereHtml,
      researchTasteHtml,
      errataHtml,
      subscribeHtml,
      personalHtml,
      projectsHtml,
      corpusProjectHtml,
      notesProjectHtml,
      siapProjectHtml,
      contactHtml,
      notFoundHtml,
    ]) {
      assert.ok(!renderedHtml.includes(RAW_CONTACT_EMAIL));
      assert.ok(!renderedHtml.includes(`mailto:${RAW_CONTACT_EMAIL}`));
      // Audit C5: exactly one <h1> per page.
      assert.equal((renderedHtml.match(/<h1[\s>]/gu) || []).length, 1);
      // Audit C7 and owner decision: no subscribe panels or email newsletter promises.
      assert.ok(!renderedHtml.includes("subscribe-panel"));
      assert.ok(!renderedHtml.includes("newsletter_cta_click"));
      assert.ok(!/monthly (AI research|project) update/iu.test(renderedHtml));
      // Primary navigation and utility links (audit IA).
      assert.ok(renderedHtml.includes('class="site-links" aria-label="Site navigation"'));
      assert.ok(renderedHtml.includes('href="/notes/" data-hotkey="N"'));
      assert.ok(renderedHtml.includes('href="/projects/" data-hotkey="P"'));
      assert.ok(renderedHtml.includes('href="/blog/" data-hotkey="W"'));
      assert.ok(renderedHtml.includes('href="/about/" data-hotkey="A"'));
      assert.ok(renderedHtml.includes('href="/notes/#topic-search"'));
      assert.ok(renderedHtml.includes('href="/feed.xml" data-analytics-event="rss_click" data-subscribe-source="footer"'));
      assert.ok(renderedHtml.includes('href="/errata/"'));
      assert.ok(renderedHtml.includes('href="/cv.pdf" data-analytics-event="cv_download_click"'));
      assert.ok(renderedHtml.includes('<footer class="site-footer"'));
    }

    // Note pages: status, breadcrumb, reading margin, reasoned next link.
    assert.ok(parentHtml.includes('href="/topics/algorithms/dynamic-programming/"'));
    assert.ok(parentHtml.includes("Dynamic Programming"));
    assert.ok(parentHtml.includes('class="note-label notion-label-color-blue"'));
    assert.ok(childHtml.includes('aria-label="Page labels"'));
    assert.ok(childHtml.includes("Reviewed"));
    assert.ok(parentHtml.includes('aria-label="Publication status"'));
    assert.ok(parentHtml.includes('<span class="note-status note-status-working">Working note</span>'));
    assert.ok(childHtml.includes('<span class="note-status note-status-working">Working note</span>'));
    assert.ok(childHtml.includes('<nav class="breadcrumb" aria-label="Breadcrumb"><ol><li><a href="/notes/">Notes</a></li><li><a href="/topics/algorithms/">Algorithms</a></li><li aria-current="page">Dynamic Programming</li></ol></nav>'));
    assert.ok(childHtml.includes('<p class="topic-parent">In <a href="/topics/algorithms/">Algorithms</a></p>'));
    assert.ok(childHtml.includes('<aside class="reading-margin" aria-label="About this note">'));
    assert.ok(!childHtml.includes("<p class=\"topic-meta\">"), "child pages do not repeat the topic description");
    assert.ok(childHtml.includes('class="next-reading-link" href="/topics/algorithms/"'));
    assert.ok(childHtml.includes("Last note in this section; return to Algorithms for the full list."));
    assert.ok(parentHtml.includes('href="/feed.xml"'));
    assert.ok(parentHtml.includes('data-analytics-event="rss_click"'));
    assert.ok(!parentHtml.includes("reading-trail"));
    assert.ok(parentHtml.includes('<meta name="description" content="Algorithms explained with intuition, formal models, proof sketches, and implementation tradeoffs." />'));
    assert.ok(parentHtml.includes('<link rel="canonical" href="https://example.test/topics/algorithms/" />'));
    assert.ok(parentHtml.includes('<meta property="og:type" content="website" />'));
    assert.ok(parentHtml.includes('"@type":"BreadcrumbList"'));
    assert.ok(parentHtml.includes('"name":"Algorithms"'));
    const homeWebsiteSchema = findSchemaByType(homeHtml, "WebSite");
    assert.equal(homeWebsiteSchema["@id"], "https://example.test/#website");
    assert.equal(homeWebsiteSchema.url, "https://example.test/");
    assert.equal(homeWebsiteSchema.publisher["@id"], "https://example.test/#organization");
    assert.equal(homeWebsiteSchema.author["@id"], "https://example.test/#person");
    assert.equal(
      homeWebsiteSchema.potentialAction.target.urlTemplate,
      "https://example.test/notes/?q={search_term_string}#topic-search",
    );
    const homePersonSchema = findSchemaByType(homeHtml, "Person");
    assert.equal(homePersonSchema.name, "Praneeth Suresh");
    assert.equal(homePersonSchema.url, "https://example.test/about/");
    assert.equal(homePersonSchema.email, undefined);
    assert.ok(homePersonSchema.sameAs.includes("https://github.com/Praneeth-Suresh"));
    const homeOrganizationSchema = findSchemaByType(homeHtml, "Organization");
    assert.equal(homeOrganizationSchema.name, "Praneeth's CS Field Notes");
    assert.equal(homeOrganizationSchema.founder["@id"], "https://example.test/#person");
    const homePageSchema = findSchemaByType(homeHtml, "WebPage");
    assert.equal(homePageSchema.url, "https://example.test/");
    assert.equal(homePageSchema.isPartOf["@id"], "https://example.test/#website");
    const parentPageSchema = findSchemaByType(parentHtml, "CollectionPage");
    assert.equal(parentPageSchema.url, "https://example.test/topics/algorithms/");
    const childPageSchema = findSchemaByType(childHtml, "TechArticle");
    assert.equal(childPageSchema.url, "https://example.test/topics/algorithms/dynamic-programming/");
    assert.ok(parentHtml.includes('class="topic-pillar"'));
    assert.ok(parentHtml.includes("Recommended order for Algorithms"));
    assert.ok(parentHtml.includes("Key ideas"));
    assert.ok(parentHtml.includes("Learn how states, transitions, and optimal substructure organize hard problems."));
    assert.ok(parentHtml.includes("Foundations"));
    assert.ok(parentHtml.includes('class="next-reading"'));
    assert.ok(parentHtml.includes('class="next-reading-link" href="/topics/algorithms/dynamic-programming/"'));
    assert.ok(parentHtml.includes("First step in the Algorithms reading path."));

    // Home (audit C10): identity, selected work, reading entries, topic map, contact.
    assert.ok(homeHtml.includes("<title>Praneeth&#39;s CS Field Notes</title>"));
    assert.ok(homeHtml.includes('<h1 id="home-title" class="home-title">Praneeth Suresh</h1>'));
    assert.ok(homeHtml.includes("I am an ML engineer and a computer science and mathematics student at NUS."));
    assert.ok(homeHtml.includes("Current question:"));
    assert.ok(homeHtml.includes("Selected work"));
    assert.ok(homeHtml.includes('href="/projects/ai-society-corpus/"'), "without curated slugs Home shows the first two projects");
    assert.ok(homeHtml.includes('href="/topics/algorithms/"'));
    assert.ok(homeHtml.includes("1 note"));
    assert.ok(homeHtml.includes('href="/start-here/"'));
    assert.ok(homeHtml.includes(OBFUSCATED_CONTACT_EMAIL));
    assert.ok(!homeHtml.includes("home-showcase"));
    assert.ok(!homeHtml.includes("<img"), "Home carries no decorative imagery");
    assert.ok(!homeHtml.includes("theme-toggle--locked"), "Home follows the visitor's theme like every other page");
    assert.ok(!homeHtml.includes("tex-svg-full.js"), "MathJax only loads on pages that can contain LaTeX");
    assert.ok(homeHtml.includes('rel="alternate" type="application/rss+xml"'));
    assert.ok(homeHtml.includes('<link rel="canonical" href="https://example.test/" />'));
    assert.ok(homeHtml.includes(`<meta property="og:title" content="Praneeth&#39;s CS Field Notes" />`));
    assert.ok(homeHtml.includes('<meta property="og:url" content="https://example.test/" />'));
    assert.ok(homeHtml.includes('<meta property="og:image" content="https://example.test/assets/social/theoretical-cs-preview.svg" />'));
    assert.ok(homeHtml.includes('<meta property="og:image:width" content="1200" />'));

    // Notes index (audit C8): compact page, lazy search index, status on every listed note.
    assert.ok(notesHtml.includes("<title>Notes · Praneeth&#39;s CS Field Notes</title>"));
    assert.ok(notesHtml.includes('id="topic-search"'));
    assert.ok(notesHtml.includes('fetch("/search-index.json")'));
    assert.ok(!notesHtml.includes("Optimal substructure"), "note bodies are not inlined into /notes/");
    assert.ok(notesHtml.includes('new URLSearchParams(window.location.search).get("q")'));
    assert.ok(notesHtml.includes("history.replaceState"));
    assert.ok(notesHtml.includes('event.key === "ArrowDown"'));
    assert.ok(notesHtml.includes("No notes match"));
    assert.ok(notesHtml.includes('<details class="topic-row" id="topic-algorithms" data-hash-disclosure>'));
    assert.ok(notesHtml.includes('href="/topics/algorithms/" data-hotkey="1"'));
    assert.ok(notesHtml.includes('<a href="/topics/algorithms/dynamic-programming/">Dynamic Programming</a><span class="note-publication"><span class="note-status note-status-working">Working note</span>'));
    assert.ok(notesHtml.includes("No note has been marked reviewed yet"));
    assert.ok(notesHtml.includes('<link rel="canonical" href="https://example.test/notes/" />'));
    assert.equal(findSchemaByType(notesHtml, "CollectionPage").url, "https://example.test/notes/");
    assert.ok(notesHtml.includes('target.tagName === "INPUT"'));
    assert.ok(notesHtml.includes("searchInput.focus();"));

    // Start here: real reading paths (none in this fixture), RSS as the only follow option.
    assert.ok(startHereHtml.includes("<title>Start Here · Praneeth&#39;s CS Field Notes</title>"));
    assert.ok(startHereHtml.includes("Three ways into this site"));
    assert.ok(!startHereHtml.includes("Best: subscribe"));
    assert.ok(startHereHtml.includes('href="/feed.xml" data-analytics-event="rss_click" data-subscribe-source="start-here"'));
    assert.ok(startHereHtml.includes('<link rel="canonical" href="https://example.test/start-here/" />'));

    // Research questions: current questions first, themes kept as an archive.
    assert.ok(researchTasteHtml.includes("<title>Research Questions · Praneeth&#39;s CS Field Notes</title>"));
    assert.ok(researchTasteHtml.includes("Reading list archive (2 themes)"));
    assert.ok(researchTasteHtml.includes("Deep learning foundations"));
    assert.ok(researchTasteHtml.includes("Mechanistic interpretability"));
    assert.ok(researchTasteHtml.includes("George Cybenko, Approximation by Superpositions of a Sigmoidal Function"));
    assert.ok(researchTasteHtml.includes("https://doi.org/10.1007/BF02551274"));
    assert.ok(researchTasteHtml.includes('href="/blog/tracing-the-mental-models-of-deep-learning-lessons-from-foundational-papers/"'));
    assert.ok(researchTasteHtml.includes('class="research-topic"'));
    assert.ok(researchTasteHtml.includes('<link rel="canonical" href="https://example.test/research-taste/" />'));
    assert.equal(findSchemaByType(researchTasteHtml, "CollectionPage").url, "https://example.test/research-taste/");

    assert.ok(errataHtml.includes("<title>Errata · Praneeth&#39;s CS Field Notes</title>"));
    assert.ok(errataHtml.includes("No published corrections yet."));
    assert.ok(errataHtml.includes("When a substantive error is found"));
    assert.ok(errataHtml.includes('href="/blog/tracing-the-mental-models-of-deep-learning-lessons-from-foundational-papers/"'));
    assert.ok(errataHtml.includes('<link rel="canonical" href="https://example.test/errata/" />'));

    // Follow page: RSS only (owner decision: no email newsletter).
    assert.ok(subscribeHtml.includes("<title>Follow · Praneeth&#39;s CS Field Notes</title>"));
    assert.ok(subscribeHtml.includes("There is no email newsletter."));
    assert.ok(!subscribeHtml.includes(OBFUSCATED_CONTACT_EMAIL));
    assert.ok(subscribeHtml.includes('href="/feed.xml" data-analytics-event="rss_click" data-subscribe-source="subscribe-page"'));
    assert.ok(subscribeHtml.includes('<link rel="canonical" href="https://example.test/subscribe/" />'));
    assert.ok(subscribeHtml.includes(`<meta name="description" content="Follow new notes and writing from Praneeth&#39;s CS Field Notes by RSS." />`));

    // Projects: role, decision, artifact, limitation per dossier (fixture data has only the basics).
    assert.ok(projectsHtml.includes("<title>Projects · Praneeth&#39;s CS Field Notes</title>"));
    assert.ok(projectsHtml.includes('href="/projects/ai-society-corpus/"'));
    assert.ok(projectsHtml.includes('href="/projects/beryl/"'));
    assert.ok(projectsHtml.includes('href="/projects/notes/"'));
    assert.ok(projectsHtml.includes('href="/projects/siap/"'));
    assert.ok(projectsHtml.includes("active · current site"));
    assert.ok(!projectsHtml.includes('href="/projects/agentic-coding/"'));
    assert.ok(!projectsHtml.includes('href="/projects/computer-science-notes/"'));
    assert.ok(projectsHtml.includes('<link rel="canonical" href="https://example.test/projects/" />'));
    assert.equal(findSchemaByType(projectsHtml, "CollectionPage").url, "https://example.test/projects/");
    assert.ok(corpusProjectHtml.includes("<title>AI Society Corpus · Projects · Praneeth&#39;s CS Field Notes</title>"));
    assert.ok(corpusProjectHtml.includes("The problem"));
    assert.ok(corpusProjectHtml.includes("AI/ML learners need connected study paths."));
    assert.ok(corpusProjectHtml.includes("What I built"));
    assert.ok(corpusProjectHtml.includes("Generate prerequisite, similarity, and backlink edges from Markdown topics."));
    assert.ok(corpusProjectHtml.includes("Where it stands"));
    assert.ok(corpusProjectHtml.includes("Readers can inspect a navigable concept network."));
    assert.ok(corpusProjectHtml.includes('href="https://github.com/NUSAISoc/aisoc-corpus"'));
    assert.ok(corpusProjectHtml.includes("knowledge-graph"));
    assert.ok(notesProjectHtml.includes("<title>Notes — this site · Projects · Praneeth&#39;s CS Field Notes</title>"));
    assert.ok(notesProjectHtml.includes("The site you are reading."));
    assert.ok(notesProjectHtml.includes("active · current site"));
    assert.ok(notesProjectHtml.includes('href="https://github.com/Praneeth-Suresh/Notes"'));
    assert.ok(notesProjectHtml.includes('href="/notes/"'));
    assert.ok(notesProjectHtml.includes("static-site"));
    assert.ok(!notesProjectHtml.includes('class="topic-nav"'));
    assert.ok(notesProjectHtml.includes('"@type":"BreadcrumbList"'));
    assert.ok(notesProjectHtml.includes('<link rel="canonical" href="https://example.test/projects/notes/" />'));
    assert.equal(findSchemaByType(notesProjectHtml, "CreativeWork").url, "https://example.test/projects/notes/");
    assert.ok(siapProjectHtml.includes("<title>SIAP · Projects · Praneeth&#39;s CS Field Notes</title>"));
    assert.ok(siapProjectHtml.includes("A theory-backed agentic systems book."));
    assert.ok(siapProjectHtml.includes('href="https://github.com/Praneeth-Suresh/SIAP"'));

    // Contact: direct channels, what I am open to, what helps.
    assert.ok(contactHtml.includes("<title>Contact · Praneeth&#39;s CS Field Notes</title>"));
    assert.ok(contactHtml.includes("https://github.com/Praneeth-Suresh"));
    assert.ok(contactHtml.includes("https://www.linkedin.com/in/praneeth-suresh-a114aa250/"));
    assert.ok(contactHtml.includes(OBFUSCATED_CONTACT_EMAIL));
    assert.ok(contactHtml.includes('id="collaboration-fit"'));
    assert.ok(contactHtml.includes("What I am open to"));
    assert.ok(contactHtml.includes("What helps"));
    assert.ok(contactHtml.includes('<link rel="canonical" href="https://example.test/contact/" />'));
    assert.equal(findSchemaByType(contactHtml, "ContactPage").url, "https://example.test/contact/");

    // About: concrete role and experience before philosophy; evidence links.
    assert.ok(personalHtml.includes('<h1 id="portfolio-title">Praneeth Suresh</h1>'));
    assert.ok(personalHtml.includes("National University of Singapore"));
    assert.ok(personalHtml.includes("Experience"));
    assert.ok(personalHtml.includes("Agile Counsel"));
    assert.ok(!/1,000\+|sub-200|20%|~40%|GPA/u.test(personalHtml), "unverified metrics stay off the About page");
    assert.ok(personalHtml.includes('href="/research-taste/"'));
    assert.ok(personalHtml.includes('href="/notes/"'));
    assert.ok(personalHtml.includes("NewRepo"));
    assert.ok(personalHtml.includes('data-analytics-event="outbound_github_click"'));
    assert.ok(personalHtml.includes('data-analytics-event="outbound_linkedin_click"'));
    assert.ok(personalHtml.includes('href="/" data-hotkey="H"'));
    assert.ok(personalHtml.includes("https://www.linkedin.com/in/praneeth-suresh-a114aa250/"));
    assert.equal(findSchemaByType(personalHtml, "ProfilePage").url, "https://example.test/about/");

    // Stylesheet: one token set, reading margin, status, local scrolling, reduced motion.
    assert.ok(siteCss.includes("--paper: #f7f7f5;"));
    assert.ok(siteCss.includes("--link: #315f9c;"));
    assert.ok(siteCss.includes("--status-working: #825b21;"));
    assert.ok(siteCss.includes(".reading-margin"));
    assert.ok(siteCss.includes(".note-scroll { max-width: 100%; overflow-x: auto;"));
    assert.ok(siteCss.includes("@media (prefers-reduced-motion: reduce)"));
    assert.ok(!siteCss.includes("overflow-x: clip;"), "the page never clips content horizontally");
    assert.ok(!siteCss.includes(".home-showcase"));

    assert.ok(childHtml.includes("<h1 class=\"site-title\">Dynamic Programming</h1>"));
    assert.ok(!childHtml.includes('class="topic-pillar"'));
    assert.ok(childHtml.includes("Optimal substructure"));
    assert.ok(childHtml.includes('<link rel="canonical" href="https://example.test/topics/algorithms/dynamic-programming/" />'));
    assert.ok(childHtml.includes('"name":"Dynamic Programming"'));
    assert.ok(childHtml.includes('src="/assets/vendor/mathjax/tex-svg-full.js"'));
    assert.ok(!childHtml.includes("cdn.jsdelivr.net"));
    assert.ok(childHtml.includes("\\[dp[i]=\\min_j(dp[j]+c)\\]"));
    assert.ok(feedXml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
    assert.ok(feedXml.includes("<title>Praneeth&apos;s CS Field Notes</title>"));
    assert.ok(feedXml.includes("<link>https://example.test/topics/algorithms/</link>"));
    assert.ok(feedXml.includes("<guid>https://example.test/topics/algorithms/</guid>"));
    assert.ok(feedXml.includes("<description>Algorithms explained with intuition, formal models, proof sketches, and implementation tradeoffs.</description>"));
    assert.ok(sitemapXml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
    assert.ok(sitemapXml.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'));
    assert.ok(sitemapXml.includes("<loc>https://example.test/</loc>"));
    assert.ok(sitemapXml.includes("<loc>https://example.test/start-here/</loc>"));
    assert.ok(sitemapXml.includes("<loc>https://example.test/research-taste/</loc>"));
    assert.ok(sitemapXml.includes("<loc>https://example.test/errata/</loc>"));
    assert.ok(sitemapXml.includes("<loc>https://example.test/subscribe/</loc>"));
    assert.ok(sitemapXml.includes("<loc>https://example.test/about/</loc>"));
    assert.ok(sitemapXml.includes("<loc>https://example.test/notes/</loc>"));
    assert.ok(sitemapXml.includes("<loc>https://example.test/projects/</loc>"));
    assert.ok(sitemapXml.includes("<loc>https://example.test/projects/ai-society-corpus/</loc>"));
    assert.ok(sitemapXml.includes("<loc>https://example.test/projects/beryl/</loc>"));
    assert.ok(sitemapXml.includes("<loc>https://example.test/projects/notes/</loc>"));
    assert.ok(sitemapXml.includes("<loc>https://example.test/projects/siap/</loc>"));
    assert.ok(!sitemapXml.includes("<loc>https://example.test/projects/agentic-coding/</loc>"));
    assert.ok(!sitemapXml.includes("<loc>https://example.test/projects/computer-science-notes/</loc>"));
    assert.ok(sitemapXml.includes("<loc>https://example.test/contact/</loc>"));
    assert.ok(!sitemapXml.includes("<loc>https://example.test/collaborate/</loc>"));
    assert.ok(sitemapXml.includes("<loc>https://example.test/topics/algorithms/</loc>"));
    assert.ok(sitemapXml.includes("<loc>https://example.test/topics/algorithms/dynamic-programming/</loc>"));
    const sitemapEntries = extractSitemapEntries(sitemapXml);
    assert.equal(sitemapEntries.length, extractSitemapLocations(sitemapXml).length);
    assert.ok(sitemapEntries.every((entry) => /^\d{4}-\d{2}-\d{2}$/u.test(entry.lastModified)));
    // Audit C9: note routes carry their topic's own date, not the site-wide latest date.
    assert.deepEqual(
      sitemapEntries.find((entry) => entry.location === "https://example.test/topics/algorithms/dynamic-programming/"),
      { location: "https://example.test/topics/algorithms/dynamic-programming/", lastModified: "2026-05-23" },
    );
    assert.notEqual(
      sitemapEntries.find((entry) => entry.location === "https://example.test/").lastModified,
      "2026-05-23",
    );
    assert.deepEqual(
      sitemapEntries.find((entry) => entry.location === "https://example.test/projects/beryl/"),
      { location: "https://example.test/projects/beryl/", lastModified: "2026-08-10" },
    );
    assert.ok(robotsTxt.includes("User-agent: *"));
    assert.ok(robotsTxt.includes("Allow: /"));
    assert.ok(robotsTxt.includes("Sitemap: https://example.test/sitemap.xml"));
    assert.ok(notFoundHtml.includes("<h1 id=\"not-found-title\">Page not found</h1>"));
    assert.ok(notFoundHtml.includes('href="/notes/"'));
    assert.ok(notFoundHtml.includes('<form class="not-found-search" role="search" action="/notes/" method="get">'));
    assert.ok(notFoundHtml.includes('<link rel="canonical" href="https://example.test/404.html" />'));
    const sitemapLocations = extractSitemapLocations(sitemapXml);
    assert.equal(sitemapLocations.length, new Set(sitemapLocations).size);
    for (const routePath of await collectHtmlRoutePaths(outDir)) {
      assert.ok(
        sitemapLocations.includes(`https://example.test${routePath}`),
        `Expected sitemap to include generated route ${routePath}`,
      );
    }
    assert.equal(mathJaxAsset, "window.MathJax = window.MathJax || {};\n");
    assert.ok(socialPreviewAsset.includes("<svg"));
    assert.ok(socialPreviewAsset.includes("AI Research"));
    assert.deepEqual(
      searchIndex.map((entry) => entry.slug),
      ["algorithms", "algorithms/dynamic-programming"],
    );
    assert.equal(
      searchIndex.find((entry) => entry.slug === "algorithms/dynamic-programming").urlPath,
      "/topics/algorithms/dynamic-programming/",
    );
    assert.ok(
      searchIndex
        .find((entry) => entry.slug === "algorithms/dynamic-programming")
        .searchableText.includes("Optimal substructure"),
    );
    assert.ok(
      searchIndex
        .find((entry) => entry.slug === "algorithms/dynamic-programming")
        .searchableText.includes("Graphs"),
    );
    assert.deepEqual(
      searchIndex.find((entry) => entry.slug === "algorithms/dynamic-programming").labels,
      [
        { name: "Graphs", color: "blue" },
        { name: "Reviewed", color: "green" },
      ],
    );
  });
});

test("builds database child pages with unique sibling routes and search entries", async () => {
  await withTempDir(async (root) => {
    const contentDir = path.join(root, "content");
    const topicsDir = path.join(contentDir, "topics");
    const outDir = path.join(root, "dist");
    const mathJaxSourcePath = path.join(root, "mathjax-source.js");
    await fs.mkdir(topicsDir, { recursive: true });
    await fs.writeFile(mathJaxSourcePath, "window.MathJax = window.MathJax || {};\n", "utf8");

    const topicDocument = {
      title: "Algorithms",
      description: "Algorithm notes",
      blocks: [
        {
          type: "child_page",
          blockId: "direct-scheduling",
          title: "Scheduling",
          children: [
            {
              type: "paragraph",
              richText: [
                { type: "text", content: "Direct scheduling notes", annotations: {}, href: null },
              ],
            },
          ],
        },
        {
          type: "child_database",
          blockId: "database-1",
          title: "Subtopics",
          children: [
            {
              type: "child_page",
              blockId: "database-scheduling",
              title: "Scheduling",
              children: [
                {
                  type: "paragraph",
                  richText: [
                    {
                      type: "text",
                      content: "Database scheduling notes",
                      annotations: {},
                      href: null,
                    },
                  ],
                },
              ],
            },
            {
              type: "child_page",
              blockId: "database-flows",
              title: "Network Flows",
              children: [
                {
                  type: "equation",
                  expression: "f(u,v)=-f(v,u)",
                },
              ],
            },
          ],
        },
      ],
    };

    await fs.writeFile(
      path.join(topicsDir, "algorithms.normalized.json"),
      `${JSON.stringify(topicDocument, null, 2)}\n`,
      "utf8",
    );
    await fs.writeFile(
      path.join(contentDir, "topic-manifest.json"),
      `${JSON.stringify([
        {
          slug: "algorithms",
          title: "Algorithms",
          description: "Algorithm notes",
          source: { kind: "normalized-file", path: "topics/algorithms.normalized.json" },
        },
      ], null, 2)}\n`,
      "utf8",
    );

    await buildPagesSite({
      manifestPath: path.join(contentDir, "topic-manifest.json"),
      outputDir: outDir,
      siteTitle: "Praneeth's CS Field Notes",
      mathJaxSourcePath,
    });

    const parentHtml = await fs.readFile(
      path.join(outDir, "topics", "algorithms", "index.html"),
      "utf8",
    );
    const directChildHtml = await fs.readFile(
      path.join(outDir, "topics", "algorithms", "scheduling", "index.html"),
      "utf8",
    );
    const databaseChildHtml = await fs.readFile(
      path.join(outDir, "topics", "algorithms", "scheduling-2", "index.html"),
      "utf8",
    );
    const searchIndex = JSON.parse(
      await fs.readFile(path.join(outDir, "search-index.json"), "utf8"),
    );

    assert.ok(parentHtml.includes('href="/topics/algorithms/scheduling/"'));
    assert.ok(parentHtml.includes('href="/topics/algorithms/scheduling-2/"'));
    assert.ok(parentHtml.includes('href="/topics/algorithms/network-flows/"'));
    assert.ok(parentHtml.includes("Subtopics"));
    assert.ok(directChildHtml.includes("Direct scheduling notes"));
    assert.ok(databaseChildHtml.includes("Database scheduling notes"));
    assert.deepEqual(
      searchIndex.map((entry) => entry.slug),
      [
        "algorithms",
        "algorithms/scheduling",
        "algorithms/scheduling-2",
        "algorithms/network-flows",
      ],
    );
    assert.ok(
      searchIndex
        .find((entry) => entry.slug === "algorithms/scheduling-2")
        .searchableText.includes("Database scheduling notes"),
    );
  });
});

test("does not replace an existing output directory when page rendering fails", async () => {
  await withTempDir(async (root) => {
    const contentDir = path.join(root, "content");
    const topicsDir = path.join(contentDir, "topics");
    const outDir = path.join(root, "dist");
    const mathJaxSourcePath = path.join(root, "mathjax-source.js");
    await fs.mkdir(topicsDir, { recursive: true });
    await fs.mkdir(outDir, { recursive: true });
    await fs.writeFile(path.join(outDir, "index.html"), "previous build\n", "utf8");
    await fs.writeFile(mathJaxSourcePath, "window.MathJax = window.MathJax || {};\n", "utf8");

    const topicDocument = {
      title: "Algorithms",
      blocks: [
        {
          type: "asset",
          kind: "image",
          url: "javascript:alert(1)",
          caption: [],
        },
      ],
    };

    await fs.writeFile(
      path.join(topicsDir, "algorithms.normalized.json"),
      `${JSON.stringify(topicDocument, null, 2)}\n`,
      "utf8",
    );
    await fs.writeFile(
      path.join(contentDir, "topic-manifest.json"),
      `${JSON.stringify([
        {
          slug: "algorithms",
          title: "Algorithms",
          source: { kind: "normalized-file", path: "topics/algorithms.normalized.json" },
        },
      ], null, 2)}\n`,
      "utf8",
    );

    await assert.rejects(
      () =>
        buildPagesSite({
          manifestPath: path.join(contentDir, "topic-manifest.json"),
          outputDir: outDir,
          siteTitle: "Praneeth's CS Field Notes",
          mathJaxSourcePath,
        }),
      /Unsupported URL protocol in asset URL: javascript:/,
    );
    assert.equal(await fs.readFile(path.join(outDir, "index.html"), "utf8"), "previous build\n");
  });
});
