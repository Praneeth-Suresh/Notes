# Building a Second Brain from Legacy Documents

A second brain is only useful if it can be trusted. For an agent-managed knowledge base, that means three things: the source files must be inspectable, the migration must preserve originals, and retrieval must be designed into the repository from the beginning.

The common failure mode is to treat the second brain as a nicer folder structure. That is not enough. A folder tree helps humans browse, but an agent needs predictable metadata, canonical document types, audit trails, and a clear rule for when to read summaries versus original files.

The better target is a repository that works as both a human knowledge base and an agent-operating environment.

## Core Principles

Use Markdown as the source of truth. Markdown keeps the knowledge portable across editors, agents, static sites, and future tools. Binary files can remain in the system, but they should not be the primary reasoning surface.

Preserve originals. Word documents, Excel sheets, PDFs, scans, and exported legacy files should be stored in an append-only originals area. The converted Markdown version is the working copy; the original is the audit artifact.

Prefer actionability over taxonomy. Organize current material around what it is used for, not just what topic it belongs to. A project that is active should be easy to find because it is active, not because someone remembered the perfect folder.

Make retrieval boring. Every important page should have frontmatter fields such as status, owner, area, tags, source files, dates, and review cadence. The agent should be able to filter the repository before reading large documents.

Keep migration incremental. Do not perfectly classify years of stale files before the system can be used. Put the raw legacy export somewhere safe, migrate active material first, and promote historical files only when they become relevant again.

## Recommended Repository Shape

This is PARA adapted for agent retrieval and auditability.

```text
second-brain/
├── projects/
│   └── project-name/
│       ├── brief.md
│       ├── design.md
│       ├── decision-log.md
│       └── handoff.md
├── areas/
│   └── area-name/
│       ├── overview.md
│       ├── operating-rules.md
│       └── recurring-decisions.md
├── resources/
│   ├── templates/
│   ├── policies/
│   ├── references/
│   └── playbooks/
├── approvals/
│   ├── pending/
│   ├── approved/
│   ├── rejected/
│   └── superseded/
├── originals/
│   ├── projects/
│   ├── areas/
│   ├── resources/
│   └── archive/
├── archive/
│   ├── completed-projects/
│   └── legacy-raw/
└── agent/
    ├── project-brief.md
    ├── architecture.md
    ├── testing-policy.md
    ├── task-routing.md
    └── skills/
```

The important addition to ordinary PARA is `originals/`. It prevents the knowledge base from becoming lossy. If a Markdown file summarizes or converts a Word document, the frontmatter should point back to the original file. If an Excel workbook becomes CSV or a Markdown summary, the workbook still remains available for audits.

`approvals/` is also deliberately top-level. Approvals often need to be queried across all projects, areas, and owners. Treating them as a first-class operational lane makes it easier to answer questions like "what is waiting on review?" or "what changed after approval?"

## Minimum Frontmatter

Every durable Markdown page should start with structured metadata.

```yaml
---
title: "Document Title"
type: project-brief
status: active
area: operations
owner: person-or-team
created: 2026-07-06
updated: 2026-07-06
review_after: 2026-08-06
tags:
  - second-brain
  - migration
source_files:
  - originals/projects/example/original.docx
related:
  - projects/example/design.md
---
```

The exact schema can change, but the fields should answer the retrieval questions: what is this, who owns it, is it current, where did it come from, and what should the agent read next?

## Retrieval Flows

The agent should not read the whole repository for every task. A useful second brain has explicit retrieval paths.

For active work:

1. Search frontmatter for `status: active`.
2. Filter by `area`, `owner`, `project`, or `tags`.
3. Read the project `brief.md` first.
4. Read `design.md`, `decision-log.md`, and relevant approvals only when needed.
5. Open original files only when the Markdown summary is insufficient or the task is audit-related.

For approvals:

1. Search `approvals/pending/`.
2. Read the linked project brief and decision log.
3. Generate a recommendation or review packet.
4. Move the approval file only after human or process approval.
5. Record the final decision in the project decision log.

For audits:

1. Start from the requested project, area, time period, or decision.
2. Read Markdown summaries and decision logs.
3. Follow `source_files` links into `originals/`.
4. Produce an audit bundle listing Markdown files, original files, decisions, approvals, and unresolved gaps.

For legacy migration:

1. Inventory the legacy folder before conversion.
2. Triage files into active, reference, archive, and junk-review buckets.
3. Convert only active and high-value reference files first.
4. Store every original under `originals/` or `archive/legacy-raw/`.
5. Create Markdown stubs for important binary files that cannot be converted cleanly.

## Copy-Ready Agent Prompt

Use this prompt when starting from a legacy folder of documents and asking a coding agent to build the second brain.

