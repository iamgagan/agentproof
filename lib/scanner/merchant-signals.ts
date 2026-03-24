// lib/scanner/merchant-signals.ts
// Analyzes merchant trust signals (15 pts)

import * as cheerio from 'cheerio';
import type { CategoryResult, JsonLdData } from '../types';
import { createIssue } from './scoring';

const CATEGORY = 'merchantSignals' as const;

function extractAllJsonLd(html: string): JsonLdData[] {
  const $ = cheerio.load(html);
  const results: JsonLdData[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const parsed = JSON.parse($(el).html() || '');
      const items = parsed['@graph'] || (Array.isArray(parsed) ? parsed : [parsed]);
      results.push(...items);
    } catch { /* skip */ }
  });
  return results;
}

export async function analyzeMerchantSignals(
  homepageHtml: string,
  productPageHtml: string | null,
  url: string
): Promise<CategoryResult> {
  let score = 0;
  const issues: CategoryResult['issues'] = [];
  const allHtml = homepageHtml + (productPageHtml || '');
  const jsonLd = extractAllJsonLd(allHtml);
  const $ = cheerio.load(allHtml);

  // --- Check 1: Return policy (3 pts) ---
  const hasReturnPolicy = jsonLd.some((item) =>
    item['@type'] === 'MerchantReturnPolicy' ||
    (item.hasMerchantReturnPolicy !== undefined)
  );
  const hasReturnPolicyLink = $('a[href*="return"], a[href*="refund"]').length > 0;

  if (hasReturnPolicy) {
    score += 3;
  } else if (hasReturnPolicyLink) {
    score += 1;
    issues.push(
      createIssue(CATEGORY, 'warning', 'Return policy exists but not in structured data',
        'You have a return policy page, but it\'s not expressed as MerchantReturnPolicy schema. AI agents need structured data to communicate return terms during the purchase flow.',
        'Agents cannot tell shoppers your return policy during checkout, reducing purchase confidence.',
        'Add MerchantReturnPolicy JSON-LD with returnPolicyCategory, merchantReturnDays, and returnMethod.',
        2)
    );
  } else {
    issues.push(
      createIssue(CATEGORY, 'warning', 'No return policy found',
        'No return policy detected in structured data or as a linked page. AI agents and protocols like UCP require return policy data for checkout.',
        'Google UCP requires return policies for Merchant of Record verification. Without it, you may be ineligible for AI Mode purchases.',
        'Create a return policy page AND add MerchantReturnPolicy structured data.',
        3)
    );
  }

  // --- Check 2: Shipping info (3 pts) ---
  const hasShippingSchema = jsonLd.some((item) =>
    item['@type'] === 'OfferShippingDetails' ||
    item.shippingDetails !== undefined
  );
  const hasShippingLink = $('a[href*="shipping"], a[href*="delivery"]').length > 0;

  if (hasShippingSchema) {
    score += 3;
  } else if (hasShippingLink) {
    score += 1;
    issues.push(
      createIssue(CATEGORY, 'info', 'Shipping info exists but not in structured data',
        'You have shipping information on your site, but it\'s not in OfferShippingDetails schema.',
        'AI agents prefer structured shipping data for accurate delivery estimates in recommendations.',
        'Add OfferShippingDetails to your Product offers schema.',
        2)
    );
  } else {
    score += 0;
    issues.push(
      createIssue(CATEGORY, 'warning', 'No shipping information detected',
        'No shipping details found in structured data or linked pages.',
        'Agents cannot provide delivery estimates, which reduces conversion for agent-initiated purchases.',
        'Add shipping information page and OfferShippingDetails structured data.',
        3)
    );
  }

  // --- Check 3: Review signals (4 pts) ---
  const hasAggregateRating = jsonLd.some((item) => item.aggregateRating);
  const hasReviews = jsonLd.some((item) => item.review && (Array.isArray(item.review) ? item.review.length > 0 : true));

  if (hasAggregateRating) score += 2;
  if (hasReviews) score += 2;

  if (!hasAggregateRating && !hasReviews) {
    issues.push(
      createIssue(CATEGORY, 'warning', 'No review or rating data in structured schema',
        'AI shopping agents heavily weight reviews and ratings when making recommendations. Products without ratings are consistently ranked below rated products.',
        'Your products will lose head-to-head comparisons against competitors with visible ratings, even if your products are better.',
        'Add aggregateRating and review data to your Product JSON-LD. If you use a reviews platform (Yotpo, Judge.me, Bazaarvoice), ensure they output schema markup.',
        4)
    );
  } else if (!hasAggregateRating) {
    issues.push(
      createIssue(CATEGORY, 'info', 'Reviews found but no aggregate rating in schema',
        'Individual reviews are present but no aggregateRating summary. Agents use the aggregate for quick comparison.',
        'Agents may not surface your rating score in comparison views.',
        'Add aggregateRating with ratingValue and reviewCount to your Product schema.',
        2)
    );
  }

  // --- Check 4: Business verification (3 pts) ---
  const hasGoogleVerification = $('meta[name="google-site-verification"]').length > 0;
  const org = jsonLd.find((item) => item['@type'] === 'Organization');
  const hasAddress = org?.address !== undefined;
  const hasContactPoint = org?.contactPoint !== undefined;

  if (hasGoogleVerification) score += 1;
  if (hasAddress) score += 1;
  if (hasContactPoint) score += 1;

  const bizScore = (hasGoogleVerification ? 1 : 0) + (hasAddress ? 1 : 0) + (hasContactPoint ? 1 : 0);
  if (bizScore < 3) {
    issues.push(
      createIssue(CATEGORY, 'info', 'Incomplete business verification signals',
        `Missing: ${[!hasGoogleVerification && 'Google Site Verification', !hasAddress && 'Business address in schema', !hasContactPoint && 'Contact point in schema'].filter(Boolean).join(', ')}.`,
        'AI agents use these signals to verify you are a legitimate merchant. Lower verification = lower trust score = fewer recommendations.',
        'Add Google Site Verification, and include address and contactPoint in your Organization schema.',
        3 - bizScore)
    );
  }

  // --- Check 5: Trust signals (2 pts) ---
  const isHttps = url.startsWith('https://');
  const hasPrivacyPolicy = $('a[href*="privacy"]').length > 0;

  if (isHttps) score += 1;
  if (hasPrivacyPolicy) score += 1;

  if (!isHttps) {
    issues.push(
      createIssue(CATEGORY, 'critical', 'Site not served over HTTPS',
        'Your site is not using HTTPS. AI agents and agentic commerce protocols require HTTPS for all transactions.',
        'No AI agent will initiate a purchase on a non-HTTPS site. This is a hard blocker.',
        'Install an SSL certificate and redirect all HTTP traffic to HTTPS.',
        1)
    );
  }

  return {
    score,
    maxScore: 15,
    percentage: Math.round((score / 15) * 100),
    issues,
  };
}
