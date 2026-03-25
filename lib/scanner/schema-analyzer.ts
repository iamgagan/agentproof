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

// Valid schema.org availability URLs
const VALID_AVAILABILITY_URLS = [
  'https://schema.org/InStock',
  'https://schema.org/OutOfStock',
  'https://schema.org/PreOrder',
  'https://schema.org/Discontinued',
  'https://schema.org/LimitedAvailability',
  'http://schema.org/InStock',
  'http://schema.org/OutOfStock',
  'http://schema.org/PreOrder',
];

// Generic/placeholder values that indicate poor schema quality
const PLACEHOLDER_PATTERNS = /^(n\/a|none|null|undefined|product|item|title|description|test|sample|example|\s*)$/i;

function getStringValue(val: unknown): string {
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (val && typeof val === 'object' && 'name' in val) return String((val as Record<string, unknown>).name ?? '');
  return '';
}

function getImageUrl(val: unknown): string {
  if (typeof val === 'string') return val;
  if (Array.isArray(val) && val.length > 0) return getImageUrl(val[0]);
  if (val && typeof val === 'object' && 'url' in val) return String((val as Record<string, unknown>).url ?? '');
  return '';
}

/** Returns 0 (missing), 0.5 (present but poor quality), or 1 (good quality) */
function scoreAttrQuality(product: JsonLdData, key: string): { points: number; issue: string | null } {
  switch (key) {
    case 'name': {
      const name = getStringValue(product.name);
      if (!name) return { points: 0, issue: null };
      if (PLACEHOLDER_PATTERNS.test(name) || name.split(' ').length < 2) {
        return { points: 0.5, issue: `Product name "${name}" is too generic or a placeholder. Use a descriptive name with brand + product type.` };
      }
      return { points: 1, issue: null };
    }
    case 'description': {
      const desc = getStringValue(product.description);
      if (!desc) return { points: 0, issue: null };
      if (PLACEHOLDER_PATTERNS.test(desc) || desc.length < 50) {
        return { points: 0.5, issue: `Schema description is only ${desc.length} chars. AI agents need 100+ character schema descriptions to recommend products accurately.` };
      }
      return { points: 1, issue: null };
    }
    case 'image': {
      const imgUrl = getImageUrl(product.image);
      if (!imgUrl) return { points: 0, issue: null };
      const isAbsolute = imgUrl.startsWith('http://') || imgUrl.startsWith('https://');
      const isDataUri = imgUrl.startsWith('data:');
      const isPlaceholder = /placeholder|noimage|default|blank|dummy/i.test(imgUrl);
      if (isDataUri || isPlaceholder) {
        return { points: 0.5, issue: 'Product image in schema appears to be a placeholder or data URI. Use a real hosted product image URL.' };
      }
      if (!isAbsolute) {
        return { points: 0.5, issue: `Product image URL "${imgUrl}" is relative. Schema.org requires absolute URLs for images.` };
      }
      return { points: 1, issue: null };
    }
    case 'offers': {
      const offers = product.offers;
      if (!offers) return { points: 0, issue: null };
      const rawPrice = offers.price ?? offers.lowPrice;
      const price = parseFloat(String(rawPrice));
      const currency = getStringValue(offers.priceCurrency);
      const isValidPrice = !isNaN(price) && price > 0;
      const isValidCurrency = /^[A-Z]{3}$/.test(currency);
      if (!isValidPrice) {
        return { points: 0.5, issue: `Price value "${rawPrice}" is not a valid number. Schema.org requires numeric prices (e.g., 29.99), not formatted strings like "$29.99".` };
      }
      if (!isValidCurrency) {
        return { points: 0.5, issue: `Currency "${currency}" is not a valid ISO 4217 code. Use uppercase 3-letter codes like "USD", "EUR", "GBP".` };
      }
      return { points: 1, issue: null };
    }
    case 'brand': {
      const brand = getStringValue(product.brand);
      if (!brand) return { points: 0, issue: null };
      if (PLACEHOLDER_PATTERNS.test(brand) || brand.length < 2) {
        return { points: 0.5, issue: `Brand value "${brand}" looks like a placeholder. Provide your real brand name.` };
      }
      return { points: 1, issue: null };
    }
    case 'sku': {
      const sku = getStringValue(product.sku ?? product.gtin ?? '');
      if (!sku) return { points: 0, issue: null };
      if (sku === '0' || PLACEHOLDER_PATTERNS.test(sku)) {
        return { points: 0.5, issue: `SKU/GTIN value "${sku}" looks like a placeholder. Use your real product identifier.` };
      }
      return { points: 1, issue: null };
    }
    case 'aggregateRating': {
      const rating = product.aggregateRating;
      if (!rating) return { points: 0, issue: null };
      const ratingValue = parseFloat(String(rating.ratingValue ?? 0));
      const reviewCount = parseInt(String(rating.reviewCount ?? 0));
      if (ratingValue < 1 || ratingValue > 5) {
        return { points: 0.5, issue: `Rating value ${ratingValue} is outside the 1–5 range. Verify your aggregateRating.ratingValue.` };
      }
      if (reviewCount < 1) {
        return { points: 0.5, issue: 'aggregateRating has no reviewCount. AI agents use review counts to establish product credibility.' };
      }
      return { points: 1, issue: null };
    }
    case 'review': {
      const reviews = product.review;
      if (!reviews) return { points: 0, issue: null };
      const count = Array.isArray(reviews) ? reviews.length : 1;
      if (count < 1) return { points: 0.5, issue: 'Review array is empty.' };
      return { points: 1, issue: null };
    }
    case 'url': {
      const url = getStringValue(product.url);
      if (!url) return { points: 0, issue: null };
      const isAbsolute = url.startsWith('http://') || url.startsWith('https://');
      if (!isAbsolute) {
        return { points: 0.5, issue: `Product URL "${url}" is relative. Schema.org requires an absolute URL.` };
      }
      return { points: 1, issue: null };
    }
    case 'availability': {
      const avail = getStringValue(product.offers?.availability ?? '');
      if (!avail) return { points: 0, issue: null };
      const isValidEnum = VALID_AVAILABILITY_URLS.some((v) => avail === v);
      const isPartialMatch = avail.toLowerCase().includes('instock') || avail.toLowerCase().includes('out') || avail.toLowerCase().includes('preorder');
      if (!isValidEnum && isPartialMatch) {
        return { points: 0.5, issue: `Availability value "${avail}" is not a valid schema.org URL. Use "https://schema.org/InStock" (or OutOfStock/PreOrder/etc.).` };
      }
      if (!isValidEnum) {
        return { points: 0.5, issue: `Availability value "${avail}" doesn't match any schema.org enum. Expected: https://schema.org/InStock, OutOfStock, etc.` };
      }
      return { points: 1, issue: null };
    }
    default:
      return { points: 0, issue: null };
  }
}

