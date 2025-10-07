import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/login');
    
    // Check if login form elements are present
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Check for validation messages (adjust selectors based on your actual implementation)
    await expect(page.locator('.error-message, .mat-error')).toBeVisible();
  });

  test('should navigate to dashboard after successful login', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in login form with correct credentials
    await page.fill('input[type="email"]', 'admin@fooddelivery.com');
    await page.fill('input[type="password"]', 'Admin@123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard or restaurants page
    await page.waitForURL(/\/dashboard|\/restaurants/);
    
    // Verify we're logged in (check for any authenticated content)
    await expect(page.locator('body')).toBeVisible();
  });
});
