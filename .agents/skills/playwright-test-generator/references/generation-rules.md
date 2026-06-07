# Generation Rules

Generated tests should use `@playwright/test`, clear test titles, meaningful assertions, and comments linking to source plan scenarios.

Before generation, verify:

- `specs/<feature>.plan.md` exists
- `specs/_reviews/<feature>.validation.md` exists
- the validation decision is `PASS`
- the validation report contains `Plan SHA-256`
- the current plan file SHA-256 matches the validation report

If the hash does not match, stop and require revalidation.

Avoid fixed sleeps. Avoid brittle selectors unless no better locator exists.

Required mapping artifact:

```text
artifacts/<feature>/runs/<run-id>/03_generator/test-mapping.md
```


Test execution boundary:

- Do not add generic test runner commands to Playwright CLI references.
- If generated tests need execution instructions, refer to the target project's documented test command.
- Keep `playwright-cli` usage limited to browser evidence and investigation.
