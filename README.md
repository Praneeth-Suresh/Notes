# Computer Science Notes (Cloudflare Pages)

[![Deterministic Checks](https://github.com/Praneeth-Suresh/Notes/actions/workflows/deterministic-checks.yml/badge.svg)](https://github.com/Praneeth-Suresh/Notes/actions/workflows/deterministic-checks.yml)
![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-F38020?logo=cloudflare&logoColor=white)
![Notion API](https://img.shields.io/badge/Notion-API-000000?logo=notion&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)

Static Computer Science notes site built for Cloudflare Pages, with a strict Notion ingestion pipeline that prioritizes formatting fidelity (especially LaTeX and code blocks).

## Repository Architecture

- `src/notion-ingestion`: Notion adapter + strict normalization.
- `src/notes-content`: fidelity-safe notes rendering.
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

## Notion Setup (Required for ingestion)

1. In Notion, create an integration and copy its token.
2. Share each source page with that integration.
3. Copy the page ID from the Notion URL.

Example URL:

```text
https://www.notion.so/workspace/Algorithms-0123456789abcdef0123456789abcdef
```

Page ID:

```text
0123456789abcdef0123456789abcdef
```

## Notion Ingestion Script Usage

Use the Notion ingestion script (you referred to it as injection) to pull a page and store a normalized topic file.

```bash
node scripts/pull-notion-topic.js \
  --page-id 0123456789abcdef0123456789abcdef \
  --slug algorithms \
  --title "Algorithms"
```

Output defaults to:

```text
content/topics/<slug>.normalized.json
```

Override output path:

```bash
node scripts/pull-notion-topic.js \
  --page-id 0123456789abcdef0123456789abcdef \
  --slug algorithms \
  --out content/topics/algorithms.normalized.json
```

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

### 2. Direct Notion source (build-time fetch)

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

If any manifest entry uses `"kind": "notion-page"`, `NOTION_API_TOKEN` must be set during build.

## Build Locally

```bash
node scripts/build-pages.js \
  --manifest content/topic-manifest.json \
  --out dist \
  --site-title "Computer Science Notes"
```

Generated output:

- `dist/index.html`
- `dist/topics/<slug>/index.html`
- `dist/assets/site.css`
- `dist/search-index.json`

Run deterministic checks:

```bash
./scripts/check.sh
```

## Deploy to Cloudflare Pages (Git Integration)

1. Push this repo to GitHub.
2. In Cloudflare Dashboard: **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**.
3. Select this repository.
4. Configure build settings:

| Setting | Value |
| --- | --- |
| Framework preset | None |
| Build command | `node scripts/build-pages.js --manifest content/topic-manifest.json --out dist --site-title "Computer Science Notes"` |
| Build output directory | `dist` |
| Root directory | `/` |

5. Configure environment variables in Cloudflare Pages project:

| Variable | Required | Why |
| --- | --- | --- |
| `NOTION_API_TOKEN` | Required only if any topic source is `notion-page` | Allows build-time read from Notion |
| `NODE_VERSION` | Recommended (`20`) | Keeps build runtime predictable |

6. Save and deploy.

After this, pushes to your production branch (for example `main`) deploy automatically.

## Deploy to Cloudflare Pages (CLI Alternative)

```bash
node scripts/build-pages.js --manifest content/topic-manifest.json --out dist
npx wrangler pages deploy dist --project-name <your-pages-project-name>
```

Use this when you want manual deploys from local output.

## Out-of-the-Box Checklist

1. `NOTION_API_TOKEN` configured locally.
2. Notion pages shared with your integration.
3. `content/topic-manifest.json` updated with your topics.
4. `node scripts/pull-notion-topic.js ...` run for normalized-file topics (or use notion-page entries).
5. `node scripts/build-pages.js ...` produces `dist/`.
6. Cloudflare Pages build settings and variables configured.

## Reliability and Fidelity Guarantees

- Unsupported Notion block types fail fast in strict mode (no silent degradation).
- LaTeX is preserved into render-ready math wrappers.
- Code blocks preserve language metadata, boundaries, and indentation.
- Deterministic checks run in CI via `.github/workflows/deterministic-checks.yml`.

