# Artifact Conventions

This document defines where Playwright Test Agent workflow artifacts should be written.

The goal is traceability. A reviewer should be able to answer:

- What did the agent explore?
- What evidence supports the plan?
- Which plan was validated?
- Which scenarios were implemented?
- Why did the healer change a test?

## Common identifiers

### Run ID

Use local time:

```text
YYYYMMDD-HHMMSS
```

Example:

```text
20260607-013000
```

### Feature slug

A feature slug identifies one testable feature, page, or flow. Use lowercase ASCII kebab-case.

Examples:

```text
login
conversation-detail
user-management
ailead-12428-meeting-bot-invitation
```

Rules:

1. Use a slug explicitly provided by the user when available.
2. Prefix ticket IDs when they are part of the request.
3. Otherwise infer a short slug from the target page, flow, or business capability.
4. Do not rename the slug during a workflow.
5. If scope changes substantially, create a new slug instead of mutating the old one.

### Scope slug

Use `service-exploration` for service-wide exploration. Do not force service-wide work into a single feature slug such as `full-service`.

## Service-wide exploration artifacts

Use this structure for `playwright-service-mapper`:

```text
artifacts/service-exploration/runs/<run-id>/
  00_request.md
  01_service_mapper/
    exploration-log.md
    service-map.md
    screen-inventory.md
    navigation-map.md
    feature-inventory.md
    role-permission-map.md
    coverage-matrix.md
    open-questions.md
    evidence-index.md
    service-mapper-summary.md
  evidence/
    screenshots/
    traces/
    snapshots/
    console/
    network/
    storage/
```

Service mapping outputs are not test plans. They are discovery artifacts used to decide which feature plans to create next.

## Feature-level planning artifacts

Use this structure for `playwright-test-planner`:

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
    storage/
```

The plan under `specs/` is the handoff artifact. The files under `artifacts/` are supporting evidence.

## Plan validation artifacts

Use this structure for `playwright-test-plan-validator`:

```text
specs/_reviews/<feature>.validation.md
artifacts/<feature>/runs/<run-id>/
  02_validator/
    validation-report.md
    refinement-request.md
```

The validation report must contain exactly one decision:

- `PASS`
- `FAIL`
- `BLOCKED`

The generator must not run unless the matching validation report says `PASS`.

## Test generation artifacts

Use this structure for `playwright-test-generator`:

```text
tests/<feature>.spec.ts
artifacts/<feature>/runs/<run-id>/
  03_generator/
    generation-log.md
    implementation-report.md
    test-mapping.md
```

`test-mapping.md` should map plan scenario IDs to generated Playwright test titles.

## Healing artifacts

Use this structure for `playwright-test-healer`:

```text
artifacts/<feature>/runs/<run-id>/
  04_healer/
    failure-analysis.md
    healing-report.md
    patch-log.md
```

The healer must explain whether the fix changed the test intent or weakened assertions.


## Playwright CLI command logs

When using the `playwright-cli` skill, every command that materially affects exploration, planning, generation, or healing must be logged in the current role log.

Minimum table:

```markdown
| Step | Command | Purpose | Observation | Evidence | Next |
|---:|---|---|---|---|---|
```

Save command outputs when useful:

```text
evidence/snapshots/      # playwright-cli snapshot output
evidence/screenshots/    # playwright-cli screenshot files
evidence/console/        # playwright-cli console output
evidence/network/        # playwright-cli network output
evidence/traces/         # tracing output
evidence/storage/        # state-save output; treat as sensitive
```

Do not record secrets, tokens, cookies, or raw storage values in Markdown logs.

## Evidence rules

Use relative paths in reports.

Good:

```text
artifacts/login/runs/20260607-013000/evidence/screenshots/SCR-001-login-default.png
```

Avoid untracked absolute local paths.

If screenshots, traces, console logs, network logs, or snapshots are unavailable, record that explicitly instead of pretending evidence exists.

## Visual evidence rules

Snapshots and screenshots serve different purposes. Use both when the toolchain allows it.

### Snapshot evidence

Use snapshots for:

- roles and accessible names
- labels, placeholder text, headings, and button/link names
- input fields and form structure
- locator candidates
- DOM-accessible text and state
- rough page structure

### Screenshot evidence

Use screenshots for:

- actual user-visible layout
- visibility and hidden/covered states
- modal, drawer, popover, dropdown, and menu state
- loading, empty, disabled, validation, and error states
- overlap, clipping, sticky headers, and off-screen content
- responsive or viewport-specific layout
- visual confirmation that an element is usable by a person, not merely present in the DOM

### Mandatory visual evidence expectations

For service mapping and feature planning:

1. Each discovered screen should have at least one screenshot or trace reference.
2. Each major UI state should have screenshot or trace evidence when it affects test design.
3. Snapshot-only evidence is not enough for claims about visual display, layout, enabled/disabled appearance, or UI state.
4. If a screen is listed as explored without visual evidence, mark confidence as `Medium` or `Low` and explain why.
5. If screenshot capture is blocked, record the reason and continue with snapshot evidence, but do not claim visual completeness.

For validation:

- Treat missing visual evidence as a warning when it affects only non-critical details.
- Treat missing visual evidence as a failure when the plan relies on visual claims for core scenarios.

For healing:

- When a failure may involve visibility, clickability, overlays, timing, layout, or rendering, inspect screenshot or trace evidence before changing the test.

### Evidence file naming

Prefer stable, readable file names:

```text
evidence/screenshots/SCR-001-login-default.png
evidence/screenshots/SCR-002-dashboard-loaded.png
evidence/snapshots/SCR-001-login-default.md
evidence/traces/SC-003-validation-error.zip
```

### Evidence index format

Use this table in `evidence-index.md` files:

```markdown
# Evidence Index

| Evidence ID | Screen / State / Flow ID | Evidence type | Path | Captured after action | What it proves | Notes |
|---|---|---|---|---|---|---|
| EV-001 | SCR-001 | screenshot | evidence/screenshots/SCR-001-login-default.png | Open login page | Login form visual layout is visible | |
| EV-002 | SCR-001 | snapshot | evidence/snapshots/SCR-001-login-default.md | Open login page | Login inputs and submit button have accessible names | |
```

Every evidence entry should answer: **what does this prove?**
