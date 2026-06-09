# Specs

This directory stores durable Markdown planning, test-design, coverage, and validation artifacts.

Feature plans are created by `playwright-test-planner`:

```text
specs/<feature>.plan.md
```

Technique-based test designs are created by `playwright-test-designer`:

```text
specs/<feature>.test-design.md
```

Feature coverage ledgers are created or updated by `playwright-test-generator` and `playwright-test-healer` when implementation or assertion policy changes:

```text
specs/<feature>.coverage.md
```

Validation reports belong under:

```text
specs/_reviews/<feature>.validation.md
```

A plan should define scope, evidence, assumptions, behavior inventory, risks, and design inputs. A test design should select techniques, apply them, and define final independent test cases. The generator should work from a PASS-validated test design, not from the plan alone.

`specs/<feature>.coverage.md` is not a replacement for the test design. It is the current coverage ledger that lets the next agent or reviewer understand the implemented checks, explicit non-coverage, open coverage questions, assertion policy, and test-code mapping without reading run-local artifacts first.

Use this responsibility split:

| Artifact                                 | Responsibility                                                       |
| ---------------------------------------- | -------------------------------------------------------------------- |
| `specs/<feature>.plan.md`                | Scope, setup, assumptions, risks, and design inputs                  |
| `specs/<feature>.test-design.md`         | Test-design source of truth                                          |
| `specs/<feature>.coverage.md`            | Current coverage, gaps, assertion policy, and implementation mapping |
| `specs/_reviews/<feature>.validation.md` | Generator-readiness review of the current plan and test design       |
| `tests/<feature>.spec.ts`                | Playwright Test implementation                                       |

## Coverage ledger checks

`npm run check:coverage` is intentionally stricter than a file-existence check.
For each implemented feature test at `tests/<feature>.spec.ts`, except explicit samples such as `tests/example.spec.ts`, the checker expects `specs/<feature>.plan.md`, `specs/<feature>.test-design.md`, `specs/_reviews/<feature>.validation.md`, and `specs/<feature>.coverage.md` to exist. The validation gate must be `PASS`, and the coverage ledger must be filled in with concrete values.

The checker fails on unresolved placeholders such as `TBD`, `TODO`, `<feature>`, or `<run-id>`.
When there are no excluded cases or no open questions, keep the required table and add a concrete `None` row with a reason instead of leaving the section empty. `Last updated by run` and `Change history` must always link to the same feature, `artifacts/<feature>/runs/<run-id>/`; do not use `None` in `Change history` or reference another feature's run.

A coverage ledger that exists without the matching `tests/<feature>.spec.ts` is treated as stale and fails the check.
If the implementation file is newer than the coverage ledger, the checker emits a stale-warning so the owner can confirm whether coverage, gaps, or assertion policy changed.
