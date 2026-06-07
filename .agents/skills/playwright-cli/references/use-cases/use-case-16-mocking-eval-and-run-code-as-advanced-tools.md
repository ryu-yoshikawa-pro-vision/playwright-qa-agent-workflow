# Use Case 16: Mocking, eval, and run-code as advanced tools

This page is part of the Playwright CLI use-case reference. It intentionally documents only `playwright-cli ...` commands.

### Use when

- normal snapshot/screenshot/console/network commands cannot answer the question
- a controlled network error or offline state is needed for exploration
- DOM or runtime state must be inspected directly

### Typical commands

```bash
playwright-cli route <pattern>
playwright-cli eval <expression>
playwright-cli eval <expression> <ref>
playwright-cli run-code <code>
```

### Rules

- Use these sparingly.
- Do not let mock behavior become confused with real application behavior.
- Record mock/eval/run-code decisions in `DECISIONS.md` when they affect findings or tests.

### Common mistakes

- Overusing `run-code` instead of normal user-visible operations.
- Treating mocked responses as confirmed production behavior.
