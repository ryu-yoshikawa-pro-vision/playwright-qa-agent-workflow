# Artifact Conventions

This document defines where Playwright CLI agent workflow artifacts should be written.

## Identifiers

### Run ID

Use local time:

```text
YYYYMMDD-HHMMSS
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

```text
artifacts/service-exploration/
  HANDOFF.md
  OPEN_QUESTIONS.md
  FINDINGS.md
  DECISIONS.md
  FEATURE_BACKLOG.md
  runs/<run-id>/
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
    99_handoff.md
```

## Feature-level artifacts

```text
artifacts/<feature>/
  HANDOFF.md
  OPEN_QUESTIONS.md
  FINDINGS.md
  DECISIONS.md
  runs/<run-id>/
    00_request.md
    01_planner/
      exploration-log.md
      screen-map.md
      coverage-map.md
      evidence-index.md
      planner-summary.md
    02_validator/
      validation-report.md
      refinement-request.md
    03_generator/
      generation-log.md
      implementation-report.md
      test-mapping.md
    04_healer/
      failure-analysis.md
      healing-report.md
      patch-log.md
    evidence/
      screenshots/
      traces/
      snapshots/
      console/
      network/
    99_handoff.md
```

## Plans, reviews, and tests

```text
specs/<feature>.plan.md
specs/_reviews/<feature>.validation.md
tests/<feature>.spec.ts
```

## Evidence index format

```markdown
| Evidence ID | Screen / State ID | Evidence type | Path | Captured after action | What it proves | Notes |
|---|---|---|---|---|---|---|
```

Evidence types:

- `screenshot`
- `snapshot`
- `trace`
- `console`
- `network`
- `test-output`

## Visual evidence rules

Use snapshots and screenshots together.

Snapshots are for:

- roles
- labels
- accessible names
- text structure
- locator candidates

Screenshots and traces are for:

- layout
- visibility
- overlays
- dialogs
- drawers
- loading states
- validation states
- empty states
- disabled visual states
- responsive layout

Do not claim visual behavior from snapshot text alone.

## Handoff artifacts

Follow `docs/handoff-conventions.md`. Important findings, open questions, decisions, and next actions must be promoted into scope-level handoff files before a task ends.
