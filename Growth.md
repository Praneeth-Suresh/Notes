# Growth Execution Plan

## Actionable Tasks

### 1. Set the conversion foundation

- [ ] Choose the owned-audience stack:
  - Newsletter provider.
  - RSS or Atom feed format.
  - Analytics tool.
  - Google Search Console property.
- [ ] Add analytics instrumentation for:
  - Page views.
  - Newsletter CTA clicks.
  - RSS clicks.
  - Completed newsletter signups.
  - Outbound GitHub and LinkedIn clicks.
- [ ] Generate an RSS or Atom feed from blog posts and major topic updates.
- [ ] Add visible RSS links in the site header, footer, blog index, and post-end blocks.
- [ ] Add a newsletter signup path with the promise:
  - "One rigorous theoretical CS deep dive every 3-4 weeks."
- [ ] Add a post-conversion destination:
  - Thank-you page or inline success state.
  - Link back to the best starting topic.
  - RSS fallback for readers who do not want email.

### 2. Reposition the homepage around the real niche

- [ ] Replace the current generic homepage headline with:
  - "Theoretical CS, from intuition to proof."
- [ ] Replace the current homepage subhead with:
  - "Rigorous notes on algorithms, computation, systems, and AI engineering, written for readers who want the idea, the formal model, and the proof sketch in one place."
- [ ] Make the primary homepage CTA:
  - "Get the monthly deep dive."
- [ ] Keep a secondary CTA:
  - "Browse the notes."
- [ ] Add a visible RSS CTA:
  - "Subscribe by RSS."
- [ ] Add a proof block near the first topic section:
  - "125 static pages, 111 generated topic pages, and deep notes across algorithms, operating systems, agentic coding, AI engineering, and software systems."
- [ ] Add a short bio block:
  - "Praneeth Suresh writes rigorous computer science notes that connect intuition, formal models, and proof sketches. His work focuses on algorithms, systems, AI engineering, and the habits needed to reason clearly about complex technical ideas."

### 3. Add subscription paths to high-intent pages

- [ ] Add a compact newsletter/RSS block at the end of every blog post.
- [ ] Add a compact newsletter/RSS block near the top and bottom of every topic page.
- [ ] Add the same block to the Algorithms pillar first, then Operating Systems, then AI Engineering.
- [ ] Add a "Start here" link from the homepage to the strongest pillar page.
- [ ] Add "next reading" links at the end of long topic pages.
- [ ] Add an internal link from each future blog post back to its pillar page.

### 4. Fix SEO and sharing metadata

- [ ] Add meta descriptions to all generated pages.
- [ ] Add canonical URLs to all generated pages.
- [ ] Add Open Graph tags for:
  - Homepage.
  - Blog index.
  - Blog posts.
  - Topic pages.
- [ ] Add Twitter card tags for shared previews.
- [ ] Add Article schema for blog posts.
- [ ] Add Breadcrumb schema for topic pages and subpages.
- [ ] Add generated social preview text for flagship posts.
- [ ] Submit the sitemap and feed to Search Console after deployment.

### 5. Turn Algorithms into the first SEO pillar

- [ ] Rewrite the Algorithms topic description around search intent:
  - Algorithms explained with intuition, formal models, proof sketches, and implementation tradeoffs.
- [ ] Add a "Start here" section to Algorithms:
  - Algorithm design.
  - Invariants.
  - Asymptotic analysis.
  - Reductions.
  - NP-completeness.
- [ ] Add internal links between related Algorithms subpages.
- [ ] Add a table-of-contents style path for readers:
  - Foundations.
  - Analysis.
  - Graphs.
  - Dynamic programming.
  - Complexity.
- [ ] Add a subscription block after the first major section and at the end.
- [ ] Track Search Console impressions and CTR for the Algorithms pillar separately.

### 6. Publish one flagship theoretical CS essay

- [ ] Pick one flagship topic from the existing corpus:
  - NP-completeness and reductions.
  - Amortized analysis.
  - Invariants in algorithm design.
  - Why lower bounds matter.
- [ ] Use this structure:
  - Question.
  - Intuition.
  - Formal statement.
  - Model and assumptions.
  - Proof sketch.
  - Worked example.
  - Why this matters.
  - Further reading.
- [ ] Add citations to primary sources, textbooks, or lecture notes.
- [ ] Add a short "In this post" summary near the top.
- [ ] Add a clear post-end CTA:
  - "Get the next proof-backed CS deep dive."
