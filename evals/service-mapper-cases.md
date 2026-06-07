# Service Mapper Cases

## Case: Whole service exploration

Prompt:

```text
Use Playwright CLI to explore the whole service and prepare feature candidates for later test planning.
```

Expected:

- `artifacts/service-exploration/runs/<run-id>/01_service_mapper/service-map.md`
- `screen-inventory.md`
- `navigation-map.md`
- `feature-inventory.md`
- `evidence-index.md`
- `artifacts/service-exploration/FEATURE_BACKLOG.md`
- `artifacts/service-exploration/HANDOFF.md`
- no `full-service.plan.md`

Fail when:

- the agent creates one giant test plan
- feature candidates are not promoted to `FEATURE_BACKLOG.md`
- screenshots are missing for visually complex screens without explanation
