# Delivery

This file records completed growth and marketing implementation tasks for the Notes site.

## Agent-Owned Marketing Plan

### Bounded Context

- Site: static Cloudflare Pages technical notes site at `notes.praneeth-suresh-s.workers.dev`.
- Audience: readers who want rigorous, proof-backed theoretical CS and adjacent systems/AI engineering notes.
- Primary conversion goal: durable owned audience via RSS and email subscription.
- Secondary goals: stronger search discovery, better social link previews, clearer authority positioning, and more qualified return readership.
- Agent-owned work: repository changes, generated static pages, feed and metadata generation, analytics hook points, documentation, tests, browser checks, and distribution drafts.
- External work intentionally left to Praneeth: social posting, community replies, newsletter curator relationships, personal brand building, distribution channel judgment, analytics product selection, Google Search Console ownership, newsletter provider ownership, signup endpoint ownership, and all live external submissions or pitches.

### Growth Diagnosis

- Current website job: expose a deep technical notes corpus and portfolio through a fast static site.
- Biggest bottleneck: strong readers can browse, but there is no durable capture path, no RSS/newsletter CTA, and no metadata system that makes shared links look intentional.
- Best audience to prioritize now: serious CS readers, self-taught engineers, students, and AI/systems builders who value intuition plus formal reasoning.
- Most likely wasted effort to avoid: distributing posts on Hacker News, Reddit, Lobsters, or newsletters before the site has capture, metadata, and a clear theoretical CS promise.
- Recommended primary growth lane: conversion foundation first, then discovery and authority packaging.

### Top 3 Bets

#### 1. Capture Every Qualified Reader

- Hypothesis: if RSS and email CTAs are visible on the homepage, blog posts, and high-intent topic pages, spikes from search and communities can become returning readers.
- Why this matters now: the existing site already has enough deep material to earn serious readers, but it currently lets those readers leave without an owned return path.
- Pages or assets affected: home page, blog index, blog posts, topic pages, site navigation, generated feed files.
- Agent-owned work:
  - Add RSS or Atom generation to the static build.
  - Add visible RSS links in the header, footer-like conversion blocks, blog index, and post endings.
  - Add provider-agnostic newsletter CTA surfaces that can be wired to the chosen provider without committing secrets.
  - Add a post-conversion destination or clear inline success fallback once a provider is chosen.
- Expected impact: more return visits from the same traffic, less wasted referral traffic, and a clearer reason for readers to subscribe before the first distribution attempt.
- Effort estimate: medium.
- Dependency risk: medium; RSS is fully agent-owned, but completed email signup requires Praneeth to choose a provider and provide a public signup endpoint or embed requirements.
- Success metric: RSS clicks, newsletter CTA clicks, completed signups, returning reader percentage.
- Confidence: high.

#### 2. Make the Site Viral-Ready Before Distribution

- Hypothesis: sharper positioning plus complete SEO/social metadata will increase click-through, trust, and share quality when a flagship essay is distributed.
- Why this matters now: Hacker News, Lobsters, Reddit, and newsletter referrals judge links quickly, and weak titles/previews waste the only moment when a post can spike.
- Pages or assets affected: homepage, blog index, blog posts, topic pages, generated HTML head, sitemap or feed references.
- Agent-owned work:
  - Reposition homepage copy around "Theoretical CS, from intuition to proof."
  - Add meta descriptions, canonical URLs, Open Graph tags, Twitter card tags, and share-ready descriptions.
  - Add Article schema for blog posts and Breadcrumb schema for topic/subtopic pages.
  - Add deterministic tests that assert critical pages include canonical metadata and share metadata.
  - Keep all changes static, local, and compatible with Cloudflare Pages.
- Expected impact: better search result snippets, more trustworthy shared cards, clearer first-screen promise, and improved conversion from social/community curiosity into reading.
- Effort estimate: medium.
- Dependency risk: low-medium; core metadata is agent-owned, but Praneeth owns final wording approval, Search Console property verification, and any external analytics account setup.
- Success metric: search CTR, referral click-through from shared links, top landing pages, direct return traffic.
- Confidence: high.

#### 3. Package Algorithms as the First Authority Pillar

- Hypothesis: Algorithms has enough depth to become the first high-authority discovery surface if it gains a clear reader path, better title/description, internal links, and a flagship essay.
- Why this matters now: Algorithms is the clearest match for the theoretical CS positioning and has enough existing subpages to support an authority pillar without waiting for a large new corpus.
- Pages or assets affected: `/topics/algorithms/`, algorithm subpages, homepage "Start reading" path, one flagship blog post.
- Agent-owned work:
  - Update the Algorithms manifest description to match search intent.
  - Add template-supported "Start here" and "next reading" surfaces without degrading Notion formatting fidelity.
  - Link Algorithms from the homepage as the primary starting point.
  - Draft one flagship essay from existing Algorithms material, likely on invariants, reductions, amortized analysis, or NP-completeness.
  - Publish the essay only after Praneeth approves final topic, voice, and whether it belongs in the blog or topic-note style.
  - Add citations, proof-oriented structure, and post-end capture.
- Expected impact: a stronger landing page for search and community traffic, clearer internal navigation, and one linkable asset with a higher chance of serious discussion.
- Effort estimate: high.
- Dependency risk: medium; pillar scaffolding is agent-owned, but final essay publication depends on Praneeth's editorial approval and source preference.
- Success metric: impressions and clicks for Algorithms queries, internal clicks to subpages, read depth, conversions from Algorithms pages.
- Confidence: medium-high.

### 30-Day Execution Plan

#### Week 1: Foundation and Measurement

- Add static RSS or Atom feed generation.
- Add feed discovery links in generated HTML.
- Add provider-agnostic newsletter CTA components.
- Add analytics/event hook points for page views, RSS clicks, newsletter clicks, outbound GitHub clicks, and outbound LinkedIn clicks.
- Add basic sitemap/feed documentation for Search Console submission.
- Ask Praneeth for only the external choices that cannot be inferred: analytics provider, newsletter provider/signup endpoint, production canonical domain, and Search Console verification method.

#### Week 2: Core Page Conversion

- Update homepage headline, subhead, proof block, primary CTA, secondary CTA, and RSS CTA.
- Add conversion blocks to blog posts, blog index, topic pages, and high-intent subpages.
- Add internal "Start reading" routing toward Algorithms.
- Verify generated desktop and mobile UI with Playwright MCP.

#### Week 3: SEO and Authority Packaging

- Add canonical URLs, meta descriptions, Open Graph tags, Twitter cards, Article schema, and Breadcrumb schema.
- Improve Algorithms title/description and reader path.
- Add next-reading links where they can be generated safely.
- Add deterministic tests for generated metadata, schema, feed links, and subscription blocks.

#### Week 4: Flagship Content and Distribution Readiness

- Draft one flagship theoretical CS essay from the existing Algorithms corpus and publish only after Praneeth approves final topic and voice.
- Add "Question -> Intuition -> Formalism -> Proof -> Implications -> Further reading" structure.
- Add source/citation section and clear post-end CTA.
- Prepare distribution assets for Praneeth: HN hook, Lobsters note, Reddit discussion framing, and newsletter pitch copy.
- Do not post externally from the agent.

### Recommended Copy

- Homepage headline: "Theoretical CS, from intuition to proof."
- Homepage subhead: "Rigorous notes on algorithms, computation, systems, and AI engineering, written for readers who want the idea, the formal model, and the proof sketch in one place."
- Primary CTA: "Get the monthly deep dive."
- Secondary CTA: "Browse the notes."
- RSS CTA: "Subscribe by RSS."
- Proof block: "A growing static corpus of computer science notes across algorithms, operating systems, AI engineering, agentic coding, and software systems, built for focused reading and preserved Notion fidelity."
- Short bio: "Praneeth Suresh writes rigorous computer science notes that connect intuition, formal models, and proof sketches. His work focuses on algorithms, systems, AI engineering, and the habits needed to reason clearly about complex technical ideas."

### Lean Scorecard

- Traffic by channel: search, direct, Hacker News, Lobsters, Reddit, newsletters, referrals.
- Conversion: RSS clicks, newsletter CTA clicks, newsletter signup completion when provider is connected.
- Search: impressions, clicks, CTR, and high-impression low-CTR queries for priority topics.
- Engagement: top landing pages, internal clicks to related notes, time on page or read-depth equivalent when analytics supports it.
- Authority: external backlinks, newsletter mentions, community saves/comments, returning reader percentage.

### Deferred or Later-Slice Ideas

These are valid recommendations from `Marketing.md`, but they are not in the first 30 days unless the earlier capture and metadata work lands cleanly.

- Research-taste page: publish 10-15 topics with rationale and sources after the Algorithms pillar has a stable reader path.
- Standard proof/formal sections across every post: start with the flagship essay and future posts before retrofitting the whole archive.
- Theorem-style social preview images: defer until metadata basics work; static text previews are the first slice.
- Start Here page: defer unless homepage and Algorithms links are insufficient after browser review.
- Errata page: useful for credibility, but lower leverage than capture and metadata during the first implementation wave.
- Reproducible artifacts: add LaTeX, pseudocode, or diagrams selectively to flagship posts rather than making it a site-wide requirement immediately.
- Cross-posting to Dev.to, Medium, or Substack: founder-owned distribution decision after canonical metadata exists.

