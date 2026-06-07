# Use Case 15: Existing browser attach

This page is part of the Playwright CLI use-case reference. It intentionally documents only `playwright-cli ...` commands.

### Use when

- a login state already exists in an external browser
- browser extensions or a manually prepared session are required
- an existing debug session must be inspected

### Typical commands

```bash
playwright-cli attach --cdp=<endpoint>
playwright-cli attach --cdp=chrome
playwright-cli attach --cdp=msedge
playwright-cli attach --extension
```

### Required evidence

- record how the browser was attached at a high level
- do not record sensitive endpoint credentials or secrets

### Common mistakes

- Assuming attached browser state is reproducible for CI.
- Mixing evidence from different browser profiles without recording it.
