import { test, expect } from '@playwright/test';

test.describe('PR-1 smoke', () => {
  test('loads dashboard with seeded QA Lead session', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByLabel('Readiness: Not Ready')).toBeVisible();
  });

  test('allows role selection from login page', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'Select role' })).toBeVisible();
    await page.getByRole('button', { name: 'Continue as QA Lead' }).click();

    await expect(page).toHaveURL('/');
  });

  test('E2E-001: demo reset smoke', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Continue as QA Lead' }).click();
    await page.waitForURL('/');

    await page.getByRole('link', { name: 'Demo Controls' }).click();

    await expect(page.getByRole('heading', { name: 'Demo Controls' })).toBeVisible();

    await page.getByRole('button', { name: 'Reset demo data' }).click();

    await page.getByRole('button', { name: 'Confirm reset demo data' }).click();

    await expect(page.getByText('Demo data reset complete')).toBeVisible();

    await page.getByRole('link', { name: 'Dashboard' }).click();

    await expect(page.getByLabel('Readiness: Not Ready')).toBeVisible();
  });
});
