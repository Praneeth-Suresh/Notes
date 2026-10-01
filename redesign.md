# Redesign plan: UI/UX

Prepared and revised 30 September 2026 against commit `a1cbdec` ("Implement website audit… Notion-inspired visual system"). This is the implementation brief for styling, layout, navigation and interaction. It preserves the notes, posts, project claims and substantive technical content. Interface labels, help text and placement of existing content may change. Do not rewrite biography, invent evidence or silently discard content during consolidation.

**All ten section 5 defaults are accepted by the owner.** They are recorded as decisions there, not questions to ask again. This revision changes the plan only; implementation is a separate task. Recruiters and collaborators remain the primary audience, knowledge exploration is the main outcome, and unfinished notes stay public with clear status.

Original assessment evidence: the site was built locally, served from `dist/`, and measured in Playwright (Chromium) at 1440 × 900 and 390 × 844. Computed styles were measured on 15 routes with screenshots. The assessment also measured two references:

- `colin-moy.webflow.io`: its default, scrolled and opened-Portfolio states.
- A public Notion page (`notion.notion.site`).

Screenshots are in `audit-evidence/redesign-2026-09-30/`. That folder is gitignored. The revision rechecked source and Playwright DOM/layout on Home, Notes, Algorithms, DFS, How to Win a Hackathon and Beryl at both widths, and reviewed existing screenshots. It did not repeat the reference measurements or the earlier exhaustive audit. The current build has **158 canonical directory-index routes plus `/404.html`**; `/collaborate/` is already a redirect. Derive future counts from the build rather than hard-coding 159. Tablet, screen-reader and performance checks are implementation acceptance work, not results claimed by this review.

---

## 1. Diagnosis

### 1.1 Where the site is now

Commit `a1cbdec` removed the loudest problems: the dark Home with its gradients, the AI-generated illustrations, 1,344 px sections holding about 8 words each, the `[H] Home` keyboard-letter nav, `[ bracket ]` eyebrows and the subscribe panels. The site is now calm, but it looks generic. It reads like a default documentation theme with a portfolio bolted on. It no longer looks loudly AI-made. It looks like what an AI makes when you ask for "clean".

The remaining problem is inconsistent hierarchy and behavior: several parts look alike without working alike. "AI-generated" describes the owner's impression, not a finding about authorship. Type counts, cards and repeated navigation are clues to inspect, not universal rules for identifying poor design. The quality target is a site whose layout makes the next action obvious and whose reading experience stays predictable.

### 1.2 Measured problems

| # | Problem | Evidence (Playwright, computed styles) | Why it reads as sloppy or AI-made |
|---|---|---|---|
| 1 | Type hierarchy lacks clear roles | The original sample recorded 11–15 computed sizes per page, including many close values between 12 and 15 px; the sampled reference states had about 7. | Several neighboring UI sizes lack a clear purpose. Inspect role consistency; fractional values or extra math sizes alone do not establish a defect. |
| 2 | Too many weights | 400, 550, 600, 650 and 700 on most pages, plus 900 on `/topics/algorithms/`. | The interface has no clear role for each weight; fallback fonts may also map intermediate weights differently. Three deliberate weights are enough for this design. |
| 3 | Repeated status pills | `/notes/` contains **129 "Working note" labels in the DOM**, including collapsed groups and repeated placements. They are not all visible simultaneously. | The status matters, but repetition creates clutter when lists open. Use a visible default-status legend per listing and tags for exceptions. |
| 4 | Repeated notice text | Every note repeats "Open notebook entry: incomplete or not yet checked. Known factual errors are still corrected." in a 240 px sticky rail. | Identical notice text on every page is a classic generated-site tell. |
| 5 | Gateway headers repeat a formula | Several gateway pages use an uppercase eyebrow repeating the title (NOTES, WRITING, ABOUT, CONTACT), then a similar H1, grey lede and boxes. | Repetition weakens page identity. Share tokens and header mechanics while distinguishing index, article and profile composition. |
| 6 | Cards on a tinted canvas | `#F7F7F5` background with white, 4 px radius, 1 px `#D9DDDC` bordered cards. | The nested surfaces add visual weight to short text. The preferred sampled Notion page uses a plain white reading surface; plain rows better suit this brief. |
| 7 | Artifact captions without their artifact | Home copies `project.artifact.label` into summary cards without calling `renderArtifact`; Playwright confirms 0 figures there. On Beryl, the artifact is a valid code/log figure with no image. | The wording refers to evidence absent from the summary. Omit that caption from Home or show the actual excerpt; absence of an `<img>` alone is not a defect. |
| 8 | A button trio | Three equal-weight bordered buttons, "Start here / Browse the notes / About me", straight after the intro. | The landing-page template. Three equal choices mean the page hasn't decided what matters. |
| 9 | Blue underlined links everywhere | `rgb(49,95,156)` underlined links make up 145 text runs on `/notes/`. Card titles are links too. | The page looks like a list of links, not a document. Notion keeps links in the text colour with a faint underline. |
| 10 | Inconsistent horizontal alignment | The 672 px reading measure sits left inside a 1,112 px container, while some cards span wider and header links align right. | The large unused right margin lacks a consistent job. Centre the reading column and align intentional wider regions around it. |
| 11 | Identity is split across labels | The wordmark says "Praneeth's CS Field Notes" and the Home H1 says "Praneeth Suresh". | A person and publication can coexist, but the owner has chosen one identity: Praneeth Suresh. Apply it consistently to the shell and metadata. |
| 12 | Navigation roles overlap | Header, footer, breadcrumb, rail and "In Algorithms" body link repeat some destinations. | Global navigation, location and continuation each have a useful job. Remove redundant parent links and the footer sitemap while retaining navigation on mobile. Colin Moy's one-page navigation is not sufficient for a deep archive. |
| 13 | Skipped heading levels | Blog posts go straight from H1 to H3, with no H2. Topic-root group titles are H3s styled as 13.6 px uppercase labels. | Breaks the outline for assistive technology, and the heading tags don't match how they look. |
| 14 | Pages that are too long | `/topics/algorithms/` is 18,173 px on desktop and 24,127 px on mobile, because the full reading-order box comes before the body. | The index and the article compete on one page. |
| 15 | Reading and overflow treatment need consistency | Note body text drops to 16 px on mobile but is 17 px on desktop. Wide DFS code stays inside scrolling `pre` blocks. | Responsive sizing is not inherently wrong, and local code scrolling is correct. Adopt a deliberate body scale and show when a block has more content to the right. |
| 16 | Theme control competes for space | A sun-icon theme toggle occupies header space. | Removing it is the accepted simplification, not a usability defect by itself. System light/dark preference still needs complete styling. |

