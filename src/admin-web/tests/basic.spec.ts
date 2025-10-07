import { test, expect } from '@playwright/test';

test.describe('Basic Application Tests', () => {
  test('should load login page', async ({ page }) => {
    await page.goto('/login');
    
    // Check if login page loads
    await expect(page.locator('body')).toBeVisible();
    
    // Check for login form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should login with admin credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in login form
    await page.fill('input[type="email"]', 'admin@fooddelivery.com');
    await page.fill('input[type="password"]', 'Admin@123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForLoadState('networkidle');
    
    // Check if we're redirected away from login page
    expect(page.url()).not.toContain('/login');
  });

  test('should display restaurants page after login', async ({ page }) => {
    await page.goto('/login');
    
    // Login
    await page.fill('input[type="email"]', 'admin@fooddelivery.com');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    
    // Navigate to restaurants
    await page.goto('/restaurants');
    await page.waitForLoadState('networkidle');
    
    // Check if page loads
    await expect(page.locator('body')).toBeVisible();
  });
});
