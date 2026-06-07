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

## Traceability

Generated tests should preserve traceability to design cases.

Recommended comment pattern:

```ts
// Test design: TD-001
// Source technique: equivalence partitioning / boundary value analysis
// Evidence: EV-001, EV-002
```

Required mapping artifact:

```text
artifacts/<feature>/runs/<run-id>/04_generator/test-mapping.md
```

The mapping should include:

| Test design ID | Generated test title | Source technique | Evidence IDs | Notes |
|---|---|---|---|---|

## Safety rules

Avoid fixed sleeps. Avoid brittle selectors unless no better locator exists. Do not implement unverified behavior as if confirmed. Do not weaken assertions or collapse expected outcomes just to make tests easier.

## Test execution boundary

- Do not add generic test runner commands to Playwright CLI references.
- If generated tests need execution instructions, refer to the target project's documented test command.
- Keep `playwright-cli` usage limited to browser evidence and investigation.
