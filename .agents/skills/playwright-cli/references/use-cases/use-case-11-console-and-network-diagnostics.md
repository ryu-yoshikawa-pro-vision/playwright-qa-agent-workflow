# Use Case 11: Console and network diagnostics

This page is part of the Playwright CLI use-case reference. It intentionally documents only `playwright-cli ...` commands.

### Use when

- JavaScript errors may explain broken UI behavior
- API requests may explain missing data, disabled states, or error states
- healer needs root-cause evidence

### Typical commands

```bash
playwright-cli console error
playwright-cli console warning
playwright-cli network
playwright-cli network --filter=<pattern>
```

### Required evidence

- summarize relevant errors/statuses without exposing secrets
- redact request/response data when necessary

### Common mistakes

- Logging request headers, cookies, tokens, or sensitive payloads.
- Assuming a console warning is a defect without connecting it to user-visible behavior.
