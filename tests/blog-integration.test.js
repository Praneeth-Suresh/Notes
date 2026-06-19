"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

const { createNotesContentContext } = require("../src/notes-content");
const { createSiteStylingContext } = require("../src/site-styling");

const notesContent = createNotesContentContext();
const siteStyling = createSiteStylingContext();

function parseJsonLd(html) {
  return Array.from(html.matchAll(/<script type="application\/ld\+json">([^<]+)<\/script>/gu), (match) =>
    JSON.parse(match[1]),
  );
}

// --- renderBlogBody ---

test("renderBlogBody converts markdown headings to HTML", () => {
  const html = notesContent.renderBlogBody("# Hello\n\nParagraph here.");
  assert.ok(html.includes("<h1>Hello</h1>"));
  assert.ok(html.includes("<p>Paragraph here.</p>"));
  assert.ok(html.startsWith('<article class="blog-article">'));
});

test("renderBlogBody renders bold and italic", () => {
  const html = notesContent.renderBlogBody("**bold** and *italic*");
  assert.ok(html.includes("<strong>bold</strong>"));
  assert.ok(html.includes("<em>italic</em>"));
});

test("renderBlogBody renders images with src", () => {
  const html = notesContent.renderBlogBody("![alt text](/blog/images/pic.png)");
  assert.ok(html.includes('<img src="/blog/images/pic.png" alt="alt text">'));
});

test("renderBlogBody renders links", () => {
  const html = notesContent.renderBlogBody("[click](https://example.com)");
  assert.ok(html.includes('href="https://example.com"'));
  assert.ok(html.includes(">click</a>"));
});

test("renderBlogBody renders blockquotes", () => {
  const html = notesContent.renderBlogBody("> A quote here");
  assert.ok(html.includes("<blockquote>"));
  assert.ok(html.includes("A quote here"));
});

test("renderBlogBody renders ordered and unordered lists", () => {
  const html = notesContent.renderBlogBody("- item1\n- item2\n\n1. first\n2. second");
  assert.ok(html.includes("<ul>"));
  assert.ok(html.includes("<ol>"));
  assert.ok(html.includes("item1"));
  assert.ok(html.includes("first"));
});

test("renderBlogBody throws for non-string input", () => {
  assert.throws(() => notesContent.renderBlogBody(null), /expects a markdown string/);
  assert.throws(() => notesContent.renderBlogBody(123), /expects a markdown string/);
});

// --- createBlogSearchEntry ---

test("createBlogSearchEntry returns slug prefixed with blog/", () => {
  const entry = notesContent.createBlogSearchEntry({
    slug: "test-post",
    title: "Test Post",
    description: "A test post summary.",
    markdownString: "Some **content** here.\n\n![img](pic.png)",
  });
  assert.equal(entry.slug, "blog/test-post");
  assert.equal(entry.title, "Test Post");
  assert.equal(entry.description, "A test post summary.");
  assert.ok(entry.searchableText.includes("Test Post"));
  assert.ok(entry.searchableText.includes("Some"));
  assert.ok(entry.searchableText.includes("content"));
  // Images should be stripped from search text
  assert.ok(!entry.searchableText.includes("pic.png"));
});

test("createBlogSearchEntry throws for empty slug", () => {
  assert.throws(
    () => notesContent.createBlogSearchEntry({ slug: "", title: "T", markdownString: "" }),
    /slug must be a non-empty string/
  );
});

// --- renderBlogIndexPage ---

test("renderBlogIndexPage produces valid HTML with sections and posts", () => {
  const manifest = {
    home: { markdownFile: "posts/home.md" },
    sections: [
      {
        title: "Dev Memoir",
        subtitle: "my blog",
        posts: [
          { slug: "ch1", title: "Chapter 1", chapter: 1, markdownFile: "posts/ch1.md" },
          { slug: "ch2", title: "Chapter 2", chapter: 2, markdownFile: "posts/ch2.md" },
        ],
      },
      {
        title: "AI Readings",
        subtitle: "reflections",
        posts: [
          { slug: "ai1", title: "AI Post", chapter: null, markdownFile: "posts/ai1.md" },
        ],
      },
    ],
  };
  const html = siteStyling.renderBlogIndexPage({
    siteTitle: "Test Site",
    blogManifest: manifest,
    homeContentHtml: "<p>Welcome</p>",
  });
  assert.ok(html.includes("<!doctype html>"));
  assert.ok(html.includes("blog-page"));
  assert.ok(html.includes("Dev Memoir"));
  assert.ok(html.includes("AI Readings"));
  assert.ok(html.includes('href="/blog/ch1/"'));
  assert.ok(html.includes('href="/blog/ai1/"'));
  assert.ok(html.includes("<p>Welcome</p>"));
  assert.ok(html.includes("Blog &middot; Test Site") || html.includes("Blog · Test Site"));
});

