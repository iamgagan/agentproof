// lib/scanner/schema-analyzer.ts
// Analyzes JSON-LD, schema.org structured data for AI agent readability

import * as cheerio from 'cheerio';
import type { CategoryResult, Issue, JsonLdData } from '../types';
import { createIssue } from './scoring';

const CATEGORY = 'structuredData' as const;

function extractJsonLd(html: string): JsonLdData[] {
  const $ = cheerio.load(html);
  const results: JsonLdData[] = [];

  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const raw = $(el).html();
      if (!raw) return;
      const parsed = JSON.parse(raw);
      // Handle @graph arrays
      if (parsed['@graph'] && Array.isArray(parsed['@graph'])) {
        results.push(...parsed['@graph']);
      } else if (Array.isArray(parsed)) {
        results.push(...parsed);
      } else {
        results.push(parsed);
      }
    } catch {
      // Invalid JSON-LD — ignore
    }
  });

  return results;
}

function findByType(items: JsonLdData[], type: string): JsonLdData | null {
  return items.find((item) => {
    const itemType = item['@type'] as string | string[] | undefined;
    if (typeof itemType === 'string') return itemType.toLowerCase() === type.toLowerCase();
    if (Array.isArray(itemType)) return itemType.some((t: string) => t.toLowerCase() === type.toLowerCase());
    return false;
  }) || null;
}

const REQUIRED_PRODUCT_ATTRS = [
  { key: 'name', label: 'Product name' },
  { key: 'description', label: 'Product description' },
  { key: 'image', label: 'Product image' },
  { key: 'offers', label: 'Price/offers', deep: ['price', 'priceCurrency'] },
  { key: 'brand', label: 'Brand' },
  { key: 'sku', label: 'SKU', alt: 'gtin' },
  { key: 'aggregateRating', label: 'Aggregate rating' },
  { key: 'review', label: 'Reviews' },
  { key: 'url', label: 'Product URL' },
  { key: 'availability', label: 'Availability', nested: 'offers.availability' },
];

export async function analyzeStructuredData(
  homepageHtml: string,
  productPageHtml: string | null,
  _url: string
): Promise<CategoryResult> {
  let score = 0;
  const issues: Issue[] = [];

  // Combine JSON-LD from both pages
  const homepageJsonLd = extractJsonLd(homepageHtml);
  const productJsonLd = productPageHtml ? extractJsonLd(productPageHtml) : [];
  const allJsonLd = [...homepageJsonLd, ...productJsonLd];

  // --- Check 1: JSON-LD Product schema (8 pts) ---
  const product = findByType(productJsonLd, 'Product') || findByType(homepageJsonLd, 'Product');

  if (product) {
    score += 8;
  } else {
    issues.push(
      createIssue(
        CATEGORY,
        'critical',
        'No JSON-LD Product schema found',
        'AI shopping agents rely on structured Product schema to understand what you sell. Without it, agents cannot parse your product details programmatically.',
        'Your products will not appear in ChatGPT Shopping, Google AI Mode, or Copilot product recommendations.',
        'Add JSON-LD Product markup (schema.org/Product) to every product page. Include name, description, price, availability, images, and brand at minimum.',
        8
      )
    );
  }

  // --- Check 2: Required product attributes (10 pts, 1pt each) ---
  if (product) {
    let attrScore = 0;
    const missingAttrs: string[] = [];

    for (const attr of REQUIRED_PRODUCT_ATTRS) {
      let found = false;

      // Check direct key
      if (product[attr.key] !== undefined && product[attr.key] !== null && product[attr.key] !== '') {
        found = true;
      }

      // Check alternate key
      if (!found && attr.alt && product[attr.alt] !== undefined) {
        found = true;
      }

      // Check nested path (e.g., offers.availability)
      if (!found && attr.nested) {
        const parts = attr.nested.split('.');
        let current: unknown = product;
        for (const part of parts) {
          if (current && typeof current === 'object') {
            current = (current as Record<string, unknown>)[part];
          } else {
            current = undefined;
            break;
          }
        }
        if (current !== undefined && current !== null) {
          found = true;
        }
      }

      if (found) {
        attrScore += 1;
      } else {
        missingAttrs.push(attr.label);
      }
    }

    score += attrScore;

    if (missingAttrs.length > 0) {
      const severity = missingAttrs.length > 5 ? 'critical' : missingAttrs.length > 2 ? 'warning' : 'info';
      issues.push(
        createIssue(
          CATEGORY,
          severity,
          `Missing ${missingAttrs.length} product attributes in schema`,
          `Your Product schema is missing: ${missingAttrs.join(', ')}. AI agents use these attributes to compare products, generate recommendations, and complete purchases.`,
          `Agents comparing your products against competitors with complete data will favor the competitor.`,
          `Add the missing attributes to your JSON-LD Product markup: ${missingAttrs.join(', ')}.`,
          10 - attrScore
        )
      );
    }
  }

  // --- Check 3: Organization schema (3 pts) ---
  const org = findByType(allJsonLd, 'Organization');
  if (org && org.name && org.url) {
    score += 3;
    // Check for logo
    if (!org.logo) {
      issues.push(
        createIssue(
          CATEGORY,
          'info',
          'Organization schema missing logo',
          'Your Organization schema exists but lacks a logo property.',
          'AI agents may not display your brand identity in recommendations.',
          'Add a "logo" property to your Organization JSON-LD.',
          0.5
        )
      );
    }
  } else {
    issues.push(
      createIssue(
        CATEGORY,
        'warning',
        'No Organization schema found',
        'Organization schema helps AI agents verify your brand identity and establish trust signals.',
        'Agents may not recognize your brand as a verified merchant, reducing recommendation confidence.',
        'Add JSON-LD Organization markup with name, url, and logo to your homepage.',
        3
      )
    );
  }

  // --- Check 4: FAQPage schema (2 pts) ---
  const faqPage = findByType(allJsonLd, 'FAQPage');
  if (faqPage) {
    score += 2;
  } else {
    issues.push(
      createIssue(
        CATEGORY,
        'info',
        'No FAQPage schema found',
        'FAQPage schema provides AI agents with pre-answered questions about your products, improving recommendation quality.',
        'Agents cannot answer product questions on your behalf, potentially losing sales to competitors who provide this data.',
        'Add FAQPage JSON-LD with common product questions and answers.',
        2
      )
    );
  }

  // --- Check 5: BreadcrumbList schema (2 pts) ---
  const breadcrumb = findByType(allJsonLd, 'BreadcrumbList');
  if (breadcrumb) {
    score += 2;
  } else {
    issues.push(
      createIssue(
        CATEGORY,
        'info',
        'No BreadcrumbList schema found',
        'BreadcrumbList helps AI agents understand your site hierarchy and product categorization.',
        'Agents may have difficulty understanding your product taxonomy and category relationships.',
        'Add BreadcrumbList JSON-LD to product and category pages.',
        2
      )
    );
  }

  return {
    score,
    maxScore: 25,
    percentage: Math.round((score / 25) * 100),
    issues,
  };
}

