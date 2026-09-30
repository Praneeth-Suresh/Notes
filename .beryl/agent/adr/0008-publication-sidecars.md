# ADR 0008: Publication, correction, and media sidecars joined at build time

Status: accepted (2026-09-30)

## Context

Normalized topic JSON is overwritten by every Notion pull. The audit required visible publication status, dated corrections, and stable images without editing that ingestion output, and required that a fresh pull could not undo fixes. Some source pages (Algorithms, C, Agentic Coding) are not shared with the ingestion integration, so their original images cannot be re-downloaded.

## Decision

`pages-build` (`scripts/build-pages.js` with helpers in `scripts/lib/`) joins three checked-in sidecars to the normalized documents in memory:

1. `content/publication/notes.json` — publication metadata keyed by stable Notion id (root page id or child `blockId`, compared without dashes). Every generated note route must have exactly one entry whose `route` matches; otherwise the build fails. `scripts/sync-publication-sidecar.js` adds new notes as Working note and never changes existing status.
2. `content/publication/corrections.json` — text-guarded `replace`/`remove` edits keyed by `blockId`, each also an Errata entry. A guard mismatch fails the build.
3. `content/media/media-manifest.json` — stable local image paths and alt text keyed by `blockId`. The build fails if any expiring Notion/S3 URL remains. `notion-ingestion` now downloads images during pulls (`persistTopicMedia`), and `scripts/persist-topic-media.js` repairs checked-in files.

`notes-content` renders `block.alt` and a child-page status badge when present; `site-styling` renders the note provenance block, related links with reasons, and status on listings, reading paths, search results, and Errata.

## Consequences

- Fixes and statuses survive re-ingestion; when the author fixes Notion, the failing guard prompts retiring the override.
- Four images are redrawn replacements (marked by caption and `origin: replacement`) until the integration is granted access to those pages and the originals are re-pulled.
- Programmatic fixture builds that omit sidecars default every note to Working note; the CLI (used by Cloudflare Pages and `check-project.sh`) always requires them.
