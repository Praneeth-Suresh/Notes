# Flagship Essay Distribution Kit

This is an operator-facing draft kit for the flagship essay:

- Essay: [NP-Completeness: Formal Definition, Proof Sketches, and Reductions](/blog/np-completeness-formal-definition-proof-sketches-and-reductions/)
- Primary landing goal: get serious readers to read the essay, then choose `/subscribe/` or `/feed.xml`.
- Owner of external posting: Praneeth.
- Agent-owned status: drafts prepared only. No external post, pitch, comment, or submission has been made.

Before posting anywhere, check the current rules and norms of that community. Do not post the same wording everywhere; pick one primary lane and adapt the hook to the venue.

## Core Positioning

One-sentence description:

> A proof-backed guide to NP-completeness that separates verification from search, defines reductions precisely, and explains why hardness evidence changes algorithm design.

Short hook:

> NP-completeness is not a reason to give up. It is a reason to change the target.

Technical promise:

> The post walks from intuition to the decision-problem model, formal definitions, polynomial-time many-one reductions, a proof-sketch template, and the practical design choices that follow from credible hardness evidence.

Best-fit readers:

- People learning algorithms who want the formal model behind NP-completeness.
- Engineers who have felt a problem turn from implementation work into hardness evidence.
- Readers who like proof sketches, reductions, and the line between search and verification.

## Pre-Submit Checklist

- The live URL resolves.
- The page title and social preview are correct.
- The essay links to the Algorithms pillar.
- The essay links to `/subscribe/`.
- The essay links to `/feed.xml` through the post-end or footer subscription path.
- `/sitemap.xml` includes the essay.
- The post has no horizontal overflow on mobile.
- The Distribution Log row in `GrowthScorecard.md` is ready.
- Current community rules have been checked.

## Hacker News Drafts

Use only if the live page is ready and you are available to answer technical comments.

Title option A:

```text
NP-completeness from intuition to proof sketch
```

Title option B:

```text
NP-completeness as a language for changing the algorithm design target
```

Submission text, if the venue supports it:

```text
I wrote a proof-backed guide to NP-completeness that focuses on the moment when a problem stops looking like an implementation issue and starts looking like hardness evidence.

It defines P, NP, NP-hard, and NP-complete in the decision-problem model, then uses reductions as the main proof mechanism. The practical angle is that NP-completeness should change the target: special cases, approximation, parameterization, randomized approaches, or explicit product tradeoffs.
```

Comment seed, if discussion starts:

```text
The part I most wanted to make precise is the bidirectional correctness burden in reductions. A lot of weak explanations show that the target problem can represent solutions, but skip the direction that every target solution decodes back to a valid source solution.
```

## Lobsters Draft

Title:

```text
NP-Completeness: Formal Definition, Proof Sketches, and Reductions
```

Submission note:

```text
This is a rigorous but compact guide to NP-completeness for readers who want both intuition and the formal reduction shape. It covers P, NP, NP-hardness, NP-completeness, polynomial-time many-one reductions, the two-part proof structure, and why Cook and Karp changed algorithm design practice.

The intended takeaway is not "hard means impossible"; it is that credible hardness evidence should redirect the engineering target toward special cases, approximation, parameterized structure, pruning, randomization, or surfaced uncertainty.
```

Possible tags to consider, depending on current site norms:

```text
algorithms, compsci, math
```

## Reddit Drafts

Use a discussion-first frame. Do not present the post as a finished verdict; invite critique on the proof intuition and reduction framing.

Post title option A:

```text
How would you tighten this explanation of NP-completeness and reductions?
```

Post title option B:

```text
I wrote a proof-backed guide to NP-completeness. Does the reduction intuition hold up?
```

Body:

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

Follow-up comment if someone asks for the shortest summary:

```text
The shortest version is: if a problem is NP-complete, a polynomial-time solver for it would give polynomial-time solvers for every problem in NP, because every NP problem can be translated into it by a polynomial-time reduction.
```

## Newsletter Curator Pitch

Subject options:

```text
Proof-backed NP-completeness guide for algorithms readers
```

```text
Rigorous guide to NP-completeness, reductions, and practical hardness evidence
```

Pitch:

```text
Hi [Name],

I published a rigorous guide to NP-completeness for readers who want both the intuition and the formal reduction shape:

[URL]

The post defines P, NP, NP-hard, and NP-complete in the decision-problem model, then walks through polynomial-time many-one reductions, the construction/runtime/correctness proof template, and why hardness evidence should redirect algorithm design toward special cases, approximation, parameterization, pruning, randomization, or explicit product tradeoffs.

It may be a fit for readers interested in algorithms, complexity theory, and proof-backed engineering judgment.

Best,
Praneeth
```

Three-bullet version:

```text
- A proof-backed guide to NP-completeness that starts with the intuition and ends with the formal reduction shape.
- Covers P, NP, NP-hardness, NP-completeness, many-one reductions, Cook/Karp context, and practical design implications.
- Main takeaway: hardness evidence should change the engineering target, not end the conversation.
```

## Cross-Post Summary

Use this only on platforms where canonical links are allowed and useful.

```text
This essay explains NP-completeness as a practical language for recognizing when a problem's difficulty is structural rather than just an implementation challenge.

It covers the decision-problem model, the difference between verification and search, the definitions of P/NP/NP-hard/NP-complete, and the proof-sketch shape for reductions. The practical conclusion is that a hardness result should redirect the target toward structure, approximation, parameterization, pruning, randomized methods, or explicit uncertainty.

Canonical version: [URL]
```

## After Posting

Record the attempt in `GrowthScorecard.md`:

- Date.
- Channel.
- URL or thread.
- Hook used.
- Landing page.
- Referral visits.
- Newsletter CTA clicks.
- RSS clicks.
- Completed signups, once a newsletter provider exists.
- Notes for the next attempt.

Do not reuse the same copy blindly. If one channel sends engaged readers, use the comments and metrics to refine the next title, opening paragraph, or CTA.

