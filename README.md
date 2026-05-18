# Computer Science Notes (Cloudflare Pages)

[![Deterministic Checks](https://github.com/Praneeth-Suresh/Notes/actions/workflows/deterministic-checks.yml/badge.svg)](https://github.com/Praneeth-Suresh/Notes/actions/workflows/deterministic-checks.yml)
![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-F38020?logo=cloudflare&logoColor=white)
![Notion API](https://img.shields.io/badge/Notion-API-000000?logo=notion&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)

Static [Computer Science notes site](https://notes.praneeth-suresh-s.workers.dev/) built for Cloudflare Pages, with a strict Notion ingestion pipeline that prioritizes formatting fidelity, LaTeX fidelity, code block fidelity, subpage navigation, and static search.

## Repository Architecture

- `src/notion-ingestion`: Notion adapter + strict normalization, including child pages nested inside Notion databases.
- `src/notes-content`: fidelity-safe notes rendering, including Notion-like formatting and safe asset handling.
- `src/site-styling`: page shell and CSS.
- `scripts/pull-notion-topic.js`: pulls a Notion page into normalized topic JSON.
- `scripts/build-pages.js`: builds static Pages output into `dist/`.
- `content/topic-manifest.json`: manifest for topics and data sources.

## Prerequisites

1. Node.js 20+ (Node 25 also works).
2. A Notion integration token (for pulling from Notion and/or build-time Notion reads).
3. A Cloudflare account (for deployment).

## Local/Virtual Environment Setup

This project reads secrets from environment variables (`process.env`).

1. Create a local env file:

```bash
cat > .env.local <<'EOF'
NOTION_API_TOKEN=your_notion_integration_token
EOF
```

2. Load it in your shell session:

```bash
set -a
source .env.local
set +a
```

3. Verify the token is available:

```bash
echo "${NOTION_API_TOKEN:+NOTION_API_TOKEN is set}"
```

## Notion Setup

1. In Notion, create an integration and copy its token.
2. Share each source page with that integration.
3. Share any nested databases with the same integration if their pages should be published.
4. Copy the page ID from the Notion URL.

The ingestion step recursively reads:

- top-level page blocks
- nested child pages
- pages inside child databases
- children inside those database pages

That is what allows database-backed subpages to become static routes and search entries.

Example URL:

```text
https://www.notion.so/workspace/Algorithms-0123456789abcdef0123456789abcdef
```

Page ID:

```text
0123456789abcdef0123456789abcdef
```

## Load Notes from Notion

Use the ingestion script when you want to add a new topic or refresh the checked-in normalized JSON for an existing topic.

```bash
node scripts/pull-notion-topic.js \
  --page-id 0123456789abcdef0123456789abcdef \
  --slug algorithms \
  --title "Algorithms"
```

This command now does two things:

- writes `content/topics/<slug>.normalized.json`
- adds or updates the matching entry in `content/topic-manifest.json`

By default the normalized topic file is written to:

```text
content/topics/<slug>.normalized.json
```

To make the generated site output include the new topic, rebuild after the pull:

```bash
node scripts/build-pages.js \
  --manifest content/topic-manifest.json \
  --out dist \
  --site-title "Computer Science Notes"
```

For a brand-new topic, the command sequence is:

```bash
node scripts/pull-notion-topic.js \
  --page-id 0123456789abcdef0123456789abcdef \
  --slug operating-systems \
  --title "Operating Systems"

node scripts/build-pages.js \
  --manifest content/topic-manifest.json \
  --out dist \
  --site-title "Computer Science Notes"
```

After that build completes, the topic is rendered at:

```text
dist/topics/<slug>/index.html
```

For the Algorithms page, the command shape is:

```bash
node scripts/pull-notion-topic.js \
  --page-id 2c0d3a21bb2d8031bb05f06833e69bd3 \
  --slug algorithms \
  --title "Algorithms"
```

You can override the output path when needed:

```bash
node scripts/pull-notion-topic.js \
  --page-id 0123456789abcdef0123456789abcdef \
  --slug algorithms \
  --out content/topics/algorithms.normalized.json
```

If a nested Notion read fails, the CLI warns and asks whether to `retry`, `skip`, or `abort`. Choose `abort` when fidelity matters and you do not want to publish a partial topic.

## Topic Manifest Configuration

File: `content/topic-manifest.json`

Each topic entry supports two source kinds:

### 1. Normalized file source

```json
{
  "slug": "algorithms",
  "title": "Algorithms",
  "description": "Recurrences and asymptotics.",
  "source": {
    "kind": "normalized-file",
    "path": "topics/algorithms.normalized.json"
  }
}
```

Use this mode when you want repeatable builds from committed normalized files.

### 2. Direct Notion source

```json
{
  "slug": "operating-systems",
  "title": "Operating Systems",
  "description": "Scheduling, memory, and concurrency.",
  "source": {
    "kind": "notion-page",
    "pageId": "0123456789abcdef0123456789abcdef"
  }
}
```

Use this mode when the build should fetch directly from Notion. If any manifest entry uses `"kind": "notion-page"`, `NOTION_API_TOKEN` must be set during build.

## Build the Site

The build reads `content/topic-manifest.json`, renders all topic pages and subpages, writes a static search index, and copies the self-hosted MathJax asset.

```bash
node scripts/build-pages.js \
  --manifest content/topic-manifest.json \
  --out dist \
  --site-title "Computer Science Notes"
```

Generated output:

- `dist/index.html`
- `dist/topics/<slug>/index.html`
- `dist/topics/<slug>/<subpage>/index.html`
- `dist/assets/site.css`
- `dist/search-index.json`

The build uses a temporary output directory and replaces `dist/` only after rendering succeeds. If rendering fails, the previous output directory is left in place.

## Preview Locally

Build the site, then serve the generated `dist/` directory:

```bash
node scripts/build-pages.js --manifest content/topic-manifest.json --out dist
python3 -m http.server 4173 --directory dist
```

Open:

```text
http://localhost:4173/
```

Useful manual checks:

- Home page search should find root topics and subpages.
- `/topics/algorithms/` should include links for child pages from the Algorithms database.
- Child pages should be available at static routes such as `/topics/algorithms/sorting/`.
- LaTeX and code blocks should render without losing source formatting.

## Verify Changes

Run the deterministic gate before committing:

```bash
./scripts/check.sh
```

If you intentionally changed tests, update the test manifest:

```bash
./scripts/update-test-manifest.sh
./scripts/check.sh
```

## Deploy to Cloudflare Pages (Git Integration)

1. Push this repo to GitHub.
2. In Cloudflare Dashboard: **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**.
3. Select this repository.
4. Configure build settings:

| Setting                | Value                                                                                                                   |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Framework preset       | None                                                                                                                    |
| Build command          | `node scripts/build-pages.js --manifest content/topic-manifest.json --out dist --site-title "Computer Science Notes"` |
| Build output directory | `dist`                                                                                                                |
| Root directory         | `/`                                                                                                                   |

5. Configure environment variables in Cloudflare Pages project:

| Variable             | Required                                             | Why                                |
| -------------------- | ---------------------------------------------------- | ---------------------------------- |
| `NOTION_API_TOKEN` | Required only if any topic source is `notion-page` | Allows build-time read from Notion |
| `NODE_VERSION`     | Recommended (`20`)                                 | Keeps build runtime predictable    |

6. Save and deploy.

After this, pushes to your production branch (for example `main`) deploy automatically.

## Deploy to Cloudflare Pages (CLI Alternative)

```bash
node scripts/build-pages.js --manifest content/topic-manifest.json --out dist
npx wrangler pages deploy dist --project-name <your-pages-project-name>
```

Use this when you want manual deploys from local output.

## Standard Maintainer Workflow

1. Set `NOTION_API_TOKEN` locally.
2. Share the source Notion page and any nested databases with the integration.
3. Pull or refresh normalized topic JSON with `node scripts/pull-notion-topic.js ...`.
4. The pull command writes the normalized topic file and updates `content/topic-manifest.json` for that slug.
5. Build with `node scripts/build-pages.js --manifest content/topic-manifest.json --out dist`.
6. Preview with `python3 -m http.server 4173 --directory dist`.
7. Run `./scripts/check.sh`.
8. Deploy through Cloudflare Pages.

## Reliability and Fidelity Guarantees

- Unsupported Notion block types fail fast in strict mode (no silent degradation).
- LaTeX is preserved into render-ready math wrappers.
- Code blocks preserve language metadata, boundaries, and indentation.
- Child pages, including pages nested inside Notion databases, are flattened into static routes.
- Search covers root topics and generated subpages.
- Safe raster Notion image assets are preserved, while unsafe links and asset URLs are rejected.
- Deterministic checks run in CI via `.github/workflows/deterministic-checks.yml`.
