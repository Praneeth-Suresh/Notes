# Notes Application Launch & Monetization To-Do

Updated: 2026-07-04 (Asia/Bangkok)

## 1) What I audited

- Template coverage: `src/site-styling/internal/shell.js` drives all public routes.
- Data coverage: `content/topic-manifest.json`, `content/blog/blog-manifest.json`, `content/projects.json`, `content/research-taste.json`.
- Output coverage: verified generated `dist/` files and ran a full local build to `/tmp/notes-dist-check`.
- Route checks: all manifest-defined topics, topic subpages, blog posts, and core utility routes resolve to files in `dist/`.
- Internal asset checks: CSS/JS/icon/JSON/image references in generated HTML are present in `dist/`.
- Playwright MCP check:
  - `run_web_automation` works (validated on `https://example.com`).
  - `notes.praneeth-suresh-s.workers.dev` could not be opened from this runner (DNS failure in this environment).
  - `file:///.../dist/index.html` timed out in browser automation.
  - Because live preview is not reachable from the runner, this check is based on static `dist/` validation + code inspection.

## 2) Current state quick feel (rough)

- Strong: clear information architecture, clean technical tone, good metadata/SEO primitives, topic/blog/project/subpage depth is substantial.
- Correct editorial posture: the notes, blog essays, topic pages, and project write-ups should stay deeply technical and content-rich. The site is valuable because it gives serious readers real technical depth, not because it compresses everything into marketing copy.
- Main improvement area: the marketing/navigation pages should be sharper. Home, Start Here, About Me, Subscribe, Projects, Contact, and Collaborate need clearer first-screen hierarchy, stronger visual focus, and faster decisions for new visitors.
- Monetization gap: conversion points currently route primarily to RSS / email intent (mailto) instead of a validated capture funnel.
- Product polish gap: no dedicated error page, and live browser verification still needs to be completed from an environment that can reach production.

## 3) Reimagined page roles

The site should separate deep technical reading from fast visitor orientation.

- **Deep technical pages:** `/notes/`, `/topics/...`, `/blog/...`, `/projects/...`
  - Purpose: prove depth, rigor, and taste.
  - Optimization target: clarity, navigation, internal linking, source trails, search, readability, and credibility.
  - Do not make these artificially short. Dense technical material is expected and valuable.

- **Marketing/navigation pages:** `/`, `/start-here/`, `/about/`, `/subscribe/`, `/contact/`, `/collaborate/`, `/projects/`
  - Purpose: help a new visitor understand what to do next.
  - Optimization target: concise positioning, strong visual hierarchy, clear CTAs, and low-friction movement into deeper material.
  - These pages should draw attention quickly, then send interested users into the technical corpus.

- **About Me page:** `/about/`
  - Purpose: introduce Praneeth Suresh as a person, builder, student, researcher, and collaborator.
  - Not its purpose: explain the website. The homepage and `/start-here/` already perform that job.
  - Success condition: a visitor leaves understanding who Praneeth is, what he is credible at, what he is currently pursuing, and why they might contact or follow him.

## 4) Launch & monetization to-do list

### P0 - launch blockers / reliability
- [x] Verify the live domain is reachable in the deployed environment from an external browser.

  Completed: Playwright automation loaded `https://notes.praneeth-suresh-s.workers.dev/` successfully from an external browser environment. The run reported title `Computer Science Notes`, main heading `Praneeth's CS Field Notes`, and visible header links for Start, About, Projects, Notes, Blog, Contact, and RSS.

- [x] Add a custom `404.html` page and route behavior for unknown routes.

  Completed: the Pages build now emits `dist/404.html` through `scripts/build-pages.js` using a new `renderNotFoundPage` renderer in `site-styling`. The page uses the shared shell, canonical metadata, and recovery links to Home, Notes, Writing, Contact, Start Here, and Subscribe. The generated page is covered by `tests/pages-build-subpages.test.js`.

- [x] Add Playwright browser regression checks for all primary routes (`/`, `/notes/`, `/topics/`, `/blog/`, `/projects/`, `/contact/`, `/subscribe/`, `/about/`).

  Completed: added a durable browser smoke-check matrix in `agent/browser-smoke-checks.md` and ran Playwright/TinyFish verification against production. The route batch confirmed Start Here, Notes, Blog, Projects, Contact, Subscribe, About, and Collaborate load with their expected headings and visible controls. The homepage was verified separately in the live-domain check.

- [ ] Confirm analytics event names are consistent across pages and consumed by the analytics destination.

  Blocked by scope: event-name consistency can be audited locally, but confirming destination consumption requires wiring or inspecting an analytics provider. The user explicitly asked not to implement conversion tracking because there is not enough time to act on the insights, so this should remain open until analytics work is intentionally resumed.

- [x] Confirm feed and sitemap validate as XML and crawlable.

  Completed: local validation confirmed `dist/feed.xml` and `dist/sitemap.xml` include XML declarations and correct RSS/sitemap roots. `dist/robots.txt` allows crawling and points to `https://notes.praneeth-suresh-s.workers.dev/sitemap.xml`. The build test now also asserts the sitemap namespace and crawler discovery files.

