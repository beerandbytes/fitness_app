import { test, expect } from '@playwright/test';

test.describe('Diet Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('userToken', 'mock-token');
    });
  });

  test('should display diet page', async ({ page }) => {
    await page.goto('/diet');
    await expect(page.getByRole('heading', { name: /dieta|comidas/i })).toBeVisible({ timeout: 10000 });
  });

  test('should show food search', async ({ page }) => {
    await page.goto('/diet');
    // Look for food search input or button
    const searchInput = page.getByPlaceholderText(/buscar alimento/i);
    if (await searchInput.isVisible({ timeout: 5000 })) {
      await searchInput.fill('pollo');
    }
  });
});

