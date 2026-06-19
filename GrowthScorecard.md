# Weekly Growth Scorecard

Use this scorecard once per week after deployment. It is designed for the current static site setup: RSS is live, newsletter provider selection is pending, analytics hooks exist in generated HTML, and external distribution remains maintainer-owned.

## Weekly Review Header

- Week starting:
- Review date:
- Primary improvement chosen this week:
- Previous week's chosen improvement:
- Result of previous improvement:
- Next external distribution action, if any:

## Measurement Sources

| Area | Source of truth | Owner | Status |
| --- | --- | --- | --- |
| Search impressions and CTR | Google Search Console | Praneeth | Pending property verification and sitemap submission |
| Page views and referrers | `page_view` analytics event through the chosen provider listening to `notes-analytics` events | Praneeth for provider, agent for site hooks | Site hook present; provider pending |
| RSS clicks | `rss_click` analytics event | Agent-owned site hook, provider pending | Hook present |
| Newsletter CTA clicks | `newsletter_cta_click` analytics event | Agent-owned site hook, provider pending | Hook present |
| Newsletter signups | Newsletter provider dashboard or callback | Praneeth | Provider pending |
| Outbound profile clicks | `outbound_github_click`, `outbound_linkedin_click` events | Agent-owned site hook, provider pending | Hooks present |
| Distribution attempts | Manual log in this file | Praneeth | Ready |
| Backlinks and mentions | Search Console links report, referrers, newsletter/forum mentions | Praneeth | Pending external data |

## Traffic By Channel

Record sessions, users, or page views consistently. Use whichever metric your analytics provider exposes most reliably.

| Channel | Landing pages | Visits | Engaged visits | Notes |
| --- | --- | ---: | ---: | --- |
| Search |  |  |  |  |
| Direct |  |  |  |  |
| Hacker News |  |  |  |  |
| Lobsters |  |  |  |  |
| Reddit |  |  |  |  |
| Newsletters |  |  |  |  |
| GitHub |  |  |  |  |
| LinkedIn |  |  |  |  |
| Other referrals |  |  |  |  |

## Search Console

Track Algorithms separately because it is the first SEO pillar.

| Page or pillar | Impressions | Clicks | CTR | Average position | Queries with high impressions and low CTR | Action |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| Algorithms pillar |  |  |  |  |  |  |
| Flagship NP-completeness essay |  |  |  |  |  |  |
| Start Here |  |  |  |  |  |  |
| Research Taste |  |  |  |  |  |  |
| Blog index |  |  |  |  |  |  |
| Other high-impression page |  |  |  |  |  |  |

## Engagement

Use provider-specific equivalents if exact read time or scroll depth is unavailable.

| Page | Average read time | Scroll depth | Internal clicks to related notes | Return visits | Interpretation |
| --- | ---: | ---: | ---: | ---: | --- |
| Flagship NP-completeness essay |  |  |  |  |  |
| Algorithms pillar |  |  |  |  |  |
| Start Here |  |  |  |  |  |
| Subscribe |  |  |  |  |  |
| Top search landing page |  |  |  |  |  |

## Conversion

Use the same denominator every week so trend lines stay honest.

| Conversion path | Count | Denominator | Rate | Notes |
| --- | ---: | ---: | ---: | --- |
| Newsletter CTA clicks |  | Total visits |  | Event: `newsletter_cta_click` |
| RSS clicks |  | Total visits |  | Event: `rss_click` |
| Subscribe page visits |  | Total visits |  | Route: `/subscribe/` |
| Completed newsletter signups |  | Subscribe page visits |  | Pending provider |
| GitHub outbound clicks |  | Portfolio visits |  | Event: `outbound_github_click` |
| LinkedIn outbound clicks |  | Portfolio visits |  | Event: `outbound_linkedin_click` |
| Returning reader percentage |  | Total users |  | Provider-defined returning user metric |

## Distribution Log

Only record attempts that Praneeth actually runs. Do not count drafted hooks as distribution.

| Date | Channel | URL or thread | Hook used | Landing page | Referral visits | CTA clicks | RSS clicks | Signups | Notes for next attempt |
| --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: | --- |
|  |  |  |  |  |  |  |  |  |  |

## Weekly Decision Rule

Pick exactly one improvement each week:

1. If search impressions are rising but CTR is weak, rewrite one title or meta description.
2. If a page gets traffic but low read time, improve the opening hook, summary, or table of contents.
3. If readers finish posts but do not click subscribe or RSS, adjust the CTA placement or copy.
4. If one channel sends engaged visits, run one follow-up distribution attempt in that channel.
5. If one pillar gets impressions but no clicks to related notes, add or improve internal links.

## Viral Readiness Gate

Before a flagship essay is submitted to an external community, confirm:

- The essay has a concrete hook in the first screen.
- The essay has a formal statement, model, proof sketch, and why-it-matters section.
- Open Graph and Twitter metadata are present.
- `/subscribe/` is reachable from the essay.
- `/feed.xml` is reachable from the essay and footer.
- The sitemap includes the essay.
- The Distribution Log row is prepared but not filled until the submission is live.
