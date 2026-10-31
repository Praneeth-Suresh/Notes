# Browser Smoke Checks

Use Playwright against a fresh generated build for UI changes, then repeat key navigation against production after deployment.

## Canonical route families

| Route | Expected browser signal |
| --- | --- |
| `/` | One `Praneeth Suresh` H1; four closed disclosures (Projects, Notes, Writing, About); opening one closes another and updates/restores its hash. |
| `/notes/` | Search field and topic disclosures remain browsable; loading, retry, empty, results, query restoration, and Cmd/Ctrl+K work without moving focus. |
| `/topics/<topic>/` | Status properties, grouped Contents, direct overview link, source body, and sparse status legend. |
| `/topics/<topic>/<note>/` | Status properties, optional known gaps/outline, stable heading anchors, local code/table/math overflow, copy feedback, related and Next rows. |
| `/blog/` | Writing grouped by topic (manifest section) with a topic jump list, chapter numbers for series, and search. |
| `/blog/<post>/` | Section/chapter kicker, article properties, logical heading outline, copy-link feedback, and chronological newer/older links. |
| `/projects/` | Ruled card grid with status, title, summary, role, and updated date; no column narrower than its words at any width. |
| `/projects/<project>/` | Project properties plus Problem, What I built, Evidence when present, One hard decision, Where it stands, and Limits when present. |
| `/about/` | Identity/experience/work plus complete `#research` and visible `#contact` content. |
| `/errata/` | Dated affected-page rows with Original/Now callouts. |
| Search dialog (any route) | Cmd/Ctrl+K or the Search link opens it with focus in the field; results match `/notes/?q=`; arrows move, Enter opens the top result, Escape or a backdrop click closes it on the same URL. |
| Theme toggle (any route) | Switches light (`#F2F2ED` paper) and dark, and the choice persists across routes. |
| `/404.html` | Concise recovery, Home/Notes links, and static Notes search form. |

Every canonical HTML route plus 404 must be checked at 320, 390, 768, and 1440 px in light/dark system themes for one H1, logical headings, assets, local-only technical overflow, no page overflow, and usable controls. Also inspect reduced motion, 200% zoom, keyboard-only navigation, no-JavaScript, font fallback, print, direct fragments, and Back/Forward.

## Compatibility routes

Verify permanent HTTP redirects in a Cloudflare-compatible local preview: `/start-here/` → `/#notes`; `/contact/` and `/collaborate/` → `/about/#contact`; `/research-taste/` → `/about/#research`; `/subscribe/` → `/feed.xml`; renamed note routes → their final note. There must be no chain.
