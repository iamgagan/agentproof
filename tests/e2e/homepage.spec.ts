import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders hero section with scanner', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('ChatGPT is recommending products');
    await expect(page.locator('input[placeholder="https://yourstore.com"]').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Scan My Store/i }).first()).toBeVisible();
  });

  test('scan button is disabled when input is empty', async ({ page }) => {
    const button = page.getByRole('button', { name: /Scan My Store/i }).first();
    await expect(button).toBeDisabled();
  });

  test('scan button is disabled for invalid URL', async ({ page }) => {
    const input = page.locator('input[placeholder="https://yourstore.com"]').first();
    await input.fill('not-a-url');
    const button = page.getByRole('button', { name: /Scan My Store/i }).first();
    await expect(button).toBeDisabled();
  });

  test('scan button enables for valid URL', async ({ page }) => {
    const input = page.locator('input[placeholder="https://yourstore.com"]').first();
    await input.fill('https://example.com');
    const button = page.getByRole('button', { name: /Scan My Store/i }).first();
    await expect(button).toBeEnabled();
  });

  test('shows SSRF error for private addresses', async ({ page }) => {
    const input = page.locator('input[placeholder="https://yourstore.com"]').first();
    await input.fill('http://127.0.0.1');
    const button = page.getByRole('button', { name: /Scan My Store/i }).first();
    // Button should be disabled because validateUrl rejects private IPs
    await expect(button).toBeDisabled();
  });

  test('renders stat cards', async ({ page }) => {
    await expect(page.getByText('4,700%')).toBeVisible();
    await expect(page.getByText('87%')).toBeVisible();
    await expect(page.getByText('$3–5T')).toBeVisible();
  });

  test('renders 5 scoring category descriptions', async ({ page }) => {
    await expect(page.getByText('Schema & Structured Data')).toBeVisible();
    await expect(page.getByText('Product Data Quality')).toBeVisible();
    await expect(page.getByText('Protocol Readiness')).toBeVisible();
    await expect(page.getByText('Merchant Center Signals')).toBeVisible();
    await expect(page.getByText('AI Discoverability')).toBeVisible();
  });

  test('renders how it works section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'How it works' })).toBeVisible();
    await expect(page.getByText('Enter your store URL')).toBeVisible();
    await expect(page.getByText('Scanner agents analyze')).toBeVisible();
    await expect(page.getByText('Get your score + fix list')).toBeVisible();
  });
});
