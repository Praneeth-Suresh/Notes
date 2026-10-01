# ADR 0009: Fingerprinted sitemap dates and checked-in redirects

Status: accepted (2026-09-30)

## Context

The sitemap gave every route the site-wide latest date (audit C9). Renaming duplicate and misspelled notes (audit C11) changes their slugs, and old links must keep working.

## Decision

- `pages-build` fingerprints each route's authoritative content: note blocks after corrections plus publication metadata, post Markdown and manifest entry, project entry, and rendered HTML for gateway pages (with the site origin stripped). `content/publication/route-dates.json` maps route to `{fingerprint, lastModified}`. The build fails if any route is new, changed, or removed without a ledger update; `scripts/update-route-dates.js` records today's date only for routes whose fingerprint changed.
- `content/publication/redirects.json` is emitted as `dist/_redirects` (Cloudflare static-assets format, 301, with and without the trailing slash). Every source must no longer be generated. A destination must be a generated same-origin page pathname with an optional existing fragment, or an allowlisted generated file such as `/feed.xml`. Validation rejects missing routes, missing fragment IDs, self-targets, chains, and cycles. Retired navigation pages point directly to their final content so `/collaborate/` does not chain through `/contact/`.
- The 2026-09-30 route consolidation preserves guided paths and moved content before removing generators: `/start-here/` → `/#notes`, `/contact/` and `/collaborate/` → `/about/#contact`, `/research-taste/` → `/about/#research`, and `/subscribe/` → `/feed.xml`.
- Note renames are `retitle` edits in `corrections.json`, so the Notion source stays untouched and a re-pull cannot silently change a URL.

## Consequences

- A date moves only when that page's content moves. Gateway pages move when their rendered text changes, which includes lists of notes they display.
- Every content change needs `update-route-dates.js` before the build passes; this is deliberate friction.
- Programmatic builds from fixtures without a ledger use each route's own metadata date.
- Fragment redirect targets are part of the compatibility contract: changing `#notes`, `#contact`, or `#research` now fails the build until redirects and migrated anchors are reconciled.
- Redirect destinations must never be another redirect source; internal links use final destinations directly.