### Implementation Guardrails

- Do not weaken Notion formatting, LaTeX, code block, or static deployment guarantees.
- Do not commit newsletter provider secrets or analytics tokens.
- Prefer generated template changes over hand-editing `dist/`.
- Use manifest/config additions when source-owned topic metadata must change.
- Run deterministic checks and Playwright MCP for HTML/CSS-facing work.
- For this session, because Praneeth explicitly requested it, after each task update this file and run a subagent quality review before continuing.

## Completed Task Log

### Task 1: Growth and Marketing Plan

- Status: passed.
- Date: 2026-06-19.
- Skill used: `autonomous-growth`.
- Scope:
  - Read repository routing instructions and the autonomous growth workflow.
  - Reviewed `Growth.md`, `Marketing.md`, `README.md`, `agent/project-brief.md`, `agent/design-tree.md`, `agent/testing-policy.md`, and `agent/agent-rules.md`.
  - Audited generated homepage, Algorithms topic page, blog index, topic manifest, and blog manifest for positioning, CTAs, metadata, feed, and capture gaps.
  - Separated agent-owned repo work from founder-owned external distribution and brand-building work.
- Result:
  - Created this marketing execution plan with diagnosis, top bets, 30-day sequence, copy recommendations, scorecard, and implementation guardrails.
- Checks run:
  - Repository inspection through deterministic file reads and targeted search.
- Checks not run:
  - `./scripts/check.sh`, because this task only created a planning document and did not change generated site behavior.
  - Playwright MCP, because no rendered UI behavior changed in this task.
- Design files or ADR updates:
  - None. This task did not settle a durable architecture or design-system decision beyond the delivery plan.
- Temporary session state:
  - No `agent/session-state.md` was created.
- Review:
  - First subagent review failed the plan for missing decision-framework fields, under-separated external ownership, missing deferrals from `Marketing.md`, and unclear subagent-policy wording.
  - Updated this plan to address those gaps.
  - Second subagent cross-validation passed with no required fixes.

### Task 2: RSS and Capture Foundation

- Status: passed.
- Date: 2026-06-19.
- Skills used: `adding-features`, `testing-vertical-slices`, `grill-me`.
- Scope:
  - Implemented the first Week 1 owned-audience slice from the ratified marketing plan.
  - Kept the work static and provider-neutral so Cloudflare Pages remains free of runtime newsletter or analytics dependencies.
  - Left newsletter provider selection, signup endpoint ownership, Search Console ownership, and external analytics account setup to Praneeth.
- Result:
  - Added deterministic RSS generation in `scripts/build-pages.js`.
  - Added `--site-url` support for absolute feed item URLs, defaulting to `https://notes.praneeth-suresh-s.workers.dev`.
  - Generated `dist/feed.xml` from root topic pages and blog posts.
  - Added RSS discovery links to generated HTML.
  - Added a header RSS link.
  - Added subscription panels to the home page, topic pages, blog index, and blog posts.
  - Added provider-neutral analytics hooks for page views, RSS clicks, newsletter CTA clicks, outbound GitHub clicks, and outbound LinkedIn clicks.
  - Buffered analytics events in `window.notesAnalyticsEvents` and dispatched a `notes-analytics` browser event for future provider wiring.
  - Documented the feed and hook workflow in `README.md`.
  - Recorded the durable capture decision and UX changes in `agent/design-tree.md`.
- Checks run:
  - `node --test tests/pages-build-subpages.test.js`
  - `node --test tests/blog-integration.test.js`
  - `node --test tests/pages-build-subpages.test.js tests/blog-integration.test.js`
  - `./scripts/update-test-manifest.sh`
  - `node scripts/build-pages.js --manifest content/topic-manifest.json --out dist --site-title "Computer Science Notes" --site-url "https://notes.praneeth-suresh-s.workers.dev"`
  - `./scripts/check.sh`
  - Playwright MCP desktop home-page accessibility snapshot confirmed header RSS link and subscription panel.
  - Playwright MCP topic-page snapshot confirmed the topic subscription panel after notes content.
  - Playwright MCP blog-post snapshot confirmed the blog subscription panel after post content.
  - Playwright MCP mobile bounding-box check at 390px confirmed no horizontal overflow in the header, hero actions, topic hub, or subscription panel.
  - Playwright MCP DOM evaluation confirmed `newsletter_cta_click` maps to "Get the monthly deep dive" and `rss_click` maps to "Subscribe by RSS".
- Checks not run:
  - No external RSS validator, because network validation is outside the static local repo checks and the generated XML is covered by deterministic assertions.
  - No live analytics provider check, because no provider has been selected and no external analytics script was added.
- Tests changed:
  - Updated `tests/pages-build-subpages.test.js` for feed generation, feed discovery links, subscription blocks, and analytics hooks.
  - Updated `tests/blog-integration.test.js` for blog feed entries and blog subscription surfaces.
  - Updated `tests/.manifest.sha256` with `./scripts/update-test-manifest.sh`.
- Design files or ADR updates:
  - Updated `agent/design-tree.md`.
  - No ADR created; this stays within the existing static Pages build and `site-styling` shell boundaries.
- Temporary session state:
  - No `agent/session-state.md` was created.
- Review:
  - Subagent cross-validation passed with no required fixes.
  - Optional follow-ups recorded for later slices: real newsletter endpoint wiring, richer RSS dates/excerpts, and stricter feed item count tests.

### Task 3: Homepage Positioning and Proof Block

- Status: passed.
- Date: 2026-06-19.
- Skills used: `adding-features`, `testing-vertical-slices`.
- Scope:
  - Implemented the homepage positioning slice from the marketing plan.
  - Kept the site title and navigation brand as `Computer Science Notes`, while changing the first-viewport homepage promise to the theoretical CS niche.
  - Used generated corpus counts for proof instead of hard-coded page-count claims.
- Result:
  - Replaced the homepage H1 with `Theoretical CS, from intuition to proof.`
  - Replaced the hero subhead with the rigorous notes positioning copy.
  - Made `Get the monthly deep dive` the primary hero CTA, targeting the subscription panel at `#subscribe-home`.
  - Kept browse, portfolio, search, and RSS as secondary hero actions.
  - Added a generated proof strip before the topic feed with top-level topic count, searchable note page count, and fidelity/checking signals.
  - Updated homepage CSS so the longer headline, hero actions, and proof strip fit on desktop and mobile.
  - Rebuilt checked-in `dist/` artifacts.
  - Recorded the homepage UX change in `agent/design-tree.md`.
- Checks run:
  - `node --test tests/pages-build-subpages.test.js` before implementation, confirming the old homepage failed the new positioning assertions.
  - `node --test tests/pages-build-subpages.test.js`
  - `./scripts/update-test-manifest.sh`
  - `node scripts/build-pages.js --manifest content/topic-manifest.json --out dist --site-title "Computer Science Notes" --site-url "https://notes.praneeth-suresh-s.workers.dev"`
  - `./scripts/check.sh`
  - Playwright MCP desktop homepage accessibility snapshot confirmed the new H1, subhead, proof strip, hero CTA, and subscription section.
  - Playwright MCP mobile bounding-box check at 390px confirmed no horizontal overflow in the header, hero, H1, hero actions, proof strip, topic hub, or subscription panel.
  - Playwright MCP click check confirmed the primary hero CTA navigates to `#subscribe-home`.
- Checks not run:
  - No external analytics/newsletter checks, because the CTA still uses the provider-neutral subscription panel and RSS path from Task 2.
- Tests changed:
  - Updated `tests/pages-build-subpages.test.js` to assert the new homepage positioning, CTA target, proof block, and generated count.
  - Updated `tests/.manifest.sha256` with `./scripts/update-test-manifest.sh`.
- Design files or ADR updates:
  - Updated `agent/design-tree.md`.
  - No ADR created; this remains a presentation and generated-output change inside the existing `site-styling` boundary.
- Temporary session state:
  - No `agent/session-state.md` was created.
- Review:
  - Subagent cross-validation passed with no required fixes.
  - Optional follow-ups recorded for later slices: exact `Browse the notes` CTA wording, real newsletter endpoint wiring, and stricter exact-label homepage assertions.

### Task 4: SEO and Social Metadata Foundation

- Status: passed.
- Date: 2026-06-19.
- Skills used: `adding-features`, `testing-vertical-slices`.
- Scope:
  - Implemented the metadata foundation from Week 3 early because it compounds every later distribution and sharing task.
  - Kept metadata static and deterministic through the existing Pages build contract.
  - Covered homepage, topic pages and subpages, portfolio page, blog index, and blog posts.
- Result:
  - Added generated meta descriptions.
  - Added canonical URLs based on the build `--site-url`.
  - Added Open Graph title, description, type, URL, and site name tags.
  - Added Twitter summary card title and description tags.
  - Added BreadcrumbList JSON-LD to topic pages and subpages.
  - Added Article JSON-LD to blog posts with Praneeth Suresh as author and the site as publisher.
  - Passed the normalized `siteUrl` through `scripts/build-pages.js` into `site-styling` renderers.
  - Rebuilt checked-in `dist/` artifacts.
  - Recorded the durable metadata decision in `agent/design-tree.md`.
  - Hardened JSON-LD script escaping after review.
  - Updated `README.md` so `--site-url` documents canonical, Open Graph, structured-data, and RSS URL usage.
