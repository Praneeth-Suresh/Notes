#!/usr/bin/env node
"use strict";

// Keeps content/publication/notes.json aligned with the note routes the build generates.
//
// - Adds an entry for every note route that has none, always as "Working note".
// - Never changes an existing entry's status, dates, gaps, or links.
// - Reports entries whose id no longer exists or whose route changed, so the maintainer
//   can decide what to do; pass --fix-routes to update recorded routes in place.
//
// Usage: node scripts/sync-publication-sidecar.js [--manifest path] [--publication path] [--fix-routes]

const fs = require("node:fs/promises");
const path = require("node:path");

const { collectPageRecords } = require("./build-pages");
const { normalizeNoteId } = require("./lib/publication-metadata");
const { applyCorrectionsToTopic, validateCorrections } = require("./lib/content-corrections");

async function listNoteRoutes(manifestPath) {
  const absoluteManifestPath = path.resolve(process.cwd(), manifestPath);
  const manifest = JSON.parse(await fs.readFile(absoluteManifestPath, "utf8"));
  // Routes come from titles after checked-in corrections (renames) are applied.
  const correctionsPath = path.join(path.dirname(absoluteManifestPath), "publication", "corrections.json");
  let corrections = [];
  try {
    corrections = validateCorrections(JSON.parse(await fs.readFile(correctionsPath, "utf8")));
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
  const routes = [];
  for (const entry of manifest) {
    if (entry?.source?.kind !== "normalized-file") {
      throw new Error(`Topic "${entry?.slug}" is not a normalized-file source; pull it first.`);
    }
    const document = JSON.parse(
      await fs.readFile(path.resolve(path.dirname(absoluteManifestPath), entry.source.path), "utf8"),
    );
    const records = collectPageRecords({
      rootDocument: applyCorrectionsToTopic({ topicSlug: entry.slug, topicDocument: document, corrections }),
      topicSlug: entry.slug,
      topicTitle: entry.title ?? document.title,
      topicDescription: entry.description ?? "",
    });
    for (const record of records) {
      routes.push({ id: record.noteId, route: record.urlPath, title: record.title, isRoot: !record.parentTitle });
    }
  }
  return routes;
}

async function main() {
  const argv = process.argv.slice(2);
  let manifestPath = "content/topic-manifest.json";
  let publicationPath = "content/publication/notes.json";
  let fixRoutes = false;
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--manifest") {
      manifestPath = argv[++index];
    } else if (argv[index] === "--publication") {
      publicationPath = argv[++index];
    } else if (argv[index] === "--fix-routes") {
      fixRoutes = true;
    } else {
      throw new Error(`Unknown argument: ${argv[index]}`);
    }
  }

  const absolutePublicationPath = path.resolve(process.cwd(), publicationPath);
  let sidecar = { version: 1, notes: [] };
  try {
    sidecar = JSON.parse(await fs.readFile(absolutePublicationPath, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  const routes = await listNoteRoutes(manifestPath);
  const routeById = new Map(routes.map((item) => [normalizeNoteId(item.id), item]));
  const known = new Set();
  let changed = false;

  for (const note of sidecar.notes) {
    const id = normalizeNoteId(note.id);
    known.add(id);
    const current = routeById.get(id);
    if (!current) {
      console.warn(`stale: ${note.id} (${note.route}) no longer matches a note`);
    } else if (current.route !== note.route) {
      console.warn(`moved: ${note.id} ${note.route} -> ${current.route}`);
      if (fixRoutes) {
        note.route = current.route;
        note.title = current.title;
        changed = true;
      }
    }
  }

  for (const item of routes) {
    if (known.has(normalizeNoteId(item.id))) {
      continue;
    }
    sidecar.notes.push({
      id: item.id,
      route: item.route,
      title: item.title,
      status: "Working note",
      contentType: item.isRoot ? "Topic overview" : "Explainer",
      reviewedAt: null,
      knownGaps: [],
      related: [],
    });
    console.log(`added: ${item.route} as Working note`);
    changed = true;
  }

  if (changed) {
    await fs.mkdir(path.dirname(absolutePublicationPath), { recursive: true });
    await fs.writeFile(absolutePublicationPath, `${JSON.stringify(sidecar, null, 2)}\n`, "utf8");
  }
}

main().catch((error) => {
  console.error(`sync-publication-sidecar failed: ${error.message}`);
  process.exitCode = 1;
});
