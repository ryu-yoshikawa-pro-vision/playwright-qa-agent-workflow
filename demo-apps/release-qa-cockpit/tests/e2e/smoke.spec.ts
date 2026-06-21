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

test.describe('PR-3 core release screens', () => {
  test('E2E-002: navigation from Dashboard to Releases to Release Overview', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    await page.getByRole('link', { name: 'Releases' }).click();
    await expect(page.getByRole('heading', { name: 'Releases' })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Weekly Release 2026-06' }),
    ).toBeVisible();

    await page.getByRole('link', { name: 'View release Weekly Release 2026-06' }).click();
    await expect(
      page.getByRole('heading', { name: 'Weekly Release 2026-06' }),
    ).toBeVisible();
  });

  test('E2E-003: readiness badge shown on Releases and Release Overview', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByLabel('Readiness: Not Ready')).toBeVisible();

    await page.getByRole('link', { name: 'Releases' }).click();
    await expect(page.getByLabel('Readiness: Not Ready')).toBeVisible();

    await page.getByRole('link', { name: 'View release Weekly Release 2026-06' }).click();
    await expect(page.getByLabel('Readiness: Not Ready')).toBeVisible();
  });

  test('E2E-004: Release Overview shows readiness conditions and operational links', async ({
    page,
  }) => {
    await page.goto('/releases/rel-weekly-2026-06');
    await expect(
      page.getByRole('heading', { name: 'Weekly Release 2026-06' }),
    ).toBeVisible();

    await expect(
      page.getByRole('region', { name: 'Unmet readiness conditions' }),
    ).toBeVisible();
    await expect(
      page.getByRole('region', { name: 'Readiness warnings' }),
    ).toBeVisible();

    await expect(
      page.getByRole('link', { name: 'Open Test Execution' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Open Defect Triage' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Open Risk Review' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Open Release Decision' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Export Evidence Pack' }),
    ).toBeVisible();

    await expect(page.getByLabel('Readiness: Not Ready')).toBeVisible();
    await expect(page.getByText('Required: 3')).toBeVisible();
    await expect(page.getByText('Passed: 2')).toBeVisible();
    await expect(page.getByText('Failed or Blocked: 1')).toBeVisible();
    await expect(page.getByText('Unresolved blocking defects: 1')).toBeVisible();
    await expect(page.getByText('Active risks: 1')).toBeVisible();
  });
});
