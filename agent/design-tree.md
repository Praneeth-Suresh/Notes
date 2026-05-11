# Design Tree

## Current Design Concept

Use three bounded contexts with a Cloudflare Pages composition boundary:

1. `notion-ingestion` retrieves and normalizes topic trees from Notion.
2. `notes-content` owns sanitized note rendering and topic navigation artifacts.
3. `site-styling` owns design tokens, typography, and page shell styling.

The Pages build contract composes these contexts into static deploy artifacts so reliability and scalability are handled at build time, not runtime.
Formatting fidelity is a hard requirement: notion-authored structure, especially LaTeX and code blocks, must be preserved exactly through publish artifacts.
The home page should express a minimalist academic library aesthetic while making topic discovery and navigation the dominant interaction.

## Open Decisions

| Decision | Options | Current Lean | Why |
| --- | --- | --- | --- |
| n/a | n/a | n/a | No open design decisions are currently blocking the first formatting-fidelity slice. |

## Settled Decisions

| Decision | Choice | Date | ADR |
| --- | --- | --- | --- |
| Context split for delivery | Keep `notion-ingestion`, `notes-content`, and `site-styling` as separate contexts with explicit public entry points. | 2026-05-04 | n/a |
| Cloudflare Pages interface direction | Use a static artifact contract for Pages deployment outputs. | 2026-05-04 | n/a |
| Rendering priority | Treat formatting fidelity as first-class: if LaTeX or code block fidelity cannot be preserved, do not publish degraded output. | 2026-05-04 | n/a |
| First delivery slice | Build from `TopicManifest` and emit static Pages artifacts using the three context entry points. | 2026-05-04 | n/a |
| Formatting fidelity architecture | `[B] Community library-based block rendering through the notes-content public entry point; current slice uses a local adapter-compatible renderer until package management is introduced.` | 2026-05-11 | n/a |
| Notion extraction strategy | `[A] Strict Notion API adapter + custom normalizer` | 2026-05-11 | n/a |
| Notion block normalization coverage | `[A] Explicit canonical mapping for all documented Notion API block types` | 2026-05-11 | n/a |
| Notion API retrieval resilience | `[A] Bounded adapter retries for transient failures and 429` | 2026-05-11 | n/a |
| Notion read-error intervention | `[A] Public recovery callback with CLI prompt` | 2026-05-11 | n/a |
| Structured Notion content coverage | `[A] Normalize supported Notion tables, child databases, image assets, and file assets into canonical blocks` | 2026-05-11 | n/a |
| Clean-render guarantee strategy | `[B] Enforce sanitizer allowlist before publish` | 2026-05-11 | n/a |
| Topic onboarding model | `[B] Manifest-driven topic registry` | 2026-05-11 | n/a |
| Search index generation | `[A] Build-time static index` | 2026-05-11 | n/a |
| Notion subpage publishing | `[A] Flatten child pages into static nested routes` | 2026-05-11 | n/a |
| Browser math rendering | `[A] Emit TeX delimiters and load self-hosted MathJax from Pages assets` | 2026-05-11 | n/a |
| Home page topic discovery | `[A] Static-first topic hub with search/filter enhancement` | 2026-05-11 | n/a |

## Pressure Points

- Sanitization rules must preserve technical formatting (especially code blocks and LaTeX) while stripping unsafe markup.
- Topic manifest, navigation tree, and search index must stay consistent as topics grow.
- Static child-page route slugs are derived from Notion child page titles, so duplicate sibling titles need deterministic disambiguation.
- Cross-context imports must remain one-way through public entry points only.

## Recording Rule (Design Tree vs ADR)

Add or update this file when:

- A decision is still evolving.
- You are comparing options before implementation.
- The choice may still change after one or two slices.

Create an ADR when:

- The decision changes module boundaries, persistence shape, adapter contracts, security model, naming conventions used across contexts, or test strategy.
- Future contributors are likely to revisit the choice without clear repo history.