- [x] Add a short performance pass on critical routes (home + blog index + notes index).

  Completed: ran a static artifact size pass on the critical routes. Current HTML sizes are: home 26.6 KB, blog index 19.3 KB, notes index 580.9 KB. CSS is 82.9 KB and self-hosted MathJax is 2221.8 KB. The only launch concern is `/notes/`, which is heavy because it embeds the searchable notes payload; this is acceptable for launch but should be revisited later if first-load performance becomes a problem.

### P1 - launch quality
- [ ] Add route-level CTA copy review for Home, Start Here, Subscribe, Contact, Collaborate, Projects, and About Me.
- [ ] Keep `/notes/`, `/topics/...`, and `/blog/...` deep, but add stronger internal trails and next-step CTAs after substantial sections.
- [ ] Refine `/` as the high-level public gateway: research, projects, writing, asks, and notes.
- [ ] Refine `/start-here/` as the site introduction and guided reading path.
- [ ] Refine `/about/` as an About Me page focused on identity, credibility, work, and current opportunities.
- [ ] Add a lightweight onboarding prompt only if analytics show visitors are bouncing before entering deeper pages.
- [ ] Confirm there are no stale/redundant links in `content/` and `dist/` after next content regeneration.

### P2 - monetization pathway
- [ ] Decide the initial funnel explicitly:
  - Option A: RSS-first + delayed email list
  - Option B: RSS + active newsletter provider
  - Option C: paid advisory/consulting CTA only
- [ ] If Option B, wire a production email provider and implement a real signup endpoint + confirmation UX.
- [ ] If Option C, add dedicated consultation inquiry form or short form flow (calendar + qualification questions).
- [ ] Add conversion tracking for: feed click, subscribe click, contact click, external click, page visits.
- [ ] Add conversion goals in GA/SIEM equivalent and weekly reporting template.

### P2 - content and credibility pipeline
- [ ] Keep a single flagship publishing cadence (1 feature post every 2-4 weeks).
- [ ] Add “next step” blocks to every flagship post linking to related post + subscription + one CTA.
- [ ] Publish a public correction workflow for `/errata/` and integrate it with blog updates.
- [ ] Add one public proof artifact per flagship post (diagram, proof sketch, code/notebook, or benchmark summary).

## 5) Launch timeline (rough)

- **Week 1 (2026-07-05 to 2026-07-11):** Deployment health pass + reliability fixes + final page map
- **Week 2 (2026-07-12 to 2026-07-18):** Marketing-page hierarchy, About Me restyle plan, 404 page, Playwright smoke checklist
- **Week 3 (2026-07-19 to 2026-07-25):** Monetization decision + email/offer funnel build
- **Week 4 (2026-07-26 to 2026-08-01):** About Me implementation, QA pass, legal/privacy copy updates, launch rehearsal
- **Week 5 (2026-08-02 to 2026-08-08):** Quiet beta distribution (single channel), track conversions
- **Week 6 (2026-08-09 to 2026-08-15):** Iterate by conversion data, then open second distribution channel

## 6) Loose ends you likely still need to address

- Confirm live website accessibility from outside this runner (the crawler here cannot currently load `notes.praneeth-suresh-s.workers.dev`).
- About Me needs a clearer personal narrative, not more website explanation.
- Marketing pages need to be concise enough to hold attention before directing readers into the technical material.
- No clearly documented monetization decision in repo besides RSS + mailto intent in `/subscribe/`.
- No dedicated legal/privacy copy page for newsletter/contact data handling (needed if collecting emails).

## 7) Mandatory About Me requirement

- [ ] **Complete restyle of `/about/` as an About Me page, not a website introduction page.**
- [ ] First screen should introduce Praneeth Suresh directly: role, current context, technical taste, and what kind of work he wants to be known for.
- [ ] Replace redundant site explanation with personal narrative: education, current focus, selected proof of work, research/engineering interests, leadership, and opportunities.
- [ ] Make the page feel professional enough for recruiters, collaborators, AI Society partners, and serious technical readers.
- [ ] Keep the page concise compared with the technical corpus, but not shallow. It should be high-signal personal positioning.
- [ ] Preserve links to GitHub, LinkedIn, research taste, selected projects, and contact routes.

## 8) Reference website direction for About Me styling

- https://leerob.io (minimal professional narrative + portfolio signal)
- https://www.joshwcomeau.com (editorial design + technical depth)
- https://www.framer.com/about (clear brand + section hierarchy)
- https://www.patrickcollison.com/ (concise executive-level positioning)
- https://www.kylechung.io/ (developer portfolio with strong information architecture)
- https://sive.rs/about (minimal, personal, high-signal structure)
- https://www.marcbest.com/ (portfolio + case-study framing)
- https://wesbos.com/about (warm + professional voice balance)
- https://www.joanleon.com/ (clean resume-pro portfolio style)
- https://samsaccone.com/ (portfolio-first credibility layout)

Use these as directional references, not a style copy.
