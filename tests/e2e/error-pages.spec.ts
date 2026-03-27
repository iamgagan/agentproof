import { test, expect } from '@playwright/test';

test.describe('Error handling', () => {
  test('invalid scan ID shows 404 page', async ({ page }) => {
    await page.goto('/scan/scan_nonexistent');
    // Should show the branded 404 page
    await expect(page.getByText(/not found|404|expired/i).first()).toBeVisible();
  });

  test('malformed scan ID shows 404 page', async ({ page }) => {
    await page.goto('/scan/garbage-id');
    await expect(page.getByText(/not found|404|expired/i).first()).toBeVisible();
  });

  test('results page for cached scan loads from share URL', async ({ page }) => {
    // First: scan to create a cached result
    await page.goto('/');
    const input = page.locator('input[placeholder="https://yourstore.com"]').first();
    await input.fill('https://example.com');
    await page.getByRole('button', { name: /Scan My Store/i }).first().click();
    await page.waitForURL(/\/scan\/scan_/, { timeout: 45_000 });

    const resultsUrl = page.url();

    // Navigate away and come back — should load from cache
    await page.goto('/');
    await page.goto(resultsUrl);

    await expect(page.getByText('Agent Readiness Report')).toBeVisible();
    await expect(page.getByText('Category Breakdown')).toBeVisible();
  });
});
