import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.getByText('Bienvenido')).toBeVisible();
    await expect(page.getByLabel('Correo electrónico')).toBeVisible();
    await expect(page.getByLabel('Contraseña')).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.getByText('Regístrate').click();
    await expect(page.getByText('Crea tu cuenta')).toBeVisible();
  });

  test('should show error on invalid login', async ({ page }) => {
    await page.getByLabel('Correo electrónico').fill('invalid@example.com');
    await page.getByLabel('Contraseña').fill('wrongpassword');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    
    // Wait for error message
    await expect(page.getByText(/credenciales inválidas|error/i)).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to forgot password', async ({ page }) => {
    await page.getByText(/¿olvidaste tu contraseña?/i).click();
    await expect(page).toHaveURL(/.*forgot-password/);
  });
});

