# Design Tree

## Current Design Concept

Content is all put together: the HTML for all the pages and the associated static files. Design features are separate that influence the appearance of the Pages. Scripts to update content by pulling data from notion will be separate.

## Open Decisions

| Decision                         | Options                                    | Current Lean | Why                                     |
| -------------------------------- | ------------------------------------------ | ------------ | --------------------------------------- |
| How to extract HTML from Notion? | [Custom Built Parser, Use exisitng Parser] | [B]          | This makes the design less error prone. |
| How to ensure style consistency? | Need to explore options.                   | -            | -                                       |

## Settled Decisions

| Decision   | Choice   | Date         | ADR               |
| ---------- | -------- | ------------ | ----------------- |
| [Question] | [Choice] | [YYYY-MM-DD] | [ADR link or n/a] |

## Pressure Points

- How do design tests such that whenever the code is pushed to the main branch, there is assured to be a successful deployment to Cloudflare pages.

## Recording Rule (Design Tree vs ADR)

Add or update this file when:

- A decision is still evolving.
- You are comparing options before implementation.
- The choice may still change after one or two slices.

Create an ADR when:

- The decision changes module boundaries, persistence shape, adapter contracts, security model, naming conventions used across contexts, or test strategy.
- Future contributors are likely to revisit the choice without clear repo history.
