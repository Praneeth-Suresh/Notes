# Post Publishing Checklist

Use this checklist for every future deep-dive post before adding it to `content/blog/blog-manifest.json` and before preparing external distribution. The goal is to keep the theoretical-CS positioning consistent: intuition first, formal model second, proof sketch always visible, and conversion paths ready before any traffic spike.

## Draft Shape

Every flagship or proof-backed post should include:

- A first-screen story hook that names the tension or surprising result in plain language.
- `## In this post`
- `## The question`
- `## Intuition`
- `## Formal statement`
- `## Model and assumptions`
- `## Proof sketch`
- A worked example, reduction shape, derivation, or pseudocode section when useful.
- `## Why this matters`
- `## Internal trail`
- `## Further reading`
- `## Next questions`
- `## Corrections and clarifications`

For lighter research notes, keep at least:

- A clear question.
- One formal statement, model, or assumption section.
- One proof sketch, derivation, or technical reasoning section.
- One internal link back to a pillar page.
- One next question.

## Opening Hook

Before publishing, check the first 150-200 words:

- The post starts with a concrete problem, research question, or design tension.
- The reader can tell why the topic matters before seeing notation.
- The hook does not overclaim novelty.
- The hook makes a serious reader want the formal version.
- The opening can stand alone as a social or newsletter excerpt.

## Formal Rigor

Check the technical spine:

- Key terms are defined before they are used heavily.
- The model and assumptions are explicit.
- The formal statement matches the prose claim.
- The proof sketch has a clear construction, invariant, reduction, or argument shape.
- Bidirectional claims state both directions.
- Runtime or resource bounds are stated when they matter.
- Edge cases or limitations are named instead of hidden.
- The conclusion does not claim more than the proof supports.

## Source Trail

Use primary or durable sources when possible:

- Original paper, theorem, or primary source.
- Stable textbook or lecture-note reference when it helps readers continue.
- Links use canonical publisher, author, university, or project pages when possible.
- Further reading is specific, not a generic search suggestion.
- The post links to `/errata/` through the corrections section.

## Internal Links

Before publishing, include:

- One link to the strongest relevant pillar page.
- Two or three links to related notes, subpages, or blog posts when they exist.
- One link to `/research-taste/` when the post fits the public source trail.
- One next-reading path that keeps the reader on-site after finishing.

Default theoretical-CS links to consider:

- `/topics/algorithms/`
- `/start-here/`
- `/research-taste/`
- `/subscribe/`
- `/feed.xml`

## Manifest Metadata

Every public post entry in `content/blog/blog-manifest.json` should include:

```json
{
  "slug": "short-search-readable-slug",
  "title": "Search Intent: Formal Topic, Proof Sketch, and Core Mechanism",
  "description": "A 150-160 character summary naming the problem, method, and result or practical implication.",
  "socialPreview": "A share-preview sentence that is accurate, concrete, and not clickbait.",
  "chapter": null,
  "markdownFile": "posts/short-search-readable-slug.md"
}
```

Metadata checks:

- The title is specific enough for search and sharing.
- The description fits the actual post.
- The social preview names the technical reason to click.
- The slug is stable and readable.
- The manifest points to the checked-in markdown file.

## Conversion Readiness

The generated blog template already adds post-end subscription panels. Before distribution, confirm:

- `/subscribe/` is reachable from the generated post.
- `/feed.xml` is reachable from the generated post or shared footer.
- The post appears in `/sitemap.xml`.
- The post appears in `/feed.xml`.
- The post appears in generated search results with a non-empty description.
- `GrowthScorecard.md` has a row ready for the distribution attempt.

## Local Checks

Run:

```bash
node scripts/build-pages.js \
  --manifest content/topic-manifest.json \
  --out dist \
  --site-title "Computer Science Notes" \
  --site-url "https://notes.praneeth-suresh-s.workers.dev"

./scripts/check.sh
```

For HTML or CSS-facing changes, also verify the generated route through Playwright MCP:

- Desktop route loads with the intended title.
- Mobile route has no horizontal overflow.
- MathJax display equations do not widen the page.
- Code blocks remain readable.
- Subscription and internal links are present.

## Distribution Readiness

Do not submit externally until:

- The live URL resolves after deployment.
- Open Graph and Twitter metadata are present.
- The first screen repeats the post's main tension or question.
- The post has a durable internal trail.
- The post has a clear RSS and subscribe path.
- Any draft hook in `DistributionKit.md` has been adapted to the actual post.
- Current community rules have been checked by Praneeth.

External posting, replies, newsletter curator relationships, and social/community judgment remain maintainer-owned.

## Post-Publish Measurement

After Praneeth posts or pitches externally, record in `GrowthScorecard.md`:

- Channel.
- Live thread, post, or pitch URL when available.
- Hook used.
- Landing page.
- Referral visits.
- Newsletter CTA clicks.
- RSS clicks.
- Completed signups once a newsletter provider exists.
- Comment quality and objections.
- One improvement for the next post or next distribution attempt.

