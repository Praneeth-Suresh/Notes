# Architecture

## Bounded Contexts

| Context | Owns | Does Not Own | Public Entry Point |
| --- | --- | --- | --- |
| `notion-ingestion` | Notion API retrieval, recursive block tree collection, strict normalization to canonical note schema | Rendering, page shell, CSS, route generation | `src/notion-ingestion/index.js` |
| `notes-content` | Canonical note-to-HTML transformation, fidelity-safe escaping, search text extraction | Notion API calls, styling tokens, output filesystem layout | `src/notes-content/index.js` |
| `site-styling` | Page shell composition, typography/layout tokens, topic list presentation | Content normalization, Notion retrieval semantics | `src/site-styling/index.js` |
| `pages-build` | Build orchestration, topic manifest loading, Cloudflare Pages static artifact output | Internal logic of any bounded context | `scripts/build-pages.js` |

## Boundary Rules

1. A context may import only another context's public entry point.
2. Internal files of another context are forbidden imports.
3. External APIs, SDKs, and persistence details must be accessed through adapters.
4. Domain logic must not depend directly on HTTP objects, ORM records, UI state, or vendor client types.

## Public Interface Rule

Each context exposes one explicit public entry point:

- TypeScript: `src/<context>/index.ts`
- Python: `src/<context>/__init__.py`
- Go: exported symbols in `internal/<context>` via deliberate package API

## Forbidden Import Policy

Record concrete forbidden import patterns here once contexts exist:

- `scripts/** -> src/notion-ingestion/internal/**`
- `scripts/** -> src/notes-content/internal/**`
- `scripts/** -> src/site-styling/internal/**`
- `src/notes-content/** -> src/notion-ingestion/internal/**`
- `src/site-styling/** -> src/notion-ingestion/internal/**`

Keep this list small and high-signal. Add rules only after repeated boundary mistakes.
