# Generated Test Example

This document shows the intended shape of a generated Playwright Test without adding an executable sample spec to the repository.

This repository is a common AI-agent workflow layer, not a target application's finished Playwright test suite. Do not keep generic `tests/example.spec.ts` files that run against unrelated public sites. Generated tests should be created only from PASS-validated feature designs and target-project context.

## Example shape

```ts
import { expect, test } from '@playwright/test';

test.describe('login', () => {
  test('TD-001: valid user can sign in and reach the dashboard', async ({ page }) => {
    // Source plan: specs/login.plan.md
    // Source design: specs/login.test-design.md#TD-001
    // Validation: specs/_reviews/login.validation.md
    // Evidence: artifacts/login/runs/<run-id>/evidence/...

    await page.goto('/login');

    await page.getByLabel('Email').fill(process.env.TEST_LOGIN_EMAIL ?? '');
    await page.getByLabel('Password').fill(process.env.TEST_LOGIN_PASSWORD ?? '');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });
});
```

## Rules illustrated by the example

- Link generated tests to the test-design ID, source plan, validation report, and evidence.
- Prefer user-facing locators such as role, label, and accessible name.
- Do not hard-code secrets into tests.
- Do not invent behavior outside the validated test design.
- Do not weaken assertions merely to make a run pass.
- Keep implemented coverage current in `specs/<feature>.coverage.md`.

## When to generate real tests

Generate executable tests only after:

1. `specs/<feature>.plan.md` exists.
2. `specs/<feature>.test-design.md` exists.
3. `specs/_reviews/<feature>.validation.md` exists and is current.
4. `npm run agent:gate -- --feature <feature> --for generator` returns `PASS`.
5. Target project commands, data policy, and authentication constraints are known or explicitly marked non-blocking.
