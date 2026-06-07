# Use Case 04: Snapshot and ref-driven exploration

This page is part of the Playwright CLI use-case reference. It intentionally documents only `playwright-cli ...` commands.

### Use when

- identifying accessible roles, labels, text, forms, links, buttons, tables, or dialogs
- selecting a target for interaction
- deriving stable locator hints for generated tests

### Typical commands

```bash
playwright-cli snapshot
playwright-cli snapshot --filename=<path>
playwright-cli snapshot <ref>
```

### Required evidence

- save snapshots when they materially support a finding, plan scenario, or healing diagnosis
- reference the saved snapshot in `evidence-index.md`

### Rules

- Treat refs as short-lived.
- After click, navigation, reload, form submission, modal open/close, or meaningful state change, capture a new snapshot.
- Do not complete visual verification with snapshot alone.

### Common mistakes

- Using stale refs after the page changes.
- Inferring visual layout from accessibility text only.
