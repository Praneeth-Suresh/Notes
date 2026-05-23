"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

const { updateTopicSubtitle } = require("../scripts/update-topic-subtitle");

async function withTempDir(callback) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "notes-topic-subtitle-"));
  try {
    return await callback(root);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
}

async function writeManifest(manifestPath) {
  await fs.mkdir(path.dirname(manifestPath), { recursive: true });
  await fs.writeFile(
    manifestPath,
    `${JSON.stringify(
      [
        {
          slug: "algorithms",
          title: "Algorithms",
          description: "Old subtitle",
          source: { kind: "normalized-file", path: "topics/algorithms.normalized.json" },
        },
        {
          slug: "agent-coding",
          title: "Agentic Coding",
          description: "",
          source: { kind: "normalized-file", path: "topics/agent-coding.normalized.json" },
        },
      ],
      null,
      2,
    )}\n`,
    "utf8",
  );
}

test("updates only the selected topic manifest description", async () => {
  await withTempDir(async (root) => {
    const manifestPath = path.join(root, "content", "topic-manifest.json");
    await writeManifest(manifestPath);

    await updateTopicSubtitle({
      manifestPath,
      slug: "agent-coding",
      subtitle: "Agents, feedback loops, and implementation habits.",
    });

    const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
    assert.equal(manifest[0].description, "Old subtitle");
    assert.equal(
      manifest[1].description,
      "Agents, feedback loops, and implementation habits.",
    );
  });
});

test("allows a subtitle to be cleared intentionally", async () => {
  await withTempDir(async (root) => {
    const manifestPath = path.join(root, "content", "topic-manifest.json");
    await writeManifest(manifestPath);

    await updateTopicSubtitle({
      manifestPath,
      slug: "algorithms",
      subtitle: "   ",
    });

    const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
    assert.equal(manifest[0].description, "");
  });
});

test("fails clearly for an unknown topic slug", async () => {
  await withTempDir(async (root) => {
    const manifestPath = path.join(root, "content", "topic-manifest.json");
    await writeManifest(manifestPath);

    await assert.rejects(
      updateTopicSubtitle({
        manifestPath,
        slug: "operating-systems",
        subtitle: "Scheduling and memory.",
      }),
      /No topic manifest entry found for slug "operating-systems"/u,
    );
  });
});
