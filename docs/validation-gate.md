# Plan and Test Design Validation Gate

The validator prevents shallow planning or weak test design from being converted into brittle Playwright tests.

## Decisions

| Decision  | Meaning                                       | Next action                                                                     |
| --------- | --------------------------------------------- | ------------------------------------------------------------------------------- |
| `PASS`    | Plan and test design are ready for generation | Run `playwright-test-generator`                                                 |
| `FAIL`    | Plan or design is not ready                   | Send the report back to `playwright-test-planner` or `playwright-test-designer` |
| `BLOCKED` | Validation cannot run                         | Resolve missing file/context/evidence and rerun validation                      |

## Required loop

```text
1. Planner explores and writes specs/<feature>.plan.md
2. Designer applies techniques and writes specs/<feature>.test-design.md
3. Validator writes specs/_reviews/<feature>.validation.md
4. If PASS, generator creates tests from test-design.md
5. If FAIL, planner or designer refines the relevant source file
6. Validator runs again
```

## Minimum pass criteria

A plan should pass only when it includes:

- clear scope and entry point
- seed/setup/account/data assumptions
- evidence references
- behavior inventory
- risk assessment
- test design inputs
- unverified assumptions marked as `Unverified`
- visual evidence for visual claims
- enough detail for the designer to avoid guessing
- semantic quality review decision of `PASS`

A test design should pass only when it includes:

- selected techniques with reasons
- rejected techniques with reasons
- concrete technique application for selected techniques
- independent final test cases
- observable expected results
- source technique for each final case
- evidence references
- justified excluded cases
- no unresolved blocking questions
- test design review decision of `PASS`

## Validation report source metadata

Every validation report must include a source metadata block.

```markdown
## Source metadata

- Plan path: `specs/<feature>.plan.md`
- Plan SHA-256: `<sha256-of-current-plan-file>`
- Test design path: `specs/<feature>.test-design.md`
- Test design SHA-256: `<sha256-of-current-test-design-file>`
- Validated at: `<ISO-8601 timestamp>`
- Validator run: `artifacts/<feature>/runs/<run-id>/03_validator/`
- Decision: `PASS | FAIL | BLOCKED`
- Semantic Review Decision: `PASS | FAIL | BLOCKED`
- Test Design Review Decision: `PASS | FAIL | BLOCKED`
```

Replace every `PASS | FAIL | BLOCKED` placeholder with exactly one value. Leaving the pipe-separated placeholder unresolved is invalid and must fail `npm run check:validation`.

The SHA-256 values must be calculated from the exact source file content at validation time.

## Semantic quality checks

Every validation report must include the semantic quality review block from `.agents/skills/playwright-test-plan-validator/references/semantic-quality-gate.md`.

The semantic review checks:

- feature understanding
- scope and setup clarity
- evidence traceability
- behavior inventory adequacy
- risk and design-input adequacy
- blockers and open questions

Overall `PASS` is allowed only when `Semantic Review Decision` is also `PASS`.

## Test design quality checks

Every validation report must include the test design quality review block from `.agents/skills/playwright-test-plan-validator/references/test-design-quality-gate.md`.

The test design review checks:

- source alignment
- technique selection
- technique application
- final test cases
- exclusions and residual risk
- generator readiness

Overall `PASS` is allowed only when `Test Design Review Decision` is also `PASS`.

## Handoff completeness checks

Fail or warn when:

- `99_handoff.md` is missing for the relevant run
- scope-level `HANDOFF.md` was not updated
- open questions exist only in run-local files
- findings exist only in run-local files
- important decisions exist only in run-local files
- the recommended next action is unclear

## Generator rule

The generator must stop if:

- no validation report exists
- the report decision is `FAIL`
- the report decision is `BLOCKED`
- the validation report has no `Plan SHA-256`
- the validation report has no `Test design SHA-256`
- the current plan SHA-256 differs from the SHA-256 recorded in the validation report
- the current test design SHA-256 differs from the SHA-256 recorded in the validation report
- the plan or design changed after validation and has not been revalidated
- `Semantic Review Decision` is missing, `FAIL`, or `BLOCKED`
- `Test Design Review Decision` is missing, `FAIL`, or `BLOCKED`

## Automated hash check

Run this after planner/designer/validator work to check validation report consistency:

```bash
npm run check:validation
```

The check compares the current `specs/*.plan.md` and `specs/*.test-design.md` content to the SHA-256 values recorded in `specs/_reviews/*.validation.md`. It also fails an overall `PASS` report when semantic or test-design decisions are missing, `FAIL`, or `BLOCKED`, or when any review subsection is non-PASS. For generator readiness, use `npm run agent:gate -- --feature <feature> --for generator`; `check:validation` is a repository consistency check, while `agent:gate` is the feature-level permission check for generation.
