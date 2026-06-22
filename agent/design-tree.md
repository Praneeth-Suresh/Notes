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
| GitHub wiki blog integration | Blog content pulled from public GitHub wiki via `scripts/pull-wiki-blog.js`, rendered to `/blog/` routes using vendored `marked` for GFM markdown, with blog-specific warm accent and serif flair. Static deployment model matches existing topic workflow. | 2026-06-04 | n/a |
| Owned-audience capture foundation | Generate a static `/feed.xml` from topic roots and blog posts, expose RSS discovery links, render subscription panels through `site-styling`, and keep newsletter/analytics providers external through provider-neutral hooks until the maintainer selects them. | 2026-06-19 | n/a |
| Static SEO and sharing metadata | Generate meta descriptions, canonical URLs, Open Graph tags, Twitter summary cards, blog Article schema, and topic Breadcrumb schema through `site-styling` using the Pages build `siteUrl`; keep this metadata deterministic and static. | 2026-06-19 | n/a |
| Topic pillar packaging | Add optional manifest-owned pillar modules for root topic pages, rendered through `site-styling` before Notion-derived note content so SEO and reader-orientation copy can improve without mutating normalized Notion sources. | 2026-06-19 | n/a |
| Start Here guide | Generate a static `/start-here/` guide through the Pages build, using existing topic/search data to route new readers through Algorithms, one proof-backed note, and RSS capture before broader browsing. | 2026-06-19 | n/a |
| Research taste page | Generate a static `/research-taste/` page from checked-in `content/research-taste.json`, and link it from Home, Start Here, and Portfolio as a public source trail for future AI research notes and selected essays. | 2026-06-22 | n/a |
| Static discovery files and footer | Generate `/sitemap.xml` and `/robots.txt` from Pages build route records, and render a shared footer with RSS, sitemap, and key internal links across all generated HTML pages. | 2026-06-19 | n/a |
| Flagship AI research essay | Publish the current flagship essay as a static AI research blog post with explicit manifest metadata, social preview text, paper-backed sections, source links, FAQ schema, and entry links from Home, Start Here, Subscribe, Errata, and Research Taste. | 2026-06-22 | n/a |
| Public errata page | Generate a static `/errata/` correction-policy page, include it in sitemap/footer navigation, and link flagship posts to it for visible correction handling. | 2026-06-19 | n/a |
| Provider-neutral subscribe destination | Generate a static `/subscribe/` page as the primary newsletter CTA destination while email provider selection is pending; keep direct RSS links as the working owned-audience fallback. | 2026-06-19 | n/a |
| Static social preview image | Copy a deterministic theorem-style SVG preview into `/assets/social/` and emit absolute `og:image` and `twitter:image` metadata for generated pages, with blog Article schema using the same asset. | 2026-06-19 | n/a |
| Archived NP-completeness artifact | Keep the small static LaTeX reduction-proof template available from the archived NP-completeness essay while the current flagship moves to AI research. | 2026-06-22 | n/a |
| Flagship FAQ packaging | Allow blog manifest posts to carry optional FAQ entries and render matching FAQPage structured data when the visible essay includes an FAQ section. | 2026-06-19 | n/a |
| Homepage exploration structure | Keep the root page focused on the site promise, concise orientation, and high-scent exploration links; avoid internal implementation metrics on the homepage. | 2026-06-22 | n/a |
| Credibility hub route foundation | Generate first-class static `/projects/`, `/contact/`, and `/collaborate/` routes, include them in sitemap/footer discovery, and keep the implementation provider-neutral until project/contact systems are selected. | 2026-06-23 | n/a |
| Homepage credibility bands | Keep the homepage as the primary hub by surfacing selected projects, selected technical writing, current asks, and subscription before the topic archive. | 2026-06-23 | n/a |
| Structured project proof assets | Use checked-in `content/projects.json` as the static source for `/projects/` and `/projects/<slug>/` case-study pages with problem, method, result, code, write-up, status, and tags. | 2026-06-23 | n/a |
| About page credibility stack | Present mission-owned credentials, research interests, current focus, and leadership roles directly on `/about/` so credibility can be inspected without leaving the site. | 2026-06-23 | n/a |
| Contact CTA surface | Use `mailto:praneeth.suresh.s@gmail.com`, GitHub, and LinkedIn as the contact surface, and omit Calendly until availability can be reliably honored. | 2026-06-23 | n/a |
| Blog discovery and sharing | Blog manifest posts can define static tags; `/blog/` renders a client-side tag/search index, and post pages expose visible tags plus a copy-link share action. | 2026-06-23 | n/a |

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
| site-styling-keyboard-nav-007 | `site-styling` | done | Make visible hotkey labels navigate home, portfolio, notes/search, and numbered topic entries. | Completed generated-output tests, full gate, and Playwright shortcut verification. |
| notion-ingestion-labels-008 | `notion-ingestion` | done | Normalize configured Notion database select/multi-select labels and render them on generated page links/search entries. | Completed manifest config, adapter extraction, normalized rendering/search, docs, deterministic tests, and topic browser smoke. |

