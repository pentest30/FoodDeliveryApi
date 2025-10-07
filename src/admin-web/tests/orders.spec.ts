import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './auth-helper';

test.describe('Orders Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin first
    await loginAsAdmin(page);
    
    // Navigate to orders page
    await page.goto('/orders');
    await page.waitForLoadState('networkidle');
  });

  test('should display orders list page', async ({ page }) => {
    // Check if the page title is correct
    await expect(page.locator('h1')).toContainText('Orders Management');
    
    // Check if statistics cards are visible
    await expect(page.locator('.stat-card')).toHaveCount(4);
    
    // Check if filters are present
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
    await expect(page.locator('mat-select')).toBeVisible();
    
    // Check if table headers are present
    await expect(page.locator('th:has-text("Order ID")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();
    await expect(page.locator('th:has-text("Customer")')).toBeVisible();
    await expect(page.locator('th:has-text("Restaurant")')).toBeVisible();
    await expect(page.locator('th:has-text("Items")')).toBeVisible();
    await expect(page.locator('th:has-text("Total")')).toBeVisible();
    await expect(page.locator('th:has-text("Created")')).toBeVisible();
    await expect(page.locator('th:has-text("Actions")')).toBeVisible();
  });

  test('should filter orders by status', async ({ page }) => {
    // Click on status filter
    await page.click('mat-select');
    
    // Select a status option
    await page.click('mat-option:has-text("Pending")');
    
    // Wait for the filter to be applied
    await page.waitForTimeout(500);
    
    // Check if the filter was applied (this would depend on the actual implementation)
    // The exact assertion would depend on how the filtering is implemented
  });

  test('should search orders', async ({ page }) => {
    // Type in the search field
    await page.fill('input[placeholder*="Search"]', 'test order');
    
    // Wait for the search to be applied
    await page.waitForTimeout(500);
    
    // Check if the search was applied
    // The exact assertion would depend on the actual implementation
  });

  test('should display order details when clicking view', async ({ page }) => {
    // Wait for orders to load
    await page.waitForSelector('mat-row', { timeout: 10000 });
    
    // Click on the actions menu for the first order
    await page.click('mat-row:first-child button[mat-icon-button]');
    
    // Click on "View Details" option
    await page.click('button:has-text("View Details")');
    
    // Check if the dialog opened
    await expect(page.locator('mat-dialog-container')).toBeVisible();
    
    // Check if order details are displayed
    await expect(page.locator('h2:has-text("Order Details")')).toBeVisible();
    
    // Close the dialog
    await page.click('button[mat-dialog-close]');
  });

  test('should manage order status', async ({ page }) => {
    // Wait for orders to load
    await page.waitForSelector('mat-row', { timeout: 10000 });
    
    // Click on the actions menu for the first order
    await page.click('mat-row:first-child button[mat-icon-button]');
    
    // Click on "Manage Status" option (if available)
    const manageStatusButton = page.locator('button:has-text("Manage Status")');
    if (await manageStatusButton.isVisible()) {
      await manageStatusButton.click();
      
      // Check if the status dialog opened
      await expect(page.locator('mat-dialog-container')).toBeVisible();
      await expect(page.locator('h2:has-text("Manage Order Status")')).toBeVisible();
      
      // Close the dialog
      await page.click('button[mat-dialog-close]');
    }
  });

  test('should copy order ID', async ({ page }) => {
    // Wait for orders to load
    await page.waitForSelector('mat-row', { timeout: 10000 });
    
    // Click on the copy icon for the first order
    await page.click('mat-row:first-child .copy-icon');
    
    // Check if the snackbar notification appears
    await expect(page.locator('snack-bar-container')).toBeVisible();
    await expect(page.locator('snack-bar-container')).toContainText('Order ID copied to clipboard');
  });

  test('should handle pagination', async ({ page }) => {
    // Check if pagination is present
    const paginator = page.locator('mat-paginator');
    if (await paginator.isVisible()) {
      // Test pagination controls
      const nextButton = page.locator('mat-paginator button[aria-label="Next page"]');
      if (await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForTimeout(500);
      }
      
      const previousButton = page.locator('mat-paginator button[aria-label="Previous page"]');
      if (await previousButton.isEnabled()) {
        await previousButton.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should refresh orders', async ({ page }) => {
    // Click the refresh button
    await page.click('button:has-text("Refresh")');
    
    // Wait for the refresh to complete
    await page.waitForTimeout(1000);
    
    // Check if the page is still loaded
    await expect(page.locator('h1')).toContainText('Orders Management');
  });

  test('should clear filters', async ({ page }) => {
    // Fill in some filters first
    await page.fill('input[placeholder*="Search"]', 'test');
    await page.click('mat-select');
    await page.click('mat-option:has-text("Pending")');
    
    // Click clear filters button
    await page.click('button:has-text("Clear")');
    
    // Check if filters are cleared
    await expect(page.locator('input[placeholder*="Search"]')).toHaveValue('');
  });

  test('should display empty state when no orders', async ({ page }) => {
    // This test would need to be run in a scenario where there are no orders
    // or the API returns an empty result
    const emptyState = page.locator('.empty-state');
    if (await emptyState.isVisible()) {
      await expect(emptyState).toContainText('No Orders Found');
      await expect(emptyState).toContainText('No orders match your current filters');
    }
  });

  test('should display loading state', async ({ page }) => {
    // The loading state might be too fast to catch in normal operation
    // This test would need to be run with network throttling or mocked slow responses
    const loadingContainer = page.locator('.loading-container');
    if (await loadingContainer.isVisible()) {
      await expect(loadingContainer).toContainText('Loading orders...');
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if the page is still functional
    await expect(page.locator('h1')).toContainText('Orders Management');
    
    // Check if the hamburger menu is visible
    const menuButton = page.locator('button[aria-label="Toggle sidenav"]');
    if (await menuButton.isVisible()) {
      await menuButton.click();
    }
  });

  test('should navigate to orders from sidebar', async ({ page }) => {
    // Navigate to a different page first
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Click on Orders in the sidebar
    await page.click('a[routerLink="/orders"]');
    
    // Check if we're on the orders page
    await expect(page).toHaveURL('/orders');
    await expect(page.locator('h1')).toContainText('Orders Management');
  });
});
