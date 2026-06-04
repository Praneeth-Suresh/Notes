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
    markdownString: "Some **content** here.\n\n![img](pic.png)",
  });
  assert.equal(entry.slug, "blog/test-post");
  assert.equal(entry.title, "Test Post");
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

    // Check a post exists
    const postDir = await fs.readdir(path.join(tmpOut, "blog", "unic-launching-off"));
    assert.ok(postDir.includes("index.html"));

    // Check images copied
    const images = await fs.readdir(path.join(tmpOut, "blog", "images"));
    assert.ok(images.includes("blog1.png"));

    // Check search index includes blog
    const searchIndex = JSON.parse(await fs.readFile(path.join(tmpOut, "search-index.json"), "utf8"));
    const blogEntries = searchIndex.filter((e) => e.slug.startsWith("blog/"));
    assert.ok(blogEntries.length >= 11);
  } finally {
    await fs.rm(tmpOut, { recursive: true, force: true });
  }
});
