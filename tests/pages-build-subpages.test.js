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
    const childHtml = await fs.readFile(
      path.join(outDir, "topics", "algorithms", "dynamic-programming", "index.html"),
      "utf8",
    );
    const searchIndex = JSON.parse(
      await fs.readFile(path.join(outDir, "search-index.json"), "utf8"),
    );
    const mathJaxAsset = await fs.readFile(
      path.join(outDir, "assets", "vendor", "mathjax", "tex-svg-full.js"),
      "utf8",
    );

    assert.ok(parentHtml.includes('href="/topics/algorithms/dynamic-programming/"'));
    assert.ok(parentHtml.includes("Dynamic Programming"));
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
  });
});