### 1.3 What the references actually do

**Colin Moy (measured):**

- **Everything comes from one device.** The "O" in COLIN, MOY, ABOUT, PORTFOLIO and CONTACT is the same white pill with a black pupil. The marquee band is a pill, and the portfolio items are pill-shaped capsules (large border radius). One shape runs through the whole site, which is why it feels coherent.
- **The section words are the navigation.** There is no nav bar. `About`, `Portfolio` and `Contact` are 90 px headings (60 px on mobile) that link to `#about` and `#portfolio`, and clicking one opens its content in place.
- **It keeps a tight budget in the measured states.** One display family (Beckman), 7 observed sizes, 3 weights, one background colour (`#F8CB74`), black and white. An observed transition was `opacity 0.2s`; this is not a complete inventory of its scripts or animation.
- **Mobile keeps the same vocabulary.** The words and pills scale down, the capsule row becomes a 3-column grid, and nothing is added or removed.
- **Don't copy its flaws.** It uses 9 H1s. It splits words for screen readers ("Portf" + "Lio"). Content hidden until you click has no visible affordance, and it shows the Webflow badge.

**Notion (measured on a public page):**

- Font stack `ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI Variable Display", "Segoe UI", Helvetica, …`.
- Page title 40 px / 48 px, weight 700. Body 16 px / 24 px, weight 400.
- Text colour `#2C2C2B` on white `#FFFFFF`, in a centred content column 720 px wide.
- List items separated by hairline dividers, with no cards.
- Links in the text colour with a light underline.

The useful direction is **a restrained type hierarchy, a centred column, and structure carried by indentation, properties and selective disclosure**. Exact counts and values from one Notion page are references, not product-wide specifications.

---

## 2. Design direction

### 2.1 The one idea

**A personal technical notebook, with a large typographic index and quiet reading pages.** Home uses the accepted oversized toggle model; the archive uses compact rows; articles remain readable documents. This difference in scale and density gives each page type a recognizable purpose without inventing a separate visual theme.

The notes come from Notion, so the interface should use Notion's own structural vocabulary instead of a generic web theme:

- page titles
- property rows
- toggles `▸`
- page-link rows
- select tags
- callouts

The Colin Moy lesson is that one device, repeated everywhere, makes a site feel coherent. Here that device is **the toggle**:

- On Home, the section words (Projects, Notes, Writing, About) are **oversized toggles**. Clicking one opens its list in place, the way Colin Moy's "PORTFOLIO" does.
- On the Notes index, each topic is a toggle that opens to show its pages in reading order.
- On a topic page, reading-path groups use toggles. The article's ordinary headings and prose stay expanded; preserve source-authored Notion toggles without wrapping every section in a new disclosure.
- On a note page, "Known gaps" is a toggle callout.

The same triangle, 150 ms rotation, focus treatment and indentation identify disclosure everywhere. Links still navigate and buttons still perform actions. Use a toggle only when temporarily hiding the content improves scanning; never hide the title, publication status, primary contact route or entire article behind one.

**The aesthetic risk:** Home's section words are set at display size (88 px desktop, 44 px mobile) in the same plain Notion sans as everything else. That is a quiet Notion document with four very large words in it. The size is the only loud thing on the site. There are no decorative graphics, gradients or images carrying the personality.

### 2.2 Interaction vocabulary (the whole list)

Use this small shared vocabulary. It describes visual roles, not a ban on semantic HTML or necessary controls. Tags are metadata, not interactive elements.

| Element | Looks like | Behaviour |
|---|---|---|
| **Toggle** | `▸` + label. Rotates to `▾` when open; whole summary is a target. | Native `<details>/<summary>` for disclosure without JavaScript. Home section navigation and anchor links have explicit URL behavior in 2.4; ordinary local toggles do not change the URL. No height animation. |
| **Page link row** | Full-width title, optional short description and metadata; hairline divider. | One real `<a>` fills the row, with matching hover and focus treatment. No nested links/buttons. Additional actions sit outside that link; metadata stacks below the title on narrow screens. |
| **Inline link** | Text colour with an underline at `rgba(55,53,47,.4)`, offset 3 px. | On hover the underline turns the full text colour. No blue. |
| **Tag** | A Notion select-style pill: 12 px, radius 3 px, tinted background. | Not interactive. Shown only when it tells the reader something (see 3.8). |
| **Search field** | A labeled field with light grey background, clear action and platform-appropriate shortcut hint. | Searches at `/notes/`; results use the page-link row. Loading, error, empty and query-history behavior are specified below. |

