"use strict";

// Regression tests for the audit's navigation, search, sitemap, and redirect work.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

const { buildPagesSite } = require("../scripts/build-pages");
const { computeNextReadings } = require("../scripts/lib/reading-paths");
const { assertRedirectsConsistent, renderRedirectsFile, validateRedirects } = require("../scripts/lib/redirects");
const { fingerprint, resolveRouteDates } = require("../scripts/lib/route-dates");
const { rankSearchEntries, buildSearchSnippet } = require("../src/site-styling/internal/notes-search");
const { renderBlogBody } = require("../src/notes-content/internal/render-blog-html");
const { renderTopicBody } = require("../src/notes-content/internal/render-notes-html");

const ROOT = path.resolve(__dirname, "..");

let realBuild;
async function buildRealSite() {
  if (!realBuild) {
    realBuild = (async () => {
      const outRoot = await fs.mkdtemp(path.join(os.tmpdir(), "notes-nav-build-"));
      const outDir = path.join(outRoot, "dist");
      await buildPagesSite({
        manifestPath: path.join(ROOT, "content", "topic-manifest.json"),
        outputDir: outDir,
        siteTitle: "Praneeth's CS Field Notes",
        siteUrl: "https://example.test",
      });
      return { outRoot, outDir };
    })();
  }
  return realBuild;
}

test.after(async () => {
  if (realBuild) {
    await fs.rm((await realBuild).outRoot, { recursive: true, force: true });
  }
});

async function listHtml(dir) {
  const found = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...(await listHtml(full)));
    } else if (entry.name.endsWith(".html")) {
      found.push(full);
    }
  }
  return found;
}

// ---------------------------------------------------------------------------
// Search (audit C8)
// ---------------------------------------------------------------------------

test("search ranks exact titles and aliases first and requires every term", () => {
  const entries = [
    { title: "Graph Traversal", searchableText: "dijkstra dijkstra dijkstra bfs dfs" },
    { title: "Minimum Spanning Trees", parentTitle: "Algorithms", searchableText: "prim kruskal dijkstra" },
    { title: "Dijkstra", parentTitle: "Algorithms", searchableText: "shortest paths" },
    { title: "Breadth-first search (BFS)", parentTitle: "Algorithms", searchableText: "queue levels" },
  ];
  assert.equal(rankSearchEntries(entries, "dijkstra")[0].title, "Dijkstra");
  assert.equal(rankSearchEntries(entries, "Dijkstra ")[0].title, "Dijkstra");
  assert.equal(rankSearchEntries(entries, "bfs")[0].title, "Breadth-first search (BFS)");
  assert.equal(rankSearchEntries(entries, "breadth first search")[0].title, "Breadth-first search (BFS)");
  assert.deepEqual(rankSearchEntries(entries, "dijkstra kruskal").map((entry) => entry.title), ["Minimum Spanning Trees"]);
  assert.deepEqual(rankSearchEntries(entries, "zzqqxx"), []);
});

test("search snippets show the matching passage, not the shared description", () => {
  const snippet = buildSearchSnippet(
    {
      title: "Dijkstra",
      description: "Algorithms explained with intuition.",
      searchableText: "Dijkstra Algorithms explained with intuition. Setup text here. The relaxation step updates the tentative distance of each neighbour.",
    },
    "relaxation",
  );
  assert.ok(snippet.text.includes("relaxation step updates"));
  assert.ok(!snippet.text.includes("explained with intuition"));
});

test("real build: the exact-title Dijkstra note ranks first and /notes/ stays small", async () => {
  const { outDir } = await buildRealSite();
  const index = JSON.parse(await fs.readFile(path.join(outDir, "search-index.json"), "utf8"));
  assert.equal(rankSearchEntries(index, "dijkstra")[0].urlPath, "/topics/algorithms/dijkstra/");
  assert.equal(rankSearchEntries(index, "job sequencing")[0].urlPath, "/topics/algorithms/job-sequencing-with-deadlines/");
  const notesPage = await fs.stat(path.join(outDir, "notes", "index.html"));
  assert.ok(notesPage.size < 120_000, `notes index is ${notesPage.size} bytes`);
});

// ---------------------------------------------------------------------------
// One H1 and local scrolling (audit C5, C6)
// ---------------------------------------------------------------------------

