import { test, expect } from '@playwright/test';

test.describe('PR-1 smoke', () => {
  test('E2E-001: demo reset smoke - opens app, selects QA Lead, resets, sees Not Ready', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('heading', { name: 'Select role' }).waitFor();

    await page.getByRole('button', { name: 'Continue as QA Lead' }).click();

    await page.getByRole('heading', { name: 'Dashboard' }).waitFor();

    await page.getByRole('link', { name: 'Demo Controls' }).click();

    await page.getByRole('heading', { name: 'Demo Controls' }).waitFor();

    await page.getByRole('button', { name: 'Reset demo data' }).click();

    await page.getByRole('button', { name: 'Confirm reset demo data' }).click();

    await page.getByText('Demo data reset complete').waitFor();

    await page.getByRole('link', { name: 'Dashboard' }).click();

    await page.getByRole('heading', { name: 'Dashboard' }).waitFor();

    await expect(page.getByLabel('Readiness: Not Ready')).toBeVisible();
  });
});
