import type { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for the AgentProof landing page (/).
 */
export class HomePage {
  readonly page: Page;

  // Header
  readonly header: Locator;
  readonly logo: Locator;
  readonly navHowItWorks: Locator;
  readonly navWhatWeCheck: Locator;

  // Hero section
  readonly heroHeading: Locator;
  readonly heroSubheading: Locator;

  // Scanner form (primary hero scanner)
  readonly urlInput: Locator;
  readonly scanButton: Locator;
  readonly scanStatus: Locator;
  readonly scanError: Locator;

  // Stats section
  readonly statsSection: Locator;

  // What we check section
  readonly whatWeCheckSection: Locator;

  // How it works section
  readonly howItWorksSection: Locator;

  constructor(page: Page) {
    this.page = page;

    this.header = page.getByTestId('site-header');
    this.logo = page.getByRole('link', { name: 'AgentProof' }).first();
    this.navHowItWorks = page.getByRole('link', { name: 'How it works' }).first();
    this.navWhatWeCheck = page.getByRole('link', { name: 'What we check' }).first();

    this.heroHeading = page.getByRole('heading', { level: 1 });
    this.heroSubheading = page.locator('p').filter({ hasText: 'ChatGPT, Gemini, and Copilot are the new storefront.' }).first();

    // There are two Scanner components on the page; first one is in the hero
    this.urlInput = page.getByTestId('url-input').first();
    this.scanButton = page.getByTestId('scan-button').first();
    this.scanStatus = page.getByTestId('scan-status').first();
    this.scanError = page.getByTestId('scan-error').first();

    this.statsSection = page.locator('text=4,700%').first();
    this.whatWeCheckSection = page.locator('#what-we-check');
    this.howItWorksSection = page.locator('#how-it-works');
  }

  async goto() {
    await this.page.goto('/');
  }

  async submitUrl(url: string) {
    await this.urlInput.fill(url);
    await this.scanButton.click();
  }

  async waitForScanComplete() {
    // The scan navigates away to /scan/[id] when done
    await this.page.waitForURL(/\/scan\/[a-zA-Z0-9_-]+/, { timeout: 60_000 });
  }
}
