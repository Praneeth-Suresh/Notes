# Design Tree

## Current Design Concept

Use three bounded contexts with a Cloudflare Pages composition boundary:

1. `notion-ingestion` retrieves and normalizes topic trees from Notion.
2. `notes-content` owns sanitized note rendering and topic navigation artifacts.
3. `site-styling` owns design tokens, typography, and page shell styling.

The Pages build contract composes these contexts into static deploy artifacts so reliability and scalability are handled at build time, not runtime.
Formatting fidelity is a hard requirement: notion-authored structure, especially LaTeX and code blocks, must be preserved exactly through publish artifacts.
The home page should express a minimalist technical hub aesthetic, borrowing static-friendly cues from Stripe.dev while making topic discovery and navigation the dominant interaction.

## Open Decisions

| Decision | Options | Current Lean | Why |
| --- | --- | --- | --- |
| Stripe-inspired motion depth | CSS-only generated motifs vs. JS/canvas animation vs. remote asset reproduction | CSS-only generated motifs | Cloudflare Pages static compatibility and reduced-motion support make CSS-only motion the safest first slice. |
| Topic feed density | Card grid vs. compact blog-feed rows | Hybrid feed cards | Preserves the existing topic scan UX while moving visual rhythm closer to Stripe.dev's developer feed. |
| Portfolio source fidelity | Static curated facts from approved profile/repo pages vs. runtime profile fetch vs. user-authenticated scrape | Static curated facts from approved public GitHub pages, with LinkedIn unavailable if auth-walled | Keeps Cloudflare Pages static and avoids inventing inaccessible LinkedIn-only details. |
| Portfolio repository refresh source | Manual local GitHub API refresh vs. Pages Function runtime fetch vs. Cloudflare Worker trigger | Manual local GitHub API refresh | The maintainer wants manual local triggering; Cloudflare Pages builds must consume checked-in static JSON and never call GitHub directly. |
| Notion database label rendering | Render all database properties vs. manifest-configured select/multi-select properties vs. infer labels from page text | Manifest-configured select/multi-select properties | Keeps labels explicit, avoids noisy database metadata, and preserves Notion property intent. |
| Keyboard shortcut scope | Global single-key navigation vs. modifier-based shortcuts vs. no executable shortcuts | Global single-key navigation outside editable controls | Matches visible hotkey labels while protecting search and text input. |

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
| Stripe-inspired styling boundary | Keep Stripe.dev cues inside `site-styling`; do not change `notes-content` block HTML for this slice. | 2026-05-18 | n/a |
| Static asset policy for styling | Use local CSS, system font stacks, and generated decoration; do not add remote fonts or remote animation dependencies. | 2026-05-18 | n/a |
| Personal page placement | Emit a separate `/about/` static page, linked from the home page and header, outside the topic hierarchy. | 2026-05-22 | n/a |
| Portfolio refresh deployment model | Repository data is refreshed by a manual local script into checked-in static JSON, then Cloudflare Pages deploys after a push to `main`; Cloudflare builds do not fetch GitHub. | 2026-05-23 | n/a |
| Topic subtitle source | Topic subtitles remain manifest `description` fields, with developer tooling that updates only `content/topic-manifest.json` descriptions instead of hand-editing generated HTML. | 2026-05-23 | n/a |
| Notion highlight presentation | Notion background-color blocks remain fidelity-marked by class but render with readable translucent red highlights. | 2026-05-23 | n/a |
| Database label configuration boundary | Manifest entries may declare label property names; `notion-ingestion` emits normalized label strings and colors only, never raw Notion property payloads. | 2026-05-23 | n/a |

## Pressure Points

