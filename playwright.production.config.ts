/**
 * Playwright config for running E2E tests against the production deployment.
 * Does NOT start a local dev server.
 *
 * Usage:
 *   npx playwright test --config=playwright.production.config.ts
 */
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  // Only run the production-specific test file by default
  testMatch: '**/production-critical-flows.spec.ts',
  fullyParallel: false,
  retries: 1,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'playwright-report-production', open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL: 'https://agent-proof.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Give production pages time to load
    navigationTimeout: 30_000,
    actionTimeout: 15_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  // No webServer block — tests run against the live production URL
  outputDir: 'test-results-production',
});
