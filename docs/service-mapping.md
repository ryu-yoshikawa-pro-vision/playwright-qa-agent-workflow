# Service Mapping Workflow

Use service mapping when the user asks to explore the whole service, all screens, all pages, or the entire application.

## Purpose

A whole service is too broad to treat as one feature. Service mapping discovers the product surface and splits it into feature candidates.

```text
service-mapper -> feature backlog -> planner -> designer -> validator -> generator -> healer
```

## Required outputs

```text
artifacts/service-exploration/HANDOFF.md
artifacts/service-exploration/OPEN_QUESTIONS.md
artifacts/service-exploration/FINDINGS.md
artifacts/service-exploration/DECISIONS.md
artifacts/service-exploration/FEATURE_BACKLOG.md
artifacts/service-exploration/runs/<run-id>/01_service_mapper/
```

Run-local outputs:

- `exploration-log.md`
- `service-map.md`
- `screen-inventory.md`
- `navigation-map.md`
- `feature-inventory.md`
- `role-permission-map.md`
- `coverage-matrix.md`
- `open-questions.md`
- `evidence-index.md`
- `service-mapper-summary.md`
- `99_handoff.md`

## Required output formats

Run-local service mapper files must follow `.agents/skills/playwright-service-mapper/references/output-formats.md`. The most important requirement is stable cross-referencing between screens, navigation paths, feature candidates, and evidence.

Use IDs consistently:

- screens: `SCR-001`
- navigation paths or state transitions: `NAV-001`
- feature candidates: `FEAT-001`
- evidence: `EV-001`

The service mapper is not complete if it produces prose summaries only. It must also produce structured inventories that a feature-level planner can consume.

## Starter templates

Use the run-local templates under `artifacts/_templates/service-mapper/` for these files:

- `exploration-log.md`
- `service-map.md`
- `screen-inventory.md`
- `navigation-map.md`
- `feature-inventory.md`
- `role-permission-map.md`
- `coverage-matrix.md`
- `open-questions.md`
- `evidence-index.md`
- `service-mapper-summary.md`

Use `artifacts/_templates/99_handoff.md` for run-specific handoff.

## Visual evidence

For each discovered screen or major UI state, capture or reference both:

1. a snapshot when available
2. a screenshot when available

Do not mark a screen as fully explored if the only evidence is a snapshot and the screen has visual complexity.

## Handoff to planner

After mapping, choose a feature candidate from `FEATURE_BACKLOG.md` and pass it to `playwright-test-planner` with:

- feature slug
- related screen IDs
- related flow IDs
- evidence links
- known gaps
- unverified assumptions
