"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

const { buildPagesSite } = require("../scripts/build-pages");
const {
  joinPublication,
  validatePublicationSidecar,
} = require("../scripts/lib/publication-metadata");
const { applyCorrectionsToTopic, validateCorrections } = require("../scripts/lib/content-corrections");
const { applyMediaToTopic, validateMediaManifest } = require("../scripts/lib/note-media");
const { createNotionIngestionContext, isExpiringMediaUrl } = require("../src/notion-ingestion");

const ROOT = path.resolve(__dirname, "..");
const SIGNED_URL =
  "https://prod-files-secure.s3.us-west-2.amazonaws.com/ws/file/image.png?X-Amz-Expires=3600&X-Amz-Signature=abc";
const PNG_BYTES = Buffer.from("89504e470d0a1a0a0000000d49484452", "hex");
const EXPIRED_IMAGE_BLOCKS = [
  "342d3a21-bb2d-8070-a6de-d48ee9bfe45b",
  "35617c95-99fd-8027-910e-d331f53c777d",
  "35417c95-99fd-809e-8ba4-cc2b887aef0c",
  "3b717c95-99fd-80a7-ac4b-c83a8bc9b455",
  "3b7d3a21-bb2d-8052-9492-d19a0a4dea6f",
  "3b7d3a21-bb2d-8009-a921-d5ae92bdca4e",
  "3b7d3a21-bb2d-80ca-aa9e-c3ca6928c7c2",
];

function note(overrides = {}) {
  return {
    id: "0123456789abcdef0123456789abcdef",
    route: "/topics/demo/",
    status: "Working note",
    contentType: "Topic overview",
    reviewedAt: null,
    knownGaps: [],
    related: [],
    ...overrides,
  };
}

function text(content) {
  return {
    type: "text",
    content,
    annotations: { bold: false, italic: false, strikethrough: false, underline: false, code: false, color: "default" },
    href: null,
  };
}

// ---------------------------------------------------------------------------
// Publication sidecar validation and join
// ---------------------------------------------------------------------------

test("publication sidecar rejects duplicate ids even when dash formatting differs", () => {
  assert.throws(
    () =>
      validatePublicationSidecar({
        notes: [
          note({ id: "01234567-89ab-cdef-0123-456789abcdef" }),
          note({ id: "0123456789ABCDEF0123456789ABCDEF", route: "/topics/demo/other/" }),
        ],
      }),
    /Duplicate publication entry/,
  );
});

test("publication sidecar enforces the status contract", () => {
  assert.throws(() => validatePublicationSidecar({ notes: [note({ status: "Draft" })] }), /status must be one of/);
  assert.throws(
    () => validatePublicationSidecar({ notes: [note({ status: "Reviewed note" })] }),
    /Reviewed note and needs reviewedAt/,
  );
  assert.throws(
    () => validatePublicationSidecar({ notes: [note({ reviewedAt: "2026-09-30" })] }),
    /Working note and must not carry reviewedAt/,
  );
  assert.throws(
    () => validatePublicationSidecar({ notes: [note({ status: "Archived" })] }),
    /Archived and needs archiveReason/,
  );
  assert.throws(
    () => validatePublicationSidecar({ notes: [note({ status: "Reviewed note", reviewedAt: "2026-02-30" })] }),
    /valid calendar date/,
  );
  assert.throws(
    () => validatePublicationSidecar({ notes: [note({ related: [{ href: "/topics/demo/x/", reason: "" }] })] }),
    /reason is required/,
  );
  assert.throws(() => validatePublicationSidecar({ notes: [note({ contentType: "Essay" })] }), /contentType/);

  const reviewed = validatePublicationSidecar({
    notes: [note({ status: "Reviewed note", reviewedAt: "2026-09-30" })],
  });
  assert.equal(reviewed.get("0123456789abcdef0123456789abcdef").statusSlug, "reviewed");
});

