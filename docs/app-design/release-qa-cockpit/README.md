# Release QA Cockpit design docs

`Release QA Cockpit` is the demo target application for validating the Playwright QA Agent Workflow.

It is not a production release management system. It is a local-first SaaS-style application designed so agents can practice and validate service mapping, feature planning, test design, Playwright Test generation, and healing against a realistic QA workflow.

## Canonical order

Read these documents in this order before implementing the app:

1. [Product definition](product-definition.md)
2. [MVP scope](mvp-scope.md)
3. [Data model](data-model.md)
4. [Readiness rules](readiness-rules.md)
5. [Screen specification](screen-spec.md)
6. [State transitions](state-transitions.md)
7. [Seed scenarios](seed-scenarios.md)
8. [Testability rules](testability-rules.md)
9. [Implementation plan](implementation-plan.md)
10. [Testing strategy](testing-strategy.md)

## Source of truth policy

This directory is the canonical implementation design for Release QA Cockpit.

Older compatibility files remain at:

- `docs/app-design/release-qa-cockpit.md`
- `docs/app-design/release-qa-cockpit-implementation-source-of-truth.md`
- `docs/app-design/release-qa-cockpit-mvp-implementation-checklist.md`

If an older compatibility file conflicts with this directory, use this directory.

If documents inside this directory conflict, use the more specific document:

| Topic                                 | Canonical document       |
| ------------------------------------- | ------------------------ |
| Product purpose                       | `product-definition.md`  |
| MVP inclusion and exclusion           | `mvp-scope.md`           |
| IndexedDB stores and entity fields    | `data-model.md`          |
| Ready / At Risk / Not Ready logic     | `readiness-rules.md`     |
| Routes, screens, user operations      | `screen-spec.md`         |
| Valid status transitions              | `state-transitions.md`   |
| Deterministic demo data               | `seed-scenarios.md`      |
| Playwright-friendly DOM and selectors | `testability-rules.md`   |
| PR order and acceptance criteria      | `implementation-plan.md` |
| Unit, UI, and E2E test expectations   | `testing-strategy.md`    |

## Required implementation path

The app must be implemented only under:

```text
demo-apps/release-qa-cockpit/
```

Do not use `examples/release-qa-cockpit/` for app code, generated tests, target profiles, storage state, or documentation.

## Design intent

The app must contain enough business rules to exercise real test design skills:

- role switching
- deterministic seed data and reset
- release readiness calculation
- test execution state changes
- defect triage state changes
- risk acceptance and rejection
- preview versus persisted release decision calculation
- evidence item creation
- Evidence Pack Markdown export
- activity log creation
- accessible UI surfaces that Playwright can explore

The app must remain small enough to implement incrementally. Do not add real authentication, remote persistence, integrations, or binary file storage in the MVP.