test("Notion and Markdown headings normalize relative hierarchy under the page title", () => {
  const html = renderTopicBody({
    blocks: [
      { type: "heading", level: 4, blockId: "stable-heading", richText: [{ type: "text", content: "First", annotations: {}, href: null }] },
      { type: "heading", level: 6, richText: [{ type: "text", content: "Deep", annotations: {}, href: null }] },
      { type: "heading", level: 5, richText: [{ type: "text", content: "Middle", annotations: {}, href: null }] },
    ],
  });
  assert.ok(html.includes('<h2 id="stable-heading"'));
  assert.ok(html.includes('data-source-heading-level="4"'));
  assert.ok(html.includes('<h3 id="deep"'));
  assert.ok(html.includes('<h3 id="middle"'));
  const blog = renderBlogBody("## A\n\n#### B\n\n### C\n\n###### D");
  assert.match(blog, /<h2 id="a"[^>]*>A<\/h2>[\s\S]*<h3 id="b"[^>]*>B<\/h3>[\s\S]*<h3 id="c"[^>]*>C<\/h3>[\s\S]*<h4 id="d"[^>]*>D<\/h4>/u);
});

test("tables and code blocks scroll inside focusable regions", () => {
  const notes = renderTopicBody({
    blocks: [
      { type: "table", rows: [{ cells: [[{ type: "text", content: "a", annotations: {}, href: null }]] }] },
      { type: "code", language: "c", code: "int x;" },
    ],
  });
  assert.ok(notes.includes('<div class="note-scroll note-table-scroll" role="region" aria-label="Table" tabindex="0"><table'));
  assert.ok(notes.includes('<pre class="note-code-block" data-language="c" tabindex="0" role="region" aria-label="c code">'));
  assert.ok(notes.includes('data-copy-code>Copy</button>'));
  const blog = renderBlogBody("| a | b |\n|---|---|\n| 1 | 2 |\n\n```js\ncode\n```");
  assert.ok(blog.includes('<div class="note-scroll note-table-scroll" role="region" aria-label="Table" tabindex="0"><table>'));
  assert.ok(blog.includes('<pre tabindex="0" role="region" aria-label="js code">'));
  assert.ok(blog.includes('data-copy-status'));
});

test("real build: every HTML page has exactly one h1 and no subscribe panel", async () => {
  const { outDir } = await buildRealSite();
  const files = await listHtml(outDir);
  const sitemap = await fs.readFile(path.join(outDir, "sitemap.xml"), "utf8");
  const canonicalCount = (sitemap.match(/<loc>/gu) || []).length;
  assert.equal(files.length, canonicalCount + 1, "canonical sitemap routes plus custom 404");
  for (const file of files) {
    const html = await fs.readFile(file, "utf8");
    assert.equal((html.match(/<h1[\s>]/gu) || []).length, 1, `h1 count in ${path.relative(outDir, file)}`);
    assert.ok(!html.includes("subscribe-panel"), `subscribe panel in ${path.relative(outDir, file)}`);
    assert.ok(!html.includes('class="reading-trail"'), `reading trail in ${path.relative(outDir, file)}`);
  }
});

// ---------------------------------------------------------------------------
// Next reading and breadcrumbs (audit C11)
// ---------------------------------------------------------------------------

test("next reading follows the curated path, then siblings, never the build order", () => {
  const records = [
    { urlPath: "/topics/t/", title: "T", parentUrlPath: null, publication: null },
    { urlPath: "/topics/t/a/", title: "A", parentUrlPath: "/topics/t/", parentTitle: "T", publication: null },
    { urlPath: "/topics/t/b/", title: "B", parentUrlPath: "/topics/t/", parentTitle: "T", publication: null },
    { urlPath: "/topics/t/c/", title: "C", parentUrlPath: "/topics/t/", parentTitle: "T", publication: null },
    { urlPath: "/topics/t/d/", title: "D", parentUrlPath: "/topics/t/", parentTitle: "T", publication: { next: { href: "/topics/t/a/", reason: "Back to basics." } } },
  ];
  const byUrl = new Map(records.map((record) => [record.urlPath, record]));
  const topic = { title: "T", pillar: { startHere: [], readingPath: [{ label: "Core", links: [{ href: "/topics/t/c/" }, { href: "/topics/t/a/" }] }] } };
  const next = computeNextReadings({ topic, records, recordsByUrl: byUrl });
  assert.equal(next.get("/topics/t/").urlPath, "/topics/t/c/");
  assert.equal(next.get("/topics/t/c/").urlPath, "/topics/t/a/");
  assert.match(next.get("/topics/t/c/").reason, /reading path/u);
  assert.equal(next.get("/topics/t/b/").urlPath, "/topics/t/c/");
  assert.equal(next.get("/topics/t/d/").urlPath, "/topics/t/a/");
  assert.equal(next.get("/topics/t/d/").reason, "Back to basics.");
});

