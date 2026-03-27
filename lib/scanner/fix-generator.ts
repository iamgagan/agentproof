// lib/scanner/fix-generator.ts
// Generates copy-paste code fixes for each failing scan check.

import type { ScanResult, FixSuggestion, DetectedPlatform } from '../types';

function platformInstructions(platform: DetectedPlatform | null, generic: string): string {
  switch (platform) {
    case 'shopify':
      return `Shopify: Go to Online Store > Themes > Edit Code > theme.liquid. Paste before </head>. ${generic}`;
    case 'woocommerce':
      return `WooCommerce: Add to your theme's functions.php or use a plugin like "Insert Headers and Footers". ${generic}`;
    case 'bigcommerce':
      return `BigCommerce: Go to Storefront > Script Manager > Create a Script (placement: Head). ${generic}`;
    default:
      return generic;
  }
}

export function generateFixes(result: ScanResult): FixSuggestion[] {
  const fixes: FixSuggestion[] = [];
  const platform = result.metadata.platform;
  let domain = 'yourstore.com';
  try { domain = new URL(result.normalizedUrl).hostname; } catch { /* */ }

  for (const issue of result.topIssues) {
    const id = issue.id.toLowerCase();

    // JSON-LD Product schema
    if (id.includes('no_json_ld_product')) {
      fixes.push({
        issueId: issue.id,
        category: issue.category,
        title: 'Add JSON-LD Product Schema',
        severity: issue.severity,
        language: 'html',
        codeSnippet: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Your Product Name",
  "description": "Detailed product description with materials, size, and use-case.",
  "image": ["https://${domain}/images/product-1.jpg"],
  "brand": {
    "@type": "Brand",
    "name": "Your Brand"
  },
  "sku": "SKU-12345",
  "offers": {
    "@type": "Offer",
    "url": "https://${domain}/products/your-product",
    "priceCurrency": "USD",
    "price": "49.99",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "Your Brand"
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "reviewCount": "127"
  }
}
</script>`,
        instructions: platformInstructions(platform, 'Add this to every product page, replacing placeholder values with dynamic product data.'),
        platform: platform ?? undefined,
      });
    }

    // Missing product attributes
    if (id.includes('missing') && id.includes('product_attribute')) {
      fixes.push({
        issueId: issue.id,
        category: issue.category,
        title: 'Complete Product Schema Attributes',
        severity: issue.severity,
        language: 'json',
        codeSnippet: `{
  "brand": { "@type": "Brand", "name": "Your Brand" },
  "sku": "SKU-12345",
  "gtin": "0123456789012",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "reviewCount": "127"
  },
  "review": [{
    "@type": "Review",
    "author": { "@type": "Person", "name": "Customer Name" },
    "reviewRating": { "@type": "Rating", "ratingValue": "5" },
    "reviewBody": "Great product!"
  }]
}`,
        instructions: 'Add these missing attributes to your existing Product JSON-LD markup.',
        platform: platform ?? undefined,
      });
    }

    // Organization schema
    if (id.includes('organization')) {
      fixes.push({
        issueId: issue.id,
        category: issue.category,
        title: 'Add Organization Schema',
        severity: issue.severity,
        language: 'html',
        codeSnippet: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "${domain}",
  "url": "https://${domain}",
  "logo": "https://${domain}/logo.png",
  "sameAs": [
    "https://twitter.com/yourbrand",
    "https://facebook.com/yourbrand",
    "https://instagram.com/yourbrand"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "support@${domain}",
    "contactType": "customer service"
  }
}
</script>`,
        instructions: platformInstructions(platform, 'Add this to your homepage <head> section.'),
        platform: platform ?? undefined,
      });
    }

    // BreadcrumbList
    if (id.includes('breadcrumb')) {
      fixes.push({
        issueId: issue.id,
        category: issue.category,
        title: 'Add BreadcrumbList Schema',
        severity: issue.severity,
        language: 'html',
        codeSnippet: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://${domain}/" },
    { "@type": "ListItem", "position": 2, "name": "Category", "item": "https://${domain}/collections/category" },
    { "@type": "ListItem", "position": 3, "name": "Product Name", "item": "https://${domain}/products/product-name" }
  ]
}
</script>`,
        instructions: platformInstructions(platform, 'Add to product and category pages. Update paths dynamically.'),
        platform: platform ?? undefined,
      });
    }

    // Robots.txt
    if (id.includes('gptbot') || id.includes('claudebot') || id.includes('perplexity') || id.includes('crawler') || id.includes('robot')) {
      fixes.push({
        issueId: issue.id,
        category: issue.category,
        title: 'Allow AI Crawlers in robots.txt',
        severity: issue.severity,
        language: 'text',
        codeSnippet: `# AI Shopping Agent Access — Generated by AgentProof
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Amazonbot
Allow: /

Sitemap: https://${domain}/sitemap.xml`,
        instructions: platform === 'shopify'
          ? 'Shopify: Go to Online Store > Themes > Edit Code > robots.txt.liquid. Add these rules.'
          : 'Add or update your robots.txt file in the site root directory.',
        platform: platform ?? undefined,
      });
    }

    // Meta description
    if (id.includes('meta_description')) {
      fixes.push({
        issueId: issue.id,
        category: issue.category,
        title: 'Add Meta Description',
        severity: issue.severity,
        language: 'html',
        codeSnippet: `<meta name="description" content="Shop ${domain} for premium products. Free shipping on orders over $50. Satisfaction guaranteed with easy returns.">`,
        instructions: platformInstructions(platform, 'Add to the <head> section of every page. Make it unique per page with product-specific details.'),
        platform: platform ?? undefined,
      });
    }

    // FAQ schema
    if (id.includes('faq')) {
      fixes.push({
        issueId: issue.id,
        category: issue.category,
        title: 'Add FAQPage Schema',
        severity: issue.severity,
        language: 'html',
        codeSnippet: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is your return policy?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We offer 30-day hassle-free returns on all items."
      }
    },
    {
      "@type": "Question",
      "name": "Do you offer free shipping?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, free shipping on orders over $50 within the US."
      }
    },
    {
      "@type": "Question",
      "name": "What materials are your products made from?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We use premium, sustainably-sourced materials. Check individual product pages for specifics."
      }
    }
  ]
}
</script>`,
        instructions: platformInstructions(platform, 'Add to product pages. Customize Q&As for each product.'),
        platform: platform ?? undefined,
      });
    }

    // Return policy
    if (id.includes('return')) {
      fixes.push({
        issueId: issue.id,
        category: issue.category,
        title: 'Add ReturnPolicy Schema',
        severity: issue.severity,
        language: 'html',
        codeSnippet: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "MerchantReturnPolicy",
  "applicableCountry": "US",
  "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
  "merchantReturnDays": 30,
  "returnMethod": "https://schema.org/ReturnByMail",
  "returnFees": "https://schema.org/FreeReturn"
}
</script>`,
        instructions: platformInstructions(platform, 'Add to your product pages or site-wide. Update the return window and policy to match yours.'),
        platform: platform ?? undefined,
      });
    }

    // Shipping info
    if (id.includes('shipping')) {
      fixes.push({
        issueId: issue.id,
        category: issue.category,
        title: 'Add Shipping Details Schema',
        severity: issue.severity,
        language: 'html',
        codeSnippet: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "OfferShippingDetails",
  "shippingRate": {
    "@type": "MonetaryAmount",
    "value": "0",
    "currency": "USD"
  },
  "shippingDestination": {
    "@type": "DefinedRegion",
    "addressCountry": "US"
  },
  "deliveryTime": {
    "@type": "ShippingDeliveryTime",
    "handlingTime": { "@type": "QuantitativeValue", "minValue": 0, "maxValue": 1, "unitCode": "DAY" },
    "transitTime": { "@type": "QuantitativeValue", "minValue": 3, "maxValue": 7, "unitCode": "DAY" }
  }
}
</script>`,
        instructions: platformInstructions(platform, 'Add to product pages. Reference this from your Offer schema using "shippingDetails".'),
        platform: platform ?? undefined,
      });
    }

    // Canonical URL
    if (id.includes('canonical')) {
      fixes.push({
        issueId: issue.id,
        category: issue.category,
        title: 'Add Canonical URL',
        severity: issue.severity,
        language: 'html',
        codeSnippet: `<link rel="canonical" href="https://${domain}/products/your-product-slug">`,
        instructions: platformInstructions(platform, 'Add to the <head> of every page. The href should be the preferred URL for that page.'),
        platform: platform ?? undefined,
      });
    }
  }

  // Also generate fixes from category issues not in topIssues
  const allIssueIds = new Set(fixes.map((f) => f.issueId));
  for (const cat of Object.values(result.categories)) {
    for (const issue of cat.issues) {
      if (allIssueIds.has(issue.id)) continue;
      if (issue.id.includes('no_json_ld_product') || issue.id.includes('organization') || issue.id.includes('breadcrumb')) {
        // Already handled above from topIssues — skip duplicates
      }
    }
  }

  return fixes;
}