- Checks run:
  - `node tests/pages-build-subpages.test.js` before implementation, confirming the old generated pages failed the new metadata assertions.
  - `node tests/blog-integration.test.js` before implementation, confirming the old blog pages failed the new metadata assertions.
  - `node tests/pages-build-subpages.test.js`
  - `node tests/blog-integration.test.js`
  - `./scripts/update-test-manifest.sh`
  - `node scripts/build-pages.js --manifest content/topic-manifest.json --out dist --site-title "Computer Science Notes" --site-url "https://notes.praneeth-suresh-s.workers.dev"`
  - `./scripts/check.sh`
  - `node --test tests/pages-build-subpages.test.js tests/blog-integration.test.js` after review follow-up fixes.
  - `node scripts/build-pages.js --manifest content/topic-manifest.json --out dist --site-title "Computer Science Notes" --site-url "https://notes.praneeth-suresh-s.workers.dev"` after review follow-up fixes.
  - `./scripts/check.sh` after review follow-up fixes.
  - Playwright MCP DOM evaluation on the homepage confirmed description, canonical URL, Open Graph title/URL, and Twitter card.
  - Playwright MCP DOM evaluation on an Algorithms subpage confirmed canonical URL, description, Open Graph type, and BreadcrumbList JSON-LD.
  - Playwright MCP DOM evaluation on a blog post confirmed canonical URL, description, article Open Graph type, Twitter title, and Article JSON-LD.
- Checks not run:
  - No external rich-result validator or social-card scraper, because those require external network services and deployed URLs.
  - No live Cloudflare deployment check.
- Tests changed:
  - Updated `tests/pages-build-subpages.test.js` for homepage metadata, topic canonical tags, and breadcrumb schema.
  - Updated `tests/blog-integration.test.js` for blog index metadata and blog Article schema.
  - Updated `tests/.manifest.sha256` with `./scripts/update-test-manifest.sh`.
- Design files or ADR updates:
  - Updated `agent/design-tree.md`.
  - No ADR created; this remains a static page-shell concern inside existing `pages-build` and `site-styling` boundaries.
- Temporary session state:
  - No `agent/session-state.md` changes were made.
- Review:
  - First subagent cross-validation passed with no required fixes.
  - Addressed two optional quality improvements from review: hardened JSON-LD script escaping and corrected `--site-url` README documentation.
  - Second subagent cross-validation passed with no required fixes after follow-up fixes.
  - Optional follow-ups recorded for later slices: direct mixed-case JSON-LD escaping test and invalid `--site-url` tests.

### Task 5: Algorithms SEO Pillar Foundation

- Status: passed.
- Date: 2026-06-19.
- Skills used: `adding-features`, `testing-vertical-slices`.
- Scope:
  - Started the first topic-pillar slice from `Growth.md`.
  - Kept the Notion-normalized Algorithms source untouched.
  - Added the public reader-orientation layer through manifest data and the existing static page shell.
- Result:
  - Rewrote the Algorithms manifest description to: "Algorithms explained with intuition, formal models, proof sketches, and implementation tradeoffs."
  - Added an optional manifest-owned `pillar` configuration with "Start here" links and a five-part reading path: Foundations, Analysis, Graphs, Dynamic programming, and Complexity.
  - Passed the pillar configuration through `scripts/build-pages.js` and rendered it only on the root topic page through `site-styling`.
  - Added compact responsive CSS for the Algorithms pillar module.
  - Added a small inline-equation overflow containment fix so the Algorithms root page remains clean on mobile after MathJax renders.
  - Rebuilt checked-in `dist/` artifacts, including updated metadata, RSS description text, homepage topic cards, and the Algorithms page.
  - Recorded the topic-pillar packaging decision in `agent/design-tree.md`.
- Checks run:
  - `node --test tests/pages-build-subpages.test.js` before implementation, confirming the old generated pages failed the new pillar assertions.
  - `node tests/pages-build-subpages.test.js` to inspect the feed-description assertion failure after the description changed.
  - `node --test tests/pages-build-subpages.test.js`
  - `./scripts/update-test-manifest.sh`
  - `node scripts/build-pages.js --manifest content/topic-manifest.json --out dist --site-title "Computer Science Notes" --site-url "https://notes.praneeth-suresh-s.workers.dev"`
  - `./scripts/check.sh`
  - Playwright MCP desktop accessibility snapshot confirmed the Algorithms page exposes the new description, "Start here" pillar, reading path, and original note body.
  - Playwright MCP DOM evaluation confirmed the Algorithms canonical URL, metadata description, pillar presence, and first internal pillar links.
  - Playwright MCP mobile evaluation at 390px confirmed the Algorithms root page has no horizontal overflow after the inline-equation containment fix.
  - Playwright MCP child-page evaluation on `/topics/algorithms/dynamic-programming/` confirmed the root pillar does not render on child pages and the child canonical URL remains correct.
- Checks not run:
  - No external Search Console or deployed ranking checks.
  - No full mobile overflow fix for every Algorithms child page; the Dynamic Programming child page still has pre-existing table/code overflow unrelated to the new root pillar module.
- Tests changed:
  - Updated `tests/pages-build-subpages.test.js` to assert manifest-driven pillar rendering, no child-page pillar leakage, updated metadata, and updated RSS description text.
  - Updated `tests/.manifest.sha256` with `./scripts/update-test-manifest.sh`.
- Design files or ADR updates:
  - Updated `agent/design-tree.md`.
  - No ADR created; this remains an optional manifest field and `site-styling` presentation decision inside existing boundaries.
- Temporary session state:
  - No `agent/session-state.md` changes were made.
- Review:
  - Subagent cross-validation passed with no required fixes.

### Task 22: External Growth Handoff

- Status: passed.
- Date: 2026-06-19.
- Skills used: `adding-features`, `testing-vertical-slices`.
- Scope:
  - Completed the final support-agent-controlled handoff for Growth.md and Marketing.md items that require maintainer-owned external systems.
  - Consolidated deployment, account, Search Console, analytics, newsletter, and distribution next steps without performing external posting or account setup.
  - Kept live community judgment, provider choices, Search Console verification, social replies, and personal brand work with Praneeth.
- Result:
  - Added `ExternalHandoff.md` at the repository root.
  - Listed pre-deployment checks and the canonical static build command.
  - Listed account decisions for newsletter provider, analytics provider, Search Console, and distribution channels.
  - Added a first launch sequence covering deployment, live route checks, Search Console submission, one manual distribution lane, and scorecard logging.
  - Added a first distribution target section for the flagship NP-completeness essay.
  - Added "What Not To Claim" guardrails so drafted copy and provider-neutral paths are not mistaken for live email, analytics, Search Console, or distribution results.
  - Added a first weekly review loop tied to `GrowthScorecard.md` and `ProofBacklog.md`.
- Checks run:
  - `test -f ExternalHandoff.md` before implementation, confirming the handoff artifact did not exist yet.
- Checks not run:
  - No live deployment, analytics provider, newsletter provider, Search Console, social platform, or external distribution checks, because those are maintainer-owned.
- Tests changed:
  - No automated tests changed.
  - `tests/.manifest.sha256` was not changed.
- Design files or ADR updates:
  - No design tree or ADR updates; this is an operator-facing external handoff document rather than a site architecture or UI decision.
- Temporary session state:
  - No `agent/session-state.md` changes were made.
- Review:
  - Subagent cross-validation passed with no required fixes.

### Task 19: Flagship Reproducible Proof Artifact

- Status: passed.
- Date: 2026-06-19.
- Skills used: `adding-features`, `grill-me`, `testing-vertical-slices`.
- Scope:
  - Completed the site-controlled part of Marketing.md's reproducible-artifacts recommendation for the first flagship essay.
  - Added one reusable proof artifact without introducing runtime services, external tools, or a broad artifact-management system.
  - Kept external distribution and platform validation separate from the artifact itself.
- Result:
  - Added `content/artifacts/np-completeness-reduction-template.tex`.
  - Updated the Pages build to copy static artifacts to `dist/artifacts/`.
  - Added a "Reusable artifact" section to the flagship NP-completeness essay linking to `/artifacts/np-completeness-reduction-template.tex`.
  - Rebuilt checked-in `dist/` artifacts, including the updated flagship article and `dist/artifacts/np-completeness-reduction-template.tex`.
  - Recorded the flagship reproducible-artifact decision in `agent/design-tree.md`.
- Checks run:
  - `node --test --test-reporter=spec tests/blog-integration.test.js` before implementation, confirming the old build failed the new artifact-link and copied-file assertions.
  - `node --test --test-reporter=spec tests/blog-integration.test.js`
  - `node --check scripts/build-pages.js`
  - `./scripts/check-md.sh`
  - `node scripts/build-pages.js --manifest content/topic-manifest.json --out dist --site-title "Computer Science Notes" --site-url "https://notes.praneeth-suresh-s.workers.dev"`
  - `./scripts/update-test-manifest.sh`
  - `./scripts/check.sh`
  - Playwright MCP navigation to the flagship NP-completeness article confirmed the page title.
  - Playwright MCP DOM and browser-fetch evaluation confirmed the "Reusable artifact" heading, artifact link text, served `.tex` status `200`, `\newcommand{\problemA}` content, forward/reverse correctness sections, subscribe/RSS links, and no horizontal overflow.