## UX Changes For Review

- Home page visual metaphor changed from a quiet library/shelf mark to a Stripe.dev-inspired developer hub with bracket labels, large sans-serif title, compact actions, and generated line-work motion.
- Topic discovery changed from soft cards in a panel to a bordered feed grid with numbered topic entries and a `/ Feed` section label.
- Header and topic navigation now use compact mono labels with bracketed hotkey-style prefixes for faster scanning; labels map to real keyboard shortcuts outside editable controls.
- Topic pages use a narrower technical reading panel, stronger rectangular borders, and mono treatment for child-page/database affordances while preserving the same Notion block structure.
- Home page navigation will include a portfolio entry point to a separate `/about/` page.
- The personal page will present the maintainer as a software engineer and AI developer/researcher through a distinct portfolio layout using the same typography, borders, color tokens, and CSS-only generated visual language.
- The home page, topic pages, blog index, and blog posts now include a compact subscription panel that points readers to the generated RSS feed while the email newsletter provider remains an external maintainer choice.
- The header now includes an RSS link, and generated pages expose provider-neutral analytics hooks for page views, RSS clicks, newsletter CTA clicks, and outbound GitHub/LinkedIn profile clicks.
- The home hero now leads with the site-level promise, "Theoretical CS: No Handwaving Allowed", explains that the site collects notes, essays, research reading, and projects, and routes visitors into exploration links before the topic feed.
- Generated pages now include static SEO and sharing metadata: descriptions, canonical URLs, Open Graph tags, Twitter summary cards, Article schema on blog posts, and Breadcrumb schema on topic pages.
- The Algorithms root topic now acts as the first SEO pillar, with search-intent description copy, a "Start here" module, and a table-of-contents reading path that links into existing generated Algorithms subpages.
- The home page now includes a compact author bio band linking to `/about/`, and the portfolio hero repeats the theoretical-CS positioning statement so readers can connect the notes corpus to the maintainer's public work.
- Topic root pages and topic subpages now include a compact top subscription/RSS panel in addition to the existing post-content panel, with distinct static IDs and analytics source values for early-reader and post-reader capture.
- The site now has a generated `/start-here/` guide linked from global navigation and the home page, giving new readers a curated path into the AI research taste page, the current flagship AI essay, and RSS subscription.
- Topic pages now include a post-content "Next reading" link when another generated page exists in the same topic tree, improving internal discovery without modifying Notion-authored note bodies.
- The site now has a generated `/research-taste/` page with AI research topic interests, rationale copy, selected internal essays, and source links, linked from Home, Start Here, and Portfolio to make the author's intellectual taste inspectable on-site.
- The Pages build now emits generated `/sitemap.xml` and `/robots.txt` discovery files, and every generated HTML page includes a shared footer with RSS, sitemap, Start, Research Taste, Notes, Blog, and Portfolio links.
- The blog now has an `AI Research Deep Dives` section with a flagship deep-learning mental-models essay using the "In this essay", research-question, paper-trail, model-and-mechanism, why-it-matters, internal-trail, FAQ, and further-reading structure; Home, Start Here, Subscribe, Errata, and Research Taste link to it.
- The site now has a generated `/errata/` page with a public no-corrections-yet log and correction policy, linked from the footer, sitemap, and flagship essay.
- Primary newsletter CTAs now route to a generated `/subscribe/` destination that states the AI research deep-dive promise, exposes RSS as the live subscription path, and links readers back to Start Here and the flagship essay while the email provider remains external.
- Generated pages now include a static theorem-style social preview image via Open Graph and Twitter image metadata, so shared links have a consistent visual card without runtime preview generation.
- The archived NP-completeness essay still links a static LaTeX reduction-proof template copied to `/artifacts/`, giving serious readers a reusable construction/runtime/correctness scaffold.
- The current AI research flagship essay includes a concise reader FAQ, with matching manifest-owned FAQPage structured data emitted only for posts that define FAQ entries.
- The static site now prepares first-class Projects, Contact, and Collaborate routes so credibility inspection and inbound conversations do not have to route through the About page alone.
- The homepage now includes compact credibility bands for selected projects, best technical writing, current asks, and monthly updates before the full notes/topic archive.
- The Projects route now renders from structured checked-in project data and emits individual static case-study pages for each selected project.
- The About page now exposes education, GPA, leadership roles, current research focus, and opportunity targets from `mission.md`.
- Projects, project pages, About, Contact, and Collaborate now share explicit contact CTAs for research, internships, consulting, and NUS AI Society collaboration, including a visible no-Calendly policy.
- Blog posts now carry visible tags, the blog index includes client-side search/filtering, and individual posts expose a copy-link sharing action.

## Recording Rule (Design Tree vs ADR)

Add or update this file when:

- A decision is still evolving.
- You are comparing options before implementation.
- The choice may still change after one or two slices.

Create an ADR when:

- The decision changes module boundaries, persistence shape, adapter contracts, security model, naming conventions used across contexts, or test strategy.
- Future contributors are likely to revisit the choice without clear repo history.
