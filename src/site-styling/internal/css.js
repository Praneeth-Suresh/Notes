"use strict";

// Personal technical notebook: Inter, a centred 708px reading measure, ink links,
// native disclosures, and light/dark colour schemes that follow the system until the
// reader picks one with the header toggle (stored as html[data-theme]).
const DARK_TOKENS = `
    color-scheme: dark;
    --ink: #e6e6e3;
    --ink-2: #b4b3af;
    --ink-3: #777670;
    --rule: #41413e;
    --wash: #2f2f2f;
    --paper: #191919;
    --raised: #252525;
    --focus: #8cb4ea;
    --accent: #eda36c;
    --scrim: rgb(0 0 0 / .6);
    --working-bg: #3a2f1c;
    --working-ink: #e7bd73;
    --reviewed-bg: #1f3529;
    --reviewed-ink: #9ad7af;
    --archived-bg: #30302e;
    --archived-ink: #c2c1bb;`;

const darkNotionColors = (root) => `
  ${root} .notion-color-gray { color: #b4b3af; } ${root} .notion-color-brown { color: #d2a18d; } ${root} .notion-color-orange { color: #eda36c; }
  ${root} .notion-color-yellow { color: #e7bd73; } ${root} .notion-color-green { color: #9ad7af; } ${root} .notion-color-blue { color: #8cb4ea; }
  ${root} .notion-color-purple { color: #c7a6e8; } ${root} .notion-color-pink { color: #e58dbd; } ${root} .notion-color-red { color: #f08e87; }`;