- Checks not run:
  - No LaTeX compilation check; the artifact is a lightweight scaffold, not a complete standalone paper.
  - No external distribution or social-platform validation.
- Tests changed:
  - Updated `tests/blog-integration.test.js` to assert the flagship article links the artifact and the Pages build copies the `.tex` file.
  - Updated `tests/.manifest.sha256` with `./scripts/update-test-manifest.sh`.
- Design files or ADR updates:
  - Updated `agent/design-tree.md`.
  - No ADR created; this is a single static artifact inside the existing Pages build boundary.
- Temporary session state:
  - No `agent/session-state.md` changes were made.
- Review:
  - Subagent cross-validation passed with no required fixes.
  - Incorporated optional reviewer hardening: made `\polyreduce` paste-robust with `\ensuremath{\le_p}` and strengthened the integration test to assert both forward and reverse correctness sections.

### Task 20: Flagship FAQ Snippet And Structured Data

- Status: passed.
- Date: 2026-06-19.
- Skills used: `adding-features`, `grill-me`, `testing-vertical-slices`.
- Scope:
  - Completed the site-controlled part of Marketing.md's reusable FAQ-snippet recommendation for the first flagship essay.
  - Added visible answers to common reader/search objections while keeping claims aligned with the essay.
  - Added optional static FAQPage structured data without requiring external search tooling or platform validation.
- Result:
  - Added a "Questions readers usually ask" FAQ section to the flagship NP-completeness essay.
  - Added matching `faq` entries to the flagship post record in `content/blog/blog-manifest.json`.
  - Updated `renderBlogPostPage` to emit FAQPage JSON-LD only when a post defines non-empty FAQ entries.
  - Preserved existing Article schema output for blog posts.
  - Rebuilt checked-in `dist/` artifacts with the visible FAQ and structured data.
  - Recorded the FAQ packaging decision in `agent/design-tree.md`.
- Checks run:
  - `node --test --test-reporter=spec tests/blog-integration.test.js` before implementation, confirming the old build failed the new visible FAQ and FAQPage JSON-LD assertions.
  - `node --test --test-reporter=spec tests/blog-integration.test.js`
  - `node --check src/site-styling/internal/shell.js`
  - `node --check scripts/build-pages.js`
  - `./scripts/check-md.sh`
  - `node scripts/build-pages.js --manifest content/topic-manifest.json --out dist --site-title "Computer Science Notes" --site-url "https://notes.praneeth-suresh-s.workers.dev"`
  - `./scripts/update-test-manifest.sh`
  - `./scripts/check.sh`
  - Playwright MCP desktop navigation to the flagship article confirmed the page title.
  - Playwright MCP desktop DOM evaluation confirmed visible FAQ text, three FAQ schema questions, preserved Article schema, and no horizontal overflow.
  - Playwright MCP mobile DOM evaluation at 390px confirmed the FAQ section remains present with no horizontal overflow.
- Checks not run:
  - No external rich-result, Search Console, or social-platform validation, because those require live deployment and external accounts.
- Tests changed:
  - Updated `tests/blog-integration.test.js` to assert visible FAQ content and FAQPage structured data for the flagship essay.
  - Strengthened `tests/blog-integration.test.js` after review to parse JSON-LD, assert all three FAQ questions and answers, and assert a non-FAQ blog post does not emit FAQPage schema.
  - Updated `tests/.manifest.sha256` with `./scripts/update-test-manifest.sh`.
- Design files or ADR updates:
  - Updated `agent/design-tree.md`.
  - No ADR created; this is an optional manifest field and static blog metadata rendering inside the existing `site-styling` boundary.
- Temporary session state:
  - No `agent/session-state.md` changes were made.
- Review:
  - First subagent cross-validation passed with no required fixes.
  - Incorporated optional reviewer hardening for parsed JSON-LD assertions and FAQPage absence on non-FAQ posts.
  - Repeat subagent cross-validation passed with no required fixes.

### Task 21: Proof Backlog For Sustainable Cadence

- Status: passed.
- Date: 2026-06-19.
- Skills used: `adding-features`, `testing-vertical-slices`.
- Scope:
  - Completed the support-agent-controlled part of Marketing.md's "Maintain a backlog of proofs" sustainability recommendation.
  - Grounded future post candidates in existing site topics and the research-taste page instead of inventing a new content direction.
  - Kept publication decisions, external distribution, and final topic judgment with Praneeth.
- Result:
  - Added `ProofBacklog.md` at the repository root.
  - Added cadence rules tied to the 3-4 week deep-dive rhythm, `PostPublishingChecklist.md`, `GrowthScorecard.md`, and distribution gating.
  - Added status labels for `Ready next`, `Needs source trail`, `Needs artifact`, and `Later`.
  - Added five ready next candidates: dynamic programming, greedy exchange arguments, shortest paths, primality/randomized thinking, and matrix methods.
  - Added source-trail, artifact, and deferred idea sections.
  - Added a selection rule and draft intake template for future proof-backed posts.
- Checks run:
  - `test -f ProofBacklog.md` before implementation, confirming the backlog artifact did not exist yet.
- Checks not run:
  - No external distribution, analytics, newsletter, or Search Console checks.
  - No source-link validation beyond grounding candidates in existing local site paths.
- Tests changed:
  - No automated tests changed.
  - `tests/.manifest.sha256` was not changed.
- Design files or ADR updates:
  - No design tree or ADR updates; this is an operator-facing cadence document rather than a site architecture or UI decision.
- Temporary session state:
  - No `agent/session-state.md` changes were made.
- Review:
  - Subagent cross-validation passed with no required fixes.

### Task 18: Static Social Preview Image Metadata

- Status: passed.
- Date: 2026-06-19.
- Skills used: `adding-features`, `grill-me`, `testing-vertical-slices`, `imagegen` evaluated and intentionally not used because the asset is deterministic SVG/vector output.
- Scope:
  - Completed the site-controlled part of Marketing.md's consistent visual-preview recommendation.
  - Added a deterministic theorem-style preview asset without runtime image generation, remote dependencies, or external posting.
  - Kept platform-specific preview validation and live social sharing external to Praneeth.
- Result:
  - Added `content/social/theoretical-cs-preview.svg`.
  - Updated the Pages build to copy the preview asset to `dist/assets/social/theoretical-cs-preview.svg`.
  - Updated shared head metadata to emit absolute `og:image`, `og:image:type`, image dimensions, image alt text, `twitter:card="summary_large_image"`, `twitter:image`, and Twitter image alt text.
  - Updated blog Article schema to include the same social preview image.
  - Rebuilt checked-in `dist/` artifacts with the new asset and metadata.
  - Recorded the static social-preview decision in `agent/design-tree.md`.
- Checks run:
  - `node --test --test-reporter=spec tests/pages-build-subpages.test.js` before implementation, confirming the old build failed the new preview asset and image-metadata assertions.
  - `node --test --test-reporter=spec tests/blog-integration.test.js` before implementation, confirming the old blog output failed the new article preview image assertions.
  - `node --test --test-reporter=spec tests/pages-build-subpages.test.js`
  - `node --test --test-reporter=spec tests/blog-integration.test.js`
  - `node --check src/site-styling/internal/shell.js`
  - `node --check scripts/build-pages.js`
  - `node scripts/build-pages.js --manifest content/topic-manifest.json --out dist --site-title "Computer Science Notes" --site-url "https://notes.praneeth-suresh-s.workers.dev"`
  - `./scripts/update-test-manifest.sh`
  - `./scripts/check.sh`
  - Playwright MCP navigation to `/` on a local static server confirmed the page title.
  - Playwright MCP DOM evaluation on `/` confirmed `og:image`, `og:image:type`, `twitter:card`, `twitter:image`, served SVG status `200`, `image/svg+xml` content type, SVG content text, and no horizontal overflow.
  - Playwright MCP navigation to the flagship NP-completeness article confirmed the page title.
  - Playwright MCP DOM evaluation on the flagship article confirmed `og:type="article"`, `og:image`, `twitter:image`, Article schema `image`, subscribe/RSS links, and no horizontal overflow.
- Checks not run:
  - No external social-card debugger checks for Hacker News, Lobsters, Reddit, X, LinkedIn, or newsletter previews, because live platform validation remains external.
  - Shell `curl` checks against the local preview server were unavailable in this sandbox's process/network isolation; Playwright browser fetch confirmed the served SVG instead.
- Tests changed:
  - Updated `tests/pages-build-subpages.test.js` to assert social image metadata and copied preview asset output.
  - Updated `tests/blog-integration.test.js` to assert blog article image metadata and Article schema image.
  - Updated `tests/.manifest.sha256` with `./scripts/update-test-manifest.sh`.
- Design files or ADR updates:
  - Updated `agent/design-tree.md`.
  - No ADR created; this is a static asset/metadata addition inside existing Pages build and `site-styling` boundaries.
