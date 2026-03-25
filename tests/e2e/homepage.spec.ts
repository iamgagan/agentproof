import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';

test.describe('Homepage', () => {
  let home: HomePage;

  test.beforeEach(async ({ page }) => {
    home = new HomePage(page);
    await home.goto();
  });

  test('renders the site header with logo and navigation', async () => {
    await expect(home.header).toBeVisible();
    await expect(home.logo).toBeVisible();
    await expect(home.navHowItWorks).toBeVisible();
    await expect(home.navWhatWeCheck).toBeVisible();
  });

  test('renders hero heading and subheading', async () => {
    await expect(home.heroHeading).toBeVisible();
    await expect(home.heroHeading).toContainText('AI shopping agents');
    await expect(home.heroSubheading).toBeVisible();
  });

  test('renders URL input and Scan My Store button', async () => {
    await expect(home.urlInput).toBeVisible();
    await expect(home.urlInput).toHaveAttribute('placeholder', 'https://yourstore.com');
    await expect(home.scanButton).toBeVisible();
    await expect(home.scanButton).toBeDisabled(); // disabled when input is empty
  });

  test('enables the scan button once a URL is typed', async () => {
    await home.urlInput.fill('https://www.patagonia.com');
    await expect(home.scanButton).toBeEnabled();
  });

  test('renders the stats section with key stat values', async ({ page }) => {
    await expect(page.getByText('4,700%')).toBeVisible();
    await expect(page.getByText('87%')).toBeVisible();
  });

  test('renders the "What we check" section with 5 category cards', async ({ page }) => {
    await home.whatWeCheckSection.scrollIntoViewIfNeeded();
    await expect(home.whatWeCheckSection).toBeVisible();
    const categoryCards = page.locator('#what-we-check .category-card');
    await expect(categoryCards).toHaveCount(5);
  });

  test('renders the "How it works" section with 3 steps', async ({ page }) => {
    await home.howItWorksSection.scrollIntoViewIfNeeded();
    await expect(home.howItWorksSection).toBeVisible();
    await expect(page.getByText('Enter your store URL')).toBeVisible();
    await expect(page.getByText('Scanner agents analyze')).toBeVisible();
    await expect(page.getByText('Get your score + fix list')).toBeVisible();
  });

  test('renders the bottom CTA section with a second scanner', async ({ page }) => {
    // Bottom of page has a second scanner instance
    const inputs = page.getByTestId('url-input');
    await expect(inputs).toHaveCount(2);
  });

  test('page title contains AgentProof', async ({ page }) => {
    await expect(page).toHaveTitle(/AgentProof/i);
  });
});
