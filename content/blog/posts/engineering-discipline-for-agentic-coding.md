AgentCoding is a repository that treats agentic coding as an engineering discipline rather than a prompting trick, packaging the operating rules, skills, deterministic checks, and review boundaries needed to use stochastic coding agents without surrendering responsibility for correctness, safety, and maintainability.

## Why This Matters

Large language models have stopped behaving like autocomplete and started behaving like interpreters. The "program" is no longer just the code I write; it is the whole input I hand the model: instructions, constraints, files, examples, tools, state, and environment. The context window has become the execution surface. That shift is exciting because it makes new kinds of systems possible. An agent can inspect a codebase, form a plan, use tools, recover from intermediate failures, and adapt to the local environment. That is qualitatively different from ordinary automation.

The catch is that these systems are stochastic. They are capable and often impressive, but they are not verifiable in the way ordinary programs are. As I put it in the project's own framing, bad code is the most expensive it has ever been, because an agent can now produce a lot of it quickly. So the interesting research and engineering problem is not capability. It is verifiability. If an agent can reason, improvise, and act, then my job as the engineer is to make those actions legible, bounded, and accountable.

AgentCoding is my attempt to make that discipline concrete and runnable. It matters to me because it is the clearest expression of a belief I hold across all my work: the goal is not to make agents write more code, it is to make them produce code that stays easy to change, inspect, and trust after the first generation.

## Problem Setup

When people talk about coding with agents, they usually optimize the wrong loop. They make the generation loop faster: better prompts, bigger context, more autonomy. But generation speed is only useful if the feedback that catches mistakes is stronger than the speed at which mistakes are produced. The core operating rule of this repository is exactly that: generation speed is valuable only when deterministic feedback loops are stronger than the generation loop. If the agent can write faster than I can verify, the system degrades - it accumulates entropy, hidden coupling, and silently weakened tests.

So the problem I set out to solve is not "how do I get an agent to build my app." It is: what surrounding structure makes an agent behave like a disciplined engineer instead of an unreliable intern with shell access? Good results rarely come from "just asking the model." They come from investing in repository conventions, tool access, environment scaffolding, prompt patterns, evaluation loops, and clear operational boundaries. The quality of that setup usually determines the quality of the output.

There is also a division-of-labor question underneath this. Deterministic code does not disappear in an agentic system; it changes role. The neural network is good at flexible reasoning under ambiguity. Conventional code is good at reliable execution under rules. So I want the model to handle interpretation, synthesis, and adaptation, while deterministic code handles persistence, permissions, computation, integration, testing, and enforcement. AgentCoding is the layer that keeps those two halves in their lanes.

## Method

AgentCoding is structured as an inspectable workspace, not a conventional application. The high-level flow it encodes is: a human task becomes agent instructions, which are constrained by repository conventions, which are gated by checks and hooks, which produce reviewable output, which a human merges. The human stays at both ends.

The center of the design is the `agent/` directory, which I treat as the canonical control plane - the single source of truth for agent behavior. It holds a project brief, a ubiquitous-language glossary, a design tree, an architecture document, a testing policy, agent rules, task routing, a security policy, architecture decision records (`adr/`), and a library of skills. Critically, the tool-specific instruction files that various assistants read - `AGENTS.md`, `CLAUDE.md`, `.cursor/rules/agent-rules.md`, `.github/copilot-instructions.md`, `.codex/AGENTS.md` - are treated as generated shims. I do not edit them by hand. I edit a single template and run `agent/scripts/sync-agent-env.sh` so that every tool reads the same rules. This solves a real problem: in a multi-tool world, instruction drift across assistants is a silent source of inconsistent behavior.

Behavior is organized into **skills**, each living under `agent/skills/<name>/SKILL.md`: `planning`, `adding-features`, `debugging`, `explaining-codebase`, `frontend-design`, `improving-architecture`, `testing-vertical-slices`, `tracking-entropy`, plus two design-critique skills, `grill-me` and `interview-me`. The routing rule is deliberately frugal: classify the request, load exactly one matching workflow, and pull in canonical files only when that workflow asks for them. This is a context-efficiency decision as much as a clarity decision - loading every workflow by default wastes the context budget and dilutes the agent's attention.

Two control mechanisms stand out. The first is the **feature implementation gate**: feature work requires a user-ratified plan. If no approved plan exists, the agent must plan first and stop, presenting the plan before touching implementation code. The second is **`grill-me`**, a pre-flight design critique that runs before non-trivial work. It forces the agent to restate the requested outcome, name the bounded context and public interface, list viable options, critique each for reliability, security, scalability, testability, and coupling, and explicitly ask "what assumption would make this wrong?" before choosing an approach. When that critique hits a question only I can answer, `interview-me` is the fallback that escalates to me rather than letting the agent guess.

The enforcement layer is a set of deterministic, dependency-free shell checks orchestrated by `scripts/check.sh`, which runs three gates in order:

- `check-md.sh`: a deterministic Markdown sanity check that flags unclosed triple-backtick fences and stray tab characters across all Markdown in the repo, with no external dependencies.
- `check-tests-unchanged.sh`: a test-manifest immutability check. It hashes the configured test scope and diffs it against a committed `tests/.manifest.sha256`. It does not forbid edits; it makes them impossible to hide. If the agent changes a test, the manifest diverges and the check fails until the change is explicitly acknowledged.
- `check-project.sh`: a project extension point that delegates to `check-affected.sh`, an affected-test gate. It selects tests related to changed files, falls back to the full test suite for broad changes (dependencies, hooks, test strategy), and - importantly - exits successfully with a clear message when no project test runner is configured yet.

