_I stopped trying to make the agent "smarter" and started making the repository the stricter layer._

![Repository map with tagged boundaries and review gates](/blog/images/beryl-02-what-i-built.png)

Part 1 ended at the realization.  
Part 2 is what I changed in code.

I wanted a model-agnostic boundary, so I split the problem into three parts:

1. one contract directory,
2. one deterministic check,
3. review evidence in files, not chat snippets.

## What exists today

The current flow is simple enough to describe:

- `.beryl/agent/` is the central policy and operating contract for a repo.
- `./.beryl/scripts/check.sh` reads that contract and runs a deterministic check suite.
- I get the same pass/fail output for the same repo state, no “I think it’s fine” layer.

That third point matters the most for me.  
As soon as output lives in files, it is reviewable and debuggable.

In practical terms, this gave me an auditable loop for anything agent-generated:

task → changes → check → evidence → human signoff.

No one should treat a chat log like a compliance system.

## What it is not

I wrote this deliberately because it avoids a lot of confusion:

- Beryl is not a new agent runtime.
- Beryl is not a model wrapper.
- Beryl is not a skill marketplace.
- Beryl does not replace code review.
- Beryl does not promise that every output is correct.

It is intentionally narrow because narrow systems are easier to reason about.

## First 30 minutes checklist

If you are trying this on a repo you already use:

1. Install Beryl into the repo.
2. Run `./.beryl/scripts/check.sh`.
3. Check what changed in routing, policy, and review output.
4. Tighten or loosen the boundary based on your own judgment.

That last step is the part that stays human.

I kept notes on the intended proof surface while building this:

- `proof/agent-folder-map.md` for folder ownership and intent.
- `proof/deterministic-check-proof.md` for what deterministic means and why I trust it.

The next post is the one I care about most right now: what people actually said when they tried it.

[Read Part 3: Week 1 of Building Beryl in Public](/blog/beryl-03-building-in-public-week-1/)
