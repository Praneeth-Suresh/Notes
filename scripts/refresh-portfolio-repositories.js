#!/usr/bin/env node
"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");

const DEFAULT_USERNAME = "Praneeth-Suresh";
const DEFAULT_OUT = "content/portfolio-repositories.json";
const DEFAULT_SELECTED_COUNT = 6;

function assertNonEmptyString(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${label} must be a non-empty string.`);
  }

  return value.trim();
}

function parseArgs(argv) {
  const args = {
    username: DEFAULT_USERNAME,
    out: DEFAULT_OUT,
    generatedAt: null,
    selectedCount: DEFAULT_SELECTED_COUNT,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];

    if (item === "--username") {
      args.username = assertNonEmptyString(argv[index + 1], "--username value");
      index += 1;
      continue;
    }

    if (item === "--out") {
      args.out = assertNonEmptyString(argv[index + 1], "--out value");
      index += 1;
      continue;
    }

    if (item === "--generated-at") {
      args.generatedAt = assertNonEmptyString(argv[index + 1], "--generated-at value");
      index += 1;
      continue;
    }

    if (item === "--selected-count") {
      const selectedCount = Number(assertNonEmptyString(argv[index + 1], "--selected-count value"));
      if (!Number.isInteger(selectedCount) || selectedCount < 1) {
        throw new Error("--selected-count must be a positive integer.");
      }
      args.selectedCount = selectedCount;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${item}`);
  }

  return args;
}

async function githubJsonRequest({ fetchImpl, url, githubToken }) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "notes-portfolio-refresh",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (githubToken) {
    headers.Authorization = `Bearer ${githubToken}`;
  }

  const response = await fetchImpl(url, { headers });
  if (!response.ok) {
    const body = typeof response.text === "function" ? await response.text() : "";
    throw new Error(`GitHub request failed (${response.status} ${response.statusText}) for ${url}: ${body}`);
  }

  return response.json();
}

async function listPublicRepositories({ fetchImpl, username, githubToken }) {
  const repos = [];

  for (let page = 1; ; page += 1) {
    const url = `https://api.github.com/users/${encodeURIComponent(username)}/repos?type=owner&sort=updated&per_page=100&page=${page}`;
    const batch = await githubJsonRequest({ fetchImpl, url, githubToken });
    if (!Array.isArray(batch)) {
      throw new Error("GitHub repositories response must be an array.");
    }

    repos.push(...batch);
    if (batch.length < 100) {
      break;
    }
  }

  return repos.filter((repo) => repo && repo.private !== true);
}

function classifyRepository(repo) {
  const text = `${repo.name ?? ""} ${repo.description ?? ""} ${repo.language ?? ""}`.toLowerCase();

  if (/(forecast|sentiment|reinforcement|tensorflow|deep|learning|ml|model|cnn|ct-image|notebook)/u.test(text)) {
    return "AI and ML research";
  }

  if (/(energy|solar|pv|ocf|streamlit|data|sampler|aoc|github\.io|sisthinkers|experiment)/u.test(text)) {
    return "Energy, data, and experiments";
  }

  return "Software and app systems";
}

function kindForRepository(repo) {
  const text = `${repo.name ?? ""} ${repo.description ?? ""}`.toLowerCase();

  if (/(agent|workflow|incident)/u.test(text)) {
    return "Agentic workflow";
  }

  if (/(note|knowledge|static)/u.test(text)) {
    return "Static knowledge system";
  }

  if (/(forecast|time series|sentiment|reinforcement|learning|model|tensorflow|deep)/u.test(text)) {
    return "AI and ML research";
  }

  if (/(app|tool|build|generator)/u.test(text)) {
    return "Applied software tool";
  }

  return "Public repository";
}

function summaryForRepository(repo) {
  if (typeof repo.description === "string" && repo.description.trim() !== "") {
    return repo.description.trim();
  }

  const language =
    typeof repo.language === "string" &&
    repo.language.trim() !== "" &&
    repo.language.trim() !== "Unspecified"
      ? `${repo.language.trim()} `
      : "";
  return `A public ${language}repository in Praneeth Suresh's GitHub portfolio.`;
}

function normalizeRepository(repo) {
  const name = assertNonEmptyString(repo.name, "repository name");
  return {
    name,
    href:
      typeof repo.html_url === "string" && repo.html_url.trim() !== ""
        ? repo.html_url.trim()
        : `https://github.com/${DEFAULT_USERNAME}/${name}`,
    description: typeof repo.description === "string" ? repo.description : "",
    language:
      typeof repo.language === "string" && repo.language.trim() !== ""
        ? repo.language.trim()
        : "Unspecified",
    updatedAt: typeof repo.updated_at === "string" ? repo.updated_at : "",
    stargazersCount: Number.isInteger(repo.stargazers_count) ? repo.stargazers_count : 0,
  };
}

function buildPortfolioData({
  repos,
  username = DEFAULT_USERNAME,
  generatedAt = new Date().toISOString(),
  selectedCount = DEFAULT_SELECTED_COUNT,
}) {
  const normalizedRepos = repos.map((repo) => normalizeRepository(repo));
  const selectedRepos = normalizedRepos.slice(0, selectedCount);
  const groupOrder = [
    "AI and ML research",
    "Software and app systems",
    "Energy, data, and experiments",
  ];
  const groups = new Map(groupOrder.map((label) => [label, []]));

  for (const repo of normalizedRepos) {
    groups.get(classifyRepository(repo)).push({
      name: repo.name,
      href: repo.href,
    });
  }

  return {
    generatedAt,
    source: {
      provider: "github",
      username,
      reposUrl: `https://api.github.com/users/${username}/repos`,
    },
    reviewedRepositoryCount: normalizedRepos.length,
    portfolioProjects: selectedRepos.map((repo) => ({
      name: repo.name,
      href: repo.href,
      kind: kindForRepository(repo),
      language: repo.language,
      summary: summaryForRepository(repo),
    })),
    repositoryGroups: groupOrder.map((label) => ({
      label,
      repos: groups.get(label),
    })),
  };
}

async function writePortfolioData({ filePath, portfolioData }) {
  const absolutePath = path.resolve(process.cwd(), assertNonEmptyString(filePath, "filePath"));
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, `${JSON.stringify(portfolioData, null, 2)}\n`, "utf8");
}

async function refreshPortfolioRepositories({
  username = DEFAULT_USERNAME,
  out = DEFAULT_OUT,
  generatedAt,
  selectedCount = DEFAULT_SELECTED_COUNT,
  fetchImpl = globalThis.fetch,
  githubToken = process.env.GITHUB_TOKEN,
} = {}) {
  if (typeof fetchImpl !== "function") {
    throw new Error("A fetch implementation is required to refresh portfolio repositories.");
  }

  const repos = await listPublicRepositories({
    fetchImpl,
    username: assertNonEmptyString(username, "username"),
    githubToken,
  });
  const portfolioData = buildPortfolioData({
    repos,
    username,
    generatedAt: generatedAt ?? new Date().toISOString(),
    selectedCount,
  });

  await writePortfolioData({ filePath: out, portfolioData });
  return portfolioData;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const portfolioData = await refreshPortfolioRepositories(args);
  console.log(`Wrote portfolio repository data: ${args.out}`);
  console.log(`Reviewed public repositories: ${portfolioData.reviewedRepositoryCount}`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`refresh-portfolio-repositories failed: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = {
  buildPortfolioData,
  parseArgs,
  refreshPortfolioRepositories,
};
