"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

const {
  buildPortfolioData,
  parseArgs,
  refreshPortfolioRepositories,
} = require("../scripts/refresh-portfolio-repositories");

async function withTempDir(callback) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "notes-portfolio-repos-"));
  try {
    return await callback(root);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
}

function githubResponse(body) {
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    async json() {
      return body;
    },
  };
}

test("builds static portfolio data from public GitHub repositories", () => {
  const data = buildPortfolioData({
    username: "Praneeth-Suresh",
    generatedAt: "2026-05-23T00:00:00.000Z",
    selectedCount: 2,
    repos: [
      {
        name: "Notes",
        html_url: "https://github.com/Praneeth-Suresh/Notes",
        description: "Static notes site",
        language: "JavaScript",
        updated_at: "2026-05-01T00:00:00Z",
        stargazers_count: 3,
      },
      {
        name: "MysteryLab",
        html_url: "https://github.com/Praneeth-Suresh/MysteryLab",
        description: null,
        language: null,
        updated_at: "2026-05-02T00:00:00Z",
        stargazers_count: 0,
      },
      {
        name: "Sentiment-Analyzer",
        html_url: "https://github.com/Praneeth-Suresh/Sentiment-Analyzer",
        description: "Sentiment model notebook",
        language: "Jupyter Notebook",
        updated_at: "2026-05-03T00:00:00Z",
        stargazers_count: 1,
      },
    ],
  });

  assert.equal(data.reviewedRepositoryCount, 3);
  assert.equal(data.portfolioProjects.length, 2);
  assert.equal(data.portfolioProjects[0].summary, "Static notes site");
  assert.equal(
    data.portfolioProjects[1].summary,
    "A public repository in Praneeth Suresh's GitHub portfolio.",
  );
  assert.ok(
    data.repositoryGroups
      .find((group) => group.label === "AI and ML research")
      .repos.some((repo) => repo.name === "Sentiment-Analyzer"),
  );
});

test("refreshes repository data through the GitHub API into a checked-in JSON shape", async () => {
  await withTempDir(async (root) => {
    const outputPath = path.join(root, "portfolio-repositories.json");
    const urls = [];
    const fetchImpl = async (url) => {
      urls.push(url);
      return githubResponse([
        {
          name: "NewRepo",
          html_url: "https://github.com/Praneeth-Suresh/NewRepo",
          description: "A new public project",
          language: "TypeScript",
          updated_at: "2026-05-20T00:00:00Z",
          stargazers_count: 0,
          private: false,
        },
      ]);
    };

    await refreshPortfolioRepositories({
      username: "Praneeth-Suresh",
      out: outputPath,
      generatedAt: "2026-05-23T00:00:00.000Z",
      fetchImpl,
    });

    const parsed = JSON.parse(await fs.readFile(outputPath, "utf8"));
    assert.equal(urls.length, 1);
    assert.ok(urls[0].includes("/users/Praneeth-Suresh/repos"));
    assert.equal(parsed.generatedAt, "2026-05-23T00:00:00.000Z");
    assert.equal(parsed.reviewedRepositoryCount, 1);
    assert.equal(parsed.portfolioProjects[0].name, "NewRepo");
    assert.equal(parsed.repositoryGroups[1].repos[0].href, "https://github.com/Praneeth-Suresh/NewRepo");
  });
});

test("parses maintainer refresh arguments", () => {
  assert.deepEqual(
    parseArgs([
      "--username",
      "example-user",
      "--out",
      "tmp/repos.json",
      "--generated-at",
      "2026-05-23T00:00:00.000Z",
      "--selected-count",
      "4",
    ]),
    {
      username: "example-user",
      out: "tmp/repos.json",
      generatedAt: "2026-05-23T00:00:00.000Z",
      selectedCount: 4,
    },
  );
});