// --- renderBlogPostPage ---

test("renderBlogPostPage produces valid post HTML with nav", () => {
  const manifest = {
    sections: [
      {
        title: "Dev Memoir",
        subtitle: "my blog",
        posts: [
          { slug: "ch1", title: "Chapter 1", chapter: 1, markdownFile: "posts/ch1.md" },
          { slug: "ch2", title: "Chapter 2", chapter: 2, markdownFile: "posts/ch2.md" },
        ],
      },
    ],
  };
  const html = siteStyling.renderBlogPostPage({
    siteTitle: "Test Site",
    post: { slug: "ch1", title: "Chapter 1", chapter: 1 },
    section: "Dev Memoir",
    blogContentHtml: "<p>Post body here</p>",
    blogManifest: manifest,
  });
  assert.ok(html.includes("<!doctype html>"));
  assert.ok(html.includes("blog-page"));
  assert.ok(html.includes("Chapter 1"));
  assert.ok(html.includes("Dev Memoir"));
  assert.ok(html.includes("<p>Post body here</p>"));
  // Should have next link but no prev (first post)
  assert.ok(html.includes('href="/blog/ch2/"'));
  assert.ok(html.includes("Chapter 2 &rarr;") || html.includes("Chapter 2 →"));
  // Back link
  assert.ok(html.includes('href="/blog/"'));
});

// --- build-pages blog integration ---

