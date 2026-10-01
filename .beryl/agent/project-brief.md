# Project Brief

## Product Goal

Build **Cloudflare Pages** for **everyone interested in Computer Science** so they can **view my notes and get inspired to work in Computer Science**.

This website uses a **personal technical notebook** direction for recruiters, collaborators, and readers exploring computer science. Home is a large typographic index built from four native disclosures; archive pages use compact rows; technical pages use a centred 708 px reading measure. Self-hosted Inter, ink-coloured links, system dark mode, sparse publication tags, and a small shared disclosure vocabulary keep the site distinctive without reducing Notion formatting fidelity.

## Primary Workflows

1. **Go through notes**: User should navigate from home page with different topics I write about (Algorithms, Data Structures, Operating Systems, Agentic Coding, etc.) to the topic page from which they can navigate to pages lower down in the hierarchy (more granular topics such as Dynamic Programming). These are accessible as notion sub-pages and navigation by clicking on the sub-pages should be preserved in the site.
2. **Search**: User should be able to search for a topic and retrieve the notes about the topic they want.
3. **Upload notes**: I (maintainer) will provide a link to a notion page (top level page about topic) and the topic it corresponds to. The page should be recursively read (with notion API) to re-populate the HTML page for the topic.
4. **Home Page**: Home is a concise index owned by Praneeth Suresh. Four oversized native disclosures—Projects, Notes, Writing, and About—preview real data and link to each complete destination.
5. **Navigate from the Home Page**: User should immediately understand where they are, search or scan available topics, and move from the home page to topic pages with clear links, labels, keyboard-friendly focus states, and no dependency on non-static runtime services.
6. **Read in the notebook shell**: Topic roots, notes, and posts use one centred 708 px reading measure, concise publication properties, logical anchored headings, and local scrolling for code, tables, and display math while all Notion-derived blocks retain their rendered structure.
7. **Explore the maintainer portfolio**: User should navigate from the home page to a separate personal portfolio page that uses the same visual language but a distinct layout, then return to the home page or continue into notes without losing orientation.
8. **Refresh portfolio repository evidence**: I (maintainer) should be able to run a local deterministic repository refresh command that retrieves my current public GitHub repositories, writes checked-in portfolio data, and lets Cloudflare Pages publish the refreshed personal page through the normal Git push-to-main flow.
9. **Use keyboard navigation intentionally**: Native links, disclosures, mobile Menu, local overflow regions, and copy controls work with standard keyboard behavior. Cmd+K on macOS and Ctrl+K elsewhere focus or route to Notes search without hijacking editable fields or IME composition.

## Success Conditions

1. Home, indexes, topic roots, notes, posts, projects, About, Errata, and 404 are recognizable page families within one Inter-based notebook system: oversized Home disclosures, compact listing rows, a centred reading measure, hairline rules, ink links, and system light/dark themes.
2. The core notes structure is preserved: topic hierarchy, child-page routes, search, and all supported Notion block renderers continue to work.
3. The generated site remains deployable as static Cloudflare Pages artifacts without remote font, animation, or API dependencies.
4. The personal portfolio page truthfully presents Praneeth Suresh's public software engineering, AI research/development, project, and philosophy signals using only the approved LinkedIn and GitHub sources; inaccessible source details must not be invented.
5. Portfolio repository listings can be refreshed from public GitHub data without adding runtime dependencies to the deployed static site.
6. The visible Cmd/Ctrl+K search hint matches real behavior and remains safe for editable controls and IME composition.

## Reliability Priorities

1. **Formatting fidelity is highest priority**: Notion formatting must be carried over exactly in published notes.
2. **LaTeX fidelity is mandatory**: Mathematical notation must preserve source intent without degradation (when deployed on CloudFlare pages).
3. **Code block fidelity is mandatory**: Language tags, indentation, and block boundaries must remain intact.

## Non-Goals

- Implement non-static content in Cloudflare pages.

## External Systems

| System           | Why it exists                            | Interface owner  | Failure fallback                                                                                                                                                  |
| ---------------- | ---------------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Notion API       | Source of data for notes.                | notion-connector | If it is not possible to connect to the API, fail the upload. If there is an error while reading, display a warning and ask for user action (retry, skip, abort). |
| Cloudflare Pages | Notes are hosted using Cloudflare pages. |                  | Fail build.                                                                                                                                                       |

## Definition Of Done

A feature is complete only when it has all of the following:

1. A small design artifact update (`design-tree.md` and/or ADR) when design changes.
2. Clear boundary types/interfaces (where language supports this).
3. Behavior tests plus at least one edge case test.
4. Deterministic checks run (`./.beryl/scripts/check.sh` and relevant project checks).
5. No new illegal boundary crossings.
6. Fidelity checks explicitly cover LaTeX and code block rendering.
7. Browser verification with Playwright MCP confirms the generated static UI for any HTML/CSS-facing change.
8. UX changes are documented when presentation or navigation copy changes.
9. Personal page changes include deterministic generation checks and Playwright navigation verification for home-to-portfolio and portfolio-to-home paths.
10. Repository refresh features include deterministic script tests, avoid storing secrets, and document the maintainer workflow for refreshing generated portfolio data before pushing.
11. Keyboard navigation changes include generated markup checks and Playwright verification that shortcuts route correctly while not hijacking text input.