- Temporary session state:
  - No `agent/session-state.md` changes were made.
- Review:
  - Subagent cross-validation passed with no required fixes.
  - Optional follow-ups recorded for later slices: reject protocol-relative pillar URLs, add production-manifest link resolution tests, and track Search Console, mid-page subscription placement, and NP-completeness/reductions coverage when source pages exist.

### Task 6: Author Bio and Positioning Signal

- Status: passed.
- Date: 2026-06-19.
- Skills used: `adding-features`, `testing-vertical-slices`.
- Scope:
  - Completed the remaining homepage bio item from `Growth.md`.
  - Added reputation and positioning copy to owned site surfaces only.
  - Kept social media and external brand-building outside the implementation scope.
- Result:
  - Added a compact home-page author bio band for Praneeth Suresh below the proof strip.
  - Linked the home bio band to `/about/`.
  - Added the theoretical-CS positioning statement to the portfolio hero: "I publish rigorous, proof-backed explanations of theoretical CS topics with research-level depth and clear intuition."
  - Added responsive CSS for the home bio band and portfolio positioning line.
  - Rebuilt checked-in `dist/` artifacts.
  - Recorded the UX change in `agent/design-tree.md`.
- Checks run:
  - `node --test tests/pages-build-subpages.test.js` before implementation, confirming the old generated pages failed the new bio/positioning assertions.
  - `node --test tests/pages-build-subpages.test.js`
  - `node scripts/build-pages.js --manifest content/topic-manifest.json --out dist --site-title "Computer Science Notes" --site-url "https://notes.praneeth-suresh-s.workers.dev"`
  - `./scripts/update-test-manifest.sh`
  - `./scripts/check.sh`
  - Playwright MCP desktop homepage accessibility snapshot confirmed the home bio region, copy, and `/about/` link.
  - Playwright MCP desktop DOM evaluation confirmed the home bio is present and does not overflow.
  - Playwright MCP portfolio DOM evaluation confirmed the positioning statement and original portfolio intro are both present.
  - Playwright MCP mobile evaluation at 390px confirmed no horizontal overflow on the home page or portfolio page after the new copy.
- Checks not run:
  - No external brand or social media checks, by user instruction.
  - No live Cloudflare deployment check.
- Tests changed:
  - Updated `tests/pages-build-subpages.test.js` to assert the home bio block and portfolio positioning statement.
  - Updated `tests/.manifest.sha256` with `./scripts/update-test-manifest.sh`.
- Design files or ADR updates:
  - Updated `agent/design-tree.md`.
  - No ADR created; this is a presentation/copy change inside the existing `site-styling` boundary.
- Temporary session state:
  - No `agent/session-state.md` changes were made.
- Review:
  - Subagent cross-validation passed with no required fixes.
  - Optional follow-ups recorded for later slices: consider softening "research-level depth", assert exact home-bio placement between proof strip and topic feed, and add a structural accessibility assertion for the `/about/` link label.

### Task 7: Early Topic Subscription Capture

- Status: passed.
- Date: 2026-06-19.
- Skills used: `adding-features`, `testing-vertical-slices`.
- Scope:
  - Completed the Growth.md item to add subscription paths near the top and bottom of topic pages.
  - Kept the newsletter provider-neutral and RSS-backed, matching the owned-audience foundation from Task 2.
  - Applied the change to generated root topic pages and topic subpages.
- Result:
  - Added a compact variant of the existing subscription panel.
  - Rendered the compact panel near the top of topic pages after the topic description and optional pillar module.
  - Kept the existing full subscription panel after topic content.
  - Used distinct static IDs and analytics source values:
    - `subscribe-topic-top` and `topic-top` for root topic top panels.
    - `subscribe-topic` and `topic` for root topic bottom panels.
    - `subscribe-topic-subpage-top` and `topic-subpage-top` for subpage top panels.
    - `subscribe-topic-subpage` and `topic-subpage` for subpage bottom panels.
  - Added compact-panel CSS while preserving the existing full panel.
  - Rebuilt checked-in `dist/` artifacts.
  - Recorded the topic capture UX change in `agent/design-tree.md`.
- Checks run:
  - `node --test tests/pages-build-subpages.test.js` before implementation, confirming the old topic pages failed the new top/bottom panel assertions.
  - `node --test tests/pages-build-subpages.test.js`
  - `node scripts/build-pages.js --manifest content/topic-manifest.json --out dist --site-title "Computer Science Notes" --site-url "https://notes.praneeth-suresh-s.workers.dev"`
  - `./scripts/update-test-manifest.sh`
  - `./scripts/check.sh`
  - Playwright MCP desktop accessibility snapshot on `/topics/algorithms/` confirmed the compact panel appears before the note body and the full panel remains after the note body.
  - Playwright MCP DOM evaluation on `/topics/algorithms/` confirmed two panels, one compact panel, distinct IDs, distinct analytics source values, and no horizontal overflow.
  - Playwright MCP mobile DOM evaluation on `/topics/algorithms/dynamic-programming/` confirmed two subpage panels, one compact panel, distinct IDs, distinct analytics source values, and the compact panel fits within the viewport.
- Checks not run:
  - No external newsletter signup completion check, because the provider remains intentionally external.
  - No full mobile overflow fix for every Algorithms child page; the Dynamic Programming child page still has pre-existing table/code overflow unrelated to the new subscription panel.
- Tests changed:
  - Updated `tests/pages-build-subpages.test.js` to assert top and bottom topic subscription panels, distinct IDs, and compact-panel rendering for root and child topic pages.
  - Updated `tests/.manifest.sha256` with `./scripts/update-test-manifest.sh`.
- Design files or ADR updates:
  - Updated `agent/design-tree.md`.
  - No ADR created; this is a static page-shell presentation change inside the existing `site-styling` boundary.
- Temporary session state:
  - No `agent/session-state.md` changes were made.
- Review:
  - Subagent cross-validation passed with no required fixes.
  - Optional follow-ups recorded for later slices: assert `data-subscribe-source` values directly, assert compact/full panel ordering around topic body content, and consider an explicitly RSS-backed CTA label until a real provider endpoint exists.

### Task 8: Start Here Reader Guide

- Status: passed.
- Date: 2026-06-19.
- Skills used: `adding-features`, `grill-me`, `testing-vertical-slices`.
- Scope:
  - Completed the Marketing.md item to create a Start Here path for new readers.
  - Strengthened the Growth.md homepage path to the strongest pillar.
  - Kept the guide static, internal-link-only, and owned-site controlled.
- Result:
  - Added a generated `/start-here/` page through the normal Pages build.
  - Linked `/start-here/` from global navigation, the home hero, and the home topic hub.
  - Built a three-step reader path:
    - Start with the Algorithms pillar.
    - Read the Dynamic Programming proof-backed note when present.
    - Subscribe by RSS when the shape is useful.
  - Added a "Pick a durable thread" section from the existing topic list.
  - Added a subscription panel to the Start Here page.
  - Added canonical URL, meta description, Open Graph, and Twitter metadata through the shared layout.
  - Fixed a nav-label CSS issue found during Playwright verification so links without hotkeys do not render empty `[]` prefixes.
  - Rebuilt checked-in `dist/` artifacts, including `dist/start-here/index.html`.
  - Recorded the Start Here guide decision in `agent/design-tree.md`.
- Checks run:
  - `node --test tests/pages-build-subpages.test.js` before implementation, confirming the old build failed the new `/start-here/` assertions.
  - `node --test tests/pages-build-subpages.test.js`
  - `node scripts/build-pages.js --manifest content/topic-manifest.json --out dist --site-title "Computer Science Notes" --site-url "https://notes.praneeth-suresh-s.workers.dev"`
  - `./scripts/update-test-manifest.sh`
  - `./scripts/check.sh`
  - Playwright MCP desktop accessibility snapshot on `/start-here/` confirmed the page title, first reading path, topic links, and subscription panel.
  - Playwright MCP DOM evaluation on `/start-here/` confirmed canonical URL, meta description, header Start link, three reader steps, six topic links, subscription panel, and no horizontal overflow.
  - Playwright MCP snapshot and DOM evaluation confirmed the empty-bracket nav label issue was fixed for links without hotkeys.
  - Playwright MCP mobile evaluation at 390px confirmed `/start-here/` has no horizontal overflow and the three-step path fits the viewport.
  - Playwright MCP DOM evaluation on the homepage confirmed links to `/start-here/` from the header, hero actions, and topic hub.
- Checks not run:
  - No external distribution or social-posting check, by user instruction.
  - No live Cloudflare deployment check.
- Tests changed:
  - Updated `tests/pages-build-subpages.test.js` to assert `/start-here/` generation, home/header links, metadata, guide links, subscription panel, and hotkey-prefix CSS behavior.
  - Updated `tests/.manifest.sha256` with `./scripts/update-test-manifest.sh`.
- Design files or ADR updates:
  - Updated `agent/design-tree.md`.
  - No ADR created; this is a static page-shell addition inside existing `pages-build` and `site-styling` boundaries.
- Temporary session state:
  - No `agent/session-state.md` changes were made.
