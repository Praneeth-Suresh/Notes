# Homepage Animation Plan

## Purpose

The home page should help readers quickly understand what this site is for and where to go next: notes, research writing, projects, portfolio, and contact. Motion should serve that goal by making the reading order obvious, bringing one decision surface into focus at a time, and keeping clickable targets stable once they appear.

The current color direction and section-to-section palette transitions should remain. The change is not a visual reset. It is a motion reset: replace scattered drifting, alternating card motion, and unpredictable rotations with a single scroll grammar that moves left to right, introduces headings before links, and holds important panels in place long enough for users to act.

## Intended Effects

1. Establish orientation before choice.
   The first visible motion should introduce the site promise and primary actions before any dense list of links moves. The user should always know which section they are in and why it matters.

2. Make each section feel like a staged reveal.
   Section titles arrive first from the left, supporting copy settles next, then the link/card group slides in from the right. This creates a predictable cause-and-effect rhythm: title explains the segment, cards become the available actions.

3. Keep action targets stable.
   Links may slide into place, but once a section is active, cards stop moving. Hover and focus states can still respond, but scroll should not keep pushing clickable boxes around while the user is trying to choose.

4. Use held segments to draw attention.
   Important sections should use a sticky inner stage so the text and cards remain in a stable reading position while the background color and small visual details progress. This gives users time to scan without the whole interface drifting away.

5. Preserve accessibility and static deployment.
   The motion remains a progressive enhancement in the `site-styling` context, respects `prefers-reduced-motion`, and does not add remote animation dependencies.

## Motion Grammar

The homepage should use one consistent choreography:

```text
scroll enters section
  title lane slides in from left and locks
  supporting copy fades/lifts subtly into readable position
  action/cards lane slides in from right and locks
  visual linework draws quietly while content is held
scroll exits section
  previous content releases upward with minimal movement
  next background color crossfades in
```

Rules:

- Primary movement is horizontal: left-to-right for titles, right-to-left for link groups entering the stage.
- Vertical movement is only used as a small settling motion, not the main effect.
- No alternating per-card drift formulas.
- No card rotation during scroll.
- No continuous movement on active clickable cards.
- Handoff sections must let the previous information leave or release before the next large surface enters the same reading area.
- Background color transitions stay smooth and section-specific.
- Dark-to-light background transitions should use an intermediate muted bridge color and begin early in the section hold instead of waiting until the bottom of the pane.
- Do not use a numbered left rail for homepage pane navigation; it competes with the user's reading path.
- Held content should settle near the visual middle of the viewport, not at the bottom edge.
- The global navigation must remain visibly readable over showcase backgrounds, but it should not stay pinned throughout the page and compete with scroll sections.

## Section-Specific Styles

The homepage should not repeat the same card choreography for every middle section. Keep the shared scroll grammar, but vary the layout and motion signature by content type.

### Document Scan: Research

Use for research and serious technical writing previews.

- The title still arrives first from the left.
- Cards enter as a controlled document stack from the right.
- The stack can reveal through a narrow horizontal clip, like a scanner exposing a paper trail.
- Individual cards may be offset after they settle, but they must not keep moving while active.
- The visual linework remains secondary and should not compete with the text stack.

### Build Rail: Projects

Use for selected project proof.

- The title frames the section first.
- Project cards enter as a compact build rail from the lower right.
- Cards may have different heights to imply assembled system parts, but the final positions are stable.
- The movement should feel like components locking into place, not floating cards.

### Index Shelf: Selected Writing

Use for archive-like writing links.

- The title arrives first.
- A horizontal rule draws across the card shelf as the links settle.
- Cards sit in a lower, shelf-like lane so they do not repeat the research document stack.
- Once settled, the shelf behaves like a static index.

## Scroll Story

### 1. Hero: Establish The Site

Goal: make the site promise clear before asking the user to pick a route.

Sequence:

1. The hero title enters first from the left and settles.
2. The intro paragraph and primary actions follow with a shorter travel distance.
3. The technical visual linework draws after the text is readable.
4. The "Pick a doorway" band is held below the hero as the first real choice surface.

Hold behavior:

- The hero copy and visual should stay readable at first, then hand off cleanly before the doorway grid occupies the same reading area.
- The doorway cards should not drift once visible.

### 2. Doorways: Choose A Route

Goal: make the available site routes easy to scan and click.

Sequence:

1. "Pick a doorway" appears before the card list.
2. The doorway cards slide in as a single lane from the right.
3. Cards settle into a stable grid and remain stationary while the user scrolls through the held portion.

Presentation:

- Treat the doorway grid as the main action surface for the opening segment.
- Do not animate individual cards in different directions.
- If stagger is used, keep it tiny and sequential from left to right, with a short duration.

### 3. Research/Writing: Focus On Reading Depth

Goal: show that the site has serious technical writing, not only topic indexes.

Sequence:

1. Section label and title slide in from the left.
2. "Read all writing" settles under the title.
3. The selected writing cards use the Document Scan style: a clipped document stack enters from the right and locks.
4. The SVG linework can draw across the visual, but only after the cards are stable.

Hold behavior:

- The text column remains sticky while the writing cards are visible.
- The cards stay clickable and stationary during the hold.

### 4. Projects: Show Evidence

Goal: shift from reading to proof of work.

Sequence:

1. Title and project framing enter from the left.
2. Project cards use the Build Rail style: cards enter from the lower right and lock into varied heights.
3. The background color transition carries the emotional shift into the project palette.

Hold behavior:

- Keep the project cards fixed in the active section so the user can choose one.
- Avoid depth or scale motion that makes cards feel like they are moving away from the cursor.

### 5. Selected Writing: Return To The Archive

Goal: bridge back from proof of work to the larger body of notes and essays.

