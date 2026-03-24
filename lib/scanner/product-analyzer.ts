// lib/scanner/product-analyzer.ts
// Analyzes product data quality for AI agent interpretation (20 pts)

import * as cheerio from 'cheerio';
import type { CategoryResult, JsonLdData } from '../types';
import { createIssue } from './scoring';

const CATEGORY = 'productQuality' as const;

function extractJsonLdProducts(html: string): JsonLdData[] {
  const $ = cheerio.load(html);
  const results: JsonLdData[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const parsed = JSON.parse($(el).html() || '');
      const items = parsed['@graph'] || (Array.isArray(parsed) ? parsed : [parsed]);
      for (const item of items) {
        if (item['@type'] === 'Product') results.push(item);
      }
    } catch { /* skip */ }
  });
  return results;
}

export async function analyzeProductQuality(
  homepageHtml: string,
  productPageHtml: string | null,
  _url: string
): Promise<CategoryResult> {
  let score = 0;
  const issues: CategoryResult['issues'] = [];
  const html = productPageHtml || homepageHtml;
  const $ = cheerio.load(html);

  // Find product data
  const products = extractJsonLdProducts(html);
  const product = products[0] || null;

  // --- Check 1: Description length & richness (5 pts) ---
  const description = product?.description || $('meta[name="description"]').attr('content') || '';
  const descLen = description.length;

  if (descLen >= 500) {
    score += 5;
  } else if (descLen >= 150) {
    score += 4;
    issues.push(
      createIssue(CATEGORY, 'info', 'Product description could be richer',
        `Your product description is ${descLen} characters. AI agents perform best with 500+ character descriptions that include specific attributes, use cases, and comparisons.`,
        'Agents may choose competitors with more detailed, attribute-dense descriptions.',
        'Expand product descriptions to 500+ characters. Include materials, dimensions, use cases, compatibility, and care instructions.',
        1)
    );
  } else if (descLen >= 50) {
    score += 2;
    issues.push(
      createIssue(CATEGORY, 'warning', 'Product description too thin for AI agents',
        `Your product description is only ${descLen} characters. AI shopping agents need dense, attribute-rich descriptions to accurately represent and recommend products.`,
        'Agents will struggle to differentiate your product from competitors or answer shopper questions about it.',
        'Rewrite descriptions to 500+ characters with specific attributes: materials, dimensions, weight, use cases, compatibility, warranty.',
        3)
    );
  } else {
    issues.push(
      createIssue(CATEGORY, 'critical', 'Product description missing or extremely short',
        `${descLen === 0 ? 'No product description found' : `Product description is only ${descLen} characters`}. AI agents cannot recommend products they cannot describe.`,
        'Your products are effectively invisible to AI shopping agents that rely on text to understand what you sell.',
        'Add comprehensive product descriptions (500+ characters) with specific, searchable attributes.',
        5)
    );
  }

  // --- Check 2: Attribute density (5 pts) ---
  const fullText = (description + ' ' + $.text()).toLowerCase();
  const attributeKeywords = ['size', 'color', 'colour', 'material', 'weight', 'dimension',
    'width', 'height', 'length', 'warranty', 'compatible', 'fits', 'suitable for',
    'use case', 'ideal for', 'designed for', 'capacity', 'voltage', 'power'];
  const foundAttrs = attributeKeywords.filter((k) => fullText.includes(k));
  const attrScore = Math.min(5, Math.floor(foundAttrs.length / 2));
  score += attrScore;

  if (attrScore < 4) {
    issues.push(
      createIssue(CATEGORY, attrScore < 2 ? 'warning' : 'info',
        'Low attribute density in product content',
        `Found only ${foundAttrs.length} product attributes in page content. AI agents use attributes like size, material, weight, compatibility, and use-case to make accurate recommendations.`,
        'When a shopper asks an agent "find me a waterproof jacket under $100 in size medium," your product won\'t match if these attributes aren\'t in your data.',
        'Add explicit product attributes: size, color, material, weight, dimensions, compatibility, use cases, care instructions.',
        5 - attrScore)
    );
  }

  // --- Check 3: Image quality signals (3 pts) ---
  const images = $('img[src*="product"], img[src*="item"], .product img, [data-product] img, main img');
  const hasMultipleImages = images.length >= 2;
  const hasAltText = images.toArray().some((img) => $(img).attr('alt')?.length ?? 0 > 5);
  // Check for large images
  const hasLargeImages = images.toArray().some((img) => {
    const width = parseInt($(img).attr('width') || '0');
    return width >= 500;
  });

  if (hasMultipleImages) score += 1;
  if (hasAltText) score += 1;
  if (hasLargeImages) score += 1;

  const imgScore = (hasMultipleImages ? 1 : 0) + (hasAltText ? 1 : 0) + (hasLargeImages ? 1 : 0);
  if (imgScore < 3) {
    issues.push(
      createIssue(CATEGORY, 'info', 'Product image signals could be stronger',
        `Image quality check: Multiple images: ${hasMultipleImages ? '✓' : '✗'}, Alt text: ${hasAltText ? '✓' : '✗'}, High-res: ${hasLargeImages ? '✓' : '✗'}`,
        'AI agents use image metadata and alt text to understand product visuals. Missing alt text means agents can\'t describe your product images.',
        'Ensure all product images have descriptive alt text, provide multiple angles, and use high-resolution images (500px+).',
        3 - imgScore)
    );
  }

  // --- Check 4: Variant handling (3 pts) ---
  const hasVariantsInSchema = product?.hasVariant || product?.offers?.['@type'] === 'AggregateOffer';
  const hasSelectElements = $('select[name*="size"], select[name*="color"], select[name*="variant"], [data-option]').length > 0;

  if (hasVariantsInSchema) {
    score += 3;
  } else if (hasSelectElements) {
    score += 1;
    issues.push(
      createIssue(CATEGORY, 'warning', 'Product variants only in JavaScript, not structured data',
        'Your product page has variant selectors (size, color) in the HTML, but these aren\'t represented in structured data. AI agents read structured data, not interactive dropdowns.',
        'Agents will see your product as a single option instead of showing available sizes/colors, reducing match rate for specific shopper requests.',
        'Add variant data to your JSON-LD using the "hasVariant" property or "AggregateOffer" for price ranges.',
        2)
    );
  } else {
    // Might not have variants — not penalized heavily
    score += 1;
  }

  // --- Check 5: Price clarity (4 pts) ---
  const hasPrice = product?.offers?.price || product?.offers?.lowPrice;
  const hasCurrency = product?.offers?.priceCurrency;
  const hasAvailability = product?.offers?.availability;

  if (hasPrice) score += 2;
  if (hasCurrency) score += 1;
  if (hasAvailability) score += 1;

  const priceScore = (hasPrice ? 2 : 0) + (hasCurrency ? 1 : 0) + (hasAvailability ? 1 : 0);
  if (priceScore < 4) {
    const missing: string[] = [];
    if (!hasPrice) missing.push('price');
    if (!hasCurrency) missing.push('currency');
    if (!hasAvailability) missing.push('availability status');
    issues.push(
      createIssue(CATEGORY, missing.includes('price') ? 'critical' : 'warning',
        'Incomplete pricing data in structured schema',
        `Missing from your Product schema: ${missing.join(', ')}. AI agents need explicit, machine-readable pricing to include your products in comparisons and purchases.`,
        'Agents cannot show your price in shopping comparisons or complete checkout without this data.',
        `Add ${missing.join(', ')} to the "offers" object in your JSON-LD Product markup.`,
        4 - priceScore)
    );
  }

  return {
    score,
    maxScore: 20,
    percentage: Math.round((score / 20) * 100),
    issues,
  };
}