- Review:
  - Subagent cross-validation passed with no required fixes.
  - Optional follow-ups recorded for later slices: add a direct generated-output assertion that every `/start-here/` internal link resolves, add ordering assertions for homepage Start Here links if placement becomes important, and add two more proof-backed notes when strong source pages are ready.

### Task 9: Topic Next-Reading Links

- Status: passed.
- Date: 2026-06-19.
- Skills used: `adding-features`, `testing-vertical-slices`.
- Scope:
  - Completed the Growth.md item to add "next reading" links at the end of long topic pages.
  - Kept the links generated from existing static topic-page records instead of mutating Notion-normalized note bodies.
  - Applied the behavior to topic root pages and subpages whenever another generated page exists in the same topic tree.
- Result:
  - Derived the next generated page for each topic page in `scripts/build-pages.js`.
  - Passed `nextReading` data through the existing `site-styling` topic page renderer.
  - Added a post-content `Next reading` navigation block before the bottom subscription panel.
  - Omitted the block when there is no next generated page, avoiding empty or broken links.
  - Added compact CSS for `.next-reading`.
  - Rebuilt checked-in `dist/` artifacts.
  - Recorded the next-reading UX change in `agent/design-tree.md`.
- Checks run:
  - `node --test tests/pages-build-subpages.test.js` before implementation, confirming the old generated pages failed the new next-reading assertions.
  - `node --test tests/pages-build-subpages.test.js`
  - `node scripts/build-pages.js --manifest content/topic-manifest.json --out dist --site-title "Computer Science Notes" --site-url "https://notes.praneeth-suresh-s.workers.dev"`
  - `./scripts/update-test-manifest.sh`
  - `./scripts/check.sh`
  - Playwright MCP desktop accessibility snapshot on `/topics/algorithms/` confirmed the post-content `Next reading` navigation appears before the bottom subscription panel.
  - Playwright MCP DOM evaluation on `/topics/algorithms/` confirmed the next-reading label, title, href, ordering before `#subscribe-topic`, and no horizontal overflow on the root page.
  - Playwright MCP mobile DOM evaluation on `/topics/algorithms/dynamic-programming/` confirmed the subpage next-reading block, target href, and block width fit the viewport.
- Checks not run:
  - No external analytics/conversion check.
  - No full mobile overflow fix for every Algorithms child page; the Dynamic Programming child page still has pre-existing table/code overflow unrelated to the new next-reading block.
- Tests changed:
  - Updated `tests/pages-build-subpages.test.js` to assert root-page next-reading output and last-child omission in the generated fixture.
  - Updated `tests/.manifest.sha256` with `./scripts/update-test-manifest.sh`.
- Design files or ADR updates:
  - Updated `agent/design-tree.md`.
  - No ADR created; this is a static page-shell discovery feature inside existing `pages-build` and `site-styling` boundaries.
- Temporary session state:
  - No `agent/session-state.md` changes were made.
- Review:
  - Subagent cross-validation passed with no required fixes.
  - Optional follow-ups recorded for later slices: add generated-output target-resolution assertions for all `.next-reading-link` links, add direct ordering assertions around topic body and bottom subscription panel, and replace `pageRecords.indexOf(pageRecord)` with an indexed loop for cleaner linear derivation.

### Task 10: Public Research Taste Page

- Status: passed.
- Date: 2026-06-19.
- Skills used: `adding-features`, `grill-me`, `testing-vertical-slices`.
- Scope:
  - Completed the Marketing.md item to publish a public research taste list with 10-15 theoretical-CS topics, rationale, and source trails.
  - Kept the work under site control: static content, static generation, internal links, metadata, and browser-verified layout.
  - Left social posting and external brand building to the maintainer.
- Result:
  - Added checked-in `content/research-taste.json` with 12 theoretical-CS interests, rationale copy, and source links.
  - Added a generated `/research-taste/` page through the normal Pages build.
  - Added `--research-taste-data` support to `scripts/build-pages.js` and an explicit `researchTasteDataPath` build option for deterministic tests.
  - Rendered the page through `site-styling` with canonical URL, meta description, Open Graph, Twitter metadata, source-link cards, and a subscription panel.
  - Linked `/research-taste/` from the homepage author band, the Start Here guide, and the portfolio hero.
  - Added responsive CSS for the research grid and home author link group.
  - Rebuilt checked-in `dist/` artifacts, including `dist/research-taste/index.html`.
  - Recorded the research taste page decision in `agent/design-tree.md`.
- Checks run:
  - `node --test tests/pages-build-subpages.test.js` before implementation, confirming the old build failed the new `/research-taste/` assertions.
  - `node --test --test-reporter=spec tests/pages-build-subpages.test.js`
  - `node --check src/site-styling/internal/shell.js`
  - `node --check scripts/build-pages.js`
  - `node scripts/build-pages.js --manifest content/topic-manifest.json --out dist --site-title "Computer Science Notes" --site-url "https://notes.praneeth-suresh-s.workers.dev"`
  - `./scripts/update-test-manifest.sh`
  - `./scripts/check.sh`
  - Playwright MCP navigation to `/research-taste/` confirmed the page title.
  - Playwright MCP mobile DOM evaluation on `/research-taste/` confirmed title, canonical URL, meta description, H1, 12 topic cards, 14 source links, Cook DOI link, subscription panel, and no horizontal overflow.
  - Playwright MCP desktop DOM evaluation on `/research-taste/` confirmed 12 topic cards, 14 source links, and no horizontal overflow.
  - Playwright MCP DOM evaluation confirmed `/research-taste/` ingress links from `/`, `/start-here/`, and `/about/`.
  - Playwright MCP mobile layout evaluation at 390px confirmed the research grid collapses to one column and fits the viewport.
- Checks not run:
  - No external social distribution or brand-building checks, by user instruction.
  - No live Cloudflare deployment check.
  - No HTTP validation of every external source link beyond using stable DOI/publisher URLs in the static content.
- Tests changed:
  - Updated `tests/pages-build-subpages.test.js` to assert `/research-taste/` generation, fixture data loading, metadata, source links, and Home/Start/Portfolio ingress links.
  - Updated `tests/.manifest.sha256` with `./scripts/update-test-manifest.sh`.
- Design files or ADR updates:
  - Updated `agent/design-tree.md`.
  - No ADR created; this is a static page-shell addition inside existing `pages-build` and `site-styling` boundaries.
- Temporary session state:
  - No `agent/session-state.md` changes were made.
- Review:
  - Subagent cross-validation passed with no required fixes.
  - Optional follow-ups recorded for later slices: add a production-content assertion that `content/research-taste.json` always has 10-15 topics, non-empty rationales, and at least one valid source per topic, and consider making missing `content/research-taste.json` a build failure instead of rendering an empty research page.

### Task 11: Sitemap, Robots, and Footer Discovery

- Status: passed.
- Date: 2026-06-19.
- Skills used: `adding-features`, `grill-me`, `testing-vertical-slices`.
- Scope:
  - Completed the controllable part of Growth.md's Search Console prerequisite by generating a sitemap and robots file.
  - Completed the Growth.md requirement for visible RSS links in the footer.
  - Kept Search Console submission itself external for the maintainer.
- Result:
  - Added generated `/sitemap.xml` output from the same route records used by the Pages build.
  - Added generated `/robots.txt` with a sitemap pointer to the configured `siteUrl`.
  - Included static pages, topic root pages, topic subpages, blog index, and blog posts in the sitemap.
  - Added a shared footer to every generated HTML page with Start, Research Taste, Notes, Blog, Portfolio, RSS, and Sitemap links.
  - Added footer RSS analytics metadata with `data-subscribe-source="footer"`.
  - Added responsive footer CSS.
  - Rebuilt checked-in `dist/` artifacts; the production sitemap currently contains 127 `<loc>` entries.
  - Recorded the static discovery decision in `agent/design-tree.md`.
- Checks run:
  - `node --test --test-reporter=spec tests/pages-build-subpages.test.js` before implementation, confirming the old build failed the new sitemap/robots/footer assertions.
  - `node --test --test-reporter=spec tests/blog-integration.test.js` before implementation, confirming the old build failed the new blog sitemap assertions.
  - `node --test --test-reporter=spec tests/pages-build-subpages.test.js`
  - `node --test --test-reporter=spec tests/blog-integration.test.js`
  - `node --check scripts/build-pages.js`
  - `node --check src/site-styling/internal/shell.js`
  - `node scripts/build-pages.js --manifest content/topic-manifest.json --out dist --site-title "Computer Science Notes" --site-url "https://notes.praneeth-suresh-s.workers.dev"`
  - `./scripts/update-test-manifest.sh`
  - `./scripts/check.sh`
  - `rg -c "<loc>" dist/sitemap.xml`
  - Playwright MCP mobile DOM evaluation on `/` confirmed footer links, footer RSS event metadata, sitemap root/research/blog-post entries, robots sitemap pointer, and no horizontal overflow.
  - Playwright MCP desktop DOM evaluation on `/` confirmed the footer exists, renders seven links, and does not cause horizontal overflow.
- Checks not run:
  - No Search Console submission or live deployment check, by user/external-account boundary.
