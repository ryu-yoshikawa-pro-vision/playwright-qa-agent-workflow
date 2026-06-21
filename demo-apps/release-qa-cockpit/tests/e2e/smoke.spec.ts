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
  test('E2E-002: navigation from Dashboard to Releases to Release Overview', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    await page.getByRole('link', { name: 'Releases' }).click();
    await expect(page.getByRole('heading', { name: 'Releases' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Weekly Release 2026-06' })).toBeVisible();

    await page.getByRole('link', { name: 'View release Weekly Release 2026-06' }).click();
    await expect(page.getByRole('heading', { name: 'Weekly Release 2026-06' })).toBeVisible();
  });

  test('E2E-003: readiness badge shown on Releases and Release Overview', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByLabel('Readiness: Not Ready')).toBeVisible();

    await page.getByRole('link', { name: 'Releases' }).click();
    await expect(page.getByLabel('Readiness: Not Ready').first()).toBeVisible();

    await page.getByRole('link', { name: 'View release Weekly Release 2026-06' }).click();
    await expect(page.getByLabel('Readiness: Not Ready').first()).toBeVisible();
  });

  test('E2E-004: Release Overview shows readiness conditions and operational links', async ({
    page,
  }) => {
    await page.goto('/releases/rel-weekly-2026-06');
    await expect(page.getByRole('heading', { name: 'Weekly Release 2026-06' })).toBeVisible();

    await expect(page.getByRole('region', { name: 'Unmet readiness conditions' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Readiness warnings' })).toBeVisible();

    await expect(page.getByRole('link', { name: 'Open Test Execution' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Open Defect Triage' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Open Risk Review' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Open Release Decision' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Export Evidence Pack' })).toBeVisible();

    await expect(page.getByLabel('Readiness: Not Ready')).toBeVisible();
    await expect(page.getByText('Required: 3')).toBeVisible();
    await expect(page.getByText('Passed: 2')).toBeVisible();
    await expect(page.getByText('Failed or Blocked: 1')).toBeVisible();
    await expect(page.getByText('Unresolved blocking defects: 1')).toBeVisible();
    await expect(page.getByText('Active risks: 1')).toBeVisible();
  });

  test('E2E-005: selecting a different release updates the active dashboard release', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Weekly Release 2026-06' })).toBeVisible();

    await page.getByRole('link', { name: 'Releases' }).click();
    await expect(page.getByRole('heading', { name: 'Releases' })).toBeVisible();

    await page.getByRole('link', { name: 'View release Hotfix Release 2026-06' }).click();
    await expect(page.getByRole('heading', { name: 'Hotfix Release 2026-06' })).toBeVisible();

    await page.getByRole('link', { name: 'Dashboard' }).click();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Hotfix Release 2026-06' })).toBeVisible();
    await expect(page.getByLabel('Readiness: Not Ready')).toBeVisible();
  });
});

test.describe.serial('PR-4 QA operation screens', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(async () => {
      await new Promise<void>((resolve, reject) => {
        const req = indexedDB.deleteDatabase('ReleaseQACockpit');
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    });
    await page.reload();
    await page.waitForURL('/login');
    await page.getByRole('button', { name: 'Continue as QA Lead' }).click();
    await page.waitForURL('/');
  });

  test('E2E-006: TestExecution fail -> retest -> pass', async ({ page }) => {
    await page.goto('/releases/rel-weekly-2026-06/tests');
    await expect(page.getByRole('heading', { name: 'Test Execution' })).toBeVisible();

    await expect(
      page.getByLabel('Move test Recording playback is available after processing to retest'),
    ).toBeVisible();

    await page
      .getByLabel('Move test Recording playback is available after processing to retest')
      .click();

    await expect(
      page.getByLabel('Mark test Recording playback is available after processing as passed'),
    ).toBeVisible();

    await page
      .getByLabel('Mark test Recording playback is available after processing as passed')
      .click();
  });

  test('E2E-007: Defect open -> triaged -> inProgress -> fixed -> readyForRetest -> closed', async ({
    page,
  }) => {
    await page.goto('/releases/rel-weekly-2026-06/defects');
    await expect(page.getByRole('heading', { name: 'Defect Triage' })).toBeVisible();

    await page
      .getByLabel('Move defect Recording playback fails after processing to Triaged')
      .click();
    await page
      .getByLabel('Move defect Recording playback fails after processing to In Progress')
      .click();
    await page.getByLabel('Move defect Recording playback fails after processing to Fixed').click();
    await page
      .getByLabel('Move defect Recording playback fails after processing to Ready for Retest')
      .click();
    await page.getByLabel('Close defect Recording playback fails after processing').click();
  });

  test('E2E-008: Risk draft -> pendingApproval -> accepted', async ({ page }) => {
    await page.goto('/releases/rel-weekly-2026-06/risks');
    await expect(page.getByRole('heading', { name: 'Risk Review' })).toBeVisible();

    await page
      .getByLabel('Submit risk Recording regression risk remains after fix for approval')
      .click();

    await page.getByLabel('Accept risk Recording regression risk remains after fix').click();

    await expect(page.getByLabel('Accepted reason')).toBeVisible();
    await page.getByLabel('Accepted reason').fill('Acceptable regression risk');
    await page.getByRole('button', { name: 'Confirm' }).click();
  });

  test('E2E-009: Viewer cannot mutate test execution', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Continue as Viewer' }).click();
    await page.waitForURL('/');

    await page.goto('/releases/rel-weekly-2026-06/tests');
    await expect(page.getByRole('heading', { name: 'Test Execution' })).toBeVisible();

    await expect(page.getByText(/Viewer cannot/)).toBeVisible();
  });

  test('E2E-010: Create Test Result evidence for passed/failed test', async ({ page }) => {
    await page.goto('/releases/rel-weekly-2026-06/tests');
    await expect(page.getByRole('heading', { name: 'Test Execution' })).toBeVisible();

    await expect(
      page.getByLabel('Create Test Result evidence for Evidence Pack Markdown includes QA summary'),
    ).toBeVisible();

    await page
      .getByLabel('Create Test Result evidence for Evidence Pack Markdown includes QA summary')
      .click();
  });

  test('E2E-011: Viewer sees no update buttons on test execution', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Continue as Viewer' }).click();
    await page.waitForURL('/');

    await page.goto('/releases/rel-weekly-2026-06/tests');
    await expect(page.getByRole('heading', { name: 'Test Execution' })).toBeVisible();

    await expect(page.getByText(/Viewer cannot/)).toBeVisible();
    await expect(page.getByRole('button', { name: /Move test/i })).toHaveCount(0);
  });

  test('E2E-012: Empty reason confirm shows inline error and list persists', async ({ page }) => {
    await page.goto('/releases/rel-weekly-2026-06/risks');
    await expect(page.getByRole('heading', { name: 'Risk Review' })).toBeVisible();

    await page
      .getByLabel('Submit risk Recording regression risk remains after fix for approval')
      .click();

    await page.getByLabel('Accept risk Recording regression risk remains after fix').click();

    await expect(page.getByLabel('Accepted reason')).toBeVisible();
    await page.getByRole('button', { name: 'Confirm' }).click();

    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByRole('alert')).toContainText('Accepted reason is required');
    await expect(page.getByTestId('risk-row')).toBeVisible();
  });
});
