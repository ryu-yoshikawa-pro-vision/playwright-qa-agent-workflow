# Use Case 06: Form and UI interaction patterns

This page is part of the Playwright CLI use-case reference. It intentionally documents only `playwright-cli ...` commands.

### Use when

- exploring forms
- confirming validation
- opening menus, dialogs, dropdowns, or hover states
- testing keyboard behavior

### Typical commands

```bash
playwright-cli click <ref>
playwright-cli dblclick <ref>
playwright-cli fill <ref> <value>
playwright-cli type <value>
playwright-cli select <ref> <value>
playwright-cli check <ref>
playwright-cli uncheck <ref>
playwright-cli hover <ref>
playwright-cli press <key>
```

### Required evidence

- snapshot before operation when selecting a ref
- snapshot after operation when state changes
- screenshot after operation when visual result matters

### Common mistakes

- Entering destructive flows without explicit approval.
- Skipping validation states because the happy path worked.