const ATTR_KEYS = ['name', 'description', 'image', 'offers', 'brand', 'sku', 'aggregateRating', 'review', 'url', 'availability'] as const;

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

  // --- Check 2: Product attribute quality (10 pts) ---
  // Each attribute scores 0 (missing), 0.5 (present but poor quality), or 1 (good quality)
  if (product) {
    let attrScore = 0;
    const missingAttrs: string[] = [];
    const poorQualityIssues: string[] = [];

    const ATTR_LABELS: Record<string, string> = {
      name: 'Product name', description: 'Product description', image: 'Product image',
      offers: 'Price/currency', brand: 'Brand', sku: 'SKU/GTIN',
      aggregateRating: 'Aggregate rating', review: 'Reviews', url: 'Product URL', availability: 'Availability',
    };

    for (const key of ATTR_KEYS) {
      const { points, issue } = scoreAttrQuality(product, key);
      attrScore += points;
      if (points === 0) {
        missingAttrs.push(ATTR_LABELS[key]);
      } else if (points < 1 && issue) {
        poorQualityIssues.push(issue);
      }
    }

    score += attrScore;

    if (missingAttrs.length > 0) {
      const severity = missingAttrs.length > 5 ? 'critical' : missingAttrs.length > 2 ? 'warning' : 'info';
      issues.push(
        createIssue(
          CATEGORY,
          severity,
          `Missing ${missingAttrs.length} product attribute${missingAttrs.length > 1 ? 's' : ''} in schema`,
          `Your Product schema is missing: ${missingAttrs.join(', ')}. AI agents use these to compare products, generate recommendations, and complete purchases.`,
          'Agents comparing your products against competitors with complete data will favor the competitor.',
          `Add the missing fields to your JSON-LD Product markup: ${missingAttrs.join(', ')}.`,
          missingAttrs.length
        )
      );
    }

    if (poorQualityIssues.length > 0) {
      issues.push(
        createIssue(
          CATEGORY,
          'warning',
          `${poorQualityIssues.length} schema field${poorQualityIssues.length > 1 ? 's have' : ' has'} poor data quality`,
          `Your Product schema has fields with invalid or placeholder values:\n• ${poorQualityIssues.join('\n• ')}`,
          'AI agents may misread or ignore schema fields with invalid formats, costing you recommendations even though data is technically present.',
          'Fix the field values listed above to use correct formats: numeric prices, absolute URLs, valid schema.org enums.',
          poorQualityIssues.length * 0.5
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
