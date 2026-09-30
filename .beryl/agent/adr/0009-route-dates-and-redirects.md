# ADR 0009: Fingerprinted sitemap dates and checked-in redirects

Status: accepted (2026-09-30)

## Context

The sitemap gave every route the site-wide latest date (audit C9). Renaming duplicate and misspelled notes (audit C11) changes their slugs, and old links must keep working.

## Decision

- `pages-build` fingerprints each route's authoritative content: note blocks after corrections plus publication metadata, post Markdown and manifest entry, project entry, and rendered HTML for gateway pages (with the site origin stripped). `content/publication/route-dates.json` maps route to `{fingerprint, lastModified}`. The build fails if any route is new, changed, or removed without a ledger update; `scripts/update-route-dates.js` records today's date only for routes whose fingerprint changed.
- `content/publication/redirects.json` is emitted as `dist/_redirects` (Cloudflare static-assets format, 301, with and without the trailing slash). Every source must no longer be generated and every destination must be generated.
- Note renames are `retitle` edits in `corrections.json`, so the Notion source stays untouched and a re-pull cannot silently change a URL.

## Consequences

- A date moves only when that page's content moves. Gateway pages move when their rendered text changes, which includes lists of notes they display.
- Every content change needs `update-route-dates.js` before the build passes; this is deliberate friction.
- Programmatic builds from fixtures without a ledger use each route's own metadata date.
