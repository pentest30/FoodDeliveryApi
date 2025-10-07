import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './auth-helper';

test.describe('Restaurant Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin first
    await loginAsAdmin(page);
    
    // Navigate to restaurants page
    await page.goto('/restaurants');
    await page.waitForLoadState('networkidle');
  });

  test('should display restaurants list', async ({ page }) => {
    // Check if restaurants list is visible
    await expect(page.locator('mat-table, .restaurants-list')).toBeVisible();
  });

  test('should open restaurant details', async ({ page }) => {
    // Click on first restaurant in the list
    const firstRestaurant = page.locator('mat-row, .restaurant-item').first();
    await firstRestaurant.click();
    
    // Verify we're on restaurant details page
    await expect(page.locator('h1, .restaurant-name')).toBeVisible();
  });

  test('should navigate to menu items tab', async ({ page }) => {
    // First open a restaurant
    const firstRestaurant = page.locator('mat-row, .restaurant-item').first();
    await firstRestaurant.click();
    
    // Click on Menu Items tab
    await page.click('button:has-text("Menu Items"), .tab:has-text("Menu Items")');
    
    // Verify menu items section is visible
    await expect(page.locator('.menu-items-section, .menu-items-list')).toBeVisible();
  });

  test('should create new menu item', async ({ page }) => {
    // Navigate to restaurant details
    const firstRestaurant = page.locator('mat-row, .restaurant-item').first();
    await firstRestaurant.click();
    
    // Navigate to menu items
    await page.click('button:has-text("Menu Items"), .tab:has-text("Menu Items")');
    
    // Click add menu item button
    await page.click('button:has-text("Add Menu Item"), .add-menu-item-btn');
    
    // Verify we're on the menu item creation page
    await expect(page.locator('form, .menu-item-form')).toBeVisible();
  });
});
