# Use Case 02: Environment readiness

This page is part of the Playwright CLI use-case reference. It intentionally documents only `playwright-cli ...` commands.

### Use when

- starting a service-mapper, planner, generator evidence-gathering, or healer investigation task
- the agent has not yet confirmed that Playwright CLI is available

### Typical commands

```bash
playwright-cli --help
```

### Required evidence

- note whether Playwright CLI is available
- if unavailable, mark browser-dependent phases as `BLOCKED`

### Common mistakes

- Fabricating screenshots, snapshots, traces, or browser observations when Playwright CLI is unavailable.
