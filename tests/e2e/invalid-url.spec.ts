import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';

test.describe('Invalid URL handling', () => {
  let home: HomePage;

  test.beforeEach(async ({ page }) => {
    home = new HomePage(page);
    await home.goto();
  });

  test('shows an error for a completely invalid string', async ({ page }) => {
    await home.urlInput.fill('not-a-valid-url-at-all!!!');
    await home.scanButton.click();
    await expect(home.scanError).toBeVisible();
    await expect(home.scanError).toContainText(/valid/i);
    // Must NOT navigate away
    await expect(page).toHaveURL('/');
  });

  test('shows an error for a private/loopback address', async ({ page }) => {
    await home.urlInput.fill('http://127.0.0.1');
    await home.scanButton.click();
    await expect(home.scanError).toBeVisible();
    await expect(home.scanError).toContainText(/public internet/i);
    await expect(page).toHaveURL('/');
  });

  test('shows an error for a hostname without a TLD', async ({ page }) => {
    await home.urlInput.fill('https://nodotatall');
    await home.scanButton.click();
    await expect(home.scanError).toBeVisible();
    await expect(page).toHaveURL('/');
  });

  test('clears the error message when the user starts retyping', async () => {
    await home.urlInput.fill('bad-url');
    await home.scanButton.click();
    await expect(home.scanError).toBeVisible();

    // Type into the input — error should clear
    await home.urlInput.type('x');
    await expect(home.scanError).not.toBeVisible();
  });

  test('scan button is disabled when URL input is empty', async () => {
    await expect(home.urlInput).toHaveValue('');
    await expect(home.scanButton).toBeDisabled();
  });
});
