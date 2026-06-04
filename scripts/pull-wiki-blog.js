#!/usr/bin/env node
"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");
const { execSync } = require("node:child_process");
const https = require("node:https");

const WIKI_REPO_URL = "https://github.com/Praneeth-Suresh/Praneeth-Suresh.wiki.git";
const MAIN_REPO_RAW_BASE = "https://raw.githubusercontent.com/Praneeth-Suresh/Praneeth-Suresh/main/";
const DEFAULT_OUT = "content/blog";

function parseArgs(argv) {
  const args = { out: DEFAULT_OUT };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--out") {
      args.out = argv[i + 1];
      i += 1;
    } else {
      throw new Error(`Unknown argument: ${argv[i]}`);
    }
  }
  return args;
}

function downloadFile(url) {
  return new Promise((resolve, reject) => {
    const request = (reqUrl) => {
      https.get(reqUrl, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          request(res.headers.location);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${reqUrl}`));
          return;
        }
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks)));
        res.on("error", reject);
      }).on("error", reject);
    };
    request(url);
  });
}

function parseSidebar(sidebarMd) {
  const lines = sidebarMd.split("\n");
  const sections = [];
  let current = null;

  for (const line of lines) {
    const headerMatch = line.match(/^##\s+\*\*(.+?)\*\*\s*:\s*(.+)/);
    if (headerMatch) {
      current = { title: headerMatch[1], subtitle: headerMatch[2].trim(), posts: [] };
      sections.push(current);
      continue;
    }
    if (!current) continue;
    const linkMatch = line.match(/(?:Chapter\s+(\d+):\s*)?\[(.+?)\]\((.+?)\)/);
    if (linkMatch) {
      const chapter = linkMatch[1] ? Number(linkMatch[1]) : null;
      const title = linkMatch[2];
      const url = linkMatch[3];
      const wikiPageName = decodeURIComponent(url.split("/wiki/").pop() || "");
      const slug = slugify(wikiPageName || title);
      current.posts.push({ slug, title, chapter, wikiPageName });
    }
  }
  return sections;
}

function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/['"!?:,]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractImageUrls(markdown) {
  const urls = [];
  const pattern = /!\[[^\]]*\]\(([^)]+)\)/g;
  let match;
  while ((match = pattern.exec(markdown)) !== null) {
    urls.push(match[1]);
  }
  return urls;
}

function rewriteImageUrls(markdown, imageMap) {
  return markdown.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (full, alt, url) => {
    const local = imageMap.get(url);
    return local ? `![${alt}](${local})` : full;
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const outDir = path.resolve(process.cwd(), args.out);
  const postsDir = path.join(outDir, "posts");
  const imagesDir = path.join(outDir, "images");

  // Clone wiki to temp dir
  const tmpDir = path.join(outDir, ".wiki-tmp");
  await fs.rm(tmpDir, { recursive: true, force: true });
  console.log("Cloning wiki repository...");
  execSync(`git clone --depth 1 ${WIKI_REPO_URL} "${tmpDir}"`, { stdio: "pipe" });

  try {
    // Read sidebar
    const sidebarPath = path.join(tmpDir, "_Sidebar.md");
    const sidebarMd = await fs.readFile(sidebarPath, "utf8");
    const sections = parseSidebar(sidebarMd);

    // Read Home.md
    const homeMd = await fs.readFile(path.join(tmpDir, "Home.md"), "utf8");

    // Collect all markdown files referenced by sidebar
    const allImageUrls = new Set();
    const postFiles = new Map();

    for (const section of sections) {
      for (const post of section.posts) {
        const filename = `${post.wikiPageName.replace(/ /g, "-")}.md`;
        const filePath = path.join(tmpDir, filename);
        try {
          const content = await fs.readFile(filePath, "utf8");
          postFiles.set(post.slug, content);
          for (const url of extractImageUrls(content)) allImageUrls.add(url);
        } catch (err) {
          console.warn(`Warning: could not read ${filename}: ${err.message}`);
          postFiles.set(post.slug, "");
        }
      }
    }

    // Also extract images from Home.md
    for (const url of extractImageUrls(homeMd)) allImageUrls.add(url);

    // Download images
    await fs.mkdir(imagesDir, { recursive: true });
    const imageMap = new Map();
    for (const url of allImageUrls) {
      const rawUrl = url.includes("?raw=true") ? url.replace(/\/blob\//, "/raw/") : url;
      const downloadUrl = rawUrl.replace(
        /https:\/\/github\.com\/([^/]+)\/([^/]+)\/(?:raw|blob)\/([^/]+)\//,
        "https://raw.githubusercontent.com/$1/$2/$3/"
      );
      const filename = path.basename(new URL(downloadUrl).pathname);
      const localPath = `/blog/images/${filename}`;
      imageMap.set(url, localPath);
      try {
        console.log(`Downloading ${filename}...`);
        const data = await downloadFile(downloadUrl);
        await fs.writeFile(path.join(imagesDir, filename), data);
      } catch (err) {
        console.warn(`Warning: failed to download ${url}: ${err.message}`);
      }
    }

    // Write post markdown files with rewritten image URLs
    await fs.mkdir(postsDir, { recursive: true });
    for (const [slug, content] of postFiles) {
      const rewritten = rewriteImageUrls(content, imageMap);
      await fs.writeFile(path.join(postsDir, `${slug}.md`), rewritten, "utf8");
    }

    // Write home.md
    const rewrittenHome = rewriteImageUrls(homeMd, imageMap);
    await fs.writeFile(path.join(postsDir, "home.md"), rewrittenHome, "utf8");

    // Write blog manifest
    const manifest = {
      home: { markdownFile: "posts/home.md" },
      sections: sections.map((s) => ({
        title: s.title,
        subtitle: s.subtitle,
        posts: s.posts.map((p) => ({
          slug: p.slug,
          title: p.title,
          chapter: p.chapter,
          markdownFile: `posts/${p.slug}.md`,
        })),
      })),
    };
    await fs.writeFile(
      path.join(outDir, "blog-manifest.json"),
      JSON.stringify(manifest, null, 2) + "\n",
      "utf8"
    );

    console.log(`Blog manifest written to ${path.join(args.out, "blog-manifest.json")}`);
    console.log(`${postFiles.size} posts and ${imageMap.size} images processed.`);
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exitCode = 1;
});
