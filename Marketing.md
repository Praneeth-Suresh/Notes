# Marketing a Personal Blog (Theoretical CS Focus)

## Step List (Do in Order)
1. Define your positioning and reputation goal.
2. Build a story-first content system that signals depth.
3. Make the site SEO-ready and technically fast.
4. Create distribution lanes where viral sharing is plausible.
5. Convert social/community attention into site visits.
6. Build a sustainable publishing cadence with reuse.
7. Grow durable audience channels (email/RSS).
8. Measure, iterate, and double down on what works.

## 1) Positioning and Reputation (Depth-First Authority)
1. Write a single-sentence positioning statement — Use: “I publish rigorous, proof-backed explanations of theoretical CS topics with research-level depth and clear intuition.” Put it on your home page and about page.
2. Create a public “research taste” list — Publish a page that lists 10–15 topics you care about, each with a 1–2 sentence rationale and a few primary sources; this signals seriousness.
3. Standardize a depth signal — Add a consistent section to every post called “Proof Sketch,” “Formal Statement,” or “Model & Assumptions” so readers recognize your rigor.

## 2) Story-First Content (Google Prioritizes Stories)
1. Lead with a story arc — Open posts with a concrete research question, tension, or surprising result; keep the first 150–200 words narrative and curiosity-driven.
2. Use the “Question → Intuition → Formalism → Proof → Implications” template — This is a repeatable narrative that still feels like a story.
3. Add a “Why this matters” section — Ground abstract theory in downstream impact: algorithmic efficiency, correctness guarantees, or research frontier relevance.
4. End with a research trail — Close with references, preprints, and 2–3 “next questions” to encourage sharing by serious readers.

## 3) SEO-Optimized Site (Technical + Editorial SEO)
1. Create a topic pillar page for each major area — Each pillar links to all related posts and explains the scope; treat it as a “living index.”
2. Optimize titles for both rigor and search intent — Example: “NP-Completeness: Formal Definition, Proof Sketches, and Reductions” not just “NP-Completeness Notes.”
3. Add descriptive meta summaries — Use 150–160 characters that mention the problem, method, and result to raise click-through from search.
4. Build internal linking rules — Every post must link to its pillar page and 2–3 related posts; this clusters authority around your core topics.
5. Ensure fast, clean pages — Compress images, avoid heavy scripts, and keep render blocking minimal so page speed does not cap search performance.
6. Add structured data where possible — Article schema and breadcrumb metadata increase eligibility for rich results and help Google understand narrative structure.

## 4) Viral Distribution Lanes (Where Sharing Can Spike)
| Channel | Why It Can Go Viral | How to Post for This Audience |
| --- | --- | --- |
| Hacker News | Loves novel insights and technical clarity | Post a concise summary, lead with the surprising result, and avoid marketing language. |
| Lobsters | Deep technical readership | Emphasize formal reasoning and include citations in the submission text. |
| Reddit (r/compsci, r/math, r/programming) | Strong discussion dynamics | Post as a discussion starter: “Here is a proof intuition—what would you tighten?” |
| Research/engineering newsletters | High trust distribution | Pitch a 2–3 sentence hook plus bullet summary to curators. |
| University forums / reading groups | Targeted authority building | Offer a short, well-structured reading guide and ask for critique. |
| Cross-posting platforms (Dev.to, Medium, Substack) | Built-in distribution | Cross-post a shorter version with canonical links back to your site. |

## 5) Convert Social/Community Attention into Site Visits
1. Use a “hook paragraph” before linking — In social posts, place the key insight first, then link with “Full proof and details here.”
2. Design the landing page for momentum — Ensure the first screen repeats the story hook, shows the table of contents, and highlights proof depth.
3. Add consistent visual previews — Use Open Graph images with theorem-style formatting so shares look authoritative.
4. Use “serial threads” — If you do a thread, each post should build the story and end with a “full derivation” link to your site.

