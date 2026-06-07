# Use Case 05: Visual evidence with screenshots

This page is part of the Playwright CLI use-case reference. It intentionally documents only `playwright-cli ...` commands.

### Use when

- layout, visibility, disabled state, modal/dialog/drawer state, loading state, empty state, validation message, responsive behavior, chart, canvas, or map matters
- documenting an issue or suspected defect
- confirming that a screen is actually visible to a user

### Typical commands

```bash
playwright-cli screenshot --filename=<path>
playwright-cli screenshot <ref> --filename=<path>
```

### Required evidence

- store screenshots under the relevant run's `evidence/screenshots/` directory
- record what the screenshot proves in `evidence-index.md`

### Common mistakes

- Capturing only a snapshot for a visual claim.
- Taking screenshots without linking them to a screen ID, state ID, or finding.