- Tests changed:
  - Updated `tests/pages-build-subpages.test.js` to assert sitemap/robots output, child topic sitemap entries, footer links, footer RSS tracking metadata, and footer CSS.
  - Updated `tests/blog-integration.test.js` to assert blog index and blog post sitemap entries plus the robots sitemap pointer.
  - Updated `tests/.manifest.sha256` with `./scripts/update-test-manifest.sh`.
- Design files or ADR updates:
  - Updated `agent/design-tree.md`.
  - No ADR created; this is deterministic static discovery output and shared shell navigation inside existing boundaries.
- Temporary session state:
  - No `agent/session-state.md` changes were made.
- Review:
  - Subagent cross-validation passed with no required fixes.
  - Optional follow-up recorded for later slices: add a deterministic full parity test that compares generated HTML routes to sitemap `<loc>` entries and asserts no duplicates.

### Task 12: Flagship NP-Completeness Essay

- Status: passed.
- Date: 2026-06-19.
- Skills used: `adding-features`, `grill-me`, `testing-vertical-slices`.
- Scope:
  - Completed the controllable part of Growth.md's "Publish one flagship theoretical CS essay" item.
  - Completed Marketing.md's depth-signal pattern for the first flagship post: "In this post", formal statement, model and assumptions, proof sketch, why this matters, internal trail, further reading, and next questions.
  - Added generated social preview text for the flagship post.
  - Left external distribution, submissions, pitches, and social copy to the maintainer.
- Result:
  - Added `content/blog/posts/np-completeness-formal-definition-proof-sketches-and-reductions.md`.
  - Added a `Theoretical CS Deep Dives` section to `content/blog/blog-manifest.json`.
  - Added manifest-level `description` and `socialPreview` support for blog post metadata.
  - Updated RSS feed generation to prefer a post's manifest description over section fallback copy.
  - Updated generated blog search entries to carry the manifest description so homepage search result cards have useful summaries.
  - Linked the flagship essay from the homepage and the Algorithms pillar.
  - Added a homepage flagship essay band.
  - Added source links for Cook, Karp, Clay Mathematics Institute, and CLRS/MIT Press.
  - Fixed Markdown/MathJax display-equation overflow so the flagship post does not widen the page on mobile.
  - Rebuilt checked-in `dist/` artifacts, including the new blog post route, RSS entry, sitemap entry, and search index entry.
  - Recorded the flagship essay decision in `agent/design-tree.md`.
- Checks run:
  - `node --test --test-reporter=spec tests/blog-integration.test.js` before implementation, confirming the old build failed the new flagship route, metadata, RSS, sitemap, search, Home link, and Algorithms link assertions.
  - `node --test --test-reporter=spec tests/blog-integration.test.js`
  - `node --test --test-reporter=spec tests/pages-build-subpages.test.js`
  - `node --check src/site-styling/internal/shell.js`
  - `node --check src/notes-content/internal/render-blog-html.js`
  - `node --check scripts/build-pages.js`
  - `node scripts/build-pages.js --manifest content/topic-manifest.json --out dist --site-title "Computer Science Notes" --site-url "https://notes.praneeth-suresh-s.workers.dev"`
  - `./scripts/update-test-manifest.sh`
  - `./scripts/check.sh`
  - Playwright MCP desktop navigation to the flagship post confirmed the page title.
  - Playwright MCP desktop DOM evaluation on the flagship post confirmed canonical URL, meta description, social preview description, required post sections, source names, Algorithms/TSP internal links, subscription panel, and no horizontal overflow.
  - Playwright MCP mobile DOM evaluation at 390px initially found page-level overflow from MathJax SVG output.
  - Playwright MCP mobile DOM evaluation after the CSS fix confirmed page-level overflow was gone and Home/Algorithms ingress links were present.
  - Playwright MCP desktop DOM evaluation confirmed the blog index and sitemap include the flagship post and the required depth-signal headings are present.
  - Direct generated search-index check confirmed the flagship post description is populated and the search text includes "Proof sketch".
- Checks not run:
  - No Hacker News, Lobsters, Reddit, newsletter pitch, or external distribution checks, by user instruction.
  - No live Cloudflare deployment check.
- Tests changed:
  - Updated `tests/blog-integration.test.js` to assert flagship route generation, depth sections, source links, metadata, social preview text, RSS entry, sitemap entry, search index entry, and Home/Algorithms ingress links.
  - Updated `tests/blog-integration.test.js` to assert `createBlogSearchEntry` preserves descriptions and the flagship generated search entry carries the manifest description.
  - Updated `tests/pages-build-subpages.test.js` to assert the MathJax display overflow CSS rule.
  - Updated `tests/.manifest.sha256` with `./scripts/update-test-manifest.sh`.
- Design files or ADR updates:
  - Updated `agent/design-tree.md`.
  - No ADR created; this is content packaging and static metadata within existing blog/build/styling boundaries.
- Temporary session state:
  - No `agent/session-state.md` changes were made.
- Review:
  - First subagent cross-validation failed because blog search entries dropped the flagship manifest description, leaving the homepage search result summary empty.
  - Fixed by passing `post.description` into `createBlogSearchEntry`, preserving optional descriptions in `notes-content`, rebuilding `dist/search-index.json`, and adding tests for the description path.
  - Repeat subagent cross-validation passed with no required fixes.
  - Optional follow-up recorded for later slices: strengthen the deterministic MathJax overflow CSS assertion to check `max-width: 100%`, `overflow-x: auto`, and `overflow-y: hidden`, not only selector presence.

### Task 13: Public Errata Page

- Status: passed.
- Date: 2026-06-19.
- Skills used: `adding-features`, `grill-me`, `testing-vertical-slices`.
- Scope:
  - Completed Marketing.md's visible error-corrections credibility item under site control.
  - Added a public correction-policy surface without claiming any corrections exist.
  - Left external issue tracking and social correction announcements outside this slice.
- Result:
  - Added a generated `/errata/` page through the normal Pages build.
  - Added `/errata/` to generated sitemap route records.
  - Added an Errata link to the shared footer.
  - Added a "Corrections and clarifications" section to the flagship NP-completeness essay linking to `/errata/`.
  - Rendered the errata page with canonical URL, meta description, Open Graph, Twitter metadata, no-corrections-yet copy, and correction policy copy.
  - Added responsive errata CSS.
  - Rebuilt checked-in `dist/` artifacts, including `dist/errata/index.html` and the updated flagship post route.
  - Recorded the errata decision in `agent/design-tree.md`.
- Checks run:
  - `node --test --test-reporter=spec tests/pages-build-subpages.test.js` before implementation, confirming the old build failed the new `/errata/`, footer, and sitemap assertions.
  - `node --test --test-reporter=spec tests/blog-integration.test.js` before implementation, confirming the old flagship post failed the new correction-link assertion.
  - `node --test --test-reporter=spec tests/pages-build-subpages.test.js`
  - `node --test --test-reporter=spec tests/blog-integration.test.js`
  - `node --check src/site-styling/internal/shell.js`
  - `node --check src/site-styling/index.js`
  - `node --check scripts/build-pages.js`
  - `node scripts/build-pages.js --manifest content/topic-manifest.json --out dist --site-title "Computer Science Notes" --site-url "https://notes.praneeth-suresh-s.workers.dev"`
  - `./scripts/update-test-manifest.sh`
  - `./scripts/check.sh`
  - Playwright MCP navigation to `/errata/` confirmed the page title.
  - Playwright MCP desktop DOM evaluation on `/errata/` confirmed canonical URL, meta description, H1, no-corrections-yet copy, correction policy copy, flagship link, footer Errata link, sitemap inclusion, flagship-post backlink, and no horizontal overflow.
  - Playwright MCP mobile DOM evaluation at 390px confirmed no horizontal overflow, one-column errata policy copy, and the expanded footer fits.
- Checks not run:
  - No external issue tracker, email, or social correction workflow check.
  - No live Cloudflare deployment check.
- Tests changed:
  - Updated `tests/pages-build-subpages.test.js` to assert `/errata/` generation, metadata, correction-policy copy, footer link, and sitemap entry.
  - Updated `tests/blog-integration.test.js` to assert the flagship post correction section and `/errata/` sitemap entry.
  - Updated `tests/.manifest.sha256` with `./scripts/update-test-manifest.sh`.
- Design files or ADR updates:
  - Updated `agent/design-tree.md`.
  - No ADR created; this is a static trust page and shared navigation addition inside existing build/styling boundaries.
- Temporary session state:
  - No `agent/session-state.md` changes were made.
- Review:
  - Subagent cross-validation passed with no required fixes.
  - Optional follow-up recorded for later slices: derive or conditionally render the errata page's flagship essay backlink if flagship posts become configurable.

### Task 14: Provider-Neutral Subscribe Destination

- Status: passed.
- Date: 2026-06-19.
- Skills used: `adding-features`, `grill-me`, `testing-vertical-slices`.
- Scope:
  - Completed the site-controlled post-conversion destination for Growth.md's conversion foundation.
  - Kept email provider selection external while making RSS the honest live subscription path.
  - Preserved direct RSS fallback links for readers who do not want email.
