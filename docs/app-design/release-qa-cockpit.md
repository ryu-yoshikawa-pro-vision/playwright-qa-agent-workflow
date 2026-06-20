# Release QA Cockpit design overview

`Release QA Cockpit` is the local-first SaaS-style demo target application for the Playwright QA Agent Workflow.

It is used to validate service mapping, feature planning, test design, validation, Playwright Test generation, and test healing against a realistic release QA workflow.

## Canonical design docs

The canonical implementation design now lives under:

```text
docs/app-design/release-qa-cockpit/
```

Start with:

- [Release QA Cockpit design docs](release-qa-cockpit/README.md)
- [Product definition](release-qa-cockpit/product-definition.md)
- [MVP scope](release-qa-cockpit/mvp-scope.md)
- [Data model](release-qa-cockpit/data-model.md)
- [Readiness rules](release-qa-cockpit/readiness-rules.md)
- [Screen specification](release-qa-cockpit/screen-spec.md)
- [State transitions](release-qa-cockpit/state-transitions.md)
- [Seed scenarios](release-qa-cockpit/seed-scenarios.md)
- [Testability rules](release-qa-cockpit/testability-rules.md)
- [Implementation plan](release-qa-cockpit/implementation-plan.md)
- [Testing strategy](release-qa-cockpit/testing-strategy.md)

## Compatibility note

Older references may point to this file, `release-qa-cockpit-implementation-source-of-truth.md`, or `release-qa-cockpit-mvp-implementation-checklist.md`.

Those files are compatibility entry points only. If they conflict with the canonical directory above, use the canonical directory.

## Required implementation path

Implement the app only under:

```text
demo-apps/release-qa-cockpit/
```

Do not use `examples/release-qa-cockpit/` for app code, generated tests, target project profiles, storage state, or documentation.
