# Use Case 10: Tracing important flows

This page is part of the Playwright CLI use-case reference. It intentionally documents only `playwright-cli ...` commands.

### Use when

- a flow spans multiple screens
- async behavior, loading, or external dependencies are involved
- an operation fails intermittently
- healer needs evidence beyond a single screenshot/snapshot

### Do not use when

- checking a simple static page is enough
- the trace would capture sensitive data unnecessarily

### Typical commands

```bash
playwright-cli tracing-start
playwright-cli tracing-stop
```

### Required evidence

- record trace path in `evidence-index.md`
- describe what the trace proves

### Common mistakes

- Tracing everything by default.
- Forgetting to stop/save the trace.
