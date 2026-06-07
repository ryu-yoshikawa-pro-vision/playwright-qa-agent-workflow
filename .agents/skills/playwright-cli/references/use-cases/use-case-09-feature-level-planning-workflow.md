# Use Case 09: Feature-level planning workflow

This page is part of the Playwright CLI use-case reference. It intentionally documents only `playwright-cli ...` commands.

### Use when

- a single feature, page, or flow is known
- the planner needs focused browser evidence before writing `specs/<feature>.plan.md`

### Typical commands

```bash
playwright-cli goto <url>
playwright-cli snapshot
playwright-cli screenshot --filename=<path>
playwright-cli fill <ref> <value>
playwright-cli click <ref>
playwright-cli console error
playwright-cli network --filter=<pattern>
```

### Required outputs

- `specs/<feature>.plan.md`
- feature-level artifacts under `artifacts/<feature>/runs/<run-id>/01_planner/`
- feature-level `HANDOFF.md`, `OPEN_QUESTIONS.md`, `FINDINGS.md`, `DECISIONS.md`

### Common mistakes

- Treating unverified behavior as fact.
- Skipping visual evidence for validation/error states.
- Writing test code before validation.