Sequence:

1. Section title enters first.
2. The link group uses the Index Shelf style: a rule draws across a lower shelf as cards settle.
3. Visual line drawing remains secondary.

Hold behavior:

- Keep this segment shorter than the Projects segment because it repeats the writing-card pattern.
- The section should feel familiar, not like a new animation system.

### 6. Contact: Make The Next Step Plain

Goal: turn interest into a specific next action.

Sequence:

1. The contact title enters from the left.
2. Contact and collaborate actions settle immediately after the title.
3. Current asks and subscribe panel slide in from the right and then hold.

Hold behavior:

- Use a handoff instead of an overlay: the contact title must release before current asks and subscription panels occupy the same reading area.
- Keep contact actions stable as soon as they are visible.
- The subscription panel should not animate over the current asks.

### 7. Notes Browse: Stop Performing, Start Serving

Goal: once the user reaches the full topic archive, the animation should get out of the way.

Sequence:

1. The notes section appears in normal document flow.
2. Search input and topic grid are static.
3. Hover/focus micro-interactions remain allowed, but there should be no scroll-scrubbed movement on the searchable topic cards.

## Sticky Segment Model

Use a sticky inner stage for desktop and a static stacked layout for mobile.

```text
section
  sticky stage
    left lane: label, title, copy, section link
    right lane: visual or cards
  action lane
    cards/links held in place after reveal
```

Desktop behavior:

- Each showcase section can have enough scroll height to let the sticky stage hold for a short reading window.
- The left lane locks first; the right lane enters after title progress crosses a threshold.
- Active cards lock at `transform: none` while the section is active.

Mobile behavior:

- Disable sticky holds.
- Use the same content order in normal flow: title, copy, actions, cards.
- Keep reduced travel distances and no rail.
- Dynamically clamp large titles and allow emergency wrapping so text never exceeds the phone viewport.
- Hero title words must never be split internally; if space is tight, allow line breaks only between words and reduce the mobile type scale.
- The page viewport should not permit horizontal scrolling; preserve local overflow only for fidelity-critical note content such as code, math, and tables.

Reduced motion:

- Disable scroll-scrubbed transforms and line drawing.
- Preserve the final layout and color palette.
- Keep all content visible without dependency on animation state.

Final notes reveal:

- The notes archive is the last major content surface and should receive one final, restrained attention moment.
- It should fade and lift into place as it approaches the viewport.
- The text must explicitly tell users that these cards link to the author's computer science notes.
- The notes grid itself should remain static and searchable after the reveal completes.

## Implementation Direction

Bounded context: `site-styling`.

Likely public interface:

- Keep `renderHomePage(...)` as the public page composition entry point through `src/site-styling/index.js`.
- Keep homepage motion as progressive enhancement injected by `renderLayout({ includeHomeShowcaseMotion: true })`.
- Replace the current free-form scroll variables with staged variables such as `--stage-title-progress`, `--stage-actions-progress`, and `--stage-hold-progress`.

Likely files:

- `src/site-styling/internal/shell.js`
- `src/site-styling/internal/css.js`
- generated `dist/index.html` and `dist/assets/site.css` after build
- `.beryl/agent/design-tree.md` for durable UX decision updates after implementation

Do not change:

- Section palette choices or background color sequence.
- Static Cloudflare Pages deployment model.
- Notes rendering or Notion fidelity paths.
- Search behavior in the topic archive.

## Grill-Me Critique Folded Into This Plan

```yaml
skill: grill-me
status: success
chosen_approach: "Replace scattered per-element scroll drift with staged section choreography: left-lane title reveal, right-lane action reveal, active-section hold, and static clickable targets."
rejected_alternatives:
  - option: "Tune existing drift formulas"
    reason: "It keeps the underlying problem: cards, visuals, bands, and copy still move independently, so navigation remains unpredictable."
  - option: "Remove all homepage motion"
    reason: "It would improve usability but lose the intended showcase quality and the existing palette-transition strength the user wants to preserve."
  - option: "Use a heavy animation library"
    reason: "It adds dependency weight and conflicts with the static, CSS-first deployment direction."
main_risks:
  - "Sticky sections can become awkward on short screens if section heights are not constrained carefully."
  - "Scroll-linked effects can still interfere with clicking if active cards are not locked after reveal."
  - "Duplicated Research and Selected Writing content may feel repetitive unless the hold timing differs."
assumption_that_can_break_plan: "The homepage section structure remains close to the current showcase sections and does not require a full content hierarchy rewrite."
first_vertical_slice: "Refactor the hero and doorway segment so the title appears first, doorway cards slide in as one stable lane, active cards stop moving, and reduced-motion/mobile layouts remain static."
checks_to_run:
  narrow: ["node scripts/build-pages.js --manifest content/topic-manifest.json --out /tmp/notes-pages-motion-check"]
  broad: ["./.beryl/scripts/check.sh", "Playwright MCP verification of desktop, mobile, reduced-motion, sticky hold, and stable clickable cards"]
likely_files_to_change:
  - "src/site-styling/internal/css.js"
  - "src/site-styling/internal/shell.js"
  - "agent/design-tree.md"
design_updates:
  update_design_tree: true
  update_architecture: false
  create_or_update_adr: false
notes: "The change belongs in site-styling because it affects visual choreography and page shell behavior, not content normalization or build orchestration."
```

## Approval Plan

After this plan is approved, implement in this order:

1. Replace the current scroll variable model with staged progress for active sections.
2. Refactor homepage CSS so title, copy, visuals, and cards use the same predictable section grammar.
3. Add sticky desktop holds and static mobile/reduced-motion fallbacks.
4. Preserve current palettes and background color transitions.
5. Build the static site and verify in Playwright that cards do not move while users are expected to click them.
