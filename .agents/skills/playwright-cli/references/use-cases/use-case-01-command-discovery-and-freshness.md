# Use Case 01: Command discovery and freshness

This page is part of the Playwright CLI use-case reference. It intentionally documents only `playwright-cli ...` commands.

### Use when

- a command or option is unfamiliar
- Playwright CLI behavior may have changed
- an agent is about to use an advanced option

### Typical commands

```bash
playwright-cli --help
playwright-cli <command> --help
```

### Required behavior

- Do not guess unavailable options.
- Do not maintain a full static command catalog in this repository.
- If help output contradicts this repository, prefer current help output and update docs later.

### Common mistakes

- Copying old command examples from memory.
- Treating this repository as a complete CLI reference.
