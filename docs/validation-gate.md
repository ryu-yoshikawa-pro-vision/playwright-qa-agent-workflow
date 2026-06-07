# Plan Validation Gate

The plan validator prevents shallow planning output from being converted into brittle Playwright tests.

## Decisions

| Decision | Meaning | Next action |
|---|---|---|
| `PASS` | Plan is ready for generation | Run `playwright-test-generator` |
| `FAIL` | Plan is not ready | Send the report back to `playwright-test-planner` |
| `BLOCKED` | Validation cannot run | Resolve missing file/context and rerun validation |

## Required loop

```text
1. Planner explores and writes specs/<feature>.plan.md
2. Validator writes specs/_reviews/<feature>.validation.md
3. If PASS, generator creates tests
4. If FAIL, planner refines the same plan using the validation report
5. Validator runs again
```

## Minimum pass criteria

A plan should pass only when it includes:

- clear scope and entry point
- seed/setup/account/data assumptions
- screen or flow inventory
- independent scenarios
- concrete steps
- observable expected results
- failure indicators
- relevant happy/error/boundary/state coverage
- unverified assumptions marked as `Unverified`
- visual evidence for visual claims
- enough detail for the generator to avoid guessing

## Validation report source metadata

Every validation report must include a source metadata block.

```markdown
## Source metadata

- Plan path: `specs/<feature>.plan.md`
- Plan SHA-256: `<sha256-of-current-plan-file>`
- Validated at: `<ISO-8601 timestamp>`
- Validator run: `artifacts/<feature>/runs/<run-id>/02_validator/`
- Decision: `PASS | FAIL | BLOCKED`
```

The SHA-256 must be calculated from the exact plan file content at validation time.

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
- the current plan SHA-256 differs from the SHA-256 recorded in the validation report
- the plan changed after validation and has not been revalidated

## Automated hash check

Run this after planner/validator work and before generation:

```bash
npm run check:validation
```

The check compares the current `specs/*.plan.md` content to the `Plan SHA-256` recorded in `specs/_reviews/*.validation.md`.
