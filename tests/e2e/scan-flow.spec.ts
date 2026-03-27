import { test, expect } from '@playwright/test';

test.describe('Scan flow', () => {
  test('submitting a URL shows scanning state and navigates to results', async ({ page }) => {
    await page.goto('/');

    const input = page.locator('input[placeholder="https://yourstore.com"]').first();
    await input.fill('https://example.com');

    const submitButton = page.getByRole('button', { name: /Scan My Store/i }).first();
    await submitButton.click();

    // Should show scanning state
    await expect(page.getByText('Scanning…').first()).toBeVisible({ timeout: 5000 });

    // Should navigate to results page after scan completes
    await page.waitForURL(/\/scan\/scan_/, { timeout: 45_000 });
    expect(page.url()).toMatch(/\/scan\/scan_/);

    // Results page should have key elements
    await expect(page.getByText('Agent Readiness Report')).toBeVisible();
    await expect(page.getByText('Category Breakdown')).toBeVisible();
    await expect(page.getByText('Top Issues to Fix')).toBeVisible();
  });

  test('results page shows score gauge and grade', async ({ page }) => {
    // First scan to get a results page
    await page.goto('/');
    const input = page.locator('input[placeholder="https://yourstore.com"]').first();
    await input.fill('https://example.com');
    await page.getByRole('button', { name: /Scan My Store/i }).first().click();
    await page.waitForURL(/\/scan\/scan_/, { timeout: 45_000 });

    // Score gauge should render (SVG circle)
    await expect(page.locator('svg circle').first()).toBeVisible();

    // Score summary table should show all 5 categories (exact match in sidebar)
    await expect(page.getByText('Schema', { exact: true })).toBeVisible();
    await expect(page.getByText('Product Data', { exact: true })).toBeVisible();
    await expect(page.getByText('Protocols', { exact: true })).toBeVisible();
    await expect(page.getByText('Merchant', { exact: true })).toBeVisible();
    await expect(page.getByText('Discoverability', { exact: true })).toBeVisible();

    // Total score should be visible
    await expect(page.getByText(/\/100/)).toBeTruthy();
  });

  test('results page shows share banner and concierge CTA', async ({ page }) => {
    await page.goto('/');
    const input = page.locator('input[placeholder="https://yourstore.com"]').first();
    await input.fill('https://example.com');
    await page.getByRole('button', { name: /Scan My Store/i }).first().click();
    await page.waitForURL(/\/scan\/scan_/, { timeout: 45_000 });

    // Share banner
    await expect(page.getByText(/Share/i).first()).toBeVisible();

    // Concierge CTA
    await expect(page.getByText('Want us to fix this for you?')).toBeVisible();
    await expect(page.getByText('$299 flat fee')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('"Scan another store" link navigates back to homepage', async ({ page }) => {
    await page.goto('/');
    const input = page.locator('input[placeholder="https://yourstore.com"]').first();
    await input.fill('https://example.com');
    await page.getByRole('button', { name: /Scan My Store/i }).first().click();
    await page.waitForURL(/\/scan\/scan_/, { timeout: 45_000 });

    await page.getByText('Scan another store').click();
    await page.waitForURL('/');
    await expect(page.locator('h1')).toContainText('ChatGPT is recommending products');
  });
});
