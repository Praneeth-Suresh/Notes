"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

const { buildPagesSite } = require("../scripts/build-pages");

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
          description: "Algorithm notes",
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

    await buildPagesSite({
      manifestPath: path.join(contentDir, "topic-manifest.json"),
      outputDir: outDir,
      siteTitle: "Computer Science Notes",
      mathJaxSourcePath,
      portfolioDataPath,
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
    const personalHtml = await fs.readFile(path.join(outDir, "about", "index.html"), "utf8");
    const siteCss = await fs.readFile(path.join(outDir, "assets", "site.css"), "utf8");
    const searchIndex = JSON.parse(
      await fs.readFile(path.join(outDir, "search-index.json"), "utf8"),
    );
    const mathJaxAsset = await fs.readFile(
      path.join(outDir, "assets", "vendor", "mathjax", "tex-svg-full.js"),
      "utf8",
    );

    assert.ok(parentHtml.includes('href="/topics/algorithms/dynamic-programming/"'));
    assert.ok(parentHtml.includes("Dynamic Programming"));
    assert.ok(parentHtml.includes('class="note-label notion-label-color-blue"'));
    assert.ok(childHtml.includes('aria-label="Page labels"'));
    assert.ok(childHtml.includes("Reviewed"));
    assert.ok(homeHtml.includes('class="stripe-field"'));
    assert.ok(homeHtml.includes('href="/about/"'));
    assert.ok(homeHtml.includes('class="topic-card" href="/topics/algorithms/" data-index="01" data-hotkey="1"'));
    assert.ok(homeHtml.includes('data-hotkey="T"'));
    assert.ok(homeHtml.includes('document.addEventListener("keydown"'));
    assert.ok(homeHtml.includes('target.tagName === "INPUT"'));
    assert.ok(homeHtml.includes('searchInput.focus();'));
    assert.ok(personalHtml.includes("Praneeth Suresh"));
    assert.ok(personalHtml.includes("Software engineer and AI developer/researcher"));
    assert.ok(personalHtml.includes("turning exploratory ideas into working systems"));
    assert.ok(personalHtml.includes("Curiosity is only useful when it becomes a system"));
    assert.ok(personalHtml.includes("NewRepo"));
    assert.ok(personalHtml.includes("A newly refreshed public repository."));
    assert.ok(personalHtml.includes("<span>1</span>"));
    assert.ok(personalHtml.includes("href=\"/\" data-hotkey=\"H\""));
    assert.ok(personalHtml.includes("href=\"/#main-content\" data-hotkey=\"N\""));
    assert.ok(personalHtml.includes("https://www.linkedin.com/in/praneeth-suresh-a114aa250/"));
    assert.ok(!personalHtml.includes("Praneeth describes himself"));
    assert.ok(!personalHtml.includes("Source note: LinkedIn required authentication"));
    assert.ok(!homeHtml.includes("notes.dev"));
    assert.ok(siteCss.includes("@keyframes stripe-drift"));
    assert.ok(siteCss.includes("background: rgb(212 76 71 / 0.18);"));
    assert.ok(siteCss.includes("50% {\n    transform: translateX(18%) skewY(-10deg);"));
    assert.ok(siteCss.includes("100% {\n    transform: translateX(-18%) skewY(-10deg);"));
    assert.ok(siteCss.includes(".portfolio-quote"));
    assert.ok(siteCss.includes(".portfolio-hero"));
    assert.ok(siteCss.includes("@media (prefers-reduced-motion: reduce)"));
    assert.ok(childHtml.includes("<h1 class=\"site-title\">Dynamic Programming</h1>"));
    assert.ok(childHtml.includes("Optimal substructure"));
    assert.ok(childHtml.includes('src="/assets/vendor/mathjax/tex-svg-full.js"'));
    assert.ok(!childHtml.includes("cdn.jsdelivr.net"));
    assert.ok(childHtml.includes("\\[dp[i]=\\min_j(dp[j]+c)\\]"));
    assert.equal(mathJaxAsset, "window.MathJax = window.MathJax || {};\n");
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
      siteTitle: "Computer Science Notes",
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
          siteTitle: "Computer Science Notes",
          mathJaxSourcePath,
        }),
      /Unsupported URL protocol in asset URL: javascript:/,
    );
    assert.equal(await fs.readFile(path.join(outDir, "index.html"), "utf8"), "previous build\n");
  });
});
