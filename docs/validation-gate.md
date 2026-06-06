# Plan Validation Gate

The plan validator prevents shallow planning output from being converted into brittle Playwright tests.

## Why this gate exists

Planner output can look plausible while still being too weak for automation. Common failure modes include:

- generic test ideas with no evidence from the target UI
- missing starting states or test data
- expected results that say only “works correctly”
- scenarios that depend on previous scenarios
- unverified behavior presented as confirmed behavior
- missing locator hints or observable assertions

The validator catches these issues before the generator writes code.

## Gate decisions

| Decision | Meaning | Next action |
|---|---|---|
| `PASS` | Plan is ready for generation | Run `playwright-test-generator` |
| `FAIL` | Plan is not ready | Send the report back to `playwright-test-planner` |
| `BLOCKED` | Validation cannot run | Resolve missing file/context and rerun validation |

## Required loop

```text
1. Planner explores and writes specs/<plan>.md
2. Validator writes specs/_reviews/<plan-stem>.validation.md
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
- enough detail for the generator to avoid guessing

## Report location

Validation reports should be saved under:

```text
specs/_reviews/<plan-stem>.validation.md
```

## Generator rule

The generator should stop if:

- no validation report exists
- the report decision is `FAIL`
- the report decision is `BLOCKED`
- the plan was changed after the validation report and has not been revalidated
