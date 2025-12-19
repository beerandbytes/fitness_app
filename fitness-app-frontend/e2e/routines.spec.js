import { test, expect } from '@playwright/test';

test.describe('Routines Management', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto('/');
    // Add auth token to localStorage or use mock
    await page.evaluate(() => {
      localStorage.setItem('userToken', 'mock-token');
    });
  });

  test('should display routines page', async ({ page }) => {
    await page.goto('/routines');
    await expect(page.getByRole('heading', { name: /rutinas/i })).toBeVisible({ timeout: 10000 });
  });

  test('should open create routine modal', async ({ page }) => {
    await page.goto('/routines');
    const createButton = page.getByRole('button', { name: /crear rutina/i });
    if (await createButton.isVisible()) {
      await createButton.click();
      await expect(page.getByLabel(/nombre/i)).toBeVisible({ timeout: 5000 });
    }
  });
});

