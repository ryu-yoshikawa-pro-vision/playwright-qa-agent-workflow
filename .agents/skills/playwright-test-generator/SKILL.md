---
name: playwright-test-generator
description: Generate Playwright Test code from a validated Markdown test plan under specs/. Use only after playwright-test-plan-validator returns PASS.
---

# Playwright Test Generator

You are the generator role in the Playwright Test Agents workflow.

Your job is to convert a validated Markdown feature plan into robust Playwright Test files. Do not redesign the plan unless the plan is clearly incomplete; in that case, report the gap before generating unsafe tests.

## Inputs

Use these inputs:

- source plan under `specs/<feature>.plan.md`
- matching validation report under `specs/_reviews/<feature>.validation.md` with decision `PASS`
- planner artifacts under `artifacts/<feature>/runs/<run-id>/01_planner/`, when available
- seed file, defaulting to `seed.spec.ts`
- existing Playwright conventions in the repository
- Playwright CLI exploration logs, snapshots, screenshots, and traces when available
- Playwright Test MCP generator/browser logs only when MCP is explicitly used

## Artifact location

Write generated code and implementation evidence here:

```text
tests/<feature>.spec.ts
artifacts/<feature>/runs/<run-id>/
  03_generator/
    generation-log.md
    implementation-report.md
    test-mapping.md
```

If file writing is unavailable, return the same artifact contents in the response and clearly say which files should be written.

## Browser automation capability

Use the `playwright-cli` skill by default when live UI verification is needed during generation. Prefer:

```bash
playwright-cli snapshot
playwright-cli screenshot --filename=<path>
npx playwright test tests/<feature>.spec.ts --trace=retain-on-failure
```

Use Playwright Test MCP only when explicitly configured or requested.

## Generation workflow

For each scenario:

1. Read the relevant plan section.
2. Read the matching validation report and confirm the decision is `PASS`.
3. If the validation report is missing or not `PASS`, stop and ask to run `playwright-test-plan-validator` first.
4. Review planner evidence when available.
5. Set up the page using the generator setup tool when available.
6. Rehearse or verify important steps with the `playwright-cli` skill where possible, especially when locator choices or visual assertions depend on live UI evidence.
7. Read the generator log when available.
8. Generate one focused Playwright test file or append to the correct suite, depending on existing project structure.
9. Keep the generated test traceable to its source plan and validation report.
10. Write the generation artifacts.


## Visual evidence usage during generation

Before generating assertions or locators, review the planner's visual evidence when available.

Use snapshots for:

- accessible names
- locator candidates
- labels, roles, and text

Use screenshots or traces for:

- whether the user can actually see the element
- modal, drawer, dropdown, table, loading, empty, validation, and error states
- layout-sensitive assertions
- deciding whether an assertion should use visible text, role, enabled/disabled state, or another user-observable signal

Do not generate a visual assertion from snapshot text alone if the plan requires visual confirmation. If the plan passed validation but required visual evidence is missing for a scenario, report that mismatch in `03_generator/implementation-report.md` and keep the test conservative rather than inventing behavior.

## Code requirements

Generated tests must:

- use `@playwright/test`
- keep one clear `test.describe` group for the plan section or feature
- use test titles that match the scenario names
- include `// spec: ...`, `// validation: ...`, and `// seed: ...` comments near the top
- include a short comment before each logical step from the plan
- prefer user-facing locators such as `getByRole`, `getByLabel`, `getByText`, and `getByPlaceholder`
- avoid brittle CSS/XPath selectors unless no better locator is available
- avoid fixed sleeps
- avoid `networkidle` unless the user explicitly requires it and no safer signal exists
- assert meaningful user-visible outcomes

## Required generator artifacts

### `03_generator/generation-log.md`

Record generation activity.

```markdown
# Generation Log

## Summary

- Feature:
- Source plan:
- Validation report:
- Generated test file:

## Action log

| Step | Scenario ID | Action | Observation | Evidence |
|---:|---|---|---|---|
```

### `03_generator/implementation-report.md`

Summarize implementation decisions.

```markdown
# Implementation Report

## Generated files

| File | Purpose | Notes |
|---|---|---|

## Locator strategy

- ...

## Assertion strategy

- ...

## Limitations / TODOs

| Item | Reason | Required follow-up |
|---|---|---|
```

### `03_generator/test-mapping.md`

Map plan scenarios to tests.

```markdown
# Test Mapping

## Source

- Plan:
- Validation:
- Generated test file:

## Scenario mapping

| Plan scenario ID | Test title | Status | Notes |
|---|---|---|---|

## Unimplemented scenarios

| Scenario ID | Reason | Required action |
|---|---|---|
```

## Output rules

- Write tests under `tests/` unless the user specifies another path.
- Write generator artifacts under `artifacts/<feature>/runs/<run-id>/03_generator/`.
- Do not silently remove scenarios from the plan.
- Do not weaken assertions to make generation easier.
- If a step cannot be automated safely, add a clear TODO comment and report the limitation.
- If behavior is uncertain, do not invent an assertion; mark the uncertainty in the report and keep the test conservative.
