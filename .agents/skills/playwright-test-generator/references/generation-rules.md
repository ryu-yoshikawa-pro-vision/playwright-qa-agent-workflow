# Generation Rules

Generated tests should use `@playwright/test`, clear test titles, meaningful assertions, and comments linking to source test-design cases.

Before generation, verify:

- `specs/<feature>.plan.md` exists
- `specs/<feature>.test-design.md` exists
- `specs/_reviews/<feature>.validation.md` exists
- the validation decision is `PASS`
- the validation report contains `Plan SHA-256`
- the validation report contains `Test design SHA-256`
- the validation report contains `Semantic Review Decision: PASS`
- the validation report contains `Test Design Review Decision: PASS`
- the current plan file SHA-256 matches the validation report
- the current test design file SHA-256 matches the validation report

If any hash does not match, stop and require revalidation. If semantic review or test design review is missing, `FAIL`, or `BLOCKED`, stop and require validator/planner/designer follow-up.

## Source priority

Use sources in this priority order:

1. `specs/<feature>.test-design.md` for final cases, expected results, source techniques, and exclusions.
2. `specs/<feature>.plan.md` for scope, setup assumptions, evidence, risks, and behavior background.
3. handoff and evidence files for supporting detail.

Do not generate tests from plan-only scenario ideas when the validated test design excludes or changes them.

Use `artifacts/_templates/coverage.md` when creating a new coverage ledger. Replace placeholders with concrete paths, design case IDs, test titles, run IDs, and coverage decisions. Do not leave `TBD`, `TODO`, `<feature>`, `<run-id>`, or other template placeholders in the final ledger. When nothing is excluded or no open question exists, keep the table and write a concrete `None` row with a reason. `Last updated by run` and `Change history` must link to the same feature, `artifacts/<feature>/runs/<run-id>/`; do not use `None` history or another feature's run.

## Traceability

Generated tests should preserve traceability to design cases.

Recommended comment pattern:

```ts
// Test design: TD-001
// Source technique: equivalence partitioning / boundary value analysis
// Evidence: EV-001, EV-002
```

Required run-local mapping artifact:

```text
artifacts/<feature>/runs/<run-id>/04_generator/test-mapping.md
```

The mapping should include:

| Test design ID | Generated test title | Source technique | Evidence IDs | Notes |
| -------------- | -------------------- | ---------------- | ------------ | ----- |

Required current coverage ledger:

```text
specs/<feature>.coverage.md
```

`test-mapping.md` records what happened in this generator run. `specs/<feature>.coverage.md` records the current feature coverage state. After creating or changing tests, promote the current mapping into the coverage ledger.

The coverage ledger must include:

- current status and the last updating run
- coverage summary by area or behavior
- implemented test mapping back to test design IDs
- what each implemented test verifies
- explicitly uncovered cases, with reason, risk, and follow-up
- current assertion policy, especially when avoiding brittle exact text checks
- open questions that affect coverage
- change history with at least one concrete run-linked row

## Safety rules

Avoid fixed sleeps. Avoid brittle selectors unless no better locator exists. Do not implement unverified behavior as if confirmed. Do not weaken assertions or collapse expected outcomes just to make tests easier.

## Test execution boundary

- Do not add generic test runner commands to Playwright CLI references.
- If generated tests need execution instructions, refer to the target project's documented test command.
- Keep `playwright-cli` usage limited to browser evidence and investigation.
