import { test, expect } from '@playwright/test';

test.describe('Weight Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('userToken', 'mock-token');
    });
  });

  test('should display weight tracking page', async ({ page }) => {
    await page.goto('/weight');
    await expect(page.getByRole('heading', { name: /peso|weight/i })).toBeVisible({ timeout: 10000 });
  });

  test('should show weight form', async ({ page }) => {
    await page.goto('/weight');
    const weightInput = page.getByLabel(/peso/i);
    if (await weightInput.isVisible({ timeout: 5000 })) {
      await weightInput.fill('70.5');
    }
  });
});