test("publication join fails on missing, unknown, and moved note ids", () => {
  const records = [
    { urlPath: "/topics/demo/", noteId: "0123456789abcdef0123456789abcdef", title: "Demo" },
    { urlPath: "/topics/demo/child/", noteId: "11111111-2222-3333-4444-555555555555", title: "Child" },
  ];

  const onlyRoot = validatePublicationSidecar({ notes: [note()] });
  assert.throws(() => joinPublication({ pageRecords: records, sidecar: onlyRoot }), /missing publication entries for: \/topics\/demo\/child\//);

  const withUnknown = validatePublicationSidecar({
    notes: [
      note(),
      note({ id: "11111111222233334444555555555555", route: "/topics/demo/child/", contentType: "Explainer" }),
      note({ id: "99999999999999999999999999999999", route: "/topics/demo/gone/", contentType: "Explainer" }),
    ],
  });
  assert.throws(() => joinPublication({ pageRecords: records, sidecar: withUnknown }), /no matching note: 9{32}/);

  const moved = validatePublicationSidecar({
    notes: [note(), note({ id: "11111111222233334444555555555555", route: "/topics/demo/old-name/", contentType: "Explainer" })],
  });
  assert.throws(() => joinPublication({ pageRecords: records, sidecar: moved }), /routes out of date/);

  const complete = validatePublicationSidecar({
    notes: [
      note({ related: [{ href: "/topics/demo/child/", reason: "Worked example of the overview." }] }),
      note({ id: "11111111222233334444555555555555", route: "/topics/demo/child/", contentType: "Explainer" }),
    ],
  });
  const joined = joinPublication({ pageRecords: records, sidecar: complete });
  assert.deepEqual(joined.map((record) => record.publication.status), ["Working note", "Working note"]);
});

// ---------------------------------------------------------------------------
// Content corrections
// ---------------------------------------------------------------------------

function correctionFixture(match = "Every line ends with a semicolon") {
  return validateCorrections({
    entries: [
      {
        id: "demo-fix",
        date: "2026-09-30",
        kind: "Correction",
        topic: "demo",
        noteId: "0123456789abcdef0123456789abcdef",
        summary: "Fixes the claim.",
        edits: [
          { blockId: "AAAA", action: "replace", match, richText: [{ text: "Statements end with " }, { code: ";" }] },
          { blockId: "bbbb", action: "remove", match: "private task" },
        ],
      },
    ],
  });
}

test("corrections replace guarded text, remove residue, and leave the source untouched", () => {
  const source = {
    blocks: [
      { type: "paragraph", blockId: "aaaa", richText: [text("Every line ends with   a semicolon ")] },
      { type: "paragraph", blockId: "bbbb", richText: [text("private task")], children: [{ type: "paragraph", richText: [text("child")] }] },
      { type: "paragraph", blockId: "cccc", richText: [text("keep")] },
    ],
  };
  const snapshot = JSON.stringify(source);
  const corrected = applyCorrectionsToTopic({ topicSlug: "demo", topicDocument: source, corrections: correctionFixture() });

  assert.equal(JSON.stringify(source), snapshot, "normalized source must not be mutated");
  assert.deepEqual(corrected.blocks.map((block) => block.blockId), ["aaaa", "cccc"]);
  assert.equal(corrected.blocks[0].richText[1].content, ";");
  assert.equal(corrected.blocks[0].richText[1].annotations.code, true);
});

test("corrections fail loudly when the guarded source text changed or the block vanished", () => {
  const source = {
    blocks: [
      { type: "paragraph", blockId: "aaaa", richText: [text("Already fixed upstream")] },
      { type: "paragraph", blockId: "bbbb", richText: [text("private task")] },
    ],
  };
  assert.throws(
    () => applyCorrectionsToTopic({ topicSlug: "demo", topicDocument: source, corrections: correctionFixture() }),
    /expected block aaaa .* Update or retire the correction/,
  );
  assert.throws(
    () =>
      applyCorrectionsToTopic({
        topicSlug: "demo",
        topicDocument: { blocks: [{ type: "paragraph", blockId: "aaaa", richText: [text("Every line ends with a semicolon")] }] },
        corrections: correctionFixture(),
      }),
    /missing from topic "demo": demo-fix:bbbb/,
  );
  assert.throws(
    () => validateCorrections({ entries: [{ ...correctionFixture()[0], edits: [], id: "x" }] }),
    /edits must be a non-empty array/,
  );
});

// ---------------------------------------------------------------------------
// Media persistence
// ---------------------------------------------------------------------------

test("signed Notion/S3 URLs are recognised as expiring; stable paths are not", () => {
  assert.equal(isExpiringMediaUrl(SIGNED_URL), true);
  assert.equal(isExpiringMediaUrl("/assets/notes-media/c/x.png"), false);
  assert.equal(isExpiringMediaUrl("https://example.com/diagram.png"), false);
});

test("ingestion persists Notion images locally using a fresh block URL and validates bytes", async () => {
  const mediaDir = await fs.mkdtemp(path.join(os.tmpdir(), "notes-media-"));
  try {
    const requested = [];
    const fetchImpl = async (url) => {
      requested.push(String(url));
      if (String(url).startsWith("https://api.notion.com/v1/blocks/")) {
        return { ok: true, json: async () => ({ type: "image", image: { type: "file", file: { url: "https://fresh.example/img.png" } } }) };
      }
      if (url === "https://fresh.example/img.png") {
        return { ok: true, status: 200, arrayBuffer: async () => PNG_BYTES };
      }
      return { ok: false, status: 403 };
    };
    const context = createNotionIngestionContext({ fetchImpl });
    const topicDocument = {
      title: "Demo",
      blocks: [
        { type: "asset", kind: "image", blockId: "3b7d3a21-bb2d-8052-9492-d19a0a4dea6f", url: SIGNED_URL, caption: [text("Pointer box")] },
        { type: "asset", kind: "image", blockId: "11111111-2222-3333-4444-555555555555", url: "https://example.com/external.png", caption: [] },
      ],
    };

    const persisted = await context.persistTopicMedia({ topicDocument, topicSlug: "c", mediaDir, notionToken: "test-token" });

    assert.equal(persisted.length, 1);
    assert.equal(topicDocument.blocks[0].url, "/assets/notes-media/c/3b7d3a21-bb2d-8052-9492-d19a0a4dea6f.png");
    assert.deepEqual(topicDocument.blocks[0].caption, [text("Pointer box")], "caption is preserved");
    assert.equal(topicDocument.blocks[1].url, "https://example.com/external.png", "non-expiring URLs are left alone");
    assert.deepEqual(await fs.readFile(path.join(mediaDir, "c", "3b7d3a21-bb2d-8052-9492-d19a0a4dea6f.png")), PNG_BYTES);
    assert.ok(!requested.includes(SIGNED_URL), "the stale signed URL is never fetched when a token is available");

    const htmlDocument = {
      title: "Demo",
      blocks: [{ type: "asset", kind: "image", blockId: "3b7d3a21-bb2d-8052-9492-d19a0a4dea6f", url: SIGNED_URL, caption: [] }],
    };
    const htmlFetch = async (url) =>
      String(url).includes("api.notion.com")
        ? { ok: true, json: async () => ({ image: { file: { url: "https://fresh.example/page.html" } } }) }
        : { ok: true, status: 200, arrayBuffer: async () => Buffer.from("<html>expired</html>") };
    await assert.rejects(
      () =>
        createNotionIngestionContext({ fetchImpl: htmlFetch }).persistTopicMedia({
          topicDocument: htmlDocument,
          topicSlug: "c",
          mediaDir,
          notionToken: "test-token",
        }),
      /not a supported raster image/,
    );
    assert.equal(htmlDocument.blocks[0].url, SIGNED_URL, "failed downloads do not rewrite the URL");
  } finally {
    await fs.rm(mediaDir, { recursive: true, force: true });
  }
});

test("build-time media join refuses to publish an expiring image URL", () => {
  assert.throws(
    () =>
      applyMediaToTopic({
        topicSlug: "demo",
        topicDocument: { blocks: [{ type: "asset", kind: "image", blockId: "x", url: SIGNED_URL, caption: [] }] },
        images: new Map(),
        usedIds: new Set(),
      }),
    /still references expiring Notion media URLs/,
  );
});

test("checked-in media manifest covers all seven expired images with files and alt text", async () => {
  const mediaDir = path.join(ROOT, "content", "media");
  const manifest = JSON.parse(await fs.readFile(path.join(mediaDir, "media-manifest.json"), "utf8"));
  const images = validateMediaManifest(manifest, { mediaDir });
  for (const blockId of EXPIRED_IMAGE_BLOCKS) {
    const entry = images.get(blockId);
    assert.ok(entry, `media manifest entry for ${blockId}`);
    assert.ok(entry.alt.length >= 40, `useful alt text for ${blockId}`);
    const stat = await fs.stat(entry.filePath);
    assert.ok(stat.size > 500, `non-trivial media file for ${blockId}`);
  }
});

// ---------------------------------------------------------------------------
// Full build of the real archive
// ---------------------------------------------------------------------------

let realBuild;
async function buildRealSite() {
  if (!realBuild) {
    realBuild = (async () => {
      const outRoot = await fs.mkdtemp(path.join(os.tmpdir(), "notes-trust-build-"));
      const outDir = path.join(outRoot, "dist");
      await buildPagesSite({
        manifestPath: path.join(ROOT, "content", "topic-manifest.json"),
        outputDir: outDir,
        siteTitle: "Praneeth's CS Field Notes",
        siteUrl: "https://example.test",
        publicationPath: path.join(ROOT, "content", "publication", "notes.json"),
        correctionsPath: path.join(ROOT, "content", "publication", "corrections.json"),
        mediaDir: path.join(ROOT, "content", "media"),
      });
      return { outRoot, outDir };
    })();
  }
  return realBuild;
}

test.after(async () => {
  if (realBuild) {
    const { outRoot } = await realBuild;
    await fs.rm(outRoot, { recursive: true, force: true });
  }
});

async function readPage(outDir, route) {
  return fs.readFile(path.join(outDir, ...route.split("/").filter(Boolean), "index.html"), "utf8");
}

test("real build: every note route and search result carries an explicit status; none is Reviewed without a date", async () => {
  const { outDir } = await buildRealSite();
  const sidecar = JSON.parse(await fs.readFile(path.join(ROOT, "content", "publication", "notes.json"), "utf8"));
  const searchIndex = JSON.parse(await fs.readFile(path.join(outDir, "search-index.json"), "utf8"));
  const topicEntries = searchIndex.filter((entry) => entry.urlPath.startsWith("/topics/"));

  assert.equal(sidecar.notes.length, 125);
  assert.equal(topicEntries.length, sidecar.notes.length);
  for (const entry of topicEntries) {
    assert.ok(["Working note", "Reviewed note", "Archived"].includes(entry.status), `status for ${entry.urlPath}`);
    if (entry.status === "Reviewed note") {
      assert.match(entry.reviewedAt ?? "", /^\d{4}-\d{2}-\d{2}$/u);
    }
  }
  for (const noteEntry of sidecar.notes) {
    const html = await readPage(outDir, noteEntry.route);
    assert.ok(html.includes('aria-label="Publication status"'), `status block on ${noteEntry.route}`);
    assert.ok(html.includes(`>${noteEntry.status}<`), `visible status text on ${noteEntry.route}`);
  }
});

test("real build: status shows on topic listings, the notes search payload, and curated reading paths", async () => {
  const { outDir } = await buildRealSite();
  const algorithms = await readPage(outDir, "/topics/algorithms/");
  const notes = await readPage(outDir, "/notes/");

  assert.match(
    algorithms,
    /class="note-child-page-link" href="\/topics\/algorithms\/a-search\/">A\* Search<\/a><span class="note-publication"><span class="note-status note-status-working">Working note<\/span><span class="note-type">Stub<\/span>/u,
  );
  assert.ok(algorithms.includes('<a class="topic-pillar-link" href="/topics/algorithms/dijkstra/">Dijkstra</a><span class="note-publication"><span class="note-status note-status-working">Working note</span>'));
  // Search results render status from the lazily loaded index.
  assert.ok(notes.includes("function statusBadge(entry)"));
  const searchIndex = JSON.parse(await fs.readFile(path.join(outDir, "search-index.json"), "utf8"));
  assert.equal(searchIndex.find((entry) => entry.urlPath === "/topics/algorithms/dijkstra/").status, "Working note");
  assert.ok(notes.includes('<a href="/topics/algorithms/dijkstra/">Dijkstra</a><span class="note-publication"><span class="note-status note-status-working">Working note</span>'));
  const startHere = await readPage(outDir, "/start-here/");
  assert.ok(startHere.includes('<a href="/topics/algorithms/binary-search/">Binary Search</a><span class="note-publication"><span class="note-status note-status-working">Working note</span>'));

  const stub = await readPage(outDir, "/topics/algorithms/a-search/");
  assert.ok(stub.includes("No definition, algorithm, or worked example yet."));
  assert.ok(stub.includes('<a href="/topics/algorithms/dijkstra/">Dijkstra</a>'));
});

test("real build: no expiring image URL ships and all seven images resolve to stable local files", async () => {
  const { outDir } = await buildRealSite();
  const pages = [
    "/topics/algorithms/savitchs-algorithm/",
    "/topics/os/more-about-threads/",
    "/topics/os/dual-mode/",
    "/topics/cpp/c-memory-model/",
    "/topics/c/pointers-in-c/",
    "/topics/c/data-structures-in-c/",
  ];
  let imageCount = 0;
  for (const route of pages) {
    const html = await readPage(outDir, route);
    assert.ok(!/amazonaws\.com|X-Amz-/u.test(html), `no signed URL on ${route}`);
    for (const match of html.matchAll(/<img src="(\/assets\/notes-media\/[^"]+)" alt="([^"]*)"/gu)) {
      imageCount += 1;
      assert.ok(match[2].length >= 40, `alt text for ${match[1]}`);
      await fs.access(path.join(outDir, match[1]));
    }
  }
  assert.equal(imageCount, EXPIRED_IMAGE_BLOCKS.length);
  const searchIndex = await fs.readFile(path.join(outDir, "search-index.json"), "utf8");
  assert.ok(!/amazonaws\.com|X-Amz-/u.test(searchIndex));
});

test("real build: corrected teaching claims are published and the originals only appear on Errata", async () => {
  const { outDir } = await buildRealSite();
  const expectations = [
    ["/topics/algorithms/", "It is nesting, not parallel execution, that multiplies", "when loops are in parallel: do multiplication"],
    ["/topics/algorithms/", "Pairwise differences are <em>not</em> invariant in general", "for any fixed pair is unchanged"],
    ["/topics/c/", "Despite the name, it does not turn on every warning", "turn on all warnings"],
    ["/topics/c/syntax-in-c/", "Not every line does", "Every line ends with a semicolon"],
    ["/topics/cpp/c-basics/", "the linker then combines the object files", "the same as Java and C."],
    ["/topics/agent-coding/", "Avoid <code class=\"note-inline-code\">--trust-all-tools</code>", "so I can search them semantically"],
    ["/topics/agent-coding/", "Tool-specific notes for the Kiro CLI", "take this to the next level"],
    ["/topics/os/os-basics/", "public study plan", "delete this page once you are done"],
  ];
  for (const [route, present, absent] of expectations) {
    const html = await readPage(outDir, route);
    assert.ok(html.includes(present), `${route} includes corrected text: ${present}`);
    assert.ok(!html.includes(absent), `${route} no longer includes: ${absent}`);
    assert.ok(html.includes('href="/errata/#'), `${route} links to its errata entry`);
  }
  const agentCoding = await readPage(outDir, "/topics/agent-coding/");
  assert.ok(!/--trust-all-tools\s*&quot;/u.test(agentCoding), "no copy-paste trust-all command remains");

  const errata = await readPage(outDir, "/errata/");
  const corrections = JSON.parse(await fs.readFile(path.join(ROOT, "content", "publication", "corrections.json"), "utf8"));
  assert.ok(!errata.includes("No published corrections yet."));
  for (const entry of corrections.entries) {
    // Wording fixes (typos, broken sentences) are applied silently per the correction policy.
    if (entry.kind === "Wording") {
      assert.ok(!errata.includes(`id="${entry.id}"`), `wording fix ${entry.id} is not listed`);
    } else {
      assert.ok(errata.includes(`id="${entry.id}"`), `errata entry ${entry.id}`);
    }
  }
});

test("a fresh pull that still contains the original claims cannot undo the corrections", async () => {
  // The correction guards match the checked-in normalized text, i.e. exactly what a new
  // Notion pull returns until the source page itself is fixed. Applying them to the raw
  // normalized file proves the build-time correction layer is what fixes the output.
  const corrections = validateCorrections(
    JSON.parse(await fs.readFile(path.join(ROOT, "content", "publication", "corrections.json"), "utf8")),
  );
  const topics = [...new Set(corrections.map((entry) => entry.topic))];
  for (const slug of topics) {
    const raw = JSON.parse(await fs.readFile(path.join(ROOT, "content", "topics", `${slug}.normalized.json`), "utf8"));
    const before = JSON.stringify(raw);
    const corrected = applyCorrectionsToTopic({ topicSlug: slug, topicDocument: raw, corrections });
    assert.notEqual(JSON.stringify(corrected.blocks), before);
    assert.equal(JSON.stringify(raw), before);
  }
});
