#!/usr/bin/env node
"use strict";

// Refreshes content/publication/route-dates.json, the ledger behind per-route sitemap
// <lastmod> dates. Builds the site into a temporary directory, fingerprints every route's
// authoritative content, and:
//   - keeps the recorded date for routes whose fingerprint is unchanged;
//   - records --date (default: today, UTC) for new or changed routes;
//   - drops routes that no longer exist.
// --bootstrap dates new routes from their own content metadata (topic updatedAt, post
// and project dates, correction and review dates) instead of --date; use it once when
// creating the ledger.
// Usage: node scripts/update-route-dates.js [--date YYYY-MM-DD] [--bootstrap] [--manifest path]

const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

const { buildPagesSite } = require("./build-pages");

async function main() {
  const argv = process.argv.slice(2);
  let date = new Date().toISOString().slice(0, 10);
  let manifestPath = "content/topic-manifest.json";
  let bootstrap = false;
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--date") {
      date = argv[++index];
    } else if (argv[index] === "--bootstrap") {
      bootstrap = true;
    } else if (argv[index] === "--manifest") {
      manifestPath = argv[++index];
    } else {
      throw new Error(`Unknown argument: ${argv[index]}`);
    }
  }
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(date)) {
    throw new Error("--date must use YYYY-MM-DD.");
  }

  const ledgerPath = path.join(path.dirname(path.resolve(manifestPath)), "publication", "route-dates.json");
  let ledger = { version: 1, routes: {} };
  try {
    ledger = JSON.parse(await fs.readFile(ledgerPath, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "route-dates-"));
  try {
    const { routeFingerprints } = await buildPagesSite({
      manifestPath,
      outputDir: path.join(tmp, "dist"),
      siteTitle: "Praneeth's CS Field Notes",
      routeDatesMode: "report",
    });
    const next = {};
    let changed = 0;
    for (const item of routeFingerprints) {
      const previous = ledger.routes[item.urlPath];
      if (previous && previous.fingerprint === item.fingerprint) {
        next[item.urlPath] = previous;
      } else {
        next[item.urlPath] = {
          fingerprint: item.fingerprint,
          lastModified: bootstrap && !previous && item.fallbackDate ? item.fallbackDate : date,
        };
        changed += 1;
      }
    }
    const removed = Object.keys(ledger.routes).filter((route) => !(route in next));
    ledger = {
      version: 1,
      description: "Per-route sitemap dates. A route's date changes only when the fingerprint of its authoritative content changes. Maintained by scripts/update-route-dates.js; the build fails if this file is stale.",
      routes: Object.fromEntries(Object.entries(next).sort(([a], [b]) => a.localeCompare(b))),
    };
    await fs.writeFile(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`, "utf8");
    console.log(`route dates: ${changed} new or changed (dated ${date}), ${removed.length} removed, ${routeFingerprints.length} total`);
  } finally {
    await fs.rm(tmp, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(`update-route-dates failed: ${error.message}`);
  process.exitCode = 1;
});
