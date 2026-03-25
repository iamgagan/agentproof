import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import { ResultsPage } from './pages/ResultsPage';

/**
 * End-to-end scan flow test.
 *
 * This test performs a real network scan of a live ecommerce site.
 * The scan takes up to ~30 seconds, so the timeout is set generously.
 *
 * To avoid hammering the target on every run the test accepts a cached
 * result from the /api/scan endpoint.
 */
const TEST_URL = 'https://www.allbirds.com';

test.describe('URL scan flow', () => {
  test.setTimeout(90_000);

  test('submitting a valid URL shows scanning state then redirects to results', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await home.urlInput.fill(TEST_URL);
    await expect(home.scanButton).toBeEnabled();

    await home.scanButton.click();

    // Button should switch to "Scanning…" while request is in-flight
    await expect(home.scanButton).toContainText('Scanning');

    // Wait for navigation to the results page
    await home.waitForScanComplete();

    // Confirm we landed on a /scan/[id] page
    expect(page.url()).toMatch(/\/scan\/[a-zA-Z0-9_-]+/);
  });

  test('results page displays score gauge, grade, category breakdown, and issues', async ({ page }) => {
    // Step 1: trigger the scan via the UI
    const home = new HomePage(page);
    await home.goto();
    await home.urlInput.fill(TEST_URL);
    await home.scanButton.click();
    await home.waitForScanComplete();

    // Step 2: validate the results page
    const results = new ResultsPage(page);

    await expect(results.header).toBeVisible();
    await expect(results.resultsHeader).toBeVisible();

    // Domain heading should reflect the scanned URL
    await expect(results.domainHeading).toContainText('allbirds.com');

    // Score gauge
    await expect(results.scoreGauge).toBeVisible();
    await expect(results.scoreValue).toBeVisible();
    const score = await results.getScore();
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);

    // Grade
    await expect(results.gradeValue).toBeVisible();
    const grade = await results.getGrade();
    expect(['A', 'B', 'C', 'D', 'F']).toContain(grade.trim());

    // Category breakdown section
    await expect(results.categoriesSection).toBeVisible();
    const categoryKeys = await results.getCategoryCardKeys();
    expect(categoryKeys.length).toBe(5);
    expect(categoryKeys).toContain('structuredData');
    expect(categoryKeys).toContain('productQuality');
    expect(categoryKeys).toContain('protocolReadiness');
    expect(categoryKeys).toContain('merchantSignals');
    expect(categoryKeys).toContain('aiDiscoverability');

    // Issues section
    await expect(results.issuesSection).toBeVisible();

    // "Scan another store" link navigates back to homepage
    await expect(results.scanAnotherLink).toBeVisible();
  });

  test('results page shows correct domain heading', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.urlInput.fill(TEST_URL);
    await home.scanButton.click();
    await home.waitForScanComplete();

    const results = new ResultsPage(page);
    await expect(results.domainHeading).toBeVisible();
    await expect(results.domainHeading).toContainText('allbirds.com');
  });

  test('"Scan another store" link returns to homepage', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.urlInput.fill(TEST_URL);
    await home.scanButton.click();
    await home.waitForScanComplete();

    const results = new ResultsPage(page);
    await results.scanAnotherLink.click();
    await expect(page).toHaveURL('/');
    await expect(page.getByTestId('url-input').first()).toBeVisible();
  });

  test('results page is shareable — reloading the /scan/[id] URL shows the same results', async ({ page }) => {
    // Trigger scan
    const home = new HomePage(page);
    await home.goto();
    await home.urlInput.fill(TEST_URL);
    await home.scanButton.click();
    await home.waitForScanComplete();

    const scanUrl = page.url();
    const results = new ResultsPage(page);
    const scoreFirst = await results.getScore();

    // Navigate to the scan URL directly (simulates sharing the link)
    await page.goto(scanUrl);
    await page.waitForLoadState('networkidle');

    const resultsReloaded = new ResultsPage(page);
    await expect(resultsReloaded.scoreGauge).toBeVisible();
    const scoreReloaded = await resultsReloaded.getScore();

    // Scores must match since both loads hit the same cached result
    expect(scoreReloaded).toBe(scoreFirst);
  });
});
