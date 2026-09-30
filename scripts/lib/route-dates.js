"use strict";

// pages-build: per-route sitemap dates.
//
// Each sitemap route gets a fingerprint of its authoritative content (note blocks and
// publication metadata, post Markdown, project entry, or rendered gateway HTML). The
// checked-in ledger content/publication/route-dates.json maps route -> {fingerprint,
// lastModified}. The build refuses to publish when a fingerprint no longer matches, so a
// date changes only when that route's content changes. `scripts/update-route-dates.js`
// refreshes the ledger. Builds without a ledger (isolated fixtures) use each route's own
// fallback date.

const crypto = require("node:crypto");

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/u;

function fingerprint(value) {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return crypto.createHash("sha256").update(text).digest("hex").slice(0, 32);
}

function validateRouteDates(data) {
  if (!data || typeof data !== "object" || !data.routes || typeof data.routes !== "object") {
    throw new Error("Route dates ledger must be an object with a routes map.");
  }
  for (const [route, entry] of Object.entries(data.routes)) {
    if (!route.startsWith("/")) {
      throw new Error(`Route dates ledger key ${route} must be a site path.`);
    }
    if (!entry || typeof entry.fingerprint !== "string" || !DATE_PATTERN.test(entry.lastModified ?? "")) {
      throw new Error(`Route dates ledger entry ${route} needs fingerprint and lastModified (YYYY-MM-DD).`);
    }
  }
  return data.routes;
}

function resolveRouteDates({ items, ledger }) {
  if (!ledger) {
    return items.map((item) => ({ urlPath: item.urlPath, lastModified: item.fallbackDate || null }));
  }
  const stale = [];
  const resolved = items.map((item) => {
    const entry = ledger[item.urlPath];
    if (!entry || entry.fingerprint !== item.fingerprint) {
      stale.push(item.urlPath);
      return { urlPath: item.urlPath, lastModified: null };
    }
    return { urlPath: item.urlPath, lastModified: entry.lastModified };
  });
  const known = new Set(items.map((item) => item.urlPath));
  const removed = Object.keys(ledger).filter((route) => !known.has(route));
  if (stale.length > 0 || removed.length > 0) {
    throw new Error(
      `Route dates are out of date (${stale.length} changed or new, ${removed.length} removed): ${[...stale, ...removed].slice(0, 12).join(", ")}${stale.length + removed.length > 12 ? ", …" : ""}. Run node scripts/update-route-dates.js to record today's date for changed routes.`,
    );
  }
  return resolved;
}

module.exports = {
  fingerprint,
  resolveRouteDates,
  validateRouteDates,
};