export function scoreAttrQuality(
  product: JsonLdData,
  key: string
): { points: number; issue: string | null } {
  const ISO_CURRENCY_REGEX = /^[A-Z]{3}$/;
  const PLACEHOLDER_PATTERNS = [/placeholder/i, /n\/a/i, /n\/a/i, /undefined/i, /null/i];

  const isPlaceholder = (value: string): boolean => {
    return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(value));
  };

  const isAbsoluteUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isHttpsUrl = (url: string): boolean => {
    return url.startsWith('https://');
  };

  switch (key) {
    case 'offers': {
      const offers = product.offers as Record<string, unknown> | undefined;
      if (!offers || typeof offers !== 'object') {
        return { points: 0, issue: 'Missing offers/price information' };
      }

      const price = offers.price;
      const currency = offers.priceCurrency as string | undefined;

      // Check if price is numeric (1pt) or string (0.5pt)
      const isNumericPrice = typeof price === 'number';
      const pricePoints = isNumericPrice ? 1 : 0.5;

      // Check if currency is ISO format (1pt for valid, 0.5pt for non-ISO)
      const isIsoCurrency = currency && ISO_CURRENCY_REGEX.test(currency);
      const currencyPoints = isIsoCurrency ? 1 : 0.5;

      // If we have both, give 1pt. If one is missing, penalize
      if (!price || !currency) {
        return { points: 0, issue: 'Incomplete price/currency information' };
      }

      // Return the lower score between price and currency quality
      const finalPoints = Math.min(pricePoints, currencyPoints);
      return { points: finalPoints, issue: finalPoints < 1 ? 'Price/currency format could be improved' : null };
    }

    case 'description': {
      const description = product.description as string | undefined;
      if (!description) {
        return { points: 0, issue: 'Missing product description' };
      }

      if (isPlaceholder(description)) {
        return { points: 0.5, issue: 'Description appears to be a placeholder' };
      }

      if (description.length < 50) {
        return { points: 0.5, issue: 'Description is too short (less than 50 characters)' };
      }

      return { points: 1, issue: null };
    }

    case 'image': {
      const image = product.image as string | undefined;
      if (!image) {
        return { points: 0, issue: 'Missing product image' };
      }

      if (isPlaceholder(image)) {
        return { points: 0.5, issue: 'Image URL appears to be a placeholder' };
      }

      if (!isAbsoluteUrl(image)) {
        return { points: 0.5, issue: 'Image URL is relative; absolute URLs are preferred' };
      }

      if (!isHttpsUrl(image)) {
        return { points: 0.5, issue: 'Image URL should use HTTPS' };
      }

      return { points: 1, issue: null };
    }

    case 'availability': {
      const offers = product.offers as Record<string, unknown> | undefined;
      const availability = offers?.availability as string | undefined;

      if (!availability) {
        return { points: 0, issue: 'Missing availability information' };
      }

      const isSchemaOrgUrl = typeof availability === 'string' && availability.startsWith('https://schema.org/');

      if (isSchemaOrgUrl) {
        return { points: 1, issue: null };
      }

      return { points: 0.5, issue: 'Availability should use schema.org URL (e.g., https://schema.org/InStock)' };
    }

    default:
      return { points: 0, issue: `Unknown attribute: ${key}` };
  }
}