- Sanitization rules must preserve technical formatting (especially code blocks and LaTeX) while stripping unsafe markup.
- Topic manifest, navigation tree, and search index must stay consistent as topics grow.
- Static child-page route slugs are derived from Notion child page titles, so duplicate sibling titles need deterministic disambiguation.
- Cross-context imports must remain one-way through public entry points only.
- Stripe-inspired visual density must not make technical notes harder to read, especially wide tables, code blocks, toggles, child databases, and LaTeX output.
- Generated motion must respect static deployment and should avoid distracting users who prefer reduced motion.
- The personal portfolio must not overclaim beyond public GitHub/LinkedIn source evidence; LinkedIn may remain unavailable behind an auth wall.
- The portfolio layout should feel distinct from topic pages while reusing the same design tokens and static-friendly visual language.
- Local portfolio refresh must not commit secrets or rely on unauthenticated browser scraping; public GitHub API fields are the preferred evidence source and the generated JSON is the Pages build input.
- Keyboard shortcuts must not fire while users type in search fields or other editable controls.
- Database labels must cross the Notion boundary as normalized data, not raw vendor property payloads.

## Active Feature Slices

| Slice ID | Bounded Context | Status | Goal | Next |
| --- | --- | --- | --- | --- |
| site-styling-stripe-static-001 | `site-styling` | done | Restyle the generated static home/topic shell toward Stripe.dev while preserving notes structure and fidelity. | Review UX changes and tune if needed. |
| site-styling-polish-002 | `site-styling` | planned | Review the first slice for refinements after UX review, especially feed density and animation restraint. | Await review of documented UX changes. |
| site-styling-portfolio-003 | `site-styling` | done | Add a separate static personal portfolio page sourced from approved public profile/repository pages and linked from the home page. | Completed `/about/`, home access, narrow generation tests, and Playwright navigation verification. |
| site-styling-portfolio-polish-004 | `site-styling` | planned | Tune portfolio content density and visual hierarchy after first browser review. | Wait for the first slice checks and screenshot/accessibility findings. |
| site-styling-ui-polish-005 | `site-styling` | done | Improve highlight readability, portfolio copy, source-note replacement, and homepage graphic continuity. | Completed generated output checks, Playwright verification, and `Finishing UI Updates` commit checkpoint. |
| site-styling-portfolio-refresh-006 | `site-styling` | done | Add local GitHub repository refresh data and subtitle update tooling while preserving static Pages deployment. | Completed local scripts, static JSON build input, README workflow, deterministic tests, and browser check. |
| site-styling-keyboard-nav-007 | `site-styling` | planned | Make visible hotkey labels navigate home, portfolio, notes/search, and numbered topic entries. | Start after repository/subtitle tooling commit. |
| notion-ingestion-labels-008 | `notion-ingestion` | planned | Normalize configured Notion database select/multi-select labels and render them on generated page links/search entries. | Start after keyboard navigation commit. |

## UX Changes For Review

- Home page visual metaphor changed from a quiet library/shelf mark to a Stripe.dev-inspired developer hub with bracket labels, large sans-serif title, compact actions, and generated line-work motion.
- Topic discovery changed from soft cards in a panel to a bordered feed grid with numbered topic entries and a `/ Feed` section label.
- Header and topic navigation now use compact mono labels with bracketed hotkey-style prefixes for faster scanning; labels map to real keyboard shortcuts outside editable controls.
- Topic pages use a narrower technical reading panel, stronger rectangular borders, and mono treatment for child-page/database affordances while preserving the same Notion block structure.
- Home page navigation will include a portfolio entry point to a separate `/about/` page.
- The personal page will present the maintainer as a software engineer and AI developer/researcher through a distinct portfolio layout using the same typography, borders, color tokens, and CSS-only generated visual language.

## Recording Rule (Design Tree vs ADR)

Add or update this file when:

- A decision is still evolving.
- You are comparing options before implementation.
- The choice may still change after one or two slices.

Create an ADR when:

- The decision changes module boundaries, persistence shape, adapter contracts, security model, naming conventions used across contexts, or test strategy.
- Future contributors are likely to revisit the choice without clear repo history.
