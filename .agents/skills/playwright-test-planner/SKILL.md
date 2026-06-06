---
name: playwright-test-planner
description: Explore one feature, page, or flow with Playwright Test MCP and create a comprehensive Markdown test plan under specs/. Use when the user asks to analyze a specific UI area, discover a feature flow, or prepare Playwright test scenarios before code generation.
---

# Playwright Test Planner

You are the feature-level planner role in the Playwright Test Agents workflow.

Your job is to explore one target feature, page, or flow and write a precise test plan. Do not generate Playwright test code in this role.

If the user asks to explore the whole service, all screens, all pages, or the entire application, use `playwright-service-mapper` first instead of creating one giant full-service plan.

## Preconditions

- Use the `playwright-test` MCP server when browser exploration is needed.
- Call the planner setup tool before using other Playwright Test MCP browser tools, when that tool is available.
- Use `seed.spec.ts` as the default setup reference unless the user provides another seed file.
- If a service mapping run exists, use it as input when it is relevant to the target feature.
- Save the final feature plan under `specs/`.

## Feature slug and artifact location

Determine the feature slug once at the beginning of planning.

Rules:

1. Use the feature slug explicitly provided by the user when available.
2. Prefix ticket IDs when they are part of the request.
3. Otherwise infer a short lowercase ASCII kebab-case slug from the target page, flow, or business capability.
4. Do not rename the slug during the workflow.

Use this structure:

```text
specs/<feature>.plan.md
artifacts/<feature>/runs/<run-id>/
  00_request.md
  01_planner/
    exploration-log.md
    screen-map.md
    coverage-map.md
    evidence-index.md
    planner-summary.md
  evidence/
    screenshots/
    traces/
    snapshots/
    console/
    network/
```

`<run-id>` should use local time in this format:

```text
YYYYMMDD-HHMMSS
```

If file writing is unavailable, return the same artifact contents in the response and clearly say which files should be written.

## Exploration checklist

Explore enough to produce a plan that another tester or generator can execute without guessing.

Capture:

1. Pages or screens directly related to the feature
2. Navigation paths and entry points
3. Primary user flows
4. Forms, inputs, buttons, links, menus, tables, dialogs, and validation messages
5. Required starting state and test data assumptions
6. Permission, role, or account-state dependencies when visible
7. Error states, empty states, loading states, and boundary cases when discoverable
8. Areas that were not explored or could not be verified


## Visual evidence requirements

Do not rely on page snapshots alone. Use screenshots and snapshots together when browser tooling allows it.

For each screen, modal, drawer, menu, table state, form state, validation state, loading state, empty state, or error state that affects the plan:

1. Capture or reference a snapshot for accessible structure, locator candidates, labels, roles, names, and text.
2. Capture or reference a screenshot for actual visual layout, visibility, enabled/disabled appearance, loading/error/empty states, modal/drawer/menu display, overlap, clipping, and user-perceivable behavior.
3. Save or reference screenshot evidence under `evidence/screenshots/` and snapshot evidence under `evidence/snapshots/`.
4. Record both in `01_planner/evidence-index.md`.
5. Link relevant evidence from `01_planner/screen-map.md`, `01_planner/coverage-map.md`, and `specs/<feature>.plan.md`.

A visual or UI-state claim must not be treated as verified if it is backed only by a snapshot. Mark it as `Unverified`, `Partial`, or lower confidence unless screenshot or trace evidence exists.

Examples that require visual evidence:

- validation error appears below a field
- button looks disabled after input is cleared
- loading spinner disappears
- empty state is shown
- modal or drawer opens and blocks the page
- table pagination or horizontal scroll is visible
- an element is visually hidden, overlapped, clipped, or outside the viewport

If screenshot capture is unavailable, record the reason in `01_planner/evidence-index.md` and `01_planner/coverage-map.md`.

## Required planning artifacts

### `00_request.md`

Record:

- original request or summary
- feature slug
- target URL or entry point
- account/role/data assumptions
- seed file
- related service mapping run, if any
- destructive actions allowed: Yes/No

### `01_planner/exploration-log.md`

Record what was actually explored.

```markdown
# Exploration Log

## Summary

- Feature:
- Target URL / entry point:
- Explored screens:
- Explored flows:
- Blockers:

## Action log

| Step | Page / State | Action | Observation | Evidence |
|---:|---|---|---|---|
```

### `01_planner/screen-map.md`

Record screens/states relevant to the feature.

```markdown
# Screen Map

| Screen / State ID | Name | URL / Route | Purpose | Main elements | Evidence | Notes |
|---|---|---|---|---|---|---|
```

### `01_planner/coverage-map.md`

Record coverage and gaps.

```markdown
# Coverage Map

| Area / Flow | Covered | Evidence | Gaps / Unverified assumptions |
|---|---|---|---|
```

### `01_planner/evidence-index.md`

Index screenshots, traces, snapshots, console logs, and network logs when available. Each row must say what the evidence proves.

```markdown
# Evidence Index

| Evidence ID | Screen / State / Flow ID | Evidence type | Path | Captured after action | What it proves | Notes |
|---|---|---|---|---|---|---|
| EV-001 | ST-001 | screenshot | evidence/screenshots/ST-001-form-empty.png | Open target form | Empty form layout and disabled submit button are visible | |
| EV-002 | ST-001 | snapshot | evidence/snapshots/ST-001-form-empty.md | Open target form | Field labels and submit button accessible names are available | |
```

### `01_planner/planner-summary.md`

Summarize the handoff.

```markdown
# Planner Summary

## Result

Plan completed / partially completed / blocked

## Plan

- Plan file: specs/<feature>.plan.md

## Key findings

- ...

## Known gaps

- ...

## Next action

Run `playwright-test-plan-validator` for specs/<feature>.plan.md.
```

## Test plan requirements

Write scenarios that are independent and executable in any order.

Include:

- scenario ID
- scenario title
- objective
- starting state
- test data
- numbered steps
- expected results
- failure indicators
- notes for unverified assumptions

Cover, where relevant:

- happy path
- validation and error handling
- boundary or edge cases
- empty/loading/disabled/unavailable states
- navigation and state persistence
- role, permission, or account-state differences
- destructive or side-effect-heavy operations
- accessibility/locator considerations

## Plan format

Write the complete plan to:

```text
specs/<feature>.plan.md
```

Use this structure:

```markdown
# Test Plan: <Feature name>

## Metadata

- Feature slug:
- Source request:
- Target URL / entry point:
- Seed file:
- Related service mapping run:
- Planner artifacts:
- Created at:

## Scope

### In scope

- ...

### Out of scope

- ...

## Explored screens and flows

| ID | Screen / Flow | Evidence | Notes |
|---|---|---|---|

## Test scenarios

### SC-001: <scenario title>

- Objective:
- Starting state:
- Test data:
- Steps:
  1. ...
- Expected results:
  - ...
- Failure indicators:
  - ...
- Unverified assumptions:
  - ...

## Coverage gaps and risks

| Gap / Risk | Impact | Recommended follow-up |
|---|---|---|
```

## Output rules

- Save the complete plan as Markdown under `specs/`.
- Save supporting evidence and planner logs under `artifacts/<feature>/runs/<run-id>/01_planner/`.
- Use clear headings and stable scenario IDs.
- Do not invent behavior. Mark uncertain items as `Unverified`.
- Do not produce `.spec.ts` files.
- Hand off to `playwright-test-plan-validator` after planning.
- Only hand off to `playwright-test-generator` after validation returns `PASS`.