test("build-pages emits blog routes when manifest exists", async () => {
  const { buildPagesSite } = require("../scripts/build-pages");
  const tmpOut = path.join(os.tmpdir(), `notes-blog-build-${Date.now()}`);
  try {
    await buildPagesSite({
      manifestPath: "content/topic-manifest.json",
      outputDir: tmpOut,
      siteTitle: "Test",
    });
    const blogIndex = await fs.readFile(path.join(tmpOut, "blog", "index.html"), "utf8");
    assert.ok(blogIndex.includes("blog-page"));
    assert.ok(blogIndex.includes("A Developer"));
    assert.ok(blogIndex.includes("Theoretical CS Deep Dives"));
    assert.ok(blogIndex.includes('href="/blog/np-completeness-formal-definition-proof-sketches-and-reductions/"'));
    assert.ok(blogIndex.includes("NP-Completeness: Formal Definition, Proof Sketches, and Reductions"));
    assert.ok(blogIndex.includes('rel="alternate" type="application/rss+xml"'));
    assert.ok(blogIndex.includes('class="subscribe-panel"'));
    assert.ok(blogIndex.includes('<meta name="description" content="Stories, project notes, and AI research reflections from Computer Science Notes." />'));
    assert.ok(blogIndex.includes('<link rel="canonical" href="https://notes.praneeth-suresh-s.workers.dev/blog/" />'));
    assert.ok(blogIndex.includes('<meta property="og:title" content="Blog · Test" />'));

    // Check a post exists
    const postDir = await fs.readdir(path.join(tmpOut, "blog", "unic-launching-off"));
    assert.ok(postDir.includes("index.html"));
    const postHtml = await fs.readFile(
      path.join(tmpOut, "blog", "unic-launching-off", "index.html"),
      "utf8",
    );
    assert.ok(postHtml.includes('class="subscribe-panel"'));
    assert.ok(postHtml.includes('href="/subscribe/"'));
    assert.ok(postHtml.includes('href="/feed.xml"'));
    assert.ok(postHtml.includes('data-analytics-event="rss_click"'));
    assert.ok(postHtml.includes('<meta property="og:type" content="article" />'));
    assert.ok(postHtml.includes('<link rel="canonical" href="https://notes.praneeth-suresh-s.workers.dev/blog/unic-launching-off/" />'));
    assert.ok(postHtml.includes('<meta property="og:image" content="https://notes.praneeth-suresh-s.workers.dev/assets/social/theoretical-cs-preview.svg" />'));
    assert.ok(postHtml.includes('<meta name="twitter:card" content="summary_large_image" />'));
    assert.ok(postHtml.includes('"@type":"Article"'));
    assert.ok(postHtml.includes('"headline":"Launching Off"'));
    assert.ok(postHtml.includes('"author":{"@type":"Person","name":"Praneeth Suresh"}'));
    assert.ok(postHtml.includes('"image":"https://notes.praneeth-suresh-s.workers.dev/assets/social/theoretical-cs-preview.svg"'));
    const postSchemas = parseJsonLd(postHtml);
    assert.ok(postSchemas.some((schema) => schema["@type"] === "Article"));
    assert.equal(postSchemas.some((schema) => schema["@type"] === "FAQPage"), false);

    const flagshipHtml = await fs.readFile(
      path.join(
        tmpOut,
        "blog",
        "np-completeness-formal-definition-proof-sketches-and-reductions",
        "index.html",
      ),
      "utf8",
    );
    assert.ok(flagshipHtml.includes("<h1>NP-Completeness: Formal Definition, Proof Sketches, and Reductions</h1>"));
    assert.ok(flagshipHtml.includes("In this post"));
    assert.ok(flagshipHtml.includes("Formal statement"));
    assert.ok(flagshipHtml.includes("Model and assumptions"));
    assert.ok(flagshipHtml.includes("Proof sketch"));
    assert.ok(flagshipHtml.includes("Why this matters"));
    assert.ok(flagshipHtml.includes("Questions readers usually ask"));
    assert.ok(flagshipHtml.includes("Does NP-complete mean impossible to solve quickly?"));
    assert.ok(flagshipHtml.includes("Why do NP-completeness proofs use decision problems?"));
    assert.ok(flagshipHtml.includes("Further reading"));
    assert.ok(flagshipHtml.includes("Corrections and clarifications"));
    assert.ok(flagshipHtml.includes("Reusable artifact"));
    assert.ok(flagshipHtml.includes('href="/artifacts/np-completeness-reduction-template.tex"'));
    assert.ok(flagshipHtml.includes('href="/subscribe/"'));
    assert.ok(flagshipHtml.includes('href="/errata/"'));
    assert.ok(flagshipHtml.includes('href="/topics/algorithms/"'));
    assert.ok(flagshipHtml.includes('href="/topics/algorithms/the-traveling-salesperson-problem-tsp/"'));
    assert.ok(flagshipHtml.includes("Stephen Cook"));
    assert.ok(flagshipHtml.includes("https://doi.org/10.1145/800157.805047"));
    assert.ok(flagshipHtml.includes("Richard Karp"));
    assert.ok(flagshipHtml.includes("https://doi.org/10.1007/978-1-4684-2001-2_9"));
    assert.ok(flagshipHtml.includes('<meta name="description" content="NP-completeness explained through formal definitions, proof sketches, reductions, and why hardness evidence changes algorithm design." />'));
    assert.ok(flagshipHtml.includes('<meta property="og:description" content="A proof-backed guide to NP-completeness: formal definition, reductions, Cook, Karp, and the design consequences of hardness evidence." />'));
    assert.ok(flagshipHtml.includes('<meta name="twitter:image" content="https://notes.praneeth-suresh-s.workers.dev/assets/social/theoretical-cs-preview.svg" />'));
    assert.ok(flagshipHtml.includes('"headline":"NP-Completeness: Formal Definition, Proof Sketches, and Reductions"'));
    assert.ok(flagshipHtml.includes('"description":"NP-completeness explained through formal definitions, proof sketches, reductions, and why hardness evidence changes algorithm design."'));
    assert.ok(flagshipHtml.includes('"@type":"FAQPage"'));
    assert.ok(flagshipHtml.includes('"name":"Does NP-complete mean impossible to solve quickly?"'));
    assert.ok(flagshipHtml.includes('"name":"Why do NP-completeness proofs use decision problems?"'));
    const flagshipSchemas = parseJsonLd(flagshipHtml);
    const flagshipFaqSchema = flagshipSchemas.find((schema) => schema["@type"] === "FAQPage");
    assert.ok(flagshipSchemas.some((schema) => schema["@type"] === "Article"));
    assert.deepEqual(
      flagshipFaqSchema.mainEntity.map((item) => ({
        question: item.name,
        answer: item.acceptedAnswer.text,
      })),
      [
        {
          question: "Does NP-complete mean impossible to solve quickly?",
          answer: "No. NP-complete means that a polynomial-time exact algorithm for this problem would imply polynomial-time algorithms for every problem in NP. It is strong evidence to change the design target, not a proof that every useful instance is hopeless.",
        },
        {
          question: "Why do NP-completeness proofs use decision problems?",
          answer: "The definitions of P, NP, and NP-completeness are stated for languages with yes/no answers. Optimization problems usually enter the framework through threshold versions, such as asking whether there is a tour with cost at most K.",
        },
        {
          question: "What is the most common weak point in a reduction proof?",
          answer: "The reverse direction. It is not enough to show that a satisfying source solution creates a target solution. You also need to show that every target solution decodes into a valid source solution.",
        },
      ],
    );

    // Check images copied
    const images = await fs.readdir(path.join(tmpOut, "blog", "images"));
    assert.ok(images.includes("blog1.png"));
    const reductionTemplate = await fs.readFile(
      path.join(tmpOut, "artifacts", "np-completeness-reduction-template.tex"),
      "utf8",
    );
    assert.ok(reductionTemplate.includes("\\newcommand{\\problemA}"));
    assert.ok(reductionTemplate.includes("construction"));
    assert.ok(reductionTemplate.includes("Forward direction"));
    assert.ok(reductionTemplate.includes("Reverse direction"));

    // Check RSS feed includes blog posts
    const feedXml = await fs.readFile(path.join(tmpOut, "feed.xml"), "utf8");
    assert.ok(feedXml.includes("<title>Launching Off</title>"));
    assert.ok(feedXml.includes("<link>https://notes.praneeth-suresh-s.workers.dev/blog/unic-launching-off/</link>"));
    assert.ok(feedXml.includes("<title>NP-Completeness: Formal Definition, Proof Sketches, and Reductions</title>"));
    assert.ok(feedXml.includes("<description>NP-completeness explained through formal definitions, proof sketches, reductions, and why hardness evidence changes algorithm design.</description>"));

    // Check discovery files include generated blog routes
    const sitemapXml = await fs.readFile(path.join(tmpOut, "sitemap.xml"), "utf8");
    assert.ok(sitemapXml.includes("<loc>https://notes.praneeth-suresh-s.workers.dev/blog/</loc>"));
    assert.ok(sitemapXml.includes("<loc>https://notes.praneeth-suresh-s.workers.dev/subscribe/</loc>"));
    assert.ok(sitemapXml.includes("<loc>https://notes.praneeth-suresh-s.workers.dev/errata/</loc>"));
    assert.ok(sitemapXml.includes("<loc>https://notes.praneeth-suresh-s.workers.dev/blog/unic-launching-off/</loc>"));
    assert.ok(sitemapXml.includes("<loc>https://notes.praneeth-suresh-s.workers.dev/blog/np-completeness-formal-definition-proof-sketches-and-reductions/</loc>"));
    const robotsTxt = await fs.readFile(path.join(tmpOut, "robots.txt"), "utf8");
    assert.ok(robotsTxt.includes("Sitemap: https://notes.praneeth-suresh-s.workers.dev/sitemap.xml"));

    // Check search index includes blog
    const searchIndex = JSON.parse(await fs.readFile(path.join(tmpOut, "search-index.json"), "utf8"));
    const blogEntries = searchIndex.filter((e) => e.slug.startsWith("blog/"));
    assert.ok(blogEntries.length >= 12);
    const flagshipSearchEntry = searchIndex.find(
      (entry) => entry.slug === "blog/np-completeness-formal-definition-proof-sketches-and-reductions",
    );
    assert.equal(
      flagshipSearchEntry.description,
      "NP-completeness explained through formal definitions, proof sketches, reductions, and why hardness evidence changes algorithm design.",
    );
    assert.ok(
      flagshipSearchEntry.searchableText.includes("Proof sketch"),
    );

    const homeHtml = await fs.readFile(path.join(tmpOut, "index.html"), "utf8");
    assert.ok(homeHtml.includes('href="/blog/np-completeness-formal-definition-proof-sketches-and-reductions/"'));
    assert.ok(homeHtml.includes("NP-Completeness: Formal Definition, Proof Sketches, and Reductions"));

    const algorithmsHtml = await fs.readFile(path.join(tmpOut, "topics", "algorithms", "index.html"), "utf8");
    assert.ok(algorithmsHtml.includes('href="/blog/np-completeness-formal-definition-proof-sketches-and-reductions/"'));
  } finally {
    await fs.rm(tmpOut, { recursive: true, force: true });
  }
});
