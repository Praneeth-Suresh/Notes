# Browser Smoke Checks

Use Playwright MCP against the production URL after deployment and after major UI changes.

Production base URL:

```text
https://notes.praneeth-suresh-s.workers.dev
```

## Primary Routes

| Route | Expected browser signal |
| --- | --- |
| `/` | Page loads, heading includes `Praneeth's CS Field Notes`, and header links for Start, About, Projects, Notes, Blog, Contact, and RSS are visible. |
| `/start-here/` | Page loads, heading includes `A first path through the notes.`, and at least one primary/secondary action is visible. |
| `/notes/` | Page loads, heading includes `Search the notes archive.`, notes search input is visible, and topic cards render. |
| `/blog/` | Page loads, heading includes `A Developer's Story`, writing search input is visible, and blog post links render. |
| `/projects/` | Page loads, heading includes `Selected projects`, and project cards render. |
| `/contact/` | Page loads, heading includes `Contact`, and Email, GitHub, and LinkedIn links render. |
| `/subscribe/` | Page loads, heading includes `Subscribe`, and email/RSS subscribe links render. |
| `/about/` | Page loads, heading includes `Praneeth Suresh`, and GitHub/LinkedIn links render. |
| `/collaborate/` | Page loads, heading includes `Collaboration and consulting`, and contact/collaboration CTAs render. |

## Recent Verification

2026-07-04: TinyFish/Playwright automation confirmed all primary routes above load successfully from production.
