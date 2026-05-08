# Design Tree

## Current Design Concept

Use three bounded contexts with a Cloudflare Pages composition boundary:

1. `notion-ingestion` retrieves and normalizes topic trees from Notion.
2. `notes-content` owns sanitized note rendering and topic navigation artifacts.
3. `site-styling` owns design tokens, typography, and page shell styling.

The Pages build contract composes these contexts into static deploy artifacts so reliability and scalability are handled at build time, not runtime.
Formatting fidelity is a hard requirement: notion-authored structure, especially LaTeX and code blocks, must be preserved exactly through publish artifacts.

## Open Decisions

| Decision | Options | Current Lean | Why |
| --- | --- | --- | --- |
| Notion extraction strategy | `[A] Strict Notion API adapter + custom normalizer`, `[B] Existing parser + normalization adapter` | `[A]` | First vertical slice now implements strict normalization with fail-fast behavior for unsupported blocks. |
| Notion block normalization coverage | `[A] Explicit canonical mapping for all documented Notion API block types`, `[B] Best-effort generic object passthrough`, `[C] Only render-supported blocks` | `[A]` | Formatting fidelity requires preserving structure and metadata for documented block types while strict-failing brand-new unknown API types. |
| Notion API retrieval resilience | `[A] Bounded adapter retries for transient failures and 429`, `[B] Single-shot API calls`, `[C] Interactive retry prompt inside adapter` | `[A]` | Keeps transient connectivity/rate-limit recovery behind the Notion API adapter while preserving immediate failures for authorization and access errors. |
| Notion read-error intervention | `[A] Public recovery callback with CLI prompt`, `[B] Adapter-owned terminal prompt`, `[C] Abort-only failures` | `[A]` | Maintainer uploads now warn and ask for retry, skip, or abort while keeping terminal I/O outside the adapter and deterministic tests inside the public ingestion boundary. |
| Structured Notion content coverage | `[A] Normalize supported Notion tables, child databases, image assets, and file assets into canonical blocks`, `[B] Keep strict-mode failures for all non-text blocks`, `[C] Skip unsupported blocks by default` | `[A]` | Preserves more source information without relaxing strict failures for genuinely unknown block types. |
| Clean-render guarantee strategy | `[A] Trust parser output`, `[B] Enforce sanitizer allowlist before publish` | `[B]` | Reliability requires deterministic, sanitized HTML output with fidelity protections for LaTeX and code blocks. |
| Topic onboarding model | `[A] Hardcoded routes`, `[B] Manifest-driven topic registry` | `[B]` | Adding new topics should be metadata-only in most cases. |
| Search index generation | `[A] Build-time static index`, `[B] Runtime remote index` | `[A]` | Keeps Pages static and avoids runtime dependency failures. |

## Settled Decisions

| Decision | Choice | Date | ADR |
| --- | --- | --- | --- |
| Context split for delivery | Keep `notion-ingestion`, `notes-content`, and `site-styling` as separate contexts with explicit public entry points. | 2026-05-04 | n/a |
| Cloudflare Pages interface direction | Use a static artifact contract for Pages deployment outputs. | 2026-05-04 | n/a |
| Rendering priority | Treat formatting fidelity as first-class: if LaTeX or code block fidelity cannot be preserved, do not publish degraded output. | 2026-05-04 | n/a |
| First delivery slice | Build from `TopicManifest` and emit static Pages artifacts using the three context entry points. | 2026-05-04 | n/a |

## Pressure Points

- Sanitization rules must preserve technical formatting (especially code blocks and LaTeX) while stripping unsafe markup.
- Topic manifest, navigation tree, and search index must stay consistent as topics grow.
- Cross-context imports must remain one-way through public entry points only.

## Recording Rule (Design Tree vs ADR)

Add or update this file when:

- A decision is still evolving.
- You are comparing options before implementation.
- The choice may still change after one or two slices.

Create an ADR when:

- The decision changes module boundaries, persistence shape, adapter contracts, security model, naming conventions used across contexts, or test strategy.
- Future contributors are likely to revisit the choice without clear repo history.