```text
You are helping me turn a legacy folder of documents into a git-backed second brain.

Goal:
Create a portable, auditable, agent-readable knowledge repository from the legacy folder I provide. The final system should use Markdown as the working source of truth, preserve original documents for audit, and include retrieval flows that let a coding agent find the right context without reading the entire repository.

Inputs:
- Legacy folder path: [INSERT PATH]
- Repository path: [INSERT PATH]
- Main areas of responsibility: [INSERT AREA NAMES]
- Does this system need approvals? [YES/NO]
- Any required document types: [PROJECT BRIEF, DESIGN DOC, DECISION LOG, MEETING NOTES, POLICY, ETC.]

Hard requirements:
1. Install and initialize Beryl from https://github.com/Praneeth-Suresh/Beryl before doing repository setup work.
2. Inspect the Beryl install instructions before running them.
3. Pin Beryl to a tag or commit if the install flow supports it.
4. If Beryl cannot be installed or initialized, stop and report the exact issue. Do not silently continue without it.
5. Do not delete legacy files.
6. Do not overwrite original Word, Excel, PDF, image, or scan files.
7. Treat originals as append-only audit artifacts.
8. Keep Markdown files readable by humans and easy for agents to retrieve.
9. Prefer existing repository conventions if the repository already contains instructions, checks, or agent files.

Repository structure:
Create or adapt this structure:

second-brain/
├── projects/
├── areas/
├── resources/
│   ├── templates/
│   ├── policies/
│   ├── references/
│   └── playbooks/
├── approvals/
│   ├── pending/
│   ├── approved/
│   ├── rejected/
│   └── superseded/
├── originals/
│   ├── projects/
│   ├── areas/
│   ├── resources/
│   └── archive/
├── archive/
│   ├── completed-projects/
│   └── legacy-raw/
└── agent/

If approvals are not needed, omit the approvals workflow but keep the structure extensible.

Step 1: Repository control plane
- Install and initialize Beryl.
- Read the generated or existing agent instructions.
- Create or update agent-facing repository documentation so future agents know:
  - the purpose of the second brain
  - the folder structure
  - the document schema
  - the migration policy
  - the retrieval policy
  - the audit policy
  - the checks that must pass before work is complete

Step 2: Inventory the legacy folder
- Walk the legacy folder recursively.
- Produce an inventory file with:
  - original path
  - file name
  - extension
  - size
  - modified date when available
  - inferred category
  - proposed destination
  - conversion strategy
  - notes or warnings
- Do not convert files before producing the inventory.

Step 3: Triage
Classify files into:
- active: current work that should become first-class Markdown
- reference: useful durable knowledge
- archive: historical material kept mainly for traceability
- original-only: binary or complex files that should stay as originals with Markdown stubs
- junk-review: likely duplicates or obsolete files, but still not deleted

Write the triage result to a Markdown report and a machine-readable CSV or JSON file.

Step 4: Create templates
Create templates under resources/templates/ for:
- project brief
- design document
- decision log
- meeting notes
- policy or operating rule
- approval request, if approvals are needed
- original-file stub
- audit bundle

Each template must include YAML frontmatter with fields for:
- title
- type
- status
- area
- owner
- created
- updated
- review_after
- tags
- source_files
- related

Step 5: Convert active and high-value files
- Convert Word documents to Markdown where practical.
- Convert tabular Excel data to CSV when it is actually structured data.
- Summarize complex Excel workbooks in Markdown and link to the original workbook.
- Keep PDFs and scans as originals unless reliable text extraction is available.
- Create Markdown stubs for important binary files.
- Preserve the original folder lineage in frontmatter or notes.
- Put all original files under originals/ or archive/legacy-raw/.

Step 6: Set up retrieval
Create retrieval documentation that explains:
- how to find active projects
- how to find current area knowledge
- how to find approvals and decisions
- how to trace a Markdown file back to original documents
- how to generate an audit bundle
- how to decide whether to read a summary, full Markdown file, or original binary file

Add simple command-line retrieval helpers if appropriate. Prefer boring tools such as ripgrep, frontmatter-aware scripts, or checked-in indexes over opaque systems.

Step 7: Set up approval flow if needed
If approvals are needed:
- Create approval request templates.
- Define approval states: pending, approved, rejected, superseded.
- Ensure every approval links to the relevant project, decision, owner, and source files.
- Add a rule that decisions must be recorded in the relevant decision log after approval.
- Prefer pull requests or reviewed commits as the approval record when using git.

Step 8: Checks
Add deterministic checks for:
- Markdown sanity
- required frontmatter fields
- broken relative links
- missing source files referenced in frontmatter
- untracked originals, if possible
- repository instruction consistency, if Beryl provides such a check

Run the narrow checks first, then the full repository check.

Step 9: Final report
When complete, report:
- Beryl installation status and version or commit
- files and folders created
- inventory summary
- triage summary
- conversions performed
- originals preserved
- retrieval flows added
- checks run
- checks skipped or unavailable
- unresolved migration risks
- recommended next manual review

Important behavior:
- Do not invent missing document meaning.
- Mark uncertain classifications clearly.
- Do not delete or mutate originals.
- Keep the first migration useful rather than perfect.
- Optimize for auditability, retrieval, and future agent substitution.
```

## Practical Migration Strategy

The first migration should not try to make the whole archive beautiful. It should make the system usable.

Start by migrating active work, current policies, current decision logs, and templates. Put everything else into `archive/legacy-raw/` or `originals/archive/` with an inventory. When an old file becomes relevant, promote it into the proper area, convert or summarize it, and link back to the original.

That rule keeps the system from collapsing under migration debt. The second brain improves through use instead of requiring a perfect historical cleanup before it can start working.

## What Good Looks Like

A good second brain repository can answer these questions quickly:

- What are we actively working on?
- Who owns this?
- What decision was made, when, and why?
- What is waiting for approval?
- Which original files support this Markdown summary?
- What changed since the last review?
- What should an agent read before helping with this task?
- What should an auditor receive if they ask for evidence?

If the repository can answer those questions with plain files, git history, and deterministic checks, the agent becomes substitutable. Any capable coding agent can enter the repository, read the instructions, run the checks, and continue the work without relying on hidden chat history.
