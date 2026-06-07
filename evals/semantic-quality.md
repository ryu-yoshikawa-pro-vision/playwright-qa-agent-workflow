# Semantic Quality Evals

These evals check whether the validator can reject shallow or unsafe feature plans before technique-based test design and generation.

The goal is not to automatically judge product correctness. The goal is to keep the semantic quality gate strict enough that weak plans do not become weak test designs.

## How to use

For each `*.plan.md` fixture under `evals/fixtures/`, ask an agent using `playwright-test-plan-validator` to validate the plan as if it were `specs/<feature>.plan.md`.

The validator should produce a validation report with:

- source metadata
- overall decision
- `Semantic Quality Review`
- `Semantic Review Decision`
- concrete planner revision instructions when the decision is `FAIL` or `BLOCKED`

This eval is plan-focused. Detailed final test cases, assertions, boundary tables, decision tables, and state-transition tables are covered by `evals/test-design-techniques.md`.

## Fixture expectations

Each fixture must declare its expected result at the top using `<!-- Expected Semantic Review Decision: PASS|FAIL|BLOCKED -->`. `npm run check:semantic` reads this marker so new fixtures can be added without changing the script.

| Fixture                                 | Expected semantic decision | Reason                                                                                       |
| --------------------------------------- | -------------------------- | -------------------------------------------------------------------------------------------- |
| `good-login.plan.md`                    | `PASS`                     | Clear scope, setup, evidence, behavior inventory, risk assessment, and design inputs         |
| `bad-thin-login.plan.md`                | `FAIL`                     | Too shallow; missing usable scope, evidence, behavior inventory, and risk/design inputs      |
| `bad-unverified-visual-claim.plan.md`   | `FAIL`                     | Visual/design claim is asserted without screenshot or trace evidence                         |
| `bad-non-independent-scenarios.plan.md` | `FAIL`                     | The plan tries to hand off dependent scenario design instead of stable behavior/setup inputs |
| `bad-unverified-permission.plan.md`     | `BLOCKED`                  | Permission behavior is central but unverified by role/account evidence                       |

## Review questions

When reviewing validator behavior, check:

1. Did the validator reject vague feature plans such as "test login" or "works correctly"?
2. Did it distinguish `FAIL` from `BLOCKED`?
3. Did it require evidence for visual, permission, persistence, or error-handling claims?
4. Did it require behavior inventory and risk/design inputs instead of final test-case details inside the plan?
5. Did it provide concrete planner revision instructions instead of generic advice?
6. Did it prevent generator readiness unless semantic decision was `PASS`?

## Anti-patterns this eval should catch

- Passing a plan because it has many words but weak evidence and design inputs.
- Passing a plan because the happy path is present while key risk areas are absent.
- Treating unverified permission behavior as confirmed.
- Treating screenshot-free visual claims as validated.
- Treating dependent scenario chains as acceptable planner output.
- Requiring the planner to do the designer's job by producing final test cases, detailed assertions, or technique tables.
