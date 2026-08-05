_I had a PR land that "should have" failed every guardrail.  
The code changed a file the instructions said should never change._

![A terminal log on a rainy night](/blog/images/beryl-01-why-agents-md-isnt-enough.png)

This was my trigger moment.  
I had four instruction files in the repo telling me what agents should do: `AGENTS.md`, `CLAUDE.md`, `copilot-instructions.md`, and a rule file from Cursor. They all looked sensible in isolation.

Then I ran the review on a weekend and realised three of them disagreed on the same behavior.

The result was not one instruction failure.

The failure was that I had no single source of truth for **repo-level behavior**.

I could make this a generic startup post and say "AI agents are hard to trust." That is true, but it is not the point.

The real problem was practical:

- one file said one thing,
- another file said another thing,
- and the command history only showed the final files, not the reasoning path.

In other words, the tools were okay.

My repo process was not.

That’s why I started writing the same sentence everywhere over and over:  
**"AGENTS.md tells the agent what you want. It doesn't check that it happened."**

And that sentence is the one that changed the project.

---

What I learned the hard way

- "Prompt quality" made the output nicer, but not more reliable.
- "More tools" made things faster, but not more grounded.
- "More files" made the system more fragmented.

I wanted one narrow boundary that could be versioned, checked, and reviewed the same way as any other code path.

I started with a tiny thesis:

`repo rules should be in one place, and every agent run should be checkable against it`.

I am still tightening the edges. But that one sentence is the split between this story and everything before it.

This is also why I wrote the second one line in the same way:

> Skills make the agent smarter. I wanted the repo to get stricter.

When I say I’m building this in public, this is the thing I am building first:

not a better model, not a bigger agent, and not a prettier dashboard.

just a stricter repo.

Next up is the concrete build notes, not the theory: what I put in and what I intentionally left out.

[Read Part 2: What Beryl Actually Does (and What It Deliberately Doesn't)](/blog/beryl-02-what-i-built/)
