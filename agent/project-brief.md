# Project Brief

## Product Goal

Build **Cloudflare Pages** for **everyone interested in Computer Science** so they can **view my notes and get inspired to work in Computer Science**.

This website embraces a  **minimalist academic aesthetic** , prioritizing readability and focus. The layout is clean and structured, with ample white (or dark) space to reduce cognitive load. Typography is elegant yet functional—think **serif headers for authority** (e.g., Lora or Merriweather) paired with **sans-serif body text for legibility** (e.g., Open Sans or Inter).

## Primary Workflows

1. **Go through notes**: User should navigate from home page with different topics I write about (Algorithms, Data Structures, Operating Systems, Agentic Coding, etc.) to the topic page from which they can navigate to pages lower down in the hierarchy (more granular topics such as Dynamic Programming).
2. **Search**: User should be able to search for a topic and retrieve the notes about the topic they want.
3. **Upload notes**: I (maintainer) will provide a link to a notion page (top level page about topic) and the topic it corresponds to. The page should be recursively read (with notion API) to re-populate the HTML page for the topic.
4. **Home Page**: This is a minimalist canvas that feels like stepping into a quiet, sunlit library—where every element invites reflection. The design blends artistic subtlety with  intellectual curiosity , using visual metaphors to hint at your identity as a creator, thinker, and builder.

## Reliability Priorities

1. **Formatting fidelity is highest priority**: Notion formatting must be carried over exactly in published notes.
2. **LaTeX fidelity is mandatory**: Mathematical notation must preserve source intent without degradation.
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
4. Deterministic checks run (`./scripts/check.sh` and relevant project checks).
5. No new illegal boundary crossings.
6. Fidelity checks explicitly cover LaTeX and code block rendering.