- [ ] Link the essay from the Algorithms pillar and homepage.

### 7. Run one focused distribution cycle

- [ ] Create a short submission hook for Hacker News.
- [ ] Create a more formal submission note for Lobsters.
- [ ] Create a discussion-first Reddit version for r/compsci or r/math.
- [ ] Pitch the essay to 3-5 research or engineering newsletter curators.
- [ ] Do not distribute until the landing page has newsletter and RSS capture.
- [ ] Log each distribution attempt with:
  - Channel.
  - Date.
  - Hook used.
  - Referral traffic.
  - Newsletter conversions.
  - Notes for next attempt.

### 8. Create the weekly growth scorecard

- [ ] Track traffic by channel:
  - Search.
  - Direct.
  - Hacker News.
  - Lobsters.
  - Reddit.
  - Newsletters.
- [ ] Track Search Console metrics:
  - Impressions by topic pillar.
  - Clicks by topic pillar.
  - CTR for top pages.
  - Queries with high impressions and low CTR.
- [ ] Track engagement:
  - Average read time.
  - Scroll depth on flagship posts.
  - Internal clicks to related notes.
- [ ] Track conversion:
  - Newsletter CTA click rate.
  - Newsletter signup conversion rate.
  - RSS clicks.
  - Returning reader percentage.
- [ ] Review the scorecard every week and choose one improvement:
  - Rewrite a title.
  - Add an internal link.
  - Improve a CTA.
  - Pitch one distribution channel.
  - Refresh one high-potential page.

## 30-Day Execution Order

### Task 1: Measurement and capture

- Choose analytics, newsletter, and feed tools.
- Add analytics events.
- Generate RSS or Atom.
- Add the first newsletter signup path.
- Add Search Console verification.

### Task 2: Homepage and template conversion

- Update homepage positioning and CTA copy.
- Add RSS/newsletter links to persistent navigation areas.
- Add subscription blocks to blog posts and topic pages.
- Add the proof block and optimized bio.

### Task 3: SEO pillar and flagship content

- Turn Algorithms into the first polished pillar.
- Add topic descriptions, internal links, and reading paths.
- Draft and publish one flagship theoretical CS essay.
- Add metadata, canonical URLs, and social preview tags.

### Task 4: Distribution and iteration

- Submit the flagship essay to one primary community.
- Pitch it to selected newsletters.
- Review referral quality, read time, and conversions.
- Improve the headline, CTA, or internal links based on the data.

## Rationale

The current site already has the hardest growth asset: a large body of deep technical content. The generated site contains 125 HTML pages, including 111 topic pages. The Algorithms corpus alone has enough depth to become a search and authority pillar. The growth problem is not a lack of material.

The first bottleneck is conversion. The homepage currently tells visitors that this is a "Computer Science Notes" site, but it does not make a strong promise about rigorous, proof-backed theoretical CS. It also does not ask readers to join an owned audience channel. If Hacker News, Lobsters, Reddit, or search sends a strong reader today, the site gives them useful reading but no durable reason to return.

The second bottleneck is metadata and discoverability. The generated pages have titles, but they do not currently have meta descriptions, canonical tags, Open Graph tags, or analytics instrumentation. That weakens search click-through, link previews, measurement, and iteration. Fixing these foundations improves every future post and topic page.

The third bottleneck is content packaging. The topic pages contain useful depth, but they read like notes rather than public landing pages. A strong pillar page should orient a new reader, show a learning path, link related notes, and convert engaged readers into newsletter or RSS subscribers. Algorithms is the best first candidate because it already has the most topic depth and aligns directly with the theoretical CS positioning.

The fourth bottleneck is distribution readiness. Community distribution can create spikes, but those spikes are wasted without capture. Hacker News, Lobsters, Reddit, and newsletter pitches should come after the landing page, post template, RSS, and newsletter path are ready. That keeps the distribution loop tied to durable audience growth instead of one-time traffic.

The highest-leverage sequence is therefore:

1. Measure and capture.
2. Clarify the promise.
3. Package one pillar.
4. Publish one signature essay.
5. Distribute only after the conversion path works.
6. Use the scorecard to decide the next iteration.

This keeps the work realistic for a solo writer publishing every 3-4 weeks. It avoids a broad redesign and focuses on changes that compound across every future post.
