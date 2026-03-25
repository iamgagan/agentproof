import type { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for the scan results page (/scan/[id]).
 */
export class ResultsPage {
  readonly page: Page;

  // Header
  readonly header: Locator;

  // Results overview
  readonly resultsHeader: Locator;
  readonly domainHeading: Locator;

  // Score gauge
  readonly scoreGauge: Locator;
  readonly scoreValue: Locator;
  readonly gradeValue: Locator;

  // Category breakdown
  readonly categoriesSection: Locator;

  // Issues
  readonly issuesSection: Locator;
  readonly issueList: Locator;

  // Sidebar "Scan another store" link
  readonly scanAnotherLink: Locator;

  constructor(page: Page) {
    this.page = page;

    this.header = page.getByTestId('site-header');
    this.resultsHeader = page.getByTestId('results-header');
    this.domainHeading = page.getByRole('heading', { level: 1 });

    this.scoreGauge = page.getByTestId('score-gauge');
    this.scoreValue = page.getByTestId('score-value');
    this.gradeValue = page.getByTestId('grade-value');

    this.categoriesSection = page.getByTestId('categories-section');
    this.issuesSection = page.getByTestId('issues-section');
    this.issueList = page.getByTestId('issue-list');

    this.scanAnotherLink = page.getByRole('link', { name: '← Scan another store' });
  }

  async goto(scanId: string) {
    await this.page.goto(`/scan/${scanId}`);
  }

  /**
   * Returns the numeric score shown in the gauge center.
   */
  async getScore(): Promise<number> {
    const text = await this.scoreValue.textContent();
    return parseInt(text ?? '0', 10);
  }

  /**
   * Returns the letter grade shown below the gauge.
   */
  async getGrade(): Promise<string> {
    return (await this.gradeValue.textContent()) ?? '';
  }

  /**
   * Returns all visible category card test-ids.
   */
  async getCategoryCardKeys(): Promise<string[]> {
    const cards = await this.page.locator('[data-testid^="category-card-"]').all();
    const keys: string[] = [];
    for (const card of cards) {
      const testId = await card.getAttribute('data-testid');
      if (testId) keys.push(testId.replace('category-card-', ''));
    }
    return keys;
  }
}
