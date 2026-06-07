# Service Mapping Workflow

Use service mapping when the user asks to explore the whole service, all screens, all pages, or the entire application.

## Purpose

A whole service is too broad to treat as one feature. Service mapping discovers the product surface and splits it into feature candidates.

```text
service-mapper -> feature backlog -> planner -> validator -> generator -> healer
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