## 6) Sustainability Without Heavy Social Media
1. Pick one primary channel and one secondary — Example: primary is SEO + email, secondary is Hacker News or Lobsters.
2. Set a realistic cadence — Aim for one deep post every 3–4 weeks; publish shorter “research notes” between to stay active.
3. Reuse outputs — Turn each deep post into: a short summary, a diagram, and a FAQ snippet for search.
4. Maintain a “backlog of proofs” — Keep a list of partially finished ideas so publishing does not stall.

## 7) Build Durable Audience Channels
1. Add a focused newsletter sign-up — Offer a simple promise: “One rigorous theoretical CS deep dive per month.”
2. Publish an RSS-friendly summary — Keep a short “In this post” section near the top for fast scanning.
3. Create a “Start Here” page — Guide new readers to your best three posts and a pillar page.

## 8) Establish Research-Grade Credibility
1. Cite primary sources consistently — Include the original papers, textbooks, or lecture notes with links and full titles.
2. Include formal statements — Even if proofs are long, a clean formal statement signals rigor.
3. Share error corrections publicly — A visible “Errata” section builds trust in your precision.
4. Offer reproducible artifacts — Provide LaTeX, pseudocode, or diagrams in clean, reusable formats.

## 9) Metrics That Matter (Track Weekly)
| Metric | Why It Matters | Target Behavior |
| --- | --- | --- |
| Search impressions by topic | Indicates SEO traction | Grow impressions on pillar pages. |
| Click-through rate from search | Signals title quality | Improve titles/meta when CTR is low. |
| Time on page | Indicates depth engagement | Aim for long reads on deep dives. |
| Returning readers | Shows reputation compounding | Increase via email/RSS. |
| External links/backlinks | Authority signal | Improve by publishing high-citation posts. |

## 10) A 30/60/90-Day Execution Loop
| Timeframe | Focus | Output |
| --- | --- | --- |
| 30 days | Positioning + site SEO | Pillar pages, improved titles/meta, fast site. |
| 60 days | Story-first deep posts | 2–3 rigorous posts with proof sections. |
| 90 days | Distribution + authority | 1 viral attempt per month and curated citations. |

## 11) Checklist You Can Reuse Per Post
1. Story hook in the first 150–200 words.
2. Formal statement and intuition included.
3. Proof sketch or rigorous derivation included.
4. “Why this matters” section included.
5. Internal links to pillar page and related posts included.
6. Title and meta summary match actual search intent.
7. One distribution attempt planned (HN, Lobsters, Reddit, or newsletter pitch).

## 12) Autonomous Growth Prompt & Context

You can use the `/goal` command or standard prompts to trigger the `autonomous-growth` skill on this website repository. Below is a tailored prompt pre-filled with the context of this Theoretical CS personal blog.

### The Growth Audit Prompt

Copy and run this prompt to have the agent run an audit and produce an execution plan for your site:

```markdown
I want to run an autonomous growth audit on my personal blog using the autonomous-growth skill.

Here is the context for my site:
- **Primary Domain/Local Path**: file:///home/prane/coding/Notes
- **Website Type**: Personal blog with a Theoretical Computer Science (CS) focus.
- **Positioning/Niche**: Rigorous, proof-backed explanations of theoretical CS topics with research-level depth and clear intuition.
- **Primary Conversion Goal**: Grow durable audience channels (email newsletter sign-up and RSS subscriptions).
- **Acquisition & Distribution Lanes**: SEO (topic pillars, internal linking), Hacker News, Lobsters, Reddit (r/compsci, r/math, r/programming), and research/engineering newsletters.
- **Tech Stack & Content**: Static/markdown-based publishing workflow with lightweight, fast-loading pages.
- **Constraints**: Solo writer, publishing deep dives every 3-4 weeks.

Please audit the live site files and content in this repository, evaluate messaging, conversion paths, growth foundations, and content leverage. Then produce:
1. Growth diagnosis (homepage alignment, biggest bottleneck)
2. Top 3 bets (why, hypothesis, metric, confidence)
3. 30-day week-by-week execution plan (fixes, conversion, content, and distribution)
4. Copy recommendations (homepage headline, primary CTA text, proof block, optimized bio)
5. Scorecard / Metrics to track (search impressions, CTR, read time, newsletter conversions)
```
