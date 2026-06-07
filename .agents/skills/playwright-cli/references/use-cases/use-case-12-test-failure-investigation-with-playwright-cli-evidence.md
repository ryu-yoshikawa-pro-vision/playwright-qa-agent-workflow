# Use Case 12: Test failure investigation with Playwright CLI evidence

This page is part of the Playwright CLI use-case reference. It intentionally documents only `playwright-cli ...` commands.

### Use when

- generator or healer needs browser-state evidence for an existing failure
- a paused/debuggable browser session is available to attach to
- test output alone is not enough to diagnose the failure

### Typical commands

```bash
playwright-cli attach <session-name>
playwright-cli snapshot
playwright-cli screenshot --filename=<path>
playwright-cli console error
playwright-cli network --filter=<pattern>
```

### Boundary

Running the test suite is outside this Playwright CLI use-case reference. The generator or healer should use the target project's own test command when test execution is required, and then use `playwright-cli` only for browser-state evidence and diagnosis.

### Common mistakes

- Treating `playwright-cli` as the test runner.
- Fixing a test based only on terminal output when browser evidence is needed.
