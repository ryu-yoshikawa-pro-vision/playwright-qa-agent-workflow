# Use Case 03: Browser launch, navigation, and reload

This page is part of the Playwright CLI use-case reference. It intentionally documents only `playwright-cli ...` commands.

### Use when

- starting exploration
- moving between known URLs
- verifying navigation paths
- recovering from stale UI state

### Typical commands

```bash
playwright-cli open <url>
playwright-cli goto <url>
playwright-cli reload
playwright-cli go-back
playwright-cli go-forward
```

### Required evidence

- after navigation, capture a fresh snapshot
- capture a screenshot when the visual state matters

### Common mistakes

- Reusing old refs after navigation.
- Treating a URL load as explored before checking snapshot and visual state.
