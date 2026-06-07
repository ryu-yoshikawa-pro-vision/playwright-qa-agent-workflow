# Use Case 08: Service-wide mapping workflow

This page is part of the Playwright CLI use-case reference. It intentionally documents only `playwright-cli ...` commands.

### Use when

- the request is to explore the entire service, all screens, all routes, or all major flows

### Typical commands

```bash
playwright-cli open <url>
playwright-cli snapshot
playwright-cli screenshot --filename=<path>
playwright-cli click <ref>
playwright-cli go-back
playwright-cli goto <url>
```

### Required outputs

- `service-map.md`
- `screen-inventory.md`
- `navigation-map.md`
- `feature-inventory.md`
- `coverage-matrix.md`
- `evidence-index.md`
- scope-level `HANDOFF.md`, `OPEN_QUESTIONS.md`, `FINDINGS.md`, `DECISIONS.md`, `FEATURE_BACKLOG.md`

### Common mistakes

- Creating one huge full-service test plan.
- Failing to promote feature candidates into `FEATURE_BACKLOG.md`.
- Marking screens as explored without visual evidence.
