# Use Case 14: Vision mode and coordinate interactions

This page is part of the Playwright CLI use-case reference. It intentionally documents only `playwright-cli ...` commands.

### Use when

- important UI is not exposed in the accessibility snapshot
- canvas, chart, map, diagram, or custom widget interaction is needed
- screenshot-based coordinate interaction is the only practical exploration route

### Typical commands

```bash
playwright-cli screenshot --filename=<path>
playwright-cli mousemove <x> <y>
playwright-cli mousedown
playwright-cli mouseup
playwright-cli mousewheel <dx> <dy>
```

### Rules

- Use coordinate operations for exploration only when ref-based interaction is unavailable.
- For generated tests, prefer stable locators whenever possible.
- If coordinate interaction is necessary, record the reason in `DECISIONS.md`.

### Common mistakes

- Using coordinates when a stable ref is available.
- Generating fragile tests from exploration-only coordinate operations.
