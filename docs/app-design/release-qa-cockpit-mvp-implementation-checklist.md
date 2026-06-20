# Release QA Cockpit MVP implementation checklist

This file remains as a compatibility checklist for older references.

The canonical detailed MVP design now lives under:

```text
docs/app-design/release-qa-cockpit/
```

Use these files as the implementation source of truth:

- [MVP scope](release-qa-cockpit/mvp-scope.md)
- [Data model](release-qa-cockpit/data-model.md)
- [Readiness rules](release-qa-cockpit/readiness-rules.md)
- [Screen specification](release-qa-cockpit/screen-spec.md)
- [State transitions](release-qa-cockpit/state-transitions.md)
- [Seed scenarios](release-qa-cockpit/seed-scenarios.md)
- [Testability rules](release-qa-cockpit/testability-rules.md)
- [Implementation plan](release-qa-cockpit/implementation-plan.md)
- [Testing strategy](release-qa-cockpit/testing-strategy.md)

## Required implementation path

Use only:

```text
demo-apps/release-qa-cockpit/
```

Do not use `examples/release-qa-cockpit/` for app code, generated tests, target profile, storage state, or documentation.

## MVP checklist summary

Implementation is ready for review when:

- the app skeleton exists under `demo-apps/release-qa-cockpit/`
- deterministic seed data is implemented
- Demo Data Reset restores the initial Not Ready state
- all required MVP stores from `data-model.md` exist
- no out-of-scope stores exist
- all required screens from `screen-spec.md` are reachable
- readiness follows `readiness-rules.md`
- state transitions follow `state-transitions.md`
- UI controls follow `testability-rules.md`
- implementation order follows `implementation-plan.md`
- app tests follow `testing-strategy.md`

## First smoke E2E summary

The first smoke E2E must cover:

1. Open the demo app.
2. Continue as QA Lead.
3. Reset demo data.
4. Confirm the active release is Not Ready.
5. Resolve the seeded blocking defect through valid states.
6. Move the linked test execution to retest and then pass.
7. Create at least one Test Result evidence item.
8. Accept the seeded High impact risk.
9. Open Release Decision.
10. Confirm preview readiness is At Risk, not Ready.
11. Enter QA completion comment and decision comment.
12. Save At Risk decision.
13. Confirm Release Decision evidence is created.
14. Generate Evidence Pack Markdown.
15. Reset demo data and confirm the initial Not Ready state returns.

If this summary conflicts with the canonical detailed files, use the canonical detailed files.
