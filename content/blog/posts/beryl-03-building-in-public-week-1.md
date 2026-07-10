_A project is a claim. A build log is the answer key._

![A whiteboard sketch with sticky notes and comments](/blog/images/beryl-03-building-in-public-week-1.png)

This week is over.  
That is exactly the point.

I wanted this post to read like a memo that actually changes.  
So here is the unstyled version of what happened.

## What I shipped and what broke

I shipped a strict check early and called it done too soon.

One person reported a false positive case.  
The check had flagged behavior that should have passed.

Could I have ignored it and marked "not our problem yet"?  
No, because that false positive was doing exactly the job the project was supposed to do:
surfacing mismatches early.

I edited the boundary and kept moving.

That felt a little uncomfortable, and that was good feedback.

## What I changed this week

- Added a short section in the docs that explains where strictness is intentional.
- Kept the rule format as text files and still reviewable in PRs.
- Made the check output more readable so the failure path is obvious.
- Kept one thing unchanged: it is still deterministic.

## The open question that changed the project direction

I asked people whether this should be built first for:

- maintainers reviewing AI-assisted PRs in a single repo, or
- teams running agents across many repos with mixed styles.

The split was real.  
Most comments landed near both.  
For now I am still prioritising the first one and writing around that.

## What’s next

I am not calling this complete.

I am testing these edges:

1. where strict checks feel too brittle,
2. how to make failure triage clearer,
3. what the default boundary should look like on small personal repos.

If you used this or tried a draft version, I want your input.

Ask me for:

- the one flag you want to enforce first,
- the first case you think should skip with a warning,
- the one hard line where the check should stay strict and never loosen.

If you are interested, I’m also happy to share a practical install pack for your first test repo.
