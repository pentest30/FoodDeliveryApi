import { Page } from '@playwright/test';

export async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  
  // Fill in login form with admin credentials
  await page.fill('input[type="email"]', 'admin@fooddelivery.com');
  await page.fill('input[type="password"]', 'Admin@123');
  
  // Submit form
  await page.click('button[type="submit"]');
  
  // Wait for navigation to complete
  await page.waitForLoadState('networkidle');
}
