# External Growth Handoff

This is the maintainer-owned checklist after the repository-side growth work. The site now has RSS, metadata, subscription paths, sitemap/robots, a flagship essay, distribution drafts, scorecard, publishing checklist, proof backlog, and reusable proof artifact. The remaining steps require live accounts, deployment access, community judgment, or personal brand context.

## Before Deployment

- Review the canonical production domain used by the build command.
- Run:

```bash
node scripts/build-pages.js \
  --manifest content/topic-manifest.json \
  --out dist \
  --site-title "Computer Science Notes" \
  --site-url "https://notes.praneeth-suresh-s.workers.dev"

./scripts/check.sh
```

- Review the generated `dist/` diff.
- Push the repository through the normal Cloudflare Pages flow.

## Account Decisions

Choose and configure these outside the repository:

| Decision | Current repo state | Maintainer action |
| --- | --- | --- |
| Newsletter provider | `/subscribe/` is provider-neutral and RSS-backed | Choose provider and decide whether to wire a public signup endpoint later |
| Analytics provider | Static pages emit `notes-analytics` browser events | Choose provider and connect a listener without committing secrets |
| Search Console | `/sitemap.xml`, `/robots.txt`, and `/feed.xml` are generated | Verify property, submit sitemap and feed after deployment |
| Distribution channels | `DistributionKit.md` has draft hooks | Pick one primary channel and adapt the hook manually |

## First Launch Sequence

1. Deploy the site.
2. Open the live homepage, `/subscribe/`, `/feed.xml`, `/sitemap.xml`, and the flagship NP-completeness essay.
3. Confirm the live source includes `og:image`, `twitter:image`, Article schema, and FAQPage schema on the flagship essay.
4. Submit `/sitemap.xml` and `/feed.xml` in Search Console.
5. Choose one primary distribution lane from `DistributionKit.md`.
6. Post or pitch manually.
7. Record the attempt in `GrowthScorecard.md`.

## First Distribution Target

Use the flagship essay:

- `/blog/np-completeness-formal-definition-proof-sketches-and-reductions/`

Before posting:

- Check current community rules.
- Prefer one channel first instead of posting everywhere.
- Be available to answer technical comments.
- Use a discussion-first hook, not promotional language.
- Log the live thread URL and results in `GrowthScorecard.md`.

## What Not To Claim

- Do not claim email signup is live until a provider is selected and wired.
- Do not claim Search Console metrics exist until the property is verified and data has accumulated.
- Do not claim newsletter conversions until there is a real signup provider.
- Do not count drafted distribution copy as a distribution attempt.
- Do not reuse the same post text across communities without adapting it.

## First Weekly Review

One week after the first distribution or Search Console data appears:

- Fill `GrowthScorecard.md`.
- Compare referral quality, RSS clicks, subscribe-page visits, and internal clicks.
- Pick exactly one improvement: title/meta rewrite, CTA tuning, internal link addition, opening hook edit, or one follow-up distribution attempt.
- Move the next essay candidate from `ProofBacklog.md` into drafting only after reviewing the scorecard.