test("real build: Binary Search continues to Sorting with a clickable breadcrumb", async () => {
  const { outDir } = await buildRealSite();
  const html = await fs.readFile(path.join(outDir, "topics", "algorithms", "binary-search", "index.html"), "utf8");
  assert.ok(html.includes('class="next-reading-link" href="/topics/algorithms/sorting/"'));
  assert.ok(!html.includes('class="next-reading-link" href="/topics/algorithms/depth-first-search-dfs/"'));
  assert.ok(html.includes('<li><a href="/topics/algorithms/">Algorithms</a></li><li aria-current="page">Binary Search</li>'));
});

test("a reading path link to a note that does not exist fails the build", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "notes-dangling-"));
  try {
    await fs.mkdir(path.join(root, "topics"));
    await fs.writeFile(path.join(root, "topics", "t.json"), JSON.stringify({ title: "T", blocks: [] }));
    await fs.writeFile(path.join(root, "topic-manifest.json"), JSON.stringify([
      { slug: "t", title: "T", source: { kind: "normalized-file", path: "topics/t.json" }, pillar: { readingPath: [{ label: "x", links: [{ title: "Gone", href: "/topics/t/gone/" }] }] } },
    ]));
    const mathJaxSourcePath = path.join(root, "mj.js");
    await fs.writeFile(mathJaxSourcePath, "");
    await assert.rejects(
      buildPagesSite({ manifestPath: path.join(root, "topic-manifest.json"), outputDir: path.join(root, "dist"), siteTitle: "x", mathJaxSourcePath }),
      /reading path links to \/topics\/t\/gone\/, which is not a generated note/u,
    );
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// Redirects and renamed notes (audit C11, ledger)
// ---------------------------------------------------------------------------

test("redirects validate generated page fragments and files without chains", () => {
  const redirects = validateRedirects({ redirects: [{ from: "/old/", to: "/new/#section", reason: "moved" }, { from: "/follow/", to: "/feed.xml", reason: "rss" }] });
  const fragments = new Map([["/new/", new Set(["section"])]]);
  assert.throws(() => assertRedirectsConsistent({ redirects, generatedRoutes: ["/old/", "/new/", "/feed.xml"], generatedFragments: fragments }), /still a generated page/u);
  assert.throws(() => assertRedirectsConsistent({ redirects, generatedRoutes: [], generatedFragments: fragments }), /does not generate/u);
  assert.doesNotThrow(() => assertRedirectsConsistent({ redirects, generatedRoutes: ["/new/", "/feed.xml"], generatedFragments: fragments }));
  assert.throws(() => assertRedirectsConsistent({ redirects, generatedRoutes: ["/new/", "/feed.xml"], generatedFragments: new Map() }), /missing fragment/u);
  const chain = validateRedirects({ redirects: [{ from: "/a/", to: "/b/", reason: "one" }, { from: "/b/", to: "/new/", reason: "two" }] });
  assert.throws(() => assertRedirectsConsistent({ redirects: chain, generatedRoutes: ["/new/"] }), /chain or cycle/u);
  assert.equal(renderRedirectsFile(redirects).split("\n")[1], "/old/ /new/#section 301");
  assert.throws(() => validateRedirects({ redirects: [{ from: "/a/", to: "/b/", reason: "" }] }), /reason is required/u);
});

test("real build: renamed and retired routes redirect directly to final targets", async () => {
  const { outDir } = await buildRealSite();
  const redirects = await fs.readFile(path.join(outDir, "_redirects"), "utf8");
  const expected = [
    ["/topics/algorithms/scheduling/", "/topics/algorithms/job-sequencing-with-deadlines/"],
    ["/topics/algorithms/scheduling-2/", "/topics/algorithms/when-greedy-scheduling-works/"],
    ["/topics/os/address-space-2/", "/topics/os/address-space-study-plan/"],
    ["/topics/os/network-communcation/", "/topics/os/network-communication/"],
    ["/topics/ai-engineer/kernal-and-os-optimisations/", "/topics/ai-engineer/kernel-and-os-optimisations/"],
    ["/start-here/", "/#notes"], ["/contact/", "/about/#contact"], ["/research-taste/", "/about/#research"],
    ["/subscribe/", "/feed.xml"], ["/collaborate/", "/about/#contact"],
  ];
  for (const [from, to] of expected) {
    assert.ok(redirects.includes(`${from} ${to} 301`), `${from} redirect`);
    await assert.rejects(fs.access(path.join(outDir, ...from.split("/").filter(Boolean), "index.html")));
  }
  await fs.access(path.join(outDir, "about", "index.html"));
  await fs.access(path.join(outDir, "feed.xml"));
  const titles = [];
  for (const file of await listHtml(path.join(outDir, "topics"))) titles.push((await fs.readFile(file, "utf8")).match(/<h1 class="site-title">([^<]*)<\/h1>/u)[1]);
  const duplicates = titles.filter((title, index) => titles.indexOf(title) !== index);
  assert.deepEqual(duplicates.filter((title) => ["Scheduling", "Address Space"].includes(title)), []);
});

// ---------------------------------------------------------------------------
// Per-route sitemap dates (audit C9)
// ---------------------------------------------------------------------------

test("route dates change only when a route's fingerprint changes", () => {
  const ledger = { "/a/": { fingerprint: fingerprint("one"), lastModified: "2026-01-01" } };
  assert.deepEqual(
    resolveRouteDates({ items: [{ urlPath: "/a/", fingerprint: fingerprint("one") }], ledger }),
    [{ urlPath: "/a/", lastModified: "2026-01-01" }],
  );
  assert.throws(
    () => resolveRouteDates({ items: [{ urlPath: "/a/", fingerprint: fingerprint("two") }], ledger }),
    /update-route-dates/u,
  );
  assert.deepEqual(
    resolveRouteDates({ items: [{ urlPath: "/b/", fingerprint: "x", fallbackDate: "2026-02-02" }], ledger: null }),
    [{ urlPath: "/b/", lastModified: "2026-02-02" }],
  );
});

test("real build: sitemap dates vary by route and match the checked-in ledger", async () => {
  const { outDir } = await buildRealSite();
  const sitemap = await fs.readFile(path.join(outDir, "sitemap.xml"), "utf8");
  const ledger = JSON.parse(await fs.readFile(path.join(ROOT, "content", "publication", "route-dates.json"), "utf8")).routes;
  const entries = [...sitemap.matchAll(/<loc>https:\/\/example\.test([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/gu)];
  assert.equal(entries.length, Object.keys(ledger).length);
  for (const [, route, date] of entries) {
    assert.equal(date, ledger[route].lastModified, route);
  }
  assert.ok(new Set(entries.map((entry) => entry[2])).size > 3, "dates are not all the same");
  const post = entries.find(([, route]) => route === "/blog/how-to-win-a-hackathon/");
  assert.equal(post[2], "2026-07-17");
});

// ---------------------------------------------------------------------------
// Site name, Home weight, newsletter removal (audit C10, C12)
// ---------------------------------------------------------------------------

test("real build: one site name everywhere, a light Home, and RSS as the only follow path", async () => {
  const { outDir } = await buildRealSite();
  const metadata = JSON.parse(await fs.readFile(path.join(ROOT, "content", "site-metadata.json"), "utf8"));
  const feed = await fs.readFile(path.join(outDir, "feed.xml"), "utf8");
  assert.ok(feed.includes(`<title>${metadata.siteTitle.replaceAll("'", "&apos;")}</title>`));
  const home = await fs.readFile(path.join(outDir, "index.html"), "utf8");
  assert.ok(home.includes(`<title>${metadata.siteTitle.replaceAll("'", "&#39;")}</title>`));
  assert.ok(home.length < 40_000, `home is ${home.length} bytes`);
  assert.ok(!home.includes("<img"));
  assert.ok(!home.includes("tex-svg-full.js"));
  for (const file of await listHtml(outDir)) {
    const html = await fs.readFile(file, "utf8");
    assert.ok(!/monthly (AI research|project) update|email request|subscribe by email|newsletter_cta/iu.test(html), path.relative(outDir, file));
  }
});
