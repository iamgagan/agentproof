import type { DetectedPlatform } from '../types';

export interface GeneratedFix {
  issueId: string;
  title: string;
  instruction: string;
  code: string;
  language: 'json' | 'html' | 'text' | 'javascript';
  docsUrl?: string;
}

type FixContext = {
  productName?: string;
  productPrice?: number;
  currency?: string;
  brandName?: string;
  productUrl?: string;
};

type FixFn = (platform: DetectedPlatform | null, ctx: FixContext) => Omit<GeneratedFix, 'issueId'>;

const FIX_TEMPLATES: Record<string, FixFn> = {
  structuredData_no_json_ld_product_schema_found: (platform) => ({
    title: 'Add Product JSON-LD Schema',
    instruction: platform === 'shopify'
      ? 'In your Shopify Admin, go to Online Store → themes → Edit code → Open `sections/product-template.liquid` (or `main-product.liquid`) and paste this inside a `<script>` tag at the bottom of the product theme section.'
      : platform === 'woocommerce'
      ? 'Add this to your child theme\'s `functions.php`, inside a `wp_head` action hook, wrapped in a `<script type="application/ld+json">` tag.'
      : 'Add this inside a `<script type="application/ld+json">` tag in your product page `<head>` section.',
    code: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "{{ product.title }}",
      "description": "{{ product.description | strip_html | truncate: 500 }}",
      "image": "{{ product.featured_image | img_url: '1024x1024' }}",
      "brand": { "@type": "Brand", "name": "{{ shop.name }}" },
      "sku": "{{ product.selected_variant.sku }}",
      "offers": {
        "@type": "Offer",
        "price": "{{ product.selected_variant.price | money_without_currency }}",
        "priceCurrency": "{{ shop.currency }}",
        "availability": "{% if product.available %}https://schema.org/InStock{% else %}https://schema.org/OutOfStock{% endif %}",
        "url": "{{ shop.url }}{{ product.url }}"
      }
    }, null, 2),
    language: 'json',
    docsUrl: 'https://developers.google.com/search/docs/appearance/structured-data/product',
  }),

  structuredData_missing_product_attributes_in_schema: (_platform, ctx) => ({
    title: 'Add Missing Product Attributes to Schema',
    instruction: 'Add these fields to your existing Product JSON-LD `offers` object.',
    code: JSON.stringify({
      "priceCurrency": ctx.currency ?? "USD",
      "availability": "https://schema.org/InStock",
      "url": ctx.productUrl ?? "https://yourstore.com/products/product-handle",
      "brand": { "@type": "Brand", "name": ctx.brandName ?? "Your Brand" }
    }, null, 2),
    language: 'json',
  }),

  structuredData_schema_fields_have_poor_data_quality: () => ({
    title: 'Fix Schema Field Values',
    instruction: 'Ensure your JSON-LD uses these exact formats. Price must be a number (not a string), currency a 3-letter ISO code, and availability a full schema.org URL.',
    code: JSON.stringify({
      "offers": {
        "@type": "Offer",
        "price": 29.99,
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      }
    }, null, 2),
    language: 'json',
    docsUrl: 'https://schema.org/Offer',
  }),

  aiDiscoverability_gptbot_is_blocked_by_robots_txt: () => ({
    title: 'Allow GPTBot in robots.txt',
    instruction: 'Add these lines to your `/robots.txt` file. If you\'re on Shopify, you cannot edit robots.txt directly — use a redirect or contact Shopify support.',
    code: `User-agent: GPTBot\nAllow: /\n\nUser-agent: ChatGPT-User\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n\nUser-agent: Google-Extended\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /`,
    language: 'text',
    docsUrl: 'https://platform.openai.com/docs/gptbot',
  }),

  aiDiscoverability_meta_description_missing_or_too_short: (platform) => ({
    title: 'Add Meta Description',
    instruction: platform === 'shopify'
      ? 'In Shopify Admin, go to your product → scroll to "Search engine listing preview" → add a description of 50-160 characters.'
      : 'Add a `<meta name="description">` tag in your page `<head>`.',
    code: `<meta name="description" content="[Your product name] — [key benefit or attribute]. [Include material, use case, or key differentiator]. Free shipping on orders over $X.">`,
    language: 'html',
  }),

  productQuality_incomplete_pricing_data_in_structured_schema: (_platform, ctx) => ({
    title: 'Add Complete Pricing to Schema',
    instruction: 'Update your Product schema\'s `offers` object to include price, priceCurrency, and availability.',
    code: JSON.stringify({
      "@type": "Offer",
      "price": ctx.productPrice ?? 0,
      "priceCurrency": ctx.currency ?? "USD",
      "availability": "https://schema.org/InStock",
      "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }, null, 2),
    language: 'json',
  }),

  productQuality_schema_price_does_not_match_visible_page_price: () => ({
    title: 'Sync Schema Price with Displayed Price',
    instruction: 'Your JSON-LD price doesn\'t match the price shown on the page. If you\'re using a static JSON-LD block, update it to use a dynamic template variable instead of a hardcoded value.',
    code: `// Shopify Liquid (dynamic — always in sync)\n"price": "{{ product.selected_variant.price | money_without_currency }}"\n\n// Or for WooCommerce PHP:\n"price": <?php echo get_post_meta(get_the_ID(), '_price', true); ?>`,
    language: 'javascript',
  }),

  productQuality_product_variants_only_in_javascript_not_structured_data: () => ({
    title: 'Add Variant Data to Schema',
    instruction: 'Add an `AggregateOffer` or `hasVariant` array to your Product schema so AI agents can see all available options.',
    code: JSON.stringify({
      "@type": "Product",
      "name": "Example Product",
      "offers": {
        "@type": "AggregateOffer",
        "lowPrice": 19.99,
        "highPrice": 49.99,
        "priceCurrency": "USD",
        "offerCount": 3
      }
    }, null, 2),
    language: 'json',
    docsUrl: 'https://schema.org/AggregateOffer',
  }),

  structuredData_no_organization_schema_found: (platform) => ({
    title: 'Add Organization Schema',
    instruction: platform === 'shopify'
      ? 'Add this to your `layout/theme.liquid` inside a `<script type="application/ld+json">` tag in the `<head>` section.'
      : 'Add this inside a `<script type="application/ld+json">` tag in your homepage `<head>` section.',
    code: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Your Brand Name",
      "url": "https://yourstore.com",
      "logo": "https://yourstore.com/logo.png",
      "sameAs": [
        "https://www.instagram.com/yourbrand",
        "https://www.facebook.com/yourbrand"
      ]
    }, null, 2),
    language: 'json',
    docsUrl: 'https://developers.google.com/search/docs/appearance/structured-data/organization',
  }),

  'aiDiscoverability_claudebot_/_anthropic-ai_is_blocked_by_robots_txt': () => ({
    title: 'Allow ClaudeBot in robots.txt',
    instruction: 'Add these lines to your `/robots.txt` to allow Anthropic\'s AI crawler. If on Shopify, you cannot edit robots.txt directly — use a redirect or contact Shopify support.',
    code: `User-agent: ClaudeBot\nAllow: /\n\nUser-agent: anthropic-ai\nAllow: /`,
    language: 'text',
    docsUrl: 'https://www.anthropic.com/research/claude-character',
  }),

  merchantSignals_no_canonical_url_tag_found: (platform) => ({
    title: 'Add Canonical URL Tag',
    instruction: platform === 'shopify'
      ? 'Shopify adds canonical tags automatically on newer themes. If missing, add this to your theme\'s `<head>` in `layout/theme.liquid`.'
      : 'Add this to your product page `<head>` section.',
    code: `<link rel="canonical" href="{{ canonical_url }}" />`,
    language: 'html',
  }),

  merchantSignals_no_sitemap_xml_found: (platform) => ({
    title: 'Create or Fix sitemap.xml',
    instruction: platform === 'shopify'
      ? 'Shopify generates sitemap.xml automatically at yourstore.com/sitemap.xml. If it\'s missing, check that your store is not password-protected.'
      : platform === 'woocommerce'
      ? 'Install the Yoast SEO or Rank Math plugin — both generate sitemaps automatically including product pages.'
      : 'Generate a sitemap.xml with your product page URLs and submit it to Google Search Console.',
    code: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://yourstore.com/products/product-name</loc>\n    <lastmod>2026-03-25</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>`,
    language: 'text',
  }),
};

export function generateFix(
  issueId: string,
  platform: DetectedPlatform | null,
  ctx: FixContext
): GeneratedFix | null {
  const templateFn = FIX_TEMPLATES[issueId];
  if (!templateFn) return null;
  return { issueId, ...templateFn(platform, ctx) };
}

export function generateAllFixes(
  issues: { id: string }[],
  platform: DetectedPlatform | null,
  ctx: FixContext
): GeneratedFix[] {
  return issues.flatMap(issue => {
    const fix = generateFix(issue.id, platform, ctx);
    return fix ? [fix] : [];
  });
}
