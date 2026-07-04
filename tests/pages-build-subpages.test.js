"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

const { buildPagesSite } = require("../scripts/build-pages");

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
                  { title: "Recursion", href: "/topics/algorithms/recursion/" },
                  { title: "Binary Search", href: "/topics/algorithms/binary-search/" },
                ],
              },
              {
                label: "Graphs",
                links: [
                  {
                    title: "Breadth-first search",
                    href: "/topics/algorithms/breadth-first-search-bfs/",
                  },
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
              slug: "notes",
              title: "Notes",
              status: "active flagship",
              summary: "A static technical hub.",
              problem: "Readers need searchable and shareable notes.",
              method: "Generate static pages from normalized note data.",
              result: "The site exposes topics, search, RSS, and project pages.",
              codeUrl: "https://github.com/Praneeth-Suresh/Notes",
              writeupUrl: "/topics/agent-coding/the-design-concept/",
              tags: ["static-site", "notion"],
            },
            {
              slug: "agentic-coding",
              title: "Agentic Coding",
              status: "active research and tooling",
              summary: "A public workflow trail around agentic coding.",
              problem: "Agentic coding needs reliable boundaries.",
              method: "Document harnesses, feedback loops, and review habits.",
              result: "The notes provide a practical reliability path.",
              codeUrl: "https://github.com/Praneeth-Suresh/AgentCoding",
              writeupUrl: "/topics/agent-coding/",
              tags: ["agents"],
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
    const notesProjectHtml = await fs.readFile(
      path.join(outDir, "projects", "notes", "index.html"),
      "utf8",
    );
    const contactHtml = await fs.readFile(path.join(outDir, "contact", "index.html"), "utf8");
    const collaborateHtml = await fs.readFile(path.join(outDir, "collaborate", "index.html"), "utf8");
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
    const homeImageFiles = [
      "home-hero.png",
      "home-research.png",
      "home-projects.png",
      "home-writing.png",
      "home-contact.png",
    ];
    for (const imageFile of homeImageFiles) {
      const imageStat = await fs.stat(path.join(outDir, "assets", "home", imageFile));
      assert.ok(imageStat.size > 0);
    }

    assert.ok(parentHtml.includes('href="/topics/algorithms/dynamic-programming/"'));
    assert.ok(parentHtml.includes("Dynamic Programming"));
    assert.ok(parentHtml.includes('class="note-label notion-label-color-blue"'));
    assert.ok(childHtml.includes('aria-label="Page labels"'));
    assert.ok(childHtml.includes("Reviewed"));
    assert.equal(parentHtml.match(/class="subscribe-panel/g)?.length, 2);
    assert.ok(parentHtml.includes('id="subscribe-topic-top"'));
    assert.ok(parentHtml.includes('id="subscribe-topic"'));
    assert.ok(parentHtml.includes('class="subscribe-panel subscribe-panel-compact"'));
    assert.equal(childHtml.match(/class="subscribe-panel/g)?.length, 2);
    assert.ok(childHtml.includes('id="subscribe-topic-subpage-top"'));
    assert.ok(childHtml.includes('id="subscribe-topic-subpage"'));
    assert.ok(parentHtml.includes('href="/feed.xml"'));
    assert.ok(parentHtml.includes('data-analytics-event="rss_click"'));
    assert.ok(parentHtml.includes('data-analytics-event="newsletter_cta_click"'));
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
    assert.ok(parentHtml.includes("Start here"));
    assert.ok(parentHtml.includes("How to read Algorithms"));
    assert.ok(parentHtml.includes("Learn how states, transitions, and optimal substructure organize hard problems."));
    assert.ok(parentHtml.includes('href="/topics/algorithms/dynamic-programming/"'));
    assert.ok(parentHtml.includes("Foundations"));
    assert.ok(parentHtml.includes("Breadth-first search"));
    assert.ok(parentHtml.includes('class="next-reading"'));
    assert.ok(parentHtml.includes("Next reading"));
    assert.ok(parentHtml.includes('class="next-reading-link" href="/topics/algorithms/dynamic-programming/"'));
    assert.ok(parentHtml.includes("Dynamic Programming"));
    assert.ok(parentHtml.includes("Follow the technical trail."));
    assert.ok(homeHtml.includes('class="home-showcase"'));
    assert.ok(homeHtml.includes('data-home-motion="ready"'));
    assert.ok(!homeHtml.includes('class="home-showcase-rail"'));
    assert.ok(homeHtml.includes('class="home-showcase-section home-showcase-hero"'));
    assert.ok(homeHtml.includes('class="home-showcase-section home-showcase-research"'));
    assert.ok(homeHtml.includes('class="home-showcase-section home-showcase-projects"'));
    assert.ok(homeHtml.includes('class="home-showcase-section home-showcase-writing"'));
    assert.ok(homeHtml.includes('class="home-showcase-section home-showcase-contact"'));
    assert.ok(homeHtml.includes('id="home-asks" class="home-showcase-section home-showcase-contact"'));
    assert.ok(homeHtml.includes('class="home-showcase-section home-showcase-notes"'));
    assert.ok(homeHtml.includes('class="home-visual home-visual-hero"'));
    assert.ok(homeHtml.includes('class="home-visual home-visual-research"'));
    assert.ok(homeHtml.includes('class="home-visual home-visual-projects"'));
    assert.ok(homeHtml.includes('class="home-visual home-visual-writing"'));
    assert.ok(homeHtml.includes('class="home-visual home-visual-contact"'));
    assert.ok(homeHtml.includes('class="home-visual home-visual-notes"'));
    assert.ok(homeHtml.includes('src="/assets/home/home-hero.png"'));
    assert.ok(homeHtml.includes('src="/assets/home/home-research.png"'));
    assert.ok(homeHtml.includes('src="/assets/home/home-projects.png"'));
    assert.ok(homeHtml.includes('src="/assets/home/home-writing.png"'));
    assert.ok(homeHtml.includes('src="/assets/home/home-contact.png"'));
    assert.ok(homeHtml.includes(`src="/assets/home/home-hero.png" alt="Notebook, laptop, and technical notes introducing Praneeth&#39;s CS Field Notes." width="1032" height="1377"`));
    assert.ok(homeHtml.includes('src="/assets/home/home-research.png" alt="AI research workspace with paper excerpts, model diagrams, and analysis traces." width="1672" height="941"'));
    assert.ok(homeHtml.includes('src="/assets/home/home-projects.png" alt="Software project workspace with code, tests, prototypes, and implementation notes." width="1320" height="720"'));
    assert.ok(homeHtml.includes('src="/assets/home/home-writing.png" alt="Technical writing desk with marked-up drafts, diagrams, and code references." width="1672" height="941"'));
    assert.ok(homeHtml.includes('src="/assets/home/home-contact.png" alt="Technical collaboration table with workshop notes, agenda, and project discussion materials." width="1698" height="926"'));
    assert.ok(homeHtml.includes('alt="AI research workspace with paper excerpts, model diagrams, and analysis traces."'));
    assert.ok(!homeHtml.includes('class="stripe-field"'));
    assert.ok(homeHtml.includes("Praneeth&#39;s CS Field Notes"));
    assert.ok(homeHtml.includes("Five entry points into my work"));
    assert.ok(homeHtml.includes('href="/start-here/">Start here</a>'));
    assert.ok(homeHtml.includes('href="/notes/">Search notes</a>'));
    assert.ok(homeHtml.includes('id="main-content" class="skip-target"'));
    assert.ok(!homeHtml.includes('class="primary-action" href="#main-content"'));
    assert.ok(!homeHtml.includes("Explore notes"));
    assert.ok(homeHtml.includes('href="/blog/"'));
    assert.ok(homeHtml.includes("Read writing"));
    assert.ok(homeHtml.includes('href="/start-here/"'));
    assert.ok(homeHtml.includes(">Start</a>"));
    assert.ok(!homeHtml.includes('class="home-proof"'));
    assert.ok(!homeHtml.includes("searchable note pages"));
    assert.ok(!homeHtml.includes("LaTeX, code blocks, child pages, search, and static routing"));
    assert.ok(!homeHtml.includes('class="home-bio"'));
    assert.ok(!homeHtml.includes("Start exploring"));
    assert.ok(!homeHtml.includes('class="home-section-map"'));
    assert.ok(!homeHtml.includes('class="home-section-count"'));
    assert.ok(!homeHtml.includes("Section atlas"));
    assert.ok(homeHtml.includes('class="home-pillar-menu"'));
    assert.ok(homeHtml.includes('class="home-pillar-trigger" type="button" aria-expanded="false" aria-controls="home-pillar-panel"'));
    assert.ok(homeHtml.includes('class="home-pillar-number">5</span>'));
    assert.ok(homeHtml.includes("Open the public knowledge map"));
    assert.ok(homeHtml.includes("Five areas where I contribute to public knowledge"));
    assert.ok(homeHtml.includes('id="home-pillar-panel" class="home-pillar-panel"'));
    assert.ok(homeHtml.includes('class="home-pillar-link" href="#home-research"'));
    assert.ok(homeHtml.includes("<span>01</span><strong>/ Research</strong><em>Paper trails</em><small>Paper-backed reading"));
    assert.ok(homeHtml.includes("<span>02</span><strong>/ Projects</strong><em>Proof of work</em><small>Systems, prototypes"));
    assert.ok(homeHtml.includes("<span>03</span><strong>/ Writing</strong><em>Essays</em><small>Longer arguments"));
    assert.ok(homeHtml.includes("<span>04</span><strong>/ Asks</strong><em>Collaboration</em><small>Specific routes"));
    assert.ok(homeHtml.includes("<span>05</span><strong>/ Notes</strong><em>Archive</em><small>Searchable CS notes"));
    assert.ok(homeHtml.includes('href="#home-research"'));
    assert.ok(homeHtml.includes('href="#home-projects"'));
    assert.ok(homeHtml.includes('href="#home-writing"'));
    assert.ok(homeHtml.includes('href="#home-asks"'));
    assert.ok(homeHtml.includes('href="#home-notes"'));
    assert.ok(homeHtml.includes("Paper-backed AI research notes."));
    assert.ok(homeHtml.includes("Read research trail"));
    assert.ok(homeHtml.includes("Projects"));
    assert.ok(homeHtml.includes("Selected systems with evidence."));
    assert.ok(homeHtml.includes("View projects"));
    assert.ok(!homeHtml.includes("Proof graph"));
    assert.ok(!homeHtml.includes("Research signal"));
    assert.ok(homeHtml.includes("initHomeShowcaseMotion"));
    assert.ok(homeHtml.includes("prefers-reduced-motion: reduce"));
    assert.ok(homeHtml.includes("--section-progress"));
    assert.ok(homeHtml.includes("data-home-pillars-button"));
    assert.ok(homeHtml.includes("setPillarMenuOpen"));
    assert.ok(homeHtml.includes("window.scrollY / (viewportHeight * 0.72)"));
    assert.ok(homeHtml.includes("smoothstep((activeProgress - 0.78) / 0.16)"));
    assert.ok(homeHtml.includes("data-active-section"));
    assert.ok(!homeHtml.includes("A static technical hub."));
    assert.ok(!homeHtml.includes('href="/projects/notes/"'));
    assert.ok(!homeHtml.includes('href="/projects/agentic-coding/"'));
    assert.ok(homeHtml.includes("Essays about technical ideas."));
    assert.ok(homeHtml.includes("Longer-form writing on deep learning"));
    assert.ok(!homeHtml.includes("The mental models of deep learning"));
    assert.ok(!homeHtml.includes("NP-Completeness: formal definitions and reductions"));
    assert.ok(!homeHtml.includes("Peeking inside the black box"));
    assert.ok(homeHtml.includes("Open routes for specific conversations."));
    assert.ok(!homeHtml.includes('class="ask-list"'));
    assert.ok(!homeHtml.includes('class="ask-item"'));
    assert.ok(homeHtml.includes("NUS AI Society speakers, workshops, sponsors, and partnerships"));
    assert.ok(homeHtml.includes('href="/contact/"'));
    assert.ok(!homeHtml.includes('href="/collaborate/" class="primary-action"'));
    assert.ok(homeHtml.includes('href="/research-taste/"'));
    assert.ok(homeHtml.includes('href="/about/"'));
    assert.ok(homeHtml.includes('href="/notes/"'));
    assert.ok(homeHtml.includes("Searchable computer science notes."));
    assert.ok(homeHtml.includes('<footer class="site-footer"'));
    assert.ok(homeHtml.includes('href="/">Home</a>'));
    assert.ok(homeHtml.includes('href="/research-taste/">Research</a>'));
    assert.ok(homeHtml.includes('href="/blog/">Writing</a>'));
    assert.ok(homeHtml.includes('href="/contact/">Asks</a>'));
    assert.ok(homeHtml.includes('href="/sitemap.xml"'));
    assert.ok(homeHtml.includes('href="/errata/"'));
    assert.ok(homeHtml.includes('href="/subscribe/"'));
    assert.ok(homeHtml.includes('href="/projects/"'));
    assert.ok(homeHtml.includes('href="/contact/"'));
    assert.ok(homeHtml.includes('href="/collaborate/"'));
    assert.ok(homeHtml.includes('data-subscribe-source="footer"'));
    assert.ok(homeHtml.includes('href="/feed.xml" data-analytics-event="rss_click" data-subscribe-source="footer"'));
    assert.ok(homeHtml.includes('rel="alternate" type="application/rss+xml"'));
    assert.ok(homeHtml.includes('href="/feed.xml"'));
    assert.ok(homeHtml.includes('<meta name="description" content="A collection of Praneeth Suresh&#39;s computer science notes, writings, research reading, and projects across AI research, algorithms, systems, and software engineering." />'));
    assert.ok(homeHtml.includes('<link rel="canonical" href="https://example.test/" />'));
    assert.ok(homeHtml.includes(`<meta property="og:title" content="Praneeth&#39;s CS Field Notes" />`));
    assert.ok(homeHtml.includes('<meta property="og:url" content="https://example.test/" />'));
    assert.ok(homeHtml.includes('<meta property="og:image" content="https://example.test/assets/social/theoretical-cs-preview.svg" />'));
    assert.ok(homeHtml.includes('<meta property="og:image:width" content="1200" />'));
    assert.ok(projectsHtml.includes('class="route-figure route-figure-projects"'));
    assert.ok(projectsHtml.includes('class="route-proof-layout"'));
    assert.ok(projectsHtml.indexOf('class="route-figure route-figure-projects"') > projectsHtml.indexOf('id="projects-route-title"'));
    assert.ok(projectsHtml.indexOf('class="portfolio-project-grid"') > projectsHtml.indexOf('class="route-figure route-figure-projects"'));
    assert.ok(projectsHtml.includes('href="/" data-hotkey="H"'));
    assert.ok(projectsHtml.includes('href="/contact/" data-hotkey="C"'));
    assert.ok(contactHtml.includes('class="route-figure route-figure-contact"'));
    assert.ok(contactHtml.includes('class="contact-channel-layout"'));
    assert.ok(contactHtml.indexOf('class="portfolio-project-grid"') > contactHtml.indexOf('class="route-figure route-figure-contact"'));
    assert.ok(contactHtml.includes('href="/projects/" data-hotkey="P"'));
    assert.ok(contactHtml.includes('href="/contact/" data-hotkey="C"'));
    assert.ok(siteCss.includes(".route-figure"));
    assert.ok(siteCss.includes(".route-proof-layout"));
    assert.ok(siteCss.includes(".contact-channel-layout"));
    assert.ok(siteCss.includes(".home-showcase"));
    assert.ok(siteCss.includes(".home-showcase-section"));
    assert.ok(siteCss.includes(".home-visual"));
    assert.ok(siteCss.includes(".home-visual img"));
    assert.ok(siteCss.includes("object-fit: contain;"));
    assert.ok(siteCss.includes("--home-visual-ratio: 11 / 6;"));
    assert.ok(siteCss.includes(".home-visual-hero"));
    assert.ok(siteCss.includes("--home-visual-ratio: 1032 / 1377;"));
    assert.ok(siteCss.includes(".home-showcase-motion"));
    assert.ok(siteCss.includes("@property --showcase-bg-current"));
    assert.ok(siteCss.includes("--showcase-card-hover-foreground"));
    assert.ok(siteCss.includes("scroll-snap-type: none;"));
    assert.ok(!siteCss.includes(".home-showcase-rail a.is-active"));
    assert.ok(!homeHtml.includes("home-showcase-rail a"));
    assert.ok(siteCss.includes(".home-page .site-header"));
    assert.ok(siteCss.includes("background: rgb(15 23 42 / 0.72);"));
    assert.ok(siteCss.includes(".site-header {\n  position: relative;"));
    assert.ok(!siteCss.includes(".site-header {\n  position: sticky;"));
    assert.ok(siteCss.includes("overflow-x: clip;"));
    assert.ok(siteCss.includes("overflow-wrap: anywhere;"));
    assert.ok(siteCss.includes(".home-showcase-hero .home-title span"));
    assert.ok(siteCss.includes("overflow-wrap: normal;"));
    assert.ok(siteCss.includes("word-break: normal;"));
    assert.ok(siteCss.includes("hyphens: manual;"));
    assert.ok(!siteCss.includes(".home-section-map"));
    assert.ok(!siteCss.includes(".home-section-count"));
    assert.ok(siteCss.includes(".home-pillar-menu"));
    assert.ok(siteCss.includes(".home-pillar-trigger"));
    assert.ok(siteCss.includes(".home-pillar-number"));
    assert.ok(siteCss.includes(".home-pillar-panel"));
    assert.ok(siteCss.includes(".home-pillar-links"));
    assert.ok(siteCss.includes(".home-pillar-link small"));
    assert.ok(siteCss.includes("grid-template-columns: repeat(5, minmax(0, 1fr));"));
    assert.ok(siteCss.includes("white-space: nowrap;"));
    assert.ok(siteCss.includes("border-right: 1px solid var(--showcase-border);"));
    assert.ok(siteCss.includes(".home-pillar-link:last-child"));
    assert.ok(siteCss.includes("linear-gradient(180deg, #000, #030308 58%, #05080a);"));
    assert.ok(siteCss.includes("min-height: clamp(34rem, 82vh, 44rem);"));
    assert.ok(siteCss.includes(".home-showcase-copy .section-subtitle + .home-intro"));
    assert.ok(siteCss.includes(".home-showcase-section .home-intro"));
    assert.ok(siteCss.includes(".home-showcase-motion .home-showcase-section:not(.home-showcase-hero) .home-showcase-copy .section-subtitle"));
    assert.ok(siteCss.includes("background: var(--showcase-bg-current);"));
    assert.ok(siteCss.includes("background: var(--showcase-bg-next);"));
    assert.ok(siteCss.includes(".home-page .site-footer"));
    assert.ok(siteCss.includes(".home-showcase-notes"));
    assert.ok(siteCss.includes(".home-visual-notes"));
    assert.ok(!siteCss.includes(".home-showcase-fade"));
    assert.ok(siteCss.includes("--stage-title-progress"));
    assert.ok(siteCss.includes("--stage-copy-progress"));
    assert.ok(siteCss.includes("--stage-actions-progress"));
    assert.ok(siteCss.includes("--stage-hold-progress"));
    assert.ok(siteCss.includes("--stage-title-opacity"));
    assert.ok(siteCss.includes("--stage-actions-x"));
    assert.ok(siteCss.includes("--stage-actions-clip"));
    assert.ok(siteCss.includes("--build-card-x"));
    assert.ok(siteCss.includes("--index-rule-progress"));
    assert.ok(siteCss.includes("--notes-reveal-progress"));
    assert.ok(siteCss.includes("--line-offset"));
    assert.ok(siteCss.includes("--showcase-foreground"));
    assert.ok(siteCss.includes("--showcase-muted"));
    assert.ok(siteCss.includes("--showcase-card"));
    assert.ok(siteCss.includes("--showcase-bg-current"));
    assert.ok(siteCss.includes("--showcase-bg-next"));
    assert.ok(siteCss.includes("--showcase-bg-mix"));
    assert.ok(siteCss.includes("transition: opacity 260ms linear;"));
    assert.ok(siteCss.includes(".home-showcase-copy .topic-index-link"));
    assert.ok(siteCss.includes("padding: 2.65rem 0.85rem 0.85rem;"));
    assert.ok(siteCss.includes(".home-showcase-section .topic-card:hover .topic-card-title"));
    assert.ok(siteCss.includes(".home-showcase::before"));
    assert.ok(siteCss.includes(".home-showcase-motion .home-showcase-copy .home-title"));
    assert.ok(siteCss.includes(".home-showcase-motion .home-showcase-cards .topic-card"));
    assert.ok(siteCss.includes(".home-showcase-section > .home-showcase-copy"));
    assert.ok(siteCss.includes(".home-showcase-section:not(.home-showcase-hero) .home-showcase-cards"));
    assert.ok(siteCss.includes(".home-showcase-section.home-showcase-research .home-showcase-cards"));
    assert.ok(siteCss.includes(".home-showcase-projects .topic-card:nth-child(2)"));
    assert.ok(siteCss.includes(".home-showcase-writing .home-showcase-cards::before"));
    assert.ok(!siteCss.includes(".home-showcase-contact > .home-showcase-copy,\n  .home-showcase-contact > .home-visual"));
    assert.ok(siteCss.includes("position: sticky;"));
    assert.ok(!siteCss.includes("--card-drift"));
    assert.ok(!siteCss.includes("--card-swing"));
    assert.ok(!siteCss.includes("--visual-depth"));
    assert.ok(!siteCss.includes("--stage-fade"));
    assert.ok(!siteCss.includes("--card-fade"));
    assert.ok(siteCss.includes("background-color: #10231e;"));
    assert.ok(siteCss.includes("background-color: #172231;"));
    assert.ok(siteCss.includes("background-color: #2f1838;"));
    assert.ok(siteCss.includes("background-color: #eef3f7;"));
    assert.ok(siteCss.includes("#101924"));
    assert.ok(homeHtml.includes('data-motion-bg="#030308" data-motion-hold="#030308" data-motion-next="#1a0b36" data-motion-exit="#1a0b36"'));
    assert.ok(homeHtml.includes('data-motion-bg="#10231e" data-motion-hold="#10231e" data-motion-next="#18372f" data-motion-exit="#18372f"'));
    assert.ok(homeHtml.includes('data-motion-bg="#172231" data-motion-hold="#172231" data-motion-next="#253245" data-motion-exit="#253245"'));
    assert.ok(homeHtml.includes('data-motion-bg="#f4f1e8" data-motion-hold="#f4f1e8" data-motion-next="#ece5d8" data-motion-exit="#ece5d8"'));
    assert.ok(homeHtml.includes('data-motion-bg="#2f1838" data-motion-hold="#2f1838" data-motion-next="#3b2142" data-motion-exit="#3b2142"'));
    assert.ok(homeHtml.includes('data-motion-bg="#eef3f7" data-motion-hold="#eef3f7" data-motion-next="#dfeaf1" data-motion-exit="#dfeaf1"'));
    assert.ok(!homeHtml.includes('class="home-showcase-fade" aria-hidden="true"'));
    assert.ok(siteCss.includes(".topic-hub-intro"));
    assert.ok(siteCss.includes(".home-showcase-contact .subscribe-panel p:not(.section-kicker)"));
    assert.ok(homeHtml.includes('<meta property="og:image:height" content="630" />'));
    assert.ok(homeHtml.includes('<meta name="twitter:card" content="summary_large_image" />'));
    assert.ok(homeHtml.includes('<meta name="twitter:image" content="https://example.test/assets/social/theoretical-cs-preview.svg" />'));
    assert.ok(homeHtml.includes('data-analytics-event="page_view"'));
    assert.ok(homeHtml.includes('window.notesAnalyticsEvents'));
    assert.ok(homeHtml.includes('id="home-research" class="home-showcase-section home-showcase-research"'));
    assert.ok(homeHtml.includes('data-motion-style="scan"'));
    assert.ok(homeHtml.includes('data-motion-style="build"'));
    assert.ok(homeHtml.includes('data-motion-style="index"'));
    assert.ok(!homeHtml.includes("These are my computer science notes: linked topic archives pulled from my study system"));
    assert.ok(notesHtml.includes("Topic archives pulled from my study system."));
    assert.ok(!homeHtml.includes('data-subscribe-source="home"'));
    assert.ok(!homeHtml.includes("Subscribe for monthly AI research/project updates."));
    assert.ok(!homeHtml.includes("mailto:praneeth.suresh.s@gmail.com?subject=Subscribe%20to%20monthly%20AI%20research%20and%20project%20updates"));
    assert.ok(!homeHtml.includes('data-analytics-event="email_subscribe_click"'));
    assert.ok(!homeHtml.includes('class="topic-card" href="/topics/algorithms/" data-index="01" data-hotkey="1"'));
    assert.ok(notesHtml.includes('class="topic-card" href="/topics/algorithms/" data-index="01" data-hotkey="1"'));
    assert.ok(notesHtml.includes("<title>Notes · Praneeth&#39;s CS Field Notes</title>"));
    assert.ok(notesHtml.includes('id="topic-search"'));
    assert.ok(notesHtml.includes('new URLSearchParams(window.location.search).get("q")'));
    assert.ok(notesHtml.includes('<link rel="canonical" href="https://example.test/notes/" />'));
    assert.equal(findSchemaByType(notesHtml, "CollectionPage").url, "https://example.test/notes/");
    assert.ok(startHereHtml.includes("<title>Start Here · Praneeth&#39;s CS Field Notes</title>"));
    assert.ok(startHereHtml.includes('href="/start-here/"'));
    assert.ok(!startHereHtml.includes('aria-label="Start here navigation"'));
    assert.ok(!startHereHtml.includes('class="topic-nav"'));
    assert.ok(startHereHtml.includes("Start with the AI research trail"));
    assert.ok(startHereHtml.includes("without flattening the notes themselves"));
    assert.ok(startHereHtml.includes('href="/research-taste/"'));
    assert.ok(startHereHtml.includes("Read one paper-backed essay"));
    assert.ok(startHereHtml.includes('href="/blog/tracing-the-mental-models-of-deep-learning-lessons-from-foundational-papers/"'));
    assert.ok(startHereHtml.includes("Subscribe when the shape is useful"));
    assert.ok(startHereHtml.includes('href="/feed.xml"'));
    assert.ok(startHereHtml.includes('href="/research-taste/"'));
    assert.ok(startHereHtml.includes('class="subscribe-panel"'));
    assert.ok(startHereHtml.includes('<link rel="canonical" href="https://example.test/start-here/" />'));
    assert.ok(startHereHtml.includes(`<meta name="description" content="A guided first path through Praneeth&#39;s CS Field Notes: start with AI research, read one paper-backed essay, and subscribe by RSS." />`));
    assert.ok(researchTasteHtml.includes("<title>Research Taste · Praneeth&#39;s CS Field Notes</title>"));
    assert.ok(researchTasteHtml.includes("Research taste"));
    assert.ok(!researchTasteHtml.includes('aria-label="Research taste navigation"'));
    assert.ok(!researchTasteHtml.includes('class="topic-nav"'));
    assert.ok(researchTasteHtml.includes("Deep learning foundations"));
    assert.ok(researchTasteHtml.includes("Mechanistic interpretability"));
    assert.ok(researchTasteHtml.includes("George Cybenko, Approximation by Superpositions of a Sigmoidal Function"));
    assert.ok(researchTasteHtml.includes("https://doi.org/10.1007/BF02551274"));
    assert.ok(researchTasteHtml.includes("Essay: The mental models of deep learning"));
    assert.ok(researchTasteHtml.includes('href="/blog/tracing-the-mental-models-of-deep-learning-lessons-from-foundational-papers/"'));
    assert.ok(researchTasteHtml.includes('class="research-topic"'));
    assert.ok(researchTasteHtml.includes('<link rel="canonical" href="https://example.test/research-taste/" />'));
    assert.ok(researchTasteHtml.includes(`<meta name="description" content="A public research taste list for Praneeth&#39;s CS Field Notes: AI research topics, why they matter, selected essays, and source trails." />`));
    assert.equal(findSchemaByType(researchTasteHtml, "CollectionPage").url, "https://example.test/research-taste/");
    assert.ok(researchTasteHtml.includes('<footer class="site-footer"'));
    assert.ok(errataHtml.includes("<title>Errata · Praneeth&#39;s CS Field Notes</title>"));
    assert.ok(errataHtml.includes("Errata"));
    assert.ok(errataHtml.includes("No published corrections yet."));
    assert.ok(errataHtml.includes("When a substantive error is found"));
    assert.ok(errataHtml.includes('href="/blog/tracing-the-mental-models-of-deep-learning-lessons-from-foundational-papers/"'));
    assert.ok(errataHtml.includes('<link rel="canonical" href="https://example.test/errata/" />'));
    assert.ok(errataHtml.includes(`<meta name="description" content="Public corrections and clarification policy for Praneeth&#39;s CS Field Notes." />`));
    assert.ok(subscribeHtml.includes("<title>Subscribe · Praneeth&#39;s CS Field Notes</title>"));
    assert.ok(subscribeHtml.includes("Subscribe"));
    assert.ok(!subscribeHtml.includes('aria-label="Subscribe navigation"'));
    assert.ok(!subscribeHtml.includes('class="topic-nav"'));
    assert.ok(subscribeHtml.includes("Monthly AI research and project updates, with RSS available now."));
    assert.ok(subscribeHtml.includes("Subscribe for monthly AI research/project updates."));
    assert.ok(subscribeHtml.includes("RSS is live now."));
    assert.ok(subscribeHtml.includes("Subscribe by email"));
    assert.ok(subscribeHtml.includes('data-analytics-event="email_subscribe_click"'));
    assert.ok(subscribeHtml.includes('href="/feed.xml"'));
    assert.ok(subscribeHtml.includes('data-analytics-event="rss_click"'));
    assert.ok(subscribeHtml.includes('href="/start-here/"'));
    assert.ok(subscribeHtml.includes('href="/blog/tracing-the-mental-models-of-deep-learning-lessons-from-foundational-papers/"'));
    assert.ok(subscribeHtml.includes('<link rel="canonical" href="https://example.test/subscribe/" />'));
    assert.ok(subscribeHtml.includes(`<meta name="description" content="Subscribe for monthly AI research and project updates from Praneeth&#39;s CS Field Notes by email request or RSS." />`));
    assert.ok(projectsHtml.includes("<title>Projects · Praneeth&#39;s CS Field Notes</title>"));
    assert.ok(projectsHtml.includes("Selected projects"));
    assert.ok(projectsHtml.includes("problem, method, result, code, write-up, and status"));
    assert.ok(projectsHtml.includes('href="/projects/notes/"'));
    assert.ok(projectsHtml.includes("active flagship"));
    assert.ok(projectsHtml.includes("Contact me about research, internships, consulting, or NUS AI Society collaboration."));
    assert.ok(projectsHtml.includes("mailto:praneeth.suresh.s@gmail.com"));
    assert.ok(projectsHtml.includes('href="/projects/" data-hotkey="P"'));
    assert.ok(projectsHtml.includes('href="/contact/" data-hotkey="C"'));
    assert.ok(projectsHtml.includes('<link rel="canonical" href="https://example.test/projects/" />'));
    assert.equal(findSchemaByType(projectsHtml, "CollectionPage").url, "https://example.test/projects/");
    assert.ok(notesProjectHtml.includes("<title>Notes · Projects · Praneeth&#39;s CS Field Notes</title>"));
    assert.ok(notesProjectHtml.includes("Problem"));
    assert.ok(notesProjectHtml.includes("Readers need searchable and shareable notes."));
    assert.ok(notesProjectHtml.includes("Method"));
    assert.ok(notesProjectHtml.includes("Generate static pages from normalized note data."));
    assert.ok(notesProjectHtml.includes("Result"));
    assert.ok(notesProjectHtml.includes("The site exposes topics, search, RSS, and project pages."));
    assert.ok(notesProjectHtml.includes("Status"));
    assert.ok(notesProjectHtml.includes("active flagship"));
    assert.ok(notesProjectHtml.includes('href="https://github.com/Praneeth-Suresh/Notes"'));
    assert.ok(notesProjectHtml.includes('href="/topics/agent-coding/the-design-concept/"'));
    assert.ok(notesProjectHtml.includes('data-contact-source="project-notes"'));
    assert.ok(notesProjectHtml.includes("Email is the best first step."));
    assert.ok(!notesProjectHtml.includes("Calendly"));
    assert.ok(notesProjectHtml.includes("static-site"));
    assert.ok(notesProjectHtml.includes('"@type":"BreadcrumbList"'));
    assert.ok(notesProjectHtml.includes('<link rel="canonical" href="https://example.test/projects/notes/" />'));
    assert.equal(findSchemaByType(notesProjectHtml, "CreativeWork").url, "https://example.test/projects/notes/");
    assert.ok(contactHtml.includes("<title>Contact · Praneeth&#39;s CS Field Notes</title>"));
    assert.ok(contactHtml.includes("research, internships, consulting, NUS AI Society collaboration"));
    assert.ok(contactHtml.includes("https://github.com/Praneeth-Suresh"));
    assert.ok(contactHtml.includes("https://www.linkedin.com/in/praneeth-suresh-a114aa250/"));
    assert.ok(contactHtml.includes("mailto:praneeth.suresh.s@gmail.com"));
    assert.ok(contactHtml.includes("praneeth.suresh.s@gmail.com"));
    assert.ok(contactHtml.includes("Research, internships, consulting, and AI Society collaboration."));
    assert.ok(contactHtml.includes("Speaker, workshop, sponsor, partner"));
    assert.ok(contactHtml.includes('href="/projects/" data-hotkey="P"'));
    assert.ok(contactHtml.includes('href="/contact/" data-hotkey="C"'));
    assert.ok(contactHtml.includes('<link rel="canonical" href="https://example.test/contact/" />'));
    assert.equal(findSchemaByType(contactHtml, "ContactPage").url, "https://example.test/contact/");
    assert.ok(collaborateHtml.includes("<title>Collaborate · Praneeth&#39;s CS Field Notes</title>"));
    assert.ok(collaborateHtml.includes("Collaboration and consulting"));
    assert.ok(collaborateHtml.includes("AI Society partnerships"));
    assert.ok(collaborateHtml.includes("mailto:praneeth.suresh.s@gmail.com"));
    assert.ok(collaborateHtml.includes("Email is the best first step."));
    assert.ok(!collaborateHtml.includes("Calendly"));
    assert.ok(collaborateHtml.includes('<link rel="canonical" href="https://example.test/collaborate/" />'));
    assert.ok(homeHtml.includes('href="/start-here/" data-hotkey="S"'));
    assert.ok(homeHtml.includes('href="/about/" data-hotkey="A"'));
    assert.ok(homeHtml.includes('href="/projects/" data-hotkey="P"'));
    assert.ok(homeHtml.includes('href="/notes/" data-hotkey="N"'));
    assert.ok(homeHtml.includes('href="/contact/" data-hotkey="C"'));
    assert.ok(!homeHtml.includes('href="#topic-search" data-hotkey="/"'));
    assert.ok(notesHtml.includes('target.tagName === "INPUT"'));
    assert.ok(notesHtml.includes('searchInput.focus();'));
    assert.ok(homeHtml.includes('document.addEventListener("keydown"'));
    assert.ok(homeHtml.includes('target.tagName === "INPUT"'));
    assert.ok(personalHtml.includes("Praneeth Suresh"));
    assert.ok(personalHtml.includes("[ About me ]"));
    assert.ok(personalHtml.includes("NUS Computer Science + Mathematics student building inspectable AI systems"));
    assert.ok(personalHtml.includes("research taste becomes working software"));
    assert.ok(personalHtml.includes("about.me / signal"));
    assert.ok(personalHtml.includes("public repositories reviewed"));
    assert.ok(personalHtml.includes("Perfect GPA"));
    assert.ok(personalHtml.includes("Public work"));
    assert.ok(personalHtml.includes("second major in Mathematics"));
    assert.ok(personalHtml.includes("Tech and Research Director of the NUS AI Society"));
    assert.ok(personalHtml.includes("Tech Director of the residence student committee"));
    assert.ok(personalHtml.includes("interpretability, representation analysis, model evaluation, memory, routing, agent reliability"));
    assert.ok(personalHtml.includes("Useful conversations start from a concrete technical overlap."));
    assert.ok(personalHtml.includes("AI engineering, applied ML, developer tools"));
    assert.ok(personalHtml.includes("mailto:praneeth.suresh.s@gmail.com"));
    assert.ok(personalHtml.includes('data-contact-source="about-hero"'));
    assert.ok(personalHtml.includes('data-contact-source="about"'));
    assert.ok(personalHtml.includes('href="/research-taste/"'));
    assert.ok(personalHtml.includes("Turning AI research questions into inspectable systems."));
    assert.ok(personalHtml.includes("Curiosity is only useful when it becomes a system"));
    assert.ok(personalHtml.includes("NewRepo"));
    assert.ok(personalHtml.includes("A newly refreshed public repository."));
    assert.ok(personalHtml.includes('data-analytics-event="outbound_github_click"'));
    assert.ok(personalHtml.includes('data-analytics-event="outbound_linkedin_click"'));
    assert.ok(personalHtml.includes("<span>1</span>"));
    assert.ok(personalHtml.includes("href=\"/\" data-hotkey=\"H\""));
    assert.ok(personalHtml.includes("href=\"/notes/\" data-hotkey=\"N\""));
    assert.ok(personalHtml.includes("https://www.linkedin.com/in/praneeth-suresh-a114aa250/"));
    assert.equal(findSchemaByType(personalHtml, "ProfilePage").url, "https://example.test/about/");
    assert.ok(!personalHtml.includes("Praneeth describes himself"));
    assert.ok(!personalHtml.includes("Source note: LinkedIn required authentication"));
    assert.ok(!homeHtml.includes("notes.dev"));
    assert.ok(siteCss.includes("@keyframes stripe-drift"));
    assert.ok(siteCss.includes("--accent: #9db7ff;"));
    assert.ok(siteCss.includes("--accent-strong: #b8c3ff;"));
    assert.ok(siteCss.includes("background: rgb(212 76 71 / 0.18);"));
    assert.ok(siteCss.includes("50% {\n    transform: translateX(18%) skewY(-10deg);"));
    assert.ok(siteCss.includes("100% {\n    transform: translateX(-18%) skewY(-10deg);"));
    assert.ok(siteCss.includes(".portfolio-quote"));
    assert.ok(siteCss.includes(".portfolio-hero"));
    assert.ok(siteCss.includes(".site-links a[data-hotkey]::before"));
    assert.ok(!siteCss.includes(".site-links a::before,\n.topic-nav a::before"));
    assert.ok(siteCss.includes(".site-footer"));
    assert.ok(siteCss.includes('mjx-container[jax="SVG"][display="true"]'));
    assert.ok(siteCss.includes("@media (prefers-reduced-motion: reduce)"));
    assert.ok(childHtml.includes("<h1 class=\"site-title\">Dynamic Programming</h1>"));
    assert.ok(!childHtml.includes('class="topic-pillar"'));
    assert.ok(!childHtml.includes('class="next-reading"'));
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
    assert.ok(sitemapXml.includes("<loc>https://example.test/projects/notes/</loc>"));
    assert.ok(sitemapXml.includes("<loc>https://example.test/projects/agentic-coding/</loc>"));
    assert.ok(sitemapXml.includes("<loc>https://example.test/contact/</loc>"));
    assert.ok(sitemapXml.includes("<loc>https://example.test/collaborate/</loc>"));
    assert.ok(sitemapXml.includes("<loc>https://example.test/topics/algorithms/</loc>"));
    assert.ok(sitemapXml.includes("<loc>https://example.test/topics/algorithms/dynamic-programming/</loc>"));
    assert.ok(robotsTxt.includes("User-agent: *"));
    assert.ok(robotsTxt.includes("Allow: /"));
    assert.ok(robotsTxt.includes("Sitemap: https://example.test/sitemap.xml"));
    assert.ok(notFoundHtml.includes("<h1 id=\"not-found-title\">Page not found</h1>"));
    assert.ok(notFoundHtml.includes('href="/notes/"'));
    assert.ok(notFoundHtml.includes('href="/subscribe/"'));
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