The same checks run at commit time through a `githooks/pre-commit` hook that invokes `check.sh` in `staged` mode, so the feedback loop is wired into the moment code is committed, not left to memory.

Two policies make the intent explicit. The **test modification rule** states that existing tests may not be weakened to make an implementation pass; intentional test changes are allowed only when the behavior change is explicit in the task, the manifest is regenerated and committed, and the final response explains why. The **security policy** sets read-only access as the default, requires human approval for destructive operations, production writes, migrations, and dependency upgrades, forbids secrets in prompts, code, tests, or logs, and scopes tool access to the workspace.

Finally, every agent run ends with a **final response contract**: state what changed, which checks ran, which were skipped or unavailable, whether tests changed, whether the test manifest changed, which skills were used, and whether temporary session state was cleared. That contract is the inspectability surface - it turns an opaque agent run into a reviewable report.

## Results

The repository is real, structured, and self-consistent, and its own deterministic gate passes: running `./scripts/check.sh` succeeds, exercising the Markdown, manifest-immutability, and affected-test checks end to end. The architecture is described in the README with an explicit flow diagram and a "Run The Checks" section, the key paths exist and are organized as documented, and the multi-tool shim-generation model is implemented rather than merely proposed.

Concretely, what works today is the operating system itself: the source-of-truth model, the skill-routing scheme, the design-critique gates, the deterministic check harness, the commit-time hook, the test-immutability mechanism, and the security and testing policies. There is also a written theory and practice layer (`Theory.md`, `Practise.md`, `Cheatsheet.md`) that explains the reasoning - domain-driven boundaries, ubiquitous language, feedback loops, entropy control, modularity, TDD, and coupling management - so the rules are not arbitrary.

I am deliberately not reporting invented metrics here. There are no benchmark numbers, latency figures, or accuracy claims, because this is an operating framework, not a model. The honest result is that the scaffolding exists, is internally coherent, and enforces its own minimal contract.

## What Worked

The strongest idea is making verification cheaper and more deterministic than generation. The checks are intentionally lightweight and dependency-free, which means they actually run, every time, without a toolchain to maintain. A Markdown fence check sounds trivial, but it is exactly the kind of low-cost, high-determinism gate that catches the drift agents introduce.

The test-manifest immutability check is the design I am most pleased with. The failure mode it targets - an agent quietly weakening a test to make its own change pass - is one of the most insidious in agent-assisted development, and hashing the test scope turns a question of trust into a deterministic diff.

Treating tool instruction files as generated shims from one canonical template also worked well. It removes a whole category of "why did the agent behave differently in Cursor versus Claude" problems. And routing to a single skill per task, rather than loading everything, kept the agent's working context focused and resource-efficient - which is the behavior I want from a system meant to scale.

## What Failed

Several parts are honestly still scaffolding. The `architecture.md` is a template with placeholder bounded contexts and forbidden-import rules rather than a populated map, because the repo is a framework, not yet a populated application. The `tests/` directory contains only a `.gitkeep` and the manifest file - there are no behavior tests yet. The testing policy's command matrix is candid about this: formatter, linter, typechecker, unit tests, integration tests, and end-to-end smoke are all marked "not available yet."

That exposes the central limitation: AgentCoding is strongest as a proof-of-work artifact when paired with concrete case studies that show the workflow improving a real repository. On its own it demonstrates taste and operating discipline, but it does not yet prove an end-to-end outcome on a substantial codebase. The other unsolved boundary is infrastructure - agent-first workflows still break down where the agent has to touch hosting, deployment, secrets, permissions, and observability, and this repo deliberately stays read-only and local rather than pretending to solve that.

## What I Would Do Next

The clear next step is to attach a real case study: take a non-trivial repository, drive a feature through the full loop - `grill-me`, ratified plan, single-slice implementation, affected-test gate, final response contract - and document the before-and-after honestly, including where the agent fought the guardrails. That converts the framework from "credible design" into "demonstrated outcome."

After that I would populate the placeholder layers on a concrete project: real bounded contexts and forbidden-import rules in `architecture.md`, an actual test runner wired into the affected-test gate, and the `tests/` directory filled with behavior checks the manifest can protect. I would add an entropy-tracking pass that reports coupling and complexity drift over a series of agent commits, so the cost of speed becomes measurable rather than felt. Longer term, the most valuable work is at the infrastructure boundary: a safe, observable adapter layer that lets the agent operate against real systems while keeping the read-only-by-default, human-approval-for-destructive-actions posture intact.

This connects directly to the thesis I hold across my work: I want to build inspectable, resource-efficient systems that people can trust and scale. AgentCoding applies that to the act of building itself - deterministic checks for inspectability, single-skill routing and a minimal canonical control plane for resource efficiency, and an explicit human-in-the-loop contract so responsibility for behavior stays with people, not the model.

## Links

- Repository: https://github.com/Praneeth-Suresh/AgentCoding
- Contact: praneeth.suresh.s@gmail.com

