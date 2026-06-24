# Distribution

Use this as the only follow-up document for publicising the site. It starts from the current repository state: the static site already has RSS, subscription surfaces, metadata, sitemap/robots, an errata page, a Start Here page, a Research Taste page, and the flagship NP-completeness essay. The remaining work is maintainer-owned: live accounts, deployment checks, external posting, replies, and weekly measurement.

## Current Target

- Primary asset: `/blog/np-completeness-formal-definition-proof-sketches-and-reductions/`
- Primary goal: get serious readers to read the essay, then choose `/subscribe/` or `/feed.xml`.
- Primary audience: serious CS readers, algorithms students, engineers who care about formal reasoning, and AI/systems builders who like proof-backed technical writing.
- First distribution rule: use one primary channel first, respond to the discussion, measure it, then decide the next channel.

## Tasks

### 1. Deploy and verify the live site

- [ ] Confirm the production domain you want to publicise.
- [ ] Build the site with that domain:

```bash
node scripts/build-pages.js \
  --manifest content/topic-manifest.json \
  --out dist \
  --site-title "Computer Science Notes" \
  --site-url "https://notes.praneeth-suresh-s.workers.dev"

./scripts/check.sh
```

- [ ] Review the generated `dist/` diff before pushing.
- [ ] Push through the normal Cloudflare Pages flow.
- [ ] Open these live URLs after deployment:
  - Home page.
  - `/subscribe/`
  - `/feed.xml`
  - `/sitemap.xml`
  - `/blog/np-completeness-formal-definition-proof-sketches-and-reductions/`
- [ ] On the flagship essay, confirm the first screen has a concrete hook and the page links to `/subscribe/` and `/feed.xml`.
- [ ] Check mobile quickly in your browser: no horizontal scrolling, equations/code blocks fit, and the subscribe/RSS links are visible.

### 2. Connect the external measurement basics

- [ ] Verify the site in Google Search Console.
- [ ] Submit `/sitemap.xml`.
- [ ] Submit `/feed.xml` if Search Console accepts it for the property.
- [ ] Use URL Inspection on the home page, `/topics/algorithms/`, and the flagship essay.
- [ ] Choose an analytics provider.
- [ ] Connect the existing browser events to that provider without committing secrets. The site already emits:
  - `page_view`
  - `rss_click`
  - `newsletter_cta_click`
  - `outbound_github_click`
  - `outbound_linkedin_click`
- [ ] Confirm the analytics provider can show referrer/source, landing page, and event counts.

### 3. Decide whether email capture is live or RSS-only

- [ ] Choose a newsletter provider, or intentionally stay RSS-only for the first distribution cycle.
- [ ] If email capture is not live, do not claim a newsletter signup exists. Say "subscribe by RSS" or "monthly updates by email are coming."
- [ ] If email capture is live, test the full path:
  - Visit `/subscribe/`.
  - Submit with a test email.
  - Confirm the provider records the signup.
  - Confirm any confirmation email or success state is acceptable.
- [ ] Keep provider secrets out of the repository.

### 4. Prepare the flagship essay for one external channel

- [ ] Re-read the flagship essay from the live URL.
- [ ] Check current rules and norms for the channel before posting.
- [ ] Pick exactly one primary channel for the first attempt.
- [ ] Be available for comments for at least the first few hours after posting.
- [ ] Use a discussion-first hook. Do not use promotional language.

Good first-channel options:

| Channel | Use when | Suggested angle |
| --- | --- | --- |
| Hacker News | You can monitor discussion closely and want a high-variance traffic spike. | "NP-completeness is not a reason to give up. It is a reason to change the target." |
| Lobsters | You want a smaller, more technical discussion. | Emphasize formal definitions, reductions, proof structure, and practical design implications. |
| Reddit | You want critique and discussion rather than a link drop. | Ask whether the proof intuition and bidirectional reduction framing are clear. |
| Newsletter curators | You want slower but higher-trust discovery. | Pitch it as a rigorous guide for algorithms and complexity readers. |

### 5. Use one adapted posting draft

Adapt the wording to the venue. Do not paste the same copy everywhere.

Hacker News title options:

```text
NP-completeness from intuition to proof sketch
```

```text
NP-completeness as a language for changing the algorithm design target
```

Hacker News comment seed:

```text
The part I most wanted to make precise is the bidirectional correctness burden in reductions. A lot of weak explanations show that the target problem can represent source solutions, but skip the direction that every target solution decodes back to a valid source solution.
```

Lobsters submission note:

```text
This is a rigorous but compact guide to NP-completeness for readers who want both intuition and the formal reduction shape. It covers P, NP, NP-hardness, NP-completeness, polynomial-time many-one reductions, the two-part proof structure, and why Cook and Karp changed algorithm design practice.

The intended takeaway is not "hard means impossible"; it is that credible hardness evidence should redirect the engineering target toward special cases, approximation, parameterized structure, pruning, randomization, or surfaced uncertainty.
```

Reddit discussion frame:

```text
I wrote a guide to NP-completeness that tries to connect the intuition to the formal model:

- P, NP, NP-hard, and NP-complete as decision-problem classes
- why verification and search are different tensions
- polynomial-time many-one reductions
- the construction / runtime / correctness structure of a reduction proof
- why hardness evidence changes the practical algorithm design target

The claim I am trying to make precise is: NP-completeness is not a reason to give up; it is a reason to change the target.

I would especially value critique on whether the proof-sketch section makes the bidirectional correctness requirement clear.

Full post: [link]
```

Newsletter curator pitch:

```text
Subject: Proof-backed NP-completeness guide for algorithms readers

Hi [Name],

I published a rigorous guide to NP-completeness for readers who want both the intuition and the formal reduction shape:

[URL]

The post defines P, NP, NP-hard, and NP-complete in the decision-problem model, then walks through polynomial-time many-one reductions, the construction/runtime/correctness proof template, and why hardness evidence should redirect algorithm design toward special cases, approximation, parameterization, pruning, randomization, or explicit product tradeoffs.

It may be a fit for readers interested in algorithms, complexity theory, and proof-backed engineering judgment.

Best,
Praneeth
```

### 6. Log the distribution attempt

- [ ] Add a row here after the post or pitch is live.
- [ ] Do not count draft text as a distribution attempt.
- [ ] Fill unknown metrics later instead of guessing.

| Date | Channel | URL/thread | Hook used | Landing page | Referral visits | CTA clicks | RSS clicks | Signups | Notes for next attempt |
| --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: | --- |
|  |  |  |  |  |  |  |  |  |  |

### 7. Run a weekly review

- [ ] Pick one review day each week.
- [ ] Check traffic by channel: search, direct, Hacker News, Lobsters, Reddit, newsletters, GitHub, LinkedIn, and other referrals.
- [ ] Check Search Console for:
  - Impressions.
  - Clicks.
  - CTR.
  - Average position.
  - Queries with high impressions and low CTR.
- [ ] Check engagement for the flagship essay, `/topics/algorithms/`, `/start-here/`, and `/subscribe/`.
- [ ] Check conversions:
  - `newsletter_cta_click`
  - `rss_click`
  - `/subscribe/` visits
  - completed signups, if email capture is live
- [ ] Choose exactly one improvement for the next week:
  - Rewrite one title or meta description.
  - Improve one opening hook.
  - Add one internal link.
  - Adjust one CTA.
  - Run one follow-up distribution attempt in the best-performing channel.

### 8. Prepare the next proof-backed post

- [ ] Choose the next post only after the first distribution attempt or one week of Search Console data.
- [ ] Start from one of these candidates:
  - Dynamic programming and optimal substructure.
  - Greedy algorithms and exchange arguments.
  - Shortest paths and graph structure.
  - Primality and randomized thinking.
  - Matrix methods and fast algebra.
- [ ] Before drafting, write:
  - Working question.
  - Reader tension.
  - Formal statement.
  - Proof sketch shape.
  - Internal links.
  - Primary sources needed.
  - Reusable artifact, if any.
  - Likely distribution lane.
- [ ] Every flagship post should include:
  - First-screen story hook.
  - `## In this post`
  - `## The question`
  - `## Intuition`
  - `## Formal statement`
  - `## Model and assumptions`
  - `## Proof sketch`
  - Worked example, reduction shape, derivation, or pseudocode.
  - `## Why this matters`
  - `## Internal trail`
  - `## Further reading`
  - `## Next questions`
  - `## Corrections and clarifications`
- [ ] Add the post to `content/blog/blog-manifest.json` with a search-readable slug, title, description, and social preview.
- [ ] Build and check locally before publishing:

```bash
node scripts/build-pages.js \
  --manifest content/topic-manifest.json \
  --out dist \
  --site-title "Computer Science Notes" \
  --site-url "https://notes.praneeth-suresh-s.workers.dev"

./scripts/check.sh
```

### 9. Avoid these mistakes

- [ ] Do not post externally before the live URL works.
- [ ] Do not claim email signup is live unless the provider is wired and tested.
- [ ] Do not claim Search Console trends until the property is verified and data has accumulated.
- [ ] Do not reuse the exact same copy across communities.
- [ ] Do not distribute every channel at once; one focused attempt gives cleaner feedback.
- [ ] Do not optimize for traffic alone. Prefer serious comments, RSS clicks, subscribe-page visits, backlinks, and return readers.
