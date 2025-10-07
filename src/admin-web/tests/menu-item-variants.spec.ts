import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './auth-helper';

test.describe('Menu Item Variants', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin first
    await loginAsAdmin(page);
    
    // Navigate to a restaurant's menu items
    await page.goto('/restaurants');
    await page.waitForLoadState('networkidle');
    
    // Wait for restaurants to load and click on first one
    await page.waitForSelector('mat-row, .restaurant-item', { timeout: 10000 });
    const firstRestaurant = page.locator('mat-row, .restaurant-item').first();
    await firstRestaurant.click();
    
    // Wait for restaurant details to load and click Menu Items tab
    await page.waitForSelector('button:has-text("Menu Items"), .tab:has-text("Menu Items")', { timeout: 10000 });
    await page.click('button:has-text("Menu Items"), .tab:has-text("Menu Items")');
  });

  test('should open variant dialog when adding variant', async ({ page }) => {
    // Click on a menu item to edit it
    const menuItem = page.locator('mat-row, .menu-item').first();
    await menuItem.click();
    
    // Click add variant button
    await page.click('button:has-text("Add Variant"), .add-variant-btn');
    
    // Verify variant dialog is open
    await expect(page.locator('mat-dialog-container, .variant-dialog')).toBeVisible();
    await expect(page.locator('h2:has-text("Add New Variant")')).toBeVisible();
  });

  test('should fill variant form and save', async ({ page }) => {
    // Open variant dialog
    const menuItem = page.locator('mat-row, .menu-item').first();
    await menuItem.click();
    await page.click('button:has-text("Add Variant"), .add-variant-btn');
    
    // Fill variant form
    await page.fill('input[formControlName="name"]', 'Large Size');
    await page.fill('input[formControlName="price"]', '15.99');
    await page.fill('input[formControlName="size"]', 'Large');
    await page.fill('input[formControlName="unit"]', 'piece');
    
    // Save variant
    await page.click('button:has-text("Add Variant"), .save-variant-btn');
    
    // Verify dialog closes and variant appears in list
    await expect(page.locator('mat-dialog-container, .variant-dialog')).not.toBeVisible();
    await expect(page.locator('text=Large Size')).toBeVisible();
  });

  test('should edit existing variant', async ({ page }) => {
    // Open menu item with existing variants
    const menuItem = page.locator('mat-row, .menu-item').first();
    await menuItem.click();
    
    // Click edit on first variant
    const editButton = page.locator('button[title="Edit variant"], .edit-variant-btn').first();
    await editButton.click();
    
    // Verify edit dialog opens
    await expect(page.locator('h2:has-text("Edit Variant")')).toBeVisible();
    
    // Update variant name
    await page.fill('input[formControlName="name"]', 'Updated Variant');
    
    // Save changes
    await page.click('button:has-text("Update Variant"), .update-variant-btn');
    
    // Verify changes are saved
    await expect(page.locator('text=Updated Variant')).toBeVisible();
  });

  test('should delete variant', async ({ page }) => {
    // Open menu item with variants
    const menuItem = page.locator('mat-row, .menu-item').first();
    await menuItem.click();
    
    // Click delete on first variant
    const deleteButton = page.locator('button[title="Delete variant"], .delete-variant-btn').first();
    await deleteButton.click();
    
    // Confirm deletion in dialog
    await page.click('button:has-text("Delete"), .confirm-delete-btn');
    
    // Verify variant is removed
    await expect(page.locator('.variant-item').first()).not.toBeVisible();
  });
});