Use a plain text/icon button for actions such as Copy, Clear search and Retry, with an accessible name and the same focus token. Copy is visible on touch devices, and on pointer devices appears on hover or focus within the block. It must remain keyboard discoverable even when visually subdued.

Remove:

- all bordered cards
- decorative button styling on ordinary navigation links; keep actual buttons for actions
- the 3-button CTA row
- the theme toggle button
- the sticky status rail
- the footer sitemap block

### 2.3 Tokens

**Colour.** Light theme inspired by the measured Notion page, adjusted for readable interface text:

| Token | Value | Use |
|---|---|---|
| `--ink` | `#2C2C2B` | Body text, headings, links. |
| `--ink-2` | `#686763` | Secondary text, metadata, property names and placeholders. |
| `--ink-3` | `#A5A29A` | Decorative details only; never essential labels or the sole indication of a control. Toggle triangles use `--ink-2`. |
| `--rule` | `#E9E9E7` | Dividers, table borders. |
| `--wash` | `#F7F6F3` | Code blocks, callouts, search field, table header. |
| `--paper` | `#FFFFFF` | Page. |
| `--focus` | `#2383E2` | Focus ring and text selection only. |

Tag tints use Notion's select colours:

- Working: yellow `#FBF3DB` / `#956400`
- Reviewed: green `#EDF3EC` / `#356B4A`
- Archived: grey `#F1F1EF` / `#686763`

