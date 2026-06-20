# Release QA Cockpit implementation source of truth

This file remains as a compatibility entry point for older references.

The detailed canonical implementation design now lives under:

```text
docs/app-design/release-qa-cockpit/
```

Use that directory as the source of truth.

## Canonical documents

Read these files in order:

1. [Product definition](release-qa-cockpit/product-definition.md)
2. [MVP scope](release-qa-cockpit/mvp-scope.md)
3. [Data model](release-qa-cockpit/data-model.md)
4. [Readiness rules](release-qa-cockpit/readiness-rules.md)
5. [Screen specification](release-qa-cockpit/screen-spec.md)
6. [State transitions](release-qa-cockpit/state-transitions.md)
7. [Seed scenarios](release-qa-cockpit/seed-scenarios.md)
8. [Testability rules](release-qa-cockpit/testability-rules.md)
9. [Implementation plan](release-qa-cockpit/implementation-plan.md)
10. [Testing strategy](release-qa-cockpit/testing-strategy.md)

## Conflict policy

If this compatibility file conflicts with any file in `docs/app-design/release-qa-cockpit/`, use the file in `docs/app-design/release-qa-cockpit/`.

If files inside that directory conflict, use the more specific document for the topic.

## Non-negotiable rules

The following rules remain non-negotiable:

- Implement only under `demo-apps/release-qa-cockpit/`.
- Do not use `examples/release-qa-cockpit/`.
- Keep readiness calculation in domain logic, not React components.
- Separate persisted readiness from preview readiness.
- Do not create `comments`, `reportExports`, `reports`, or `reportHistory` stores in the MVP.
- Generate Evidence Pack Markdown from current IndexedDB state.
- Do not persist report history in the MVP.
- Keep Demo Data Reset deterministic.
- Use accessible selectors as the primary Playwright testing strategy.

## Required implementation path

```text
demo-apps/release-qa-cockpit/
```