const SITE_CSS = `
@font-face {
  font-family: "Inter";
  src: url("/assets/fonts/inter-variable.woff2") format("woff2-variations");
  font-style: normal;
  font-weight: 400 700;
  font-display: swap;
}

:root {
  color-scheme: light;
  --ink: #2c2c2b;
  --ink-2: #63625d;
  --ink-3: #a5a29a;
  --rule: #dcdbd3;
  --wash: #e8e7e0;
  --paper: #f2f2ed;
  --raised: #fafaf7;
  --focus: #2383e2;
  --accent: #9a4b08;
  --scrim: rgb(44 44 43 / .32);
  --working-bg: #f3e5bb;
  --working-ink: #8a5c00;
  --reviewed-bg: #dde9da;
  --reviewed-ink: #2f6143;
  --archived-bg: #e4e3dc;
  --archived-ink: #5f5e59;
  --font-sans: "Inter", ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI Variable Display", "Segoe UI", Helvetica, Arial, sans-serif;
  --font-mono: "SFMono-Regular", Menlo, Consolas, "Liberation Mono", monospace;
  --measure: 44.25rem;
  --measure-wrap: 50.25rem;
  --wide: 60rem;
  --t-display: clamp(2.75rem, 7vw, 5.5rem);
  --t-title: 2.5rem;
  --t-section: 1.875rem;
  --t-subsection: 1.5rem;
  --t-minor: 1.25rem;
  --t-body: 1rem;
  --t-small: .875rem;
  --t-caption: .75rem;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {${DARK_TOKENS}
  }
}
:root[data-theme="dark"] {${DARK_TOKENS}
}

*, *::before, *::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; scroll-padding-top: 1rem; }
::selection { color: var(--paper); background: var(--focus); }
body { margin: 0; background: var(--paper); color: var(--ink); font: 400 var(--t-body)/1.5 var(--font-sans); }
img, svg, video { max-width: 100%; height: auto; }
a { color: inherit; text-decoration-color: color-mix(in srgb, var(--ink) 40%, transparent); text-decoration-thickness: 1px; text-underline-offset: 3px; transition: text-decoration-color 100ms; }
a:hover { text-decoration-color: currentColor; }
button, input { font: inherit; }
code, pre, kbd { font-family: var(--font-mono); }
:focus-visible { outline: 2px solid var(--focus); outline-offset: 3px; }
[hidden] { display: none !important; }
[id] { scroll-margin-top: 1rem; }

.skip-link { position: fixed; z-index: 20; inset: .5rem auto auto .5rem; transform: translateY(-200%); padding: .5rem .75rem; background: var(--paper); border: 1px solid var(--ink); }
.skip-link:focus { transform: none; }
.layout { width: min(100%, 76rem); margin-inline: auto; padding-inline: 1.5rem; }
main:focus { outline: 0; }

.site-header { margin-bottom: 3rem; border-bottom: 1px solid var(--rule); }
.site-header-primary { min-height: 4rem; display: flex; align-items: center; gap: 1.5rem; }
.brand-link { margin-right: auto; font-weight: 600; text-decoration: none; white-space: nowrap; }
.site-links { display: flex; align-items: center; gap: 1.5rem; }
.site-links a { min-height: 2.75rem; display: inline-flex; align-items: center; color: var(--ink-2); text-decoration: none; }
.site-links a:hover, .site-links a[aria-current="page"] { color: var(--ink); }
.site-links a[aria-current="page"] { box-shadow: inset 0 -2px var(--ink); font-weight: 600; }
.site-search-link { min-height: 2.75rem; display: inline-flex; align-items: center; gap: .375rem; text-decoration: none; }
.site-search-link svg { width: 1rem; fill: none; stroke: currentColor; stroke-width: 1.8; }
.site-search-link kbd { color: var(--ink-2); font-size: var(--t-caption); }
.theme-toggle { width: 2.75rem; height: 2.75rem; display: inline-grid; place-items: center; margin-left: -.75rem; padding: 0; border: 0; border-radius: 3px; background: transparent; color: var(--ink-2); cursor: pointer; }
.theme-toggle:hover { color: var(--ink); background: var(--wash); }
.theme-toggle svg { width: 1.125rem; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; }
.theme-toggle[aria-pressed="true"] .theme-icon-moon, .theme-toggle[aria-pressed="false"] .theme-icon-sun { display: none; }
.mobile-menu { display: none; }
.site-footer { width: min(100%, var(--measure-wrap)); margin: 6rem auto 0; padding: 1.5rem 3rem 3rem; border-top: 1px solid var(--rule); color: var(--ink-2); font-size: var(--t-small); }
.footer-links { display: flex; flex-wrap: wrap; gap: .75rem 1.5rem; margin-top: .5rem; }

.page-header, .project-page, .project-others, .blog-reading-panel, .blog-home-content,
.blog-featured, .blog-toc, .about-section, .contact-section, .errata-panel,
.errata-policy, .subscribe-route, .research-questions, .research-archive,
.notes-search, .notes-topics, .notes-paths, .notes-activity, .not-found-search,
.not-found-page main > nav { width: min(100%, var(--measure)); margin-inline: auto; }
.page-header { margin-bottom: 2rem; }
h1, .page-header h1, .note-header h1, .blog-post-header h1, .home-title { margin: 0 0 .75rem; font-size: var(--t-title); line-height: 1.2; font-weight: 700; letter-spacing: -.025em; overflow-wrap: anywhere; }
h2 { margin: 3rem 0 1rem; font-size: var(--t-section); line-height: 1.3; font-weight: 600; }
h3 { margin: 2rem 0 .75rem; font-size: var(--t-subsection); line-height: 1.3; font-weight: 600; }
h4 { font-size: var(--t-minor); line-height: 1.3; font-weight: 600; }
h5, h6 { font-size: var(--t-body); line-height: 1.5; font-weight: 600; }
.page-intro, .section-intro, .muted { color: var(--ink-2); }
.page-intro { margin: 0; }
.plain-list { list-style: none; padding: 0; margin: 1rem 0; }
.plain-list > li { padding: .75rem 0; border-bottom: 1px solid var(--rule); }
.plain-list p { margin: .25rem 0 0; color: var(--ink-2); }

.breadcrumb { width: min(100%, var(--measure)); margin: 0 auto 1.5rem; color: var(--ink-2); font-size: var(--t-small); }
.breadcrumb ol { display: flex; flex-wrap: wrap; gap: .25rem 0; list-style: none; padding: 0; margin: 0; }
.breadcrumb li { min-width: 0; overflow-wrap: anywhere; }
.breadcrumb li + li::before { content: "/"; padding-inline: .5rem; color: var(--ink-3); }
.breadcrumb [aria-current="page"] { color: var(--ink); }

/* Shared disclosure and page-row vocabulary. */
details > summary { cursor: pointer; }
.topic-row > summary, .reading-path > summary, .research-archive > summary, .repo-map > summary, .notion-toggle > summary { position: relative; list-style: none; min-height: 2.75rem; padding: .625rem 0 .625rem 1.5rem; }
details > summary::-webkit-details-marker { display: none; }
.topic-row > summary::before, .reading-path > summary::before, .research-archive > summary::before, .repo-map > summary::before, .notion-toggle > summary::before { content: "▸"; position: absolute; left: 0; color: var(--ink-2); transition: transform 150ms; }
details[open] > summary::before { transform: rotate(90deg); }
.page-rows { list-style: none; padding: 0; margin: 0; border-top: 1px solid var(--rule); }
.page-row { border-bottom: 1px solid var(--rule); }
.page-row > a { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) fit-content(40%); gap: .25rem 1rem; min-height: 3.5rem; padding: .75rem; text-decoration: none; transition: background 100ms; }
.page-row > a:hover { background: var(--wash); }
.page-row > a:focus-visible { outline-offset: -2px; }
.page-row-title { font-weight: 600; }
.page-row-description { grid-column: 1; color: var(--ink-2); font-size: var(--t-small); }
.page-row-meta { grid-column: 2; grid-row: 1 / span 2; color: var(--ink-2); font-size: var(--t-small); font-variant-numeric: tabular-nums; text-align: right; }
.status-legend { color: var(--ink-2); font-size: var(--t-small); }

/* Home spends the visual emphasis on four large disclosure labels. */
.home-index { width: min(100%, 60rem); margin-inline: auto; }
.home-index > h1 { font-size: var(--t-title); }
.home-lede { max-width: var(--measure); margin: 0; color: var(--ink-2); }
.home-instruction { margin: 1.5rem 0 .5rem; font-size: var(--t-small); color: var(--ink-2); }
.home-disclosures { border-top: 1px solid var(--rule); }
.home-disclosures > details { border-bottom: 1px solid var(--rule); }
.home-disclosures > details > summary { position: relative; display: grid; grid-template-columns: 2rem minmax(0, 1fr) auto; align-items: baseline; min-height: 6.5rem; padding: .5rem 0; list-style: none; }
.home-disclosures > details > summary::before { content: "▸"; grid-column: 1; color: var(--ink-2); font-size: 1.5rem; transform-origin: center; transition: transform 150ms; }
.home-disclosures > details[open] > summary::before { transform: rotate(90deg); }
.home-disclosures > details > summary > span { grid-column: 2; font-size: var(--t-display); line-height: 1; font-weight: 700; letter-spacing: -.03em; }
.home-disclosures > details > summary > small { grid-column: 3; color: var(--ink-2); font-size: var(--t-small); font-weight: 400; }
.home-panel { max-width: var(--measure); margin-left: 2rem; padding: 0 0 2rem; }
.home-panel h2 { font-size: var(--t-minor); margin-top: 1.5rem; }
.contact-links { list-style: none; padding: 0; margin: 1rem 0; }
.contact-links li { padding: .375rem 0; }
.contact-label { display: inline-block; width: 5rem; color: var(--ink-2); }

/* Notes index and search. */
.notes-search { margin-bottom: 3rem; }
.topic-search-label { display: block; margin-bottom: .5rem; font-weight: 600; }
.search-field { display: flex; gap: .5rem; }
.topic-search { width: 100%; min-width: 0; min-height: 2.75rem; padding: .625rem .75rem; border: 1px solid transparent; border-radius: 3px; background: var(--wash); color: var(--ink); }
.topic-search:focus { border-color: var(--focus); outline: 2px solid var(--focus); outline-offset: 1px; }
.search-submit, .secondary-action, .text-button, .primary-action { min-height: 2.75rem; padding: .5rem .75rem; border: 0; border-radius: 0; background: transparent; color: var(--ink); text-decoration: underline; text-underline-offset: 3px; cursor: pointer; }
.search-submit { border: 1px solid var(--rule); text-decoration: none; }
.topic-search-status, .search-no-js { margin: .5rem 0; color: var(--ink-2); font-size: var(--t-small); }
.search-results { list-style: none; margin: 1rem 0 0; padding: 0; border-top: 1px solid var(--rule); }
.search-result { padding: .75rem 0; border-bottom: 1px solid var(--rule); }
.search-result-link { font-weight: 600; }
.search-result-meta, .search-result-snippet { margin: .25rem 0 0; color: var(--ink-2); font-size: var(--t-small); }
.search-suggestions { margin: .5rem 0; }
.topic-rows, .reading-paths { border-top: 1px solid var(--rule); }
.topic-row, .reading-path { border-bottom: 1px solid var(--rule); }
.topic-row > summary { display: grid; grid-template-columns: 1fr auto; gap: .25rem 1rem; }
.topic-row-title, .reading-path-title { font-size: var(--t-body); font-weight: 600; }
.topic-row-count, .topic-row-description, .reading-path-audience { color: var(--ink-2); font-size: var(--t-small); }
.topic-row-description { grid-column: 1 / -1; }
.topic-row-body, .reading-path-body { padding: 0 0 1rem 1.5rem; }
.topic-row-notes { columns: 2 18rem; list-style: none; padding: 0; }
.topic-row-note { break-inside: avoid; padding: .25rem 0; }
.topic-row-note-nested { padding-left: 1rem; }
.reading-path-title { display: inline; margin: 0; }
.reading-path-audience { display: block; }
.reading-path-steps { padding-left: 1.5rem; }
.reading-path-steps li { margin: .5rem 0; }
.reading-path-steps p { margin: .125rem 0; color: var(--ink-2); font-size: var(--t-small); }

/* Publication properties and note shell. */
.note-layout { width: min(100%, var(--measure-wrap)); margin-inline: auto; padding-inline: 3rem; }
.note-layout .breadcrumb, .note-header, .note-body { width: 100%; max-width: var(--measure); margin-inline: auto; }
.note-header { margin-bottom: 1.5rem; }
.topic-parent { display: none; }
.topic-meta { color: var(--ink-2); }
.note-publication { display: inline-flex; flex-wrap: wrap; align-items: center; gap: .375rem; margin-left: .5rem; font-size: var(--t-caption); }
.note-status, .topic-label, .note-label { display: inline-flex; padding: .125rem .375rem; border-radius: 3px; font-size: var(--t-caption); line-height: 1.35; }
.note-status-working { color: var(--working-ink); background: var(--working-bg); }
.note-status-reviewed { color: var(--reviewed-ink); background: var(--reviewed-bg); }
.note-status-archived { color: var(--archived-ink); background: var(--archived-bg); }
.note-type { color: var(--ink-2); }
.note-provenance { margin: 0; padding: .75rem 1rem; border-radius: 3px; background: var(--wash); font-size: var(--t-small); }
.note-provenance-facts { display: flex; flex-wrap: wrap; gap: .5rem 1.5rem; margin: 0; }
.note-provenance-facts div { display: flex; gap: .375rem; }
.note-provenance-facts dt { color: var(--ink-2); }
.note-provenance-facts dd { margin: 0; }
.note-provenance-summary { margin: .5rem 0 0; color: var(--ink-2); }
.note-provenance-label { font-weight: 600; }
.note-related, .next-reading { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid var(--rule); }
.note-related h2 { font-size: var(--t-minor); margin-top: 0; }
.note-related ul { list-style: none; padding: 0; }
.note-related li { padding: .75rem 0; border-bottom: 1px solid var(--rule); }
.note-related p, .next-reading p { margin: .25rem 0; color: var(--ink-2); }
.next-reading-link { display: block; text-decoration: none; }
.next-reading-label { display: block; color: var(--ink-2); font-size: var(--t-caption); }
.topic-pillar { margin: 0 0 3rem; }
.topic-pillar h2 { margin-top: 0; }
.topic-pillar-intro { color: var(--ink-2); }
.topic-pillar-path { border-top: 1px solid var(--rule); }
.topic-pillar-path-section { border-bottom: 1px solid var(--rule); }
.topic-pillar h3 { font-size: var(--t-minor); }
.topic-labels { display: flex; flex-wrap: wrap; gap: .375rem; margin: .75rem 0; }
.topic-label { background: var(--wash); }

/* Technical content. */
.notion-page-content, .blog-article { overflow-wrap: break-word; }
.notion-heading { font-weight: 600; }
.notion-heading-1 { font-size: var(--t-section); }
.notion-heading-2 { font-size: var(--t-subsection); }
.notion-heading-3 { font-size: var(--t-minor); }
.notion-heading-4, .notion-heading-5, .notion-heading-6 { font-size: var(--t-body); }
.notion-paragraph { margin: .75rem 0; }
.note-list { padding-left: 1.5rem; }
.notion-quote, .blog-article blockquote { margin: 1rem 0; padding-left: 1rem; border-left: 2px solid var(--ink); color: var(--ink-2); }
.notion-divider { border: 0; border-top: 1px solid var(--rule); margin: 2rem 0; }
.note-inline-code, .blog-article :not(pre) > code { padding: .125rem .25rem; border-radius: 3px; background: var(--wash); color: inherit; font-size: .875em; }
.notion-code, .code-block { position: relative; margin: 1rem 0; }
.note-code-block, .blog-article pre, .project-artifact pre { max-width: 100%; margin: 1rem 0; padding: 1rem; overflow-x: auto; border: 1px solid transparent; border-radius: 3px; background: var(--wash); color: var(--ink); font: 400 var(--t-small)/1.5 var(--font-mono); tab-size: 4; }
.note-code-block code, .blog-article pre code, .project-artifact pre code { white-space: pre; font: inherit; }
.note-scroll, .notion-equation, mjx-container[display="true"] { max-width: 100%; overflow-x: auto; overflow-y: hidden; border-inline-end: 3px solid transparent; }
.is-overflowing:not(.is-at-end) { border-inline-end-color: var(--ink-2); }
.notion-table, .blog-article table { min-width: 100%; border-collapse: collapse; font-size: var(--t-small); }
th, td { padding: .5rem .75rem; border: 1px solid var(--rule); text-align: left; vertical-align: top; }
th { background: var(--wash); font-weight: 600; }
.notion-caption, figcaption { margin-top: .375rem; color: var(--ink-2); font-size: var(--t-small); }
.note-callout, .notion-bookmark, .notion-embed, .notion-link-preview, .notion-synced-block, .notion-template, .notion-table-of-contents { margin: 1rem 0; padding: .75rem 1rem; border-radius: 3px; background: var(--wash); }
.note-callout { display: flex; gap: .75rem; }
.notion-column-list { display: flex; flex-wrap: wrap; gap: 1.5rem; }
.notion-column { flex: 1 1 14rem; min-width: 0; }
.note-child-database { margin: 2rem 0; }
.note-child-database-title { font-size: var(--t-minor); }
.note-database-entries { border-top: 1px solid var(--rule); }
.note-child-page { padding: .75rem; border-bottom: 1px solid var(--rule); }
.note-child-page h3 { display: inline; margin: 0; font-size: var(--t-body); }
.note-child-page-link { font-weight: 600; }
.note-asset { margin: 1.5rem 0; }
.note-asset img, .blog-article img { display: block; border-radius: 3px; background: #fff; }
mark { background: var(--working-bg); color: var(--working-ink); }
.notion-color-gray { color: #686763; } .notion-color-brown { color: #7d4b3b; } .notion-color-orange { color: #9a4b08; } .notion-color-yellow { color: #80600f; } .notion-color-green { color: #356b4a; } .notion-color-blue { color: #315f9c; } .notion-color-purple { color: #70489a; } .notion-color-pink { color: #96366c; } .notion-color-red { color: #a92f29; }
.notion-color-gray_background, .notion-color-brown_background, .notion-color-orange_background, .notion-color-yellow_background, .notion-color-green_background, .notion-color-blue_background, .notion-color-purple_background, .notion-color-pink_background, .notion-color-red_background { background: var(--wash); }

.crumb-collapse { display: none; }
.crumb-collapse details { display: inline; }
.crumb-collapse summary { display: inline-flex; min-width: 2.75rem; min-height: 2.75rem; align-items: center; justify-content: center; list-style: none; }
.crumb-collapse summary::-webkit-details-marker { display: none; }
.crumb-collapse ol { position: static; display: grid; gap: .25rem; margin: .25rem 0 .5rem; padding: 0 0 0 1rem; list-style: none; }
.crumb-collapse ol li::before { content: none; }
@media (max-width: 47.99rem) {
  .crumb-middle { display: none; }
  .crumb-collapse { display: list-item; list-style: none; }
}
@media (prefers-color-scheme: dark) {${darkNotionColors(':root:not([data-theme="light"])')}
}${darkNotionColors(':root[data-theme="dark"]')}
/* Long tokens wrap; MathJax's hidden MathML copy stays inside its container. */
.notion-page-content :is(p, li, td, th, dd, figcaption, blockquote, summary, h2, h3, h4, h5, h6), .blog-article :is(p, li, td, th, blockquote, h2, h3, h4), .errata-entry, .page-row, .project-page, .about-section { overflow-wrap: anywhere; }
/* Note-shell text (gaps, outline, related, provenance, search results) can hold long identifiers; wrap them on narrow screens. */
.note-known-gaps :is(li, p), .document-outline li, .note-related :is(li, p), .note-provenance, .next-reading, .search-result, .topic-row-note, .reading-path-steps :is(li, p) { overflow-wrap: anywhere; }
.note-inline-code, .blog-article :not(pre) > code { overflow-wrap: anywhere; }
.note-callout-body, .notion-column, .code-block, .notion-code { min-width: 0; }
mjx-container { position: relative; }
mjx-container:not([display="true"]) { max-width: 100%; }
mjx-assistive-mml { max-width: 100%; right: 0; overflow: hidden; }
/* Project, writing, profile, errata: shared tokens but recognizable composition. */
.project-list { width: min(100%, var(--wide)); margin-inline: auto; border-top: 1px solid var(--rule); }
.project-summary { display: grid; grid-template-columns: 1fr auto; gap: .25rem 2rem; padding: 1rem 0; border-bottom: 1px solid var(--rule); }
.project-summary h2 { margin: 0; font-size: var(--t-minor); }
.project-summary p { margin: 0; }
.project-summary > :not(h2):not(.project-status) { grid-column: 1; }
.project-status { grid-column: 2; grid-row: 1 / span 3; color: var(--ink-2); font-size: var(--t-small); }
.project-facts { margin: 1.5rem 0; }
.project-facts div { display: grid; grid-template-columns: 6rem 1fr; gap: 1rem; padding: .25rem 0; }
.project-facts dt { color: var(--ink-2); }
.project-facts dd { margin: 0; }
.project-links { display: flex; flex-wrap: wrap; gap: 1.5rem; }
.project-section h2 { font-size: var(--t-subsection); }
.project-artifact { margin: 1rem 0; }

/* Projects index: a ruled grid of dossier cards; each whole card is the link. */
.projects-page .page-header, .projects-index { width: min(100%, var(--wide)); margin-inline: auto; }
.project-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr)); margin: 0; padding: 0; list-style: none; border-top: 1px solid var(--rule); border-left: 1px solid var(--rule); }
.project-grid > li { display: flex; border-right: 1px solid var(--rule); border-bottom: 1px solid var(--rule); }
.project-card { flex: 1; display: flex; flex-direction: column; gap: .75rem; min-height: 19rem; padding: 1.75rem 1.75rem 1.5rem; text-decoration: none; transition: background 120ms; }
.project-card:hover { background: var(--wash); }
.project-card:focus-visible { outline-offset: -2px; }
.project-card-status { color: var(--accent); font: 500 var(--t-caption)/1.5 var(--font-mono); letter-spacing: .04em; }
.project-card-title { margin: 1.25rem 0 0; font-size: var(--t-section); line-height: 1.1; font-weight: 700; letter-spacing: -.03em; }
.project-card-summary { max-width: 34rem; color: var(--ink-2); }
.project-card-role { color: var(--ink-2); font-size: var(--t-small); border-left: 2px solid var(--rule); padding-left: .75rem; }
.project-card-footer { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; gap: .5rem 1rem; margin-top: auto; padding-top: 1rem; }
.project-card-link { font-weight: 600; font-size: var(--t-small); }
.project-card-link span { display: inline-block; transition: transform 120ms; }
.project-card:hover .project-card-link span { transform: translateX(3px); }
.project-card-footer time { color: var(--ink-2); font: 400 var(--t-caption) var(--font-mono); }

/* Search dialog: a raised panel over the dimmed page, opened with Cmd/Ctrl+K. */
.search-dialog { width: min(calc(100% - 2rem), 40rem); max-height: min(34rem, calc(100dvh - 6rem)); margin: 12vh auto auto; padding: 0; border: 1px solid var(--rule); border-radius: 12px; background: var(--raised); color: var(--ink); box-shadow: 0 1px 2px rgb(0 0 0 / .08), 0 16px 48px rgb(0 0 0 / .22); overflow: hidden; }
.search-dialog[open] { display: flex; animation: search-dialog-in 140ms ease-out; }
.search-dialog::backdrop { background: var(--scrim); }
@keyframes search-dialog-in { from { opacity: 0; transform: translateY(-6px) scale(.985); } }
.search-dialog-panel { flex: 1; display: flex; flex-direction: column; min-width: 0; min-height: 0; }
.search-dialog-form { display: flex; align-items: center; gap: .75rem; padding: .5rem .75rem .5rem 1.125rem; border-bottom: 1px solid var(--rule); }
.search-dialog-form > svg { flex: none; width: 1.125rem; fill: none; stroke: var(--ink-2); stroke-width: 1.8; }
.search-dialog-input { flex: 1; min-width: 0; min-height: 2.75rem; padding: 0; border: 0; background: transparent; color: var(--ink); font-size: 1.0625rem; }
.search-dialog-input:focus { outline: 0; }
.search-dialog-input::-webkit-search-cancel-button { display: none; }
.search-dialog-close { min-height: 2rem; padding: 0 .5rem; border: 1px solid var(--rule); border-radius: 4px; background: transparent; color: var(--ink-2); font: 400 var(--t-caption) var(--font-mono); cursor: pointer; }
.search-dialog-status { margin: 0; padding: .75rem 1.125rem .25rem; color: var(--ink-2); font-size: var(--t-caption); font-weight: 600; }
.search-dialog-results { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; margin: 0; padding: .25rem .5rem .5rem; list-style: none; }
.search-dialog-results .search-result { position: relative; padding: .5rem .625rem; border: 0; border-radius: 6px; }
.search-dialog-results .search-result:hover, .search-dialog-results .search-result:focus-within { background: var(--wash); }
.search-dialog-results .search-result-link { text-decoration: none; }
.search-dialog-results .search-result-link::after { content: ""; position: absolute; inset: 0; border-radius: 6px; }
.search-dialog-results .search-result-link:focus-visible { outline: 0; }
.search-dialog-results .search-result:focus-within { box-shadow: inset 2px 0 var(--focus); }
.search-dialog-results .search-result-meta { display: flex; flex-wrap: wrap; gap: .25rem .5rem; margin: .125rem 0 0; font-size: var(--t-caption); }
.search-dialog-results .note-publication { margin-left: 0; }
.search-dialog-results .search-result-snippet { margin: .25rem 0 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.search-dialog-results .search-empty { padding: 0 .625rem; }
.search-dialog-footer { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem 1.25rem; padding: .625rem 1.125rem; border-top: 1px solid var(--rule); color: var(--ink-2); font-size: var(--t-caption); }
.search-dialog-footer kbd { display: inline-block; min-width: 1.25rem; margin-right: .125rem; padding: 0 .25rem; border: 1px solid var(--rule); border-radius: 3px; font-size: .6875rem; text-align: center; }
.search-dialog-footer a { margin-left: auto; color: var(--ink); }
.blog-post-list { list-style: none; margin: 0; padding: 0; }
.blog-post-item { border-bottom: 1px solid var(--rule); }
.blog-post-link { display: grid; grid-template-columns: 2.25rem minmax(0, 1fr) fit-content(30%); gap: .125rem 1rem; align-items: baseline; padding: .75rem .5rem .75rem 0; text-decoration: none; transition: background 100ms; }
.blog-post-link:hover { background: var(--wash); }
.blog-post-link:focus-visible { outline-offset: -2px; }
.blog-post-chapter { color: var(--accent); font: 500 var(--t-small)/1.5 var(--font-mono); text-align: right; }
.blog-post-title { display: block; font-weight: 600; }
.blog-post-description { display: block; margin-top: .125rem; color: var(--ink-2); font-size: var(--t-small); }
.blog-post-link time, .blog-post-tags, .blog-post-section, .blog-post-dates, .blog-acknowledgements, .blog-correction-note { color: var(--ink-2); font-size: var(--t-small); }
.blog-post-link time { font-family: var(--font-mono); font-size: var(--t-caption); white-space: nowrap; }

/* Writing index: each manifest section is its own shelf under a heavy rule. */
.blog-kicker, .blog-post-kicker { margin: 0 0 .5rem; color: var(--accent); font: 500 var(--t-caption)/1.5 var(--font-mono); letter-spacing: .08em; text-transform: uppercase; }
.blog-post-kicker a { text-decoration: none; }
.blog-post-kicker a:hover { text-decoration: underline; }
.blog-topic-index { display: flex; flex-wrap: wrap; gap: .5rem; margin: 1.5rem 0 0; }
.blog-topic-index a { display: inline-flex; align-items: center; gap: .5rem; min-height: 2.25rem; padding: .25rem .75rem; border: 1px solid var(--rule); border-radius: 999px; font-size: var(--t-small); text-decoration: none; }
.blog-topic-index a:hover { border-color: var(--ink-2); background: var(--wash); }
.blog-topic-index span { color: var(--accent); font: 500 var(--t-caption) var(--font-mono); }
.blog-section-group { margin-top: 3.5rem; }
.blog-section-header { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: baseline; gap: .25rem 1rem; padding: .75rem 0 1rem; border-top: 2px solid var(--ink); border-bottom: 1px solid var(--rule); }
.blog-section-heading { margin: 0; font-size: var(--t-subsection); letter-spacing: -.015em; }
.blog-section-count { color: var(--ink-2); font: 400 var(--t-caption) var(--font-mono); }
.blog-section-subtitle { grid-column: 1 / -1; margin: 0; color: var(--ink-2); }
.blog-acknowledgements { width: min(100%, var(--measure)); margin: 3rem auto 0; }

/* Writing post: topic kicker, title, dates, then tags beside the share action. */
.blog-post-header { margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--rule); }
.post-properties { display: flex; flex-wrap: wrap; gap: .25rem 1.5rem; margin: 0 0 1.25rem; font: 400 var(--t-caption)/1.5 var(--font-mono); }
.post-properties > div { display: flex; gap: .5rem; }
.post-properties dt { color: var(--ink-2); }
.post-properties dd { margin: 0; color: var(--accent); }
.blog-post-meta-actions .topic-labels { flex: 1 1 auto; margin: 0; }
.blog-post-meta-actions .topic-label { padding: .125rem .625rem; border: 1px solid var(--rule); border-radius: 999px; background: transparent; font-size: var(--t-small); text-decoration: none; }
.blog-post-meta-actions .topic-label:hover { border-color: var(--ink-2); background: var(--wash); }
.blog-share-button { min-height: 2.25rem; margin-left: auto; padding: .25rem .875rem; border: 1px solid var(--ink); border-radius: 3px; background: transparent; color: var(--ink); font-size: var(--t-small); font-weight: 600; cursor: pointer; }
.blog-share-button:hover { background: var(--ink); color: var(--paper); }
.copy-status { color: var(--ink-2); font-size: var(--t-small); }
.copy-status:empty { display: none; }
.blog-post-nav a:last-child { text-align: right; }
.blog-post-nav span { color: var(--ink-2); font-size: var(--t-caption); }
.blog-back { display: inline-block; margin-top: 2rem; }
.blog-post-meta-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 1rem; }
.blog-post-nav { display: flex; justify-content: space-between; gap: 1rem; margin-top: 3rem; padding-top: 1rem; border-top: 1px solid var(--rule); }
.experience-list, .errata-log { list-style: none; padding: 0; }
.experience-list li, .research-question, .errata-entry { padding: 1rem 0; border-bottom: 1px solid var(--rule); }
.experience-list p, .research-question p, .errata-entry p { margin: .375rem 0; }
.errata-original, .errata-entry-meta { color: var(--ink-2); }
.errata-change { margin-top: .75rem; padding: .75rem 1rem; border-radius: 3px; background: var(--wash); }
.errata-change p { display: grid; grid-template-columns: 4rem minmax(0, 1fr); gap: .75rem; }
.errata-change span { font-weight: 600; color: var(--ink); }
.repo-group h3, .research-topic h3 { font-size: var(--t-body); }

/* Technical interaction hooks added by notes-content. These apply at every width;
   they must stay out of the mobile media query below. */
.visually-hidden { position: absolute !important; width: 1px !important; height: 1px !important; padding: 0 !important; margin: -1px !important; overflow: hidden !important; clip: rect(0 0 0 0) !important; white-space: nowrap !important; border: 0 !important; }
.code-block-header { min-height: 2rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: .25rem .5rem; color: var(--ink-2); font-size: var(--t-caption); }
.code-block-header + pre { margin-top: 0; }
.copy-action { min-width: 2.75rem; min-height: 2.75rem; padding: .25rem .5rem; border: 0; background: transparent; color: var(--ink); text-decoration: underline; text-underline-offset: 3px; cursor: pointer; }
.document-outline { margin: 0 0 2rem; border-block: 1px solid var(--rule); }
.document-outline summary { min-height: 2.75rem; display: flex; align-items: center; font-weight: 600; }
.document-outline ol { margin: 0 0 1rem; padding-left: 1.5rem; font-size: var(--t-small); }
.document-outline li { margin: .375rem 0; }
.document-outline .outline-level-3 { margin-left: 1rem; }
.note-known-gaps { margin-top: .75rem; border-top: 1px solid var(--rule); }
.note-known-gaps > summary { min-height: 2.75rem; display: flex; align-items: center; font-weight: 600; }
.note-known-gaps ul { margin: 0 0 .75rem; }
.contents-groups { border-top: 1px solid var(--rule); }
.contents-group { border-bottom: 1px solid var(--rule); }
.contents-group > summary { min-height: 2.75rem; display: grid; grid-template-columns: 1.5rem 1fr auto; align-items: center; list-style: none; }
.contents-group > summary::-webkit-details-marker { display: none; }
.contents-group > summary::before { content: "▸"; grid-column: 1; color: var(--ink-2); transition: transform 150ms; }
.contents-group[open] > summary::before { transform: rotate(90deg); }
.contents-group > summary > span { grid-column: 2; font-weight: 600; }
.contents-group > summary > small { grid-column: 3; color: var(--ink-2); font-size: var(--t-small); }
.contents-group .page-rows { margin-left: 1.5rem; }

@media (max-width: 47.99rem) {
  :root { --t-title: 2rem; }
  .layout { padding-inline: 1.25rem; }
  .site-header { margin-bottom: 2rem; }
  .site-header-primary { flex-wrap: wrap; gap: 0 1rem; padding-block: .375rem; }
  .site-links-desktop { display: none; }
  .site-search-link { margin-left: auto; }
  .site-search-link kbd { display: none; }
  .mobile-menu { display: block; order: 4; width: 100%; }
  .mobile-menu > summary { min-height: 2.75rem; display: flex; align-items: center; justify-content: flex-end; list-style: none; }
  .mobile-menu > nav { display: grid; border-top: 1px solid var(--rule); }
  .mobile-menu > nav a { min-height: 2.75rem; display: flex; align-items: center; text-decoration: none; border-bottom: 1px solid var(--rule); }
  .site-footer { margin-top: 4rem; padding-inline: 0; }
  .home-disclosures > details > summary { min-height: 4.5rem; grid-template-columns: 1.5rem minmax(0, 1fr) auto; }
  .home-disclosures > details > summary::before { font-size: 1rem; }
  .home-panel { margin-left: 1.5rem; }
  .note-layout { padding-inline: 0; }
  .search-field { align-items: stretch; }
  .topic-row-notes { columns: 1; }
  .page-row > a, .project-summary { grid-template-columns: 1fr; }
  .page-row-meta, .project-status { grid-column: 1; grid-row: auto; text-align: left; }
  .page-row-description { grid-column: 1; }
  .blog-post-link { grid-template-columns: 2rem minmax(0, 1fr); }
  .blog-post-link time { grid-column: 2; }
  .blog-share-button { margin-left: 0; }
  .project-card { min-height: 0; padding: 1.25rem; }
  .project-card-title { margin-top: .5rem; font-size: var(--t-subsection); }
  .search-dialog { margin-top: 1rem; max-height: calc(100dvh - 2rem); }
  .search-dialog-footer > span { display: none; }
  .project-facts div { grid-template-columns: 5rem minmax(0, 1fr); }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
}

@media print {
  :root:is([data-theme], :not([data-theme])) { color-scheme: light; --paper: #fff; --ink: #000; --ink-2: #333; --rule: #bbb; --wash: #f5f5f5; }
  .site-header, .site-footer, .skip-link, button, .site-search-link, .copy-action, .search-dialog { display: none !important; }
  .layout, .note-layout { width: 100%; max-width: none; padding: 0; }
  details:not([open]) > *:not(summary) { display: block !important; }
  details > summary::before { display: none; }
  pre, table, figure, blockquote { break-inside: avoid; }
  a { text-decoration-color: currentColor; }
}
`;

module.exports = { SITE_CSS };