These small adjustments keep the Notion-like palette readable: the original `#787774` on white is about 4.48:1, and `#448361` on `#EDF3EC` about 3.99:1. Normal text needs at least 4.5:1; use 3:1 only for qualifying large text. Verify actual states and background combinations against [WCAG text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

Dark theme follows the system: paper `#191919`, ink `#E6E6E3`, secondary `#B4B3AF`, decorative `#777670`, rule `#41413E`, wash `#2F2F2F`, focus `#8CB4EA`. Status pairs: Working `#3A2F1C` / `#E7BD73`; Reviewed `#1F3529` / `#9AD7AF`; Archived `#30302E` / `#C2C1BB`. Define hover, selected text, code, tables and callouts in both themes. Remove the old stored-theme override so it cannot defeat `prefers-color-scheme`; respond to system changes without reloading. Source diagrams retain their original colors, with a suitable backing surface where needed.

**Type.** Self-hosted **Inter** for display and body, with the Notion stack as fallback. Vendor the font and its license; no runtime font service. Prefer a WOFF2 variable subset covering 400, 600 and 700, with `font-display: swap`; measure its actual bytes and coverage rather than promising a 100 KB file. Mono stack: `"SFMono-Regular", Menlo, Consolas, "Liberation Mono", monospace`. Three interface weights: **400, 600, 700**. Eight semantic size roles:

| Token | Size / line height | Weight | Use |
|---|---|---|---|
| `--t-display` | `clamp(44px, 7vw, 88px)` / 1.0, tracking −0.03em | 700 | Home section toggles only. |
| `--t-title` | 40 / 48 (mobile 32 / 40) | 700 | Page title (the single H1). |
| `--t-section` | 30 / 39 | 600 | Article H2. |
| `--t-subsection` | 24 / 31 | 600 | Article H3. |
| `--t-minor` | 20 / 26 | 600 | Article H4; deeper headings use body size and semibold. |
| `--t-body` | 16 / 24 (1.5) | 400 | Everything else, on every breakpoint. |
| `--t-small` | 14 / 20 | 400 | Properties, metadata, row secondary text, code (14 px mono). |
| `--t-caption` | 12 / 16 | 400/600 | Tags, code-language label, footer. |

No uppercase eyebrows or letter-spaced labels. Express type tokens in `rem` so user text preferences work. Fluid display sizes naturally compute to fractional pixels; that is expected. MathJax, superscripts, source emphasis and technical diagrams are outside the eight interface roles and must preserve their meaning. Use tabular numbers for dates/counts where alignment helps, not all prose.

**Space and measure.** A 4 px base unit, using only 4, 8, 12, 16, 24, 32, 48, 64, 96 and 128 px.

- The accepted reading column is **708 px of usable content**, centred. Its outer wrapper is at most 804 px including 48 px padding per side. Below 768 px use 20 px gutters; actual width is limited by the viewport. Do not accidentally subtract the desktop padding from the 708 px text measure.
- Line length depends on Inter's metrics and the prose; 708 px is the accepted starting width, not a guarantee of 80–85 characters. Inspect actual paragraphs.
- Tables, wide code and display math may use a centred 960 px region only where the viewport has room. On smaller screens they scroll locally inside the normal gutters. The article and header stay centred independently of any optional outline rail.
- Mobile gutter is 20 px.

**Shape.** 3 px radius for tags, code and callouts. 0 px everywhere else. No shadows, gradients or background textures.

**Motion.**

- Toggle triangle: 150 ms rotation.
- Row hover background: 100 ms.
- Link underline colour: 100 ms.
- Nothing else. `prefers-reduced-motion` removes all three.

### 2.4 Behavior contract

- **Home disclosure:** four visible summaries, initially closed unless a URL or restored history selects one. Opening one closes the other Home sections at every viewport; do not change this rule on resize. Use native grouped details where supported and a small enhancement for older browsers. Multiple open panels without scripting are an acceptable fallback. Every panel includes a normal link to its complete destination. [Native details behavior](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details) is the starting point; verify the actual keyboard/accessibility behavior in browsers.
- **URLs and Back:** only explicit Home section choices use `pushState` with `#projects`, `#notes`, `#writing` or `#about`. Closing the selected Home panel returns to `/` using `replaceState`. Handle initial load, `popstate` and `hashchange` without adding new history entries. Ordinary topic/group toggles never overwrite an article fragment. Opening a linked heading reveals all enclosing source toggles before scrolling, with `scroll-margin-top` for the header. Do not steal focus after an ordinary disclosure click or auto-scroll on hover. Back must restore the previous route, query and useful scroll position.
- **Search entry:** a visible Search link goes to `/notes/#search` from every page. `Cmd+K` on macOS and `Ctrl+K` elsewhere focus the existing input or follow that same route. Do not hijack editable fields, IME composition or other modifier combinations. The `/` shortcut is optional and omitted from hints unless actually implemented. No command palette/modal is needed.
- **Search states:** reuse existing ranking and lazy index loading. Keep the topic tree until a query exists, then show matching notes and posts with context and status. Label loading; on fetch failure keep browsing available and offer Retry. Explain zero results and offer Clear search. Keep `?q=` with `replaceState` rather than a history entry per keystroke. A polite live region announces settled result counts; typing never moves focus to results. Clearing restores the tree and its open groups. Without JavaScript show the browsable tree and a concise search-unavailable message.
- **Touch and keyboard:** aim for 44 px targets for standalone summary/action controls. Give rows a clear full-row focus outline as well as hover styling. Use Enter/Space according to native element behavior. Hover never unlocks the only route to information. Use `aria-current="page"` for the current destination and named navigation landmarks.
- **Copy and scroll:** Copy takes text from the code only, preserves whitespace and reports success or failure through an unobtrusive live status. Failure leaves selection/manual copying available. Overflow cues appear only when a block actually overflows, update on resize/scroll and disappear at the end; a fade must not obscure the last code characters. Make overflowing regions keyboard reachable and give them useful accessible names.
- **Print:** expand disclosures and print content in document order; remove navigation/control chrome and avoid dark backgrounds. Font load failure, reduced motion and disabled JavaScript must not remove reading or navigation access.

---

## 3. Template redesign

The redesign is implemented through templates and shared styles. The current 158 canonical routes include 125 topic/note pages, 19 posts, 4 project pages and 10 index/gateway pages. They will keep changing as content is added. Changes must work for future data without per-slug branches. Never hand-edit generated output. Template-based implementation still requires page-by-page visual review: different content can break the same template in different ways.

### 3.1 Rendering layers

These are implementation responsibilities, not a new dependency hierarchy across bounded contexts. `site-styling` owns tokens, shell and interaction helpers; `notes-content` owns semantic content HTML; `pages-build` composes them through public entry points. `notes-content` must not import `site-styling` just to draw a child-page link or toggle. Agree a small class/attribute contract and test the resulting composition.

| Layer | Where | Produces | Changes |
|---|---|---|---|
| **L0 Tokens** | `src/site-styling/internal/css.js` | CSS custom properties and base element styles. | Introduce 2.3's tokens, migrate component rules and remove obsolete rules after their callers are migrated. Avoid a wholesale reset that drops supported content styling. |
| **L1 Shell helpers** | Private helpers in `src/site-styling/internal/shell.js` or `internal/primitives.js`; interaction script alongside them | Toggle, page row, properties, tag, callout and search markup; disclosure/history behavior. | Keep helpers private unless a real external consumer needs an API. Shared appearance does not mean all HTML must come from this file. Measure script size after implementing its behavior; no arbitrary 1 KB limit. |
| **L2 Content blocks** | `src/notes-content/internal/render-notes-html.js` and `render-blog-html.js` | Semantic body HTML, stable heading IDs, code/table/math structure. | Adopt agreed hooks for matching visual roles while preserving content, nesting, escaping, captions and source emphasis. Avoid importing shell internals or treating every source block as a UI component. |
| **L3 Shell** | `renderLayout`, `renderSiteHeader`, `renderSiteFooter`, `renderBreadcrumb`, `renderPageHeader` | The frame around every page. | Responsive navigation and breadcrumbs, compact wrapping footer and shared title/metadata treatment. |
| **L4 Page templates** | `renderTopicPage` (root and child), `renderBlogPostPage`, `renderProjectPage`, and the list templates `renderNotesIndexPage`, `renderBlogIndexPage`, `renderProjectsIndexPage` | Pages generated from data. | Sections 3.4–3.7. |
| **L5 Singleton pages** | `renderHomePage`, `renderPersonalPage`, `renderErrataPage`, `renderNotFoundPage`; retired: `renderStartHerePage`, `renderContactPage`, `renderResearchTastePage`, `renderSubscribePage` | One page each. | Section 3.9. These are the only templates that are written for a single page. |

### 3.2 Rules every template must follow

These rules make the output correct for any page the data might produce. They are the contract that stops future content from breaking the design.

1. **Decisions come from data, not page identity.** A template may check data (`isRoot`, `publication.status`, whether headings exist, `pillar.readingPath`, number of children). It must never check a slug or title. `if (slug === "algorithms")` is banned.
2. **Every optional element disappears cleanly when its data is missing.** Missing data means no empty wrapper, no label without a value and no placeholder copy. That applies to:
   - Known gaps
   - Next link
   - labels
   - outline
   - series
   - updated date
   - description
   - artifacts
3. **Shared rules, recognizable page types.** Use one title/metadata helper with explicit variants: compact index header, article header with properties, project header with contribution metadata. Home keeps its distinct large disclosure index. Do not force every page into an identical title/lede/properties stack. Exactly one H1 per page.
4. **Normalize the document outline in L2.** Merely adding one to Markdown heading levels causes the current H1 → H3 skip when a post starts with `##`. Preserve relative section relationships, remap the first body level to H2 and constrain later downward jumps to one level. Keep original IDs/aliases stable. Shell-generated section headings must fit the same outline; a summary label is not automatically an H3. Test irregular source levels and H6 explicitly. No source headings are deleted to satisfy the checker.
5. **Lists render at any size.** Every list template must work with 0, 1 and 200 items:
   - An empty list shows one line saying what's missing.
   - Long lists use compact groups with visible counts; do not render a wall of 200 cards or hide everything behind several nested toggles. Search covers closed groups. No virtualization or pagination is needed at the present scale.
6. **The page must survive long or deep content:**
   - A title of 120 characters or more wraps without overlapping anything.
   - When breadcrumbs do not fit, retain Home, the immediate parent and the current title; expose intermediate ancestors through a labeled disclosure. Base collapse on available space as well as depth. Never hide the parent or let the path push Search/Menu off-screen.
   - Wide code, tables and math scroll inside their own box.
7. **Interface motion, color and spacing use shared tokens.** Font declarations, breakpoints, 1 px rules, source-specified formatting and intrinsic asset dimensions are documented exceptions to a raw-value grep. MathJax and syntax/source colors must not be flattened to pass a style-count test.

### 3.3 Shell (L3), used by every page

```
┌──────────────────────────────────────────────────────────────────┐
│ Praneeth Suresh / {ancestors…}       Notes Projects Writing About Search │
├──────────────────────────────────────────────────────────────────┤
│  {page header: H1 title · properties · description}             │  708 px centred column
│  {template body}                                                │
│  ─────────────────────────────────────────────────────────────── │
│  Praneeth Suresh · Email · GitHub · LinkedIn · CV · RSS · Errata │  compact, wraps
└──────────────────────────────────────────────────────────────────┘
```

- **Breadcrumb:** compose one breadcrumb navigation from template ancestry data and remove the redundant "In {parent}" line. On roomy screens it shares the top bar; on a phone it sits on a second compact line. The current page is plain text, optionally truncated in the bar because the full title remains in H1. Keep the immediate parent a real link. Remove the repeated eyebrow parameter `kicker` from page headers.
- **Section links:** desktop shows Notes, Projects, Writing and About, with current-page styling and Search. Below 768 px replace the section links with a labeled native Menu disclosure containing those same four destinations. Keep the name/Home link and Search visible. Use a normal-flow expanded menu to avoid a modal, focus trap or overlay. A minimum 44 px row may grow for text or zoom; do not enforce a fixed-height header. Keep the header non-sticky initially and retain a skip-to-content link.
- **Footer:** compact and restrained, not forced to one line or 12 px links on a phone. Use 14 px utility links that wrap with usable spacing; 12 px is for ancillary text. Keep Email, CV and RSS easy to identify. Delete the sitemap block.
- **Tab title:** one layer receives the unformatted page title and appends `— Praneeth Suresh`; Home uses just the name. Existing callers currently pass preformatted titles, so migrate them together to avoid duplicate suffixes. Use the same identity in feeds, metadata and social labels.
- **Dark mode:** delete the theme toggle and use `prefers-color-scheme` in L0, per accepted decision 4.

### 3.4 Note template: `renderTopicPage` for child pages (every note, now and future)

```
{breadcrumb}
{H1 title}
Status    {tag}          ← properties(), from publication and topic metadata
Type      {contentType}
Reviewed  {reviewedAt}               ← omit if absent; Working status explains this
Updated   {substantive content date} ← omit if unavailable; not a CSS build timestamp
{Known gaps toggle callout}           ← only if publication.knownGaps is not empty
{topicContentHtml}                    ← L2 output
{Related rows}                        ← only if related is not empty
{Next in {root title} → pageRow}      ← only if nextReading exists
```

- **Remove from the template:**
  - `renderReadingMargin`, the sticky rail.
  - The repeated notice paragraph in `renderNotePublication`. Keep the explicit Status property on every note, and a short definition link to `/notes/#publication-status`; show listing legends as defined in 3.8. Keep correction/errata links and specific known gaps.
  - Separate labels markup. `renderTopicLabels` output becomes a "Tags" property.
- **Outline:** built at render time from stable H2/H3 IDs when there are at least three useful headings. Provide a labeled "On this page" disclosure near the article start at every width. At 1280 px and above the same navigation may become a quiet sticky text list outside the centred reading column. Do not use anonymous hover-only bars. Render the structure once and adapt with CSS; a static build cannot know the visitor's viewport. If an active-heading highlight is added, it never changes the URL or scroll position.
- **Also in L2 (applies to every note):**
  - Heading anchors.
  - Code block chrome: a language label from `normalizeLanguageClass`, a copy button and an overflow fade.
  - Table styling.
  - A scroll box for display math.

### 3.5 Topic root template: `renderTopicPage` for `isRoot` (every topic, now and future)

- The same header and properties as the note template.
- Show the description once, then **Contents**, then the root's own body. Do not hide the entire root lesson to make the document shorter; give readers a direct "Read the overview" link to its start.
- **Contents** is built by the `renderTopicPillar` data (`pillar.readingPath` groups):
  - Each group is a toggle.
  - Each step is a numbered `pageRow`. The numbers are allowed because they show the real reading order.
  - Children that aren't in the reading path go in a final "Other pages" toggle, so a newly pulled note is never missing from Contents.
- **When groups start open:** if the topic has six or fewer children, start open everywhere. Otherwise start groups collapsed at every width, keeping labels, counts and a direct overview link visible. This prevents the full catalogue from dominating the root before its body. Do not silently change open state on resize. An anchor targeting a hidden child opens its ancestors.
- **Child pages in the body:** `renderChildPage` output in the body becomes `pageRow`s. Don't show a pill for the default status (see 3.8).

### 3.6 List templates (they grow with the data)

| Template | Structure | Built from |
|---|---|---|
| `renderNotesIndexPage` | Title, one-line intro (with the working-note notice), search field, then a toggle per topic with its page count and ordered `pageRow`s inside. Search results replace the tree while a query is typed. `?q=` stays in the URL. | The `topics` tree and `searchIndex`. A new topic or note appears automatically. |
| `renderBlogIndexPage` | Chronological rows grouped by year, with compact optional topic/series disclosures. Keep the complete archive as the primary list rather than showing two full copies of every post. | `blogManifest`. Its sections are thematic groupings, not automatically ordered series. Use previous/next series links only for explicit series data. |
| `renderProjectsIndexPage` | `pageRow` per project: name, purpose, and on the right the role, year and status. | `projectsData`. |

### 3.7 Detail templates for posts and projects

- **`renderBlogPostPage`:**
  - Uses the note layout: the same header, with properties Published, Updated, Series and Tags.
  - The body comes from `renderBlogBody`, with headings normalised by rule 4.
  - The end links to explicitly ordered series neighbors where that data exists; otherwise to older/newer posts, clearly labeled by date direction. Do not invent a series from a category.
- **`renderProjectPage`:**
  - The same header, with properties Status, Role, Stack, Repository and Dates.
  - Give Problem, What I built, Evidence and Limits a consistent visual hierarchy, while retaining existing "One hard decision" and "Where it stands" sections. Do not erase substantive project material to fit four headings.
  - `renderArtifact` may contain a log, code, list, diagram or image; a figure does not require an `<img>`. Captions stay attached to real artifacts. Omit absent artifact wrappers gracefully. Missing optional evidence does not fail the build; malformed artifact data does. Do not add screenshots merely to decorate the dossier.

### 3.8 Status display rule (inside `renderStatusBadge` and `renderPublicationBadge`)

A single function decides where a status appears, so every template follows the same rule:

- **Note pages:** the Status property is always shown.
- **Lists, rows and search results:** show a tag only for Reviewed or Archived, as accepted. Put a visible sentence beside each independently encountered note listing or result set: "Unmarked notes are working notes: public, not yet reviewed." It cannot live only on `/notes/` while being absent from topic roots, Home selections and search results. In mixed search results distinguish Note/Post type; "unmarked" applies to notes, not essays or projects. Announce full status in each note row's accessible description without repeating it visibly.

This keeps the accepted sparse visual treatment without requiring a deep-linked visitor to guess what an unmarked row means. Known errors, archive warnings and specific gaps are never suppressed by the default-status rule. These display rules supersede the old glossary instruction to show a badge on every listing; update that instruction during implementation.

### 3.9 Singleton templates

These are the only templates written for one page each.

- **`renderHomePage`:** the toggle index in 2.1.

  ```
  Praneeth Suresh                                     40 px title
  One or two lines of bio.                            16 px --ink-2
  ▸ Projects                                    4     --t-display toggle, count at 14 px
  ▸ Notes                                     125
  ▸ Writing                                    19
  ▸ About
  ```

  - Reuse existing approved introduction text, with longer current-focus material moved into About's disclosure. Each panel uses real data and `pageRow`: selected projects with a route to all projects; eight topics with counts, selected readings and preserved guided paths; latest five posts with a route to the full archive; concise bio/contact with a route to About. Do not dump 125 nested notes onto Home. Counts mean total destination items and identify their unit; do not imply a preview is the whole collection.
  - Home label size is 88 px at roomy desktop widths and 44 px on mobile, with the accepted fluid transition. Align triangles, text baselines and counts on one grid. Give each closed row adequate target space without full-viewport sections. Fit all four summaries at 390 × 844 in the default text setting; at enlarged text prioritize wrapping and reading over that fold target.
  - `/#projects` and the other hashes open the matching panel using 2.4's consistent behavior. Keep a brief visible instruction, "Open a section", and ordinary destination links inside each panel. About's panel includes a direct Email link. Do not make essential contact information dependent on a nested toggle.
- **`renderPersonalPage`, i.e. `/about/`:** preserve the bio and existing substantive sections; move Research questions into an anchored section with selective toggles, and Contact into visible properties at `#contact`. Preserve the complete research material when retiring its old route. The old decorative dot-matrix wordmark is superseded by this accepted single-family identity direction; record that explicit change to the previous design-tree rule during implementation.
- **Retired templates:**
  - `renderStartHerePage`, `renderContactPage`, `renderResearchTastePage` and `renderSubscribePage` are removed.
  - Their content is relocated and links updated before their generator entries are removed. Redirects and implementation dependencies are specified in 3.10; line numbers are inspection anchors, not permanent API contracts.
- **`renderErrataPage`:** date rows, each with the affected page link and an Original/Now callout.
- **`renderNotFoundPage`:** a concise missing-page message, Home/Notes links and the shared search entry (or a form that submits `q` to `/notes/`). Keep the real HTTP 404 status. Repeating the oversized Home interface would bury recovery; use compact rows here.

### 3.10 Route consolidation and compatibility

| Retired route | Final destination | Content/link migration |
|---|---|---|
| `/start-here/` | `/#notes` | Preserve all three existing guided paths: professional/project path in Home's Projects panel, knowledge paths in Notes. |
| `/contact/` | `/about/#contact` | Move existing contact information and channel links; keep Email in the footer. |
| `/research-taste/` | `/about/#research` | Preserve research questions and sources in About. |
| `/subscribe/` | `/feed.xml` | RSS is the accepted follow mechanism; keep a clearly labeled RSS link and discovery metadata. |
| `/collaborate/` (already redirected) | `/about/#contact` | Update its destination directly to avoid a `/contact/` redirect chain. |

`scripts/lib/redirects.js` currently accepts only trailing-slash page paths and validates destinations against sitemap routes. Extend this existing adapter to validate a same-origin destination pathname plus optional fragment, including allowlisted generated files such as `/feed.xml`. Validate fragments against generated IDs and refuse chains/cycles or missing targets. Keep existing renamed-note redirects. Generate permanent redirects and update all internal links to final destinations. A plain Python static server ignores `_redirects`; verify HTTP behavior in a platform-compatible local preview, not by assuming the file's presence proves it works.

Update sitemap/search/RSS route sets and remove retired entries from `content/publication/route-dates.json` through `scripts/update-route-dates.js`. Retain old meaningful fragment IDs where material moves and document any unavoidable fragment mapping limits. Do not invent a new substantive review date merely because CSS or navigation changed. Expected route count after these four retirements is 154 canonical pages plus 404 if no content routes are added; the reconciliation gate must derive the actual set and explain any difference.

---

## 4. Implementation plan

Implementation begins with a real-content visual checkpoint, then proceeds through shared behavior and templates. Do not replace the complete stylesheet before testing how the new system handles technical content. Keep temporary prototypes outside published routes and retire them after the shared implementation works. The accepted defaults do not require another design interview.

| Step | Work and code locations | Dependency / exit condition | Effort |
|---|---|---|---:|
| 1. Establish the visual checkpoint | Snapshot the current route/data baseline. Prototype Home, Notes, DFS or C++ Memory Ownership, and Beryl with Inter, the 708 px column, large Home toggles and real artifacts. Start in `src/site-styling/internal/css.js` and shell helpers. | Review closed/open Home and short/long pages at 390 and 1440 px in both themes. Fix rhythm, alignment, wrapping and reading density before spreading the design. | 2–3 d |
| 2. Implement shared interaction and shell | Private helpers and scripts in `src/site-styling/internal/`; responsive header/menu, footer, titles, search entry, hash/history behavior, copy feedback. Retain `notes-search.js` ranking and its tests. | Step 1 visual direction; keyboard, touch, no-JS fallback, direct fragment and Back flows work. No theme-storage override remains. | 2–3 d |
| 3. Stabilize technical reading | `src/notes-content/internal/render-notes-html.js`, `render-blog-html.js`, and shell topic/post templates: heading normalization, properties, accessible outline, code/table/math regions, known gaps and status legends. | Steps 1–2; preserve original content, code bytes, math source and old anchor IDs. Local scrolling and deep links work inside nested source toggles. | 2–3 d |
| 4. Apply all page families | `shell.js` index/project/Home/About/Errata/404 renderers; relocate existing material through existing data files. Match rows and metadata without forcing identical page compositions. | Steps 2–3; every template has complete populated, empty, long-title and missing-optional-data states. No caption refers to a missing artifact. | 3–4 d |
| 5. Consolidate routes | `scripts/build-pages.js`, `scripts/lib/redirects.js`, `content/publication/redirects.json`, route-date workflow and public renderer exports. | Step 4 destinations and IDs exist before old pages disappear. No broken links, redirect chains or lost guided/research/contact content. | 1–2 d |
| 6. Finish and verify the complete site | Existing checks, browser route sweep, per-page screenshot ledger, font/performance comparison and design-document updates. Remove unused styling after caller migration. | All earlier steps; each final route and required state is reviewed, defects repaired and evidence recorded. | 2–3 d |

Planning range: **12–18 person-days** for one engineer familiar with the repository, including visual iteration and full coverage. It excludes substantive editorial rewrites, new project evidence and deployment. Technical unknowns are the heading/anchor migration and fragment/file redirect support; resolve them in small checks early. No framework, global component library or public primitive API is required.

### Verification strategy

**Automatic coverage:** derive routes from generated files and reconcile them with sitemap, search, RSS and redirects; include 404 and utility files explicitly. Visit every canonical HTML route in Playwright at 320, 390, 768 and 1440 px in light and dark. Check one H1, logical heading order, usable links/fragments, asset/font loading, main landmarks, no overlapping controls, and no page-wide overflow. Open disclosure states as well as checking initial pages. Inspect overflow inside boxes so `overflow-x: clip` cannot hide a failure. Math, code and data tables may scroll locally. Use [WCAG reflow guidance](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) when distinguishing legitimate two-dimensional content from accidental clipping.

**Token checks:** inspect owned UI classes and source declarations for approved type roles, weights and tokens. Do not fail a rendered page for having more than eight numeric font sizes: fluid sizing, MathJax and superscripts make that test invalid. Decorative shadows/gradients are disallowed, but accessible focus outlines and a justified overflow cue are not decoration. Validate text contrast using real foreground/background pairs, including hover, dark theme and status tags. A color grep is not a contrast test.

**Fixtures and interaction checks:** exercise long titles, six-level breadcrumbs, notes with 0/1/30 headings and irregular source heading levels, groups with 0/1/200 items, mixed publication states, no optional properties, an ungrouped post, missing artifact data, nested toggles, wide math/code/tables and font fallback. Include search loading/failure/retry/zero/many results, IME/input-safe shortcuts, Copy failure, direct fragment links, Back/Forward restoration, opening/closing mobile Menu and deep links within hidden groups. Assert actual semantics and behavior, not fragile literal HTML snapshots.

**Visual sign-off:** review full desktop and mobile screenshots for **every final canonical route and the 404**, not only fixtures. Record route, viewport/theme, finding, fix and final evidence. Review each template's interaction states and fixtures at all four widths, in dark mode, with keyboard, reduced motion and 200% zoom. Check text resizing and a narrow reflow viewport separately; reducing a screenshot's dimensions is not a zoom test. Spot-check real browser/font differences in Chromium, Firefox and WebKit when available, and screen-reader announcements for navigation, disclosure, status, search and copy. Record unavailable environments explicitly.

**Fidelity and loading:** run the existing content/ingestion/blog tests, compare code bytes and math source across a fresh build, and inspect rendered equations after typesetting. Preserve useful figures/captions and source-emphasis distinctions. Measure font transfer and layout movement against the current build; verify readable fallback before the font arrives. A visual redesign must not wait for an external font service or blank the page while scripts load.

**Repository checks:** run `./.beryl/scripts/check.sh` and `./scripts/check-project.sh`. If markup assertions in `tests/pages-build-subpages.test.js` or `tests/publication-trust.test.js` need intentional changes, preserve their underlying guarantees and update the test manifest via `./.beryl/scripts/update-test-manifest.sh`. Add focused behavior tests where regressions are plausible; do not generate tests that merely repeat token declarations.

**Design records during implementation:** update `.beryl/agent/design-tree.md` and the stale Stripe-oriented `.beryl/agent/project-brief.md` to describe the accepted direction; update the Working Note display rule in `.beryl/agent/ubiquitous-language.md`. Extend the redirect decision in ADR 0009 if its contract changes. Keep `.beryl/agent/architecture.md` aligned with the existing context ownership; an ADR saying all structural markup must come from a single helper would create unnecessary coupling and is not part of this plan.

### Definition of done

- All ten accepted choices are reflected consistently across Home, indexes, articles, projects and utility surfaces. No outdated canvas, card, eyebrow, rail or theme-toggle styling remains in active UI.
- The eight UI type roles, three weights, centred measure and spacing rhythm have clear jobs; exceptions for source content/math and technical asset dimensions are documented. Alignment and readable hierarchy are reviewed visually, not inferred from a token count.
- Disclosure, navigation and action affordances are distinct and predictable. Mobile retains every primary destination. No essential action depends on hover; no article body is hidden merely to shorten its screenshot.
- Working status is explicit on direct note pages and understandable in every listing/search context. No repeated notice wall, inaccessible amber text or misleading unmarked result remains.
- Every final route passes the generated-set reconciliation and required browser checks and has individual desktop/mobile visual sign-off. Fixture tests protect defined edge cases; they do not prove that arbitrary future content can never break a layout.
- Code, equations, tables, images, publication metadata and existing content survive a fresh build. All relocated material and old route destinations are accounted for; redirect behavior is verified in an environment that supports it.
- A reader can follow Home → topic → note → related note, return through breadcrumbs, and search/open/Back without losing context. A collaborator can find a project artifact and contact information without exploring unrelated pages. Record task observations; do not invent user-test results.
- A first-time visitor can see from Home, without scrolling on a 390 × 844 screen:
  - who the site belongs to
  - the four sections
  - how to open one

## 5. Accepted owner decisions

Accepted 30 September 2026. All defaults from the original section are settled; do not reopen them as implementation prerequisites.

| # | Decision | Accepted choice |
|---|---|---|
| 1 | Home model | A — oversized toggle index with Projects, Notes, Writing and About. |
| 2 | Display scale | A — up to 88 px desktop, 44 px mobile; the single expressive feature. |
| 3 | Typeface | B — self-hosted Inter with system fallback; record actual asset size/license. |
| 4 | Dark mode | A — follow the system; remove the manual theme toggle. |
| 5 | Listing status | A — visible tags for Reviewed and Archived; explain unmarked Working notes once per independently encountered listing/result set. Direct note status remains explicit. |
| 6 | Page icons | A — none. Functional disclosure/search indicators are still allowed. |
| 7 | Route consolidation | Yes — move Start here, Contact and Research questions into Home/About, retire Subscribe in favor of RSS, and preserve access with redirects. |
| 8 | Identity | A — Praneeth Suresh throughout the public shell and metadata; Notes is a section. |
| 9 | Accent | A — ink-colored links; blue reserved for focus and selection. Semantic status tints remain. |
| 10 | Reading width | A — 708 px usable content, centred, with padding outside that measure. |

No owner decision blocks this plan. During implementation, resolve routine layout and engineering details against these choices and the behavior contracts above. Escalate only a new conflict that materially changes the agreed experience or requires unsupported personal/content claims. This document does not authorize a commit, push or deployment.
