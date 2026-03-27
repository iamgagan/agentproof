import { test, expect } from '@playwright/test';

test.describe('Waitlist signup on results page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a results page via scanning
    await page.goto('/');
    const input = page.locator('input[placeholder="https://yourstore.com"]').first();
    await input.fill('https://example.com');
    await page.getByRole('button', { name: /Scan My Store/i }).first().click();
    await page.waitForURL(/\/scan\/scan_/, { timeout: 45_000 });
  });

  test('submitting valid email shows success state', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('test@example.com');

    await page.getByRole('button', { name: /Get a quote/i }).click();

    // Should show success message
    await expect(page.getByText("You're on the list!")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('reach out within 24 hours')).toBeVisible();
  });

  test('submit button is disabled with empty email', async ({ page }) => {
    const submitBtn = page.getByRole('button', { name: /Get a quote/i });
    await expect(submitBtn).toBeDisabled();
  });

  test('shows error for empty email after clearing', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    // Type then clear to trigger the "Please enter your email" error
    await emailInput.fill('a@b.com');
    await emailInput.fill('');

    // Button should be disabled with empty email
    const submitBtn = page.getByRole('button', { name: /Get a quote/i });
    await expect(submitBtn).toBeDisabled();
  });
});
