"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

const { upsertTopicManifest } = require("../scripts/pull-notion-topic");

async function withTempDir(callback) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "notes-pull-manifest-"));
  try {
    return await callback(root);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
}

test("adds a pulled topic to the topic manifest", async () => {
  await withTempDir(async (root) => {
    const contentDir = path.join(root, "content");
    const manifestPath = path.join(contentDir, "topic-manifest.json");
    const topicPath = path.join(contentDir, "topics", "operating-systems.normalized.json");
    await fs.mkdir(path.dirname(topicPath), { recursive: true });
    await fs.writeFile(manifestPath, "[]\n", "utf8");

    await upsertTopicManifest({
      manifestPath,
      slug: "operating-systems",
      title: "Operating Systems",
      description: "",
      normalizedTopicPath: topicPath,
    });

    const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
    assert.deepEqual(manifest, [
      {
        slug: "operating-systems",
        title: "Operating Systems",
        description: "",
        source: {
          kind: "normalized-file",
          path: "topics/operating-systems.normalized.json",
        },
      },
    ]);
  });
});

test("updates an existing topic manifest entry without duplicating it", async () => {
  await withTempDir(async (root) => {
    const contentDir = path.join(root, "content");
    const manifestPath = path.join(contentDir, "topic-manifest.json");
    const topicPath = path.join(contentDir, "topics", "algorithms.normalized.json");
    await fs.mkdir(path.dirname(topicPath), { recursive: true });
    await fs.writeFile(
      manifestPath,
      `${JSON.stringify(
        [
          {
            slug: "algorithms",
            title: "Old Algorithms",
            description: "Keep this description",
            source: { kind: "normalized-file", path: "topics/old-algorithms.normalized.json" },
          },
        ],
        null,
        2,
      )}\n`,
      "utf8",
    );

    await upsertTopicManifest({
      manifestPath,
      slug: "algorithms",
      title: "Algorithms",
      description: "",
      normalizedTopicPath: topicPath,
    });

    const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
    assert.equal(manifest.length, 1);
    assert.deepEqual(manifest[0], {
      slug: "algorithms",
      title: "Algorithms",
      description: "Keep this description",
      source: {
        kind: "normalized-file",
        path: "topics/algorithms.normalized.json",
      },
    });
  });
});
