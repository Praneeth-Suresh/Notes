# Testing Policy

## Command Matrix

| Check | Command | Status | Notes |
| --- | --- | --- | --- |
| Markdown sanity | `./scripts/check-md.sh` | available | Unclosed fences and tabs |
| Test manifest immutability check | `./scripts/check-tests-unchanged.sh` | available | Detects changes in configured test scope from `.beryl/agent/test-manifest.conf` |
| Aggregate deterministic gate | `./.beryl/scripts/check.sh` | available | Runs all deterministic checks |
| Project checks | `./scripts/check-project.sh` | available | Runs fidelity tests and static build smoke checks |
| Format | `not available yet` | unavailable | No formatter configured yet |
| Lint | `not available yet` | unavailable | No linter configured yet |
| Typecheck | `not available yet` | unavailable | No typed code configured yet |
| Unit tests | `node --test tests/notes-content-fidelity.test.js tests/notion-ingestion-fidelity.test.js tests/portfolio-repositories.test.js tests/update-topic-subtitle.test.js` | available | Verifies LaTeX/code fidelity, strict unsupported-block handling, local repository refresh data, and subtitle manifest updates |
| Integration tests | `not available yet` | unavailable | No integration harness yet |
| E2E smoke | `node scripts/build-pages.js --manifest content/topic-manifest.json --out <tmp-dir>` | available | Deterministic static build smoke check for Pages artifacts |

## Default Loop

1. Identify or add the failing behavior.
2. Select the smallest useful test level.
3. Implement one vertical slice.
4. Run narrow checks first, then broader checks.
5. Repair from actual tool output.

## Test Modification Rule

Existing tests may not be weakened to make implementation pass.

Intentional test changes are allowed only when all conditions are met:

1. The behavior change is explicit in the task or design artifact.
2. `./.beryl/scripts/update-test-manifest.sh` is run after the intentional change.
3. The manifest update is committed with the test change.
4. The final response explains why tests changed.
5. `.beryl/agent/test-manifest.conf` is updated if new test locations/patterns are introduced.

## Immutability Enforcement Scope

- The SHA manifest mechanism provides deterministic **change detection**, not cryptographic immutability guarantees against privileged users.
- Enforce stronger controls in CI/review policy (branch protection, required status checks, code review).

## Mocking Rules

- Mock external systems (network, clocks, randomness, payment/email providers).
- Do not mock domain logic in the same bounded context.
