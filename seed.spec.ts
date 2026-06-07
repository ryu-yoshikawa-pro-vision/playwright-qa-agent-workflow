import { test, expect } from '@playwright/test';

test.describe('Test group', () => {
  test('seed', async ({ page }) => {
    await page.setContent('<main data-seed="ready">seed</main>');
    await expect(page.locator('main')).toHaveAttribute('data-seed', 'ready');
  });
});