- Result:
  - Added a generated `/subscribe/` page through the normal Pages build.
  - Added `/subscribe/` to generated sitemap route records.
  - Added a Subscribe link to the shared footer.
  - Updated primary newsletter CTAs to point to `/subscribe/` instead of pretending `/feed.xml` is an email signup destination.
  - Kept secondary RSS CTAs pointing directly to `/feed.xml`.
  - Rendered `/subscribe/` with the promise "One rigorous theoretical CS deep dive every 3-4 weeks.", provider-pending copy, RSS action, Start Here link, and flagship essay link.
  - Added canonical URL, meta description, Open Graph, Twitter metadata, and responsive CSS for the page.
  - Rebuilt checked-in `dist/` artifacts, including `dist/subscribe/index.html`, updated footer output, updated sitemap, and updated HTML CTAs.
  - Recorded the subscribe destination decision in `agent/design-tree.md`.
- Checks run:
  - `node --test --test-reporter=spec tests/pages-build-subpages.test.js` before implementation, confirming the old build failed the new `/subscribe/`, CTA, footer, and sitemap assertions.
  - `node --test --test-reporter=spec tests/blog-integration.test.js` before implementation, confirming post-end CTA output failed the new subscribe destination assertions.
  - `node --test --test-reporter=spec tests/pages-build-subpages.test.js`
  - `node --test --test-reporter=spec tests/blog-integration.test.js`
  - `node --check src/site-styling/internal/shell.js`
  - `node --check src/site-styling/index.js`
  - `node --check scripts/build-pages.js`
  - `node scripts/build-pages.js --manifest content/topic-manifest.json --out dist --site-title "Computer Science Notes" --site-url "https://notes.praneeth-suresh-s.workers.dev"`
  - `./scripts/update-test-manifest.sh`
  - `./scripts/check.sh`
  - Playwright MCP navigation to `/subscribe/` confirmed the page title.
  - Playwright MCP mobile DOM evaluation on `/subscribe/` confirmed canonical URL, meta description, deep-dive promise, provider-pending copy, RSS action, Start Here link, flagship essay link, footer Subscribe link, sitemap inclusion, homepage primary CTA, flagship post primary CTA, and no horizontal overflow.
  - Playwright MCP desktop DOM evaluation on `/subscribe/` confirmed no horizontal overflow, two-column action layout, three subscribe-page actions, and the expanded footer fits.
- Checks not run:
  - No completed email signup check, because no newsletter provider has been selected.
  - No live Cloudflare deployment check.
- Tests changed:
  - Updated `tests/pages-build-subpages.test.js` to assert `/subscribe/` generation, metadata, copy, RSS fallback, Start Here/flagship links, footer link, homepage primary CTA target, and sitemap entry.
  - Updated `tests/blog-integration.test.js` to assert blog post subscribe destination links plus RSS fallback and sitemap entry.
  - Updated `tests/.manifest.sha256` with `./scripts/update-test-manifest.sh`.
- Design files or ADR updates:
  - Updated `agent/design-tree.md`.
  - No ADR created; this is a provider-neutral static conversion destination inside existing build/styling boundaries.
- Temporary session state:
  - No `agent/session-state.md` changes were made.
- Review:
  - Subagent cross-validation passed with no required fixes.
  - Optional follow-up recorded for later slices: strengthen tests to assert exact CTA anchors, not just nearby substrings, for homepage and blog subscribe panels.

### Task 15: Weekly Growth Scorecard

- Status: passed.
- Date: 2026-06-19.
- Skills used: `adding-features`, `grill-me`, `testing-vertical-slices`.
- Scope:
  - Completed the support-agent-controlled part of Growth.md's weekly scorecard requirement.
  - Created a reusable measurement artifact without claiming external analytics, Search Console, newsletter, or distribution data already exists.
  - Kept social posting, community distribution, analytics account setup, Search Console ownership, and newsletter provider setup external to Praneeth.
- Result:
  - Added `GrowthScorecard.md` at the repository root.
  - Mapped weekly measurement areas to current source-of-truth systems and ownership boundaries.
  - Included sections for traffic by channel, Search Console metrics, engagement, conversion, distribution attempts, and weekly decision rules.
  - Recorded existing provider-neutral event hook names: `page_view`, `rss_click`, `newsletter_cta_click`, `outbound_github_click`, and `outbound_linkedin_click`.
  - Added a viral-readiness gate for flagship essay distribution so external submissions happen only after metadata, RSS, subscribe, and sitemap prerequisites are present.
- Checks run:
  - `test -f GrowthScorecard.md` before implementation, confirming the scorecard artifact did not exist yet.
- Checks not run:
  - External analytics dashboard checks, because no analytics provider has been selected.
  - Google Search Console checks, because property verification and sitemap submission remain external.
  - Newsletter signup checks, because no newsletter provider has been selected.
  - External distribution checks, because social/community posting is intentionally left to Praneeth.
- Tests changed:
  - No automated tests changed.
  - `tests/.manifest.sha256` was not changed.
- Design files or ADR updates:
  - No design tree or ADR updates; this is an operating scorecard document rather than a site architecture or UI decision.
- Temporary session state:
  - No `agent/session-state.md` changes were made.
- Review:
  - Subagent cross-validation passed with no required fixes.
  - Incorporated the optional reviewer follow-up to name `page_view` explicitly in the scorecard's measurement-source table.

### Task 16: Flagship Essay Distribution Kit

- Status: passed.
- Date: 2026-06-19.
- Skills used: `adding-features`, `grill-me`, `testing-vertical-slices`.
- Scope:
  - Completed the support-agent-controlled draft work for Growth.md's focused distribution cycle.
  - Prepared copy Praneeth can adapt for Hacker News, Lobsters, Reddit, newsletter curators, and cross-posting platforms.
  - Left all live submissions, community judgment, replies, curator relationships, and external brand building to Praneeth.
- Result:
  - Added `DistributionKit.md` at the repository root.
  - Anchored the kit to the flagship NP-completeness essay and its current conversion path.
  - Added a pre-submit checklist covering live URL readiness, metadata, Algorithms pillar link, `/subscribe/`, `/feed.xml`, sitemap, mobile overflow, scorecard logging, and current community-rule checks.
  - Drafted Hacker News title options, submission copy, and a technical comment seed.
  - Drafted a Lobsters submission note and tag candidates.
  - Drafted discussion-first Reddit title/body options and a short follow-up explanation.
  - Drafted newsletter curator subject lines, pitch copy, and a three-bullet summary.
  - Drafted a canonical-link cross-post summary and after-posting measurement instructions.
- Checks run:
  - `test -f DistributionKit.md` before implementation, confirming the distribution kit artifact did not exist yet.
- Checks not run:
  - No live Hacker News, Lobsters, Reddit, newsletter, or cross-posting submission checks, by user instruction.
  - No current external community-rule verification, because the kit explicitly leaves rule checks to Praneeth immediately before posting.
- Tests changed:
  - No automated tests changed.
  - `tests/.manifest.sha256` was not changed.
- Design files or ADR updates:
  - No design tree or ADR updates; this is an operator-facing draft kit rather than a site architecture or UI decision.
- Temporary session state:
  - No `agent/session-state.md` changes were made.
- Review:
  - Subagent cross-validation passed with no required fixes.
  - Optional external follow-up: after Praneeth posts anywhere, fill `GrowthScorecard.md` with the live thread URL, hook used, referral visits, CTA clicks, RSS clicks, and notes for the next attempt.

### Task 17: Post Publishing Checklist

- Status: passed.
- Date: 2026-06-19.
- Skills used: `adding-features`, `testing-vertical-slices`.
- Scope:
  - Completed the support-agent-controlled part of Marketing.md's reusable per-post checklist and story-first content system.
  - Made future theoretical-CS posts easier to publish with consistent proof-backed structure, metadata, internal links, conversion paths, and distribution readiness.
  - Left external posting, current community-rule checks, newsletter provider setup, analytics provider setup, and Search Console access to Praneeth.
- Result:
  - Added `PostPublishingChecklist.md` at the repository root.
  - Defined the default flagship post structure: story hook, "In this post", question, intuition, formal statement, model and assumptions, proof sketch, worked example or equivalent, why this matters, internal trail, further reading, next questions, and corrections.
  - Added lighter research-note requirements for posts that are not full flagship essays.
  - Added opening-hook, formal-rigor, source-trail, internal-link, manifest-metadata, conversion-readiness, local-check, distribution-readiness, and post-publish measurement sections.
  - Included the current blog manifest metadata shape with `description` and `socialPreview`.
  - Explicitly tied post-publish measurement back to `GrowthScorecard.md`.
- Checks run:
  - `test -f PostPublishingChecklist.md` before implementation, confirming the checklist artifact did not exist yet.
- Checks not run:
  - No Playwright MCP check, because this is an operator-facing markdown document with no generated HTML/CSS surface.
  - No external posting, analytics, newsletter, or Search Console checks, by ownership boundary.
- Tests changed:
  - No automated tests changed.
  - `tests/.manifest.sha256` was not changed.
- Design files or ADR updates:
  - No design tree or ADR updates; this is an operating checklist rather than a site architecture or UI decision.
- Temporary session state:
  - No `agent/session-state.md` changes were made.
- Review:
  - Subagent cross-validation passed with no required fixes.
