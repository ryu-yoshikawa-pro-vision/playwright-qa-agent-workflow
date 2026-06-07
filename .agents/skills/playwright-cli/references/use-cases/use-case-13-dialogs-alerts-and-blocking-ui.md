# Use Case 13: Dialogs, alerts, and blocking UI

This page is part of the Playwright CLI use-case reference. It intentionally documents only `playwright-cli ...` commands.

### Use when

- browser dialogs block progress
- confirm/alert/prompt behavior is part of the feature risk
- destructive actions require explicit confirmation handling

### Typical commands

```bash
playwright-cli dialog-accept
playwright-cli dialog-dismiss
```

### Required evidence

- record dialog text and context without secrets
- plan both accept and dismiss behavior when relevant

### Common mistakes

- Accepting destructive dialogs without user approval.
- Ignoring dismiss/cancel paths.
