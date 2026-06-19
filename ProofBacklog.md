# Proof Backlog

Use this backlog to keep the deep-dive cadence alive without depending on last-minute topic selection. It is not a publication promise. It is a queue of proof-backed ideas grounded in the current site corpus and research-taste page.

## Cadence Rule

- Publish one flagship deep dive every 3-4 weeks.
- Keep one lighter research note or artifact idea available between flagship posts.
- Pick the next post from `Ready next` unless a stronger opportunity appears from Search Console, comments, or a recent distribution attempt.
- Do not distribute a post externally until the checklist in `PostPublishingChecklist.md` passes.
- After each distribution attempt, update `GrowthScorecard.md` and move one follow-up idea into this backlog.

## Status Labels

| Label | Meaning |
| --- | --- |
| Ready next | The site already has enough source material to draft a strong post. |
| Needs source trail | The idea is promising, but needs primary sources or cleaner references before drafting. |
| Needs artifact | The essay would benefit from a diagram, pseudocode, LaTeX scaffold, or worked example before publication. |
| Later | Useful, but not the next best viral or SEO bet. |

## Ready Next

| Candidate | Existing site anchor | Working question | Required proof signal | Reuse asset | Distribution angle |
| --- | --- | --- | --- | --- | --- |
| Dynamic programming and optimal substructure | `/topics/algorithms/dynamic-programming/` | When is a recursive search really a dynamic program? | Formal recurrence, state definition, induction proof of optimal substructure | Small recurrence template | Search, Hacker News, algorithms newsletters |
| Greedy algorithms and exchange arguments | `/topics/algorithms/greedy/` | Why do some greedy choices stay globally safe? | Exchange argument, invariant, counterexample boundary | Two-column "works/fails" table | Lobsters, Reddit discussion |
| Shortest paths and graph structure | `/topics/algorithms/graph-traversal/` | What changes when edges gain weights, negative weights, or constraints? | Model assumptions, relaxation invariant, failure cases | Relaxation pseudocode | Search, university reading groups |
| Primality and randomized thinking | `/topics/algorithms/primality-tests/` | What does randomness buy in primality testing? | Error model, witness idea, probability bound | Witness-check pseudocode | Hacker News, math/compsci Reddit |
| Matrix methods and fast algebra | `/topics/algorithms/matrix-based-solutions/` | When does algebra turn a combinatorial problem into linear algebra? | Matrix formulation, correctness sketch, complexity tradeoff | Worked matrix example | Search, engineering newsletters |

## Needs Source Trail

| Candidate | Existing site anchor | Missing work before drafting |
| --- | --- | --- |
| Amortized data structures | `/research-taste/` | Pick one concrete structure and gather primary or textbook references. |
| Lower bounds and why they matter | `/research-taste/` | Choose one lower-bound technique rather than trying to cover the whole area. |
| Approximation after NP-hardness | `/blog/np-completeness-formal-definition-proof-sketches-and-reductions/` | Select one canonical approximation example and source trail. |
| Parameterized complexity as a design lens | `/blog/np-completeness-formal-definition-proof-sketches-and-reductions/` | Choose a parameterized example that connects to a current Algorithms note. |

## Needs Artifact

| Candidate | Artifact to prepare | Why it helps |
| --- | --- | --- |
| Reduction gadget walkthrough | Diagram or LaTeX scaffold | Serious readers need to inspect both correctness directions. |
| Dynamic programming recurrence design | Fill-in recurrence worksheet | Turns abstract recurrence advice into reusable practice. |
| Greedy exchange argument | Proof skeleton | Helps readers distinguish a proof from intuition. |
| Graph relaxation invariant | Pseudocode plus invariant annotation | Makes correctness visible line by line. |

## Later

| Candidate | Reason to defer |
| --- | --- |
| Concurrency correctness | Strong topic, but it moves away from the first Algorithms SEO pillar. |
| Distributed systems consistency | Needs careful source boundaries and may fit better after one systems pillar is packaged. |
| GPU and matrix multiplication | Good AI-engineering bridge, but likely needs diagrams or benchmarks before publication. |
| Compiler optimizations for AI systems | Promising engineering audience, but less aligned with the first theoretical-CS distribution cycle. |

## Selection Rule

Choose the next post using this order:

1. A Search Console query or referral discussion shows demand for a topic already in `Ready next`.
2. A current Algorithms pillar page needs a flagship post to strengthen internal links.
3. A candidate has a clean formal statement, proof sketch, and reusable artifact path.
4. A distribution channel has an obvious discussion hook that is not promotional.

## Draft Intake Template

When a new idea appears, add it here before drafting:

```text
Candidate:
Existing site anchor:
Working question:
Reader tension:
Formal statement:
Proof sketch shape:
Internal links:
Primary sources needed:
Reusable artifact:
Likely distribution lane:
Status:
```

