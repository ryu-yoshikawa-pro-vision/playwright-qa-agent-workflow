# Use Case 07: Authentication and session persistence

This page is part of the Playwright CLI use-case reference. It intentionally documents only `playwright-cli ...` commands.

### Use when

- the target app requires login
- role-specific exploration is needed
- repeated exploration should reuse the same browser state

### Typical commands

```bash
PLAYWRIGHT_CLI_SESSION=<scope-or-feature> playwright-cli open <url>
playwright-cli state-save artifacts/<scope-or-feature>/auth/state.json
playwright-cli state-load artifacts/<scope-or-feature>/auth/state.json
```

### Required evidence

- record the role/session label used
- do not record secrets, cookies, localStorage, sessionStorage, or passwords

### Artifact paths

```text
artifacts/<scope-or-feature>/auth/
```

### Common mistakes

- Committing saved authentication state.
- Mixing admin and user sessions under the same session name.
