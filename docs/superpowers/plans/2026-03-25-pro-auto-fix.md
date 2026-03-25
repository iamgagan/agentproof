# Pro — Auto-Fix Generation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** For every failed scan check, generate the exact code snippet the merchant needs to paste into their store to fix it — gated behind Pro (waitlist email).

**Architecture:** Template-based fix generator (no LLM, fast + deterministic). Each issue `id` maps to a fix template function that receives scan context (platform, product data) and returns a copyable code block. Fix panel on results page is gated: shows blurred previews unless user has submitted their email to the waitlist (stored in `localStorage`). Fix API endpoint returns all fixes for a scan ID.

**Tech Stack:** Next.js 15 App Router, TypeScript, Vercel KV (existing), localStorage for Pro gate

**Prerequisites:**
- Plan 1 (MVP Polish) must be complete: `components/WaitlistForm.tsx` must exist with `onSuccess` prop, Vitest + `test:unit` script must be installed, and `tests/unit/` directory must exist.
- Issue IDs in `FIX_TEMPLATES` must match scanner output exactly. Before coding, run a scan and inspect `result.topIssues[*].id` values from the API. IDs follow the pattern `${category}_${title_as_snake_case}` (see `createIssue` in `lib/scanner/scoring.ts`).
- ProGate returns `null` on SSR (no `localStorage` on server), causing a brief layout flash. This is an accepted MVP trade-off.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `lib/scanner/fix-generator.ts` | Create | Maps issue IDs → fix templates with platform-aware code |
| `app/api/fixes/[scanId]/route.ts` | Create | GET: returns generated fixes for a scan |
| `components/FixPanel.tsx` | Create | Shows fix list, gated behind Pro email check |
| `components/ProGate.tsx` | Create | Email wall component: blur + unlock on email submit |
| `app/scan/[id]/page.tsx` | Modify | Add FixPanel below IssueList in left column |
| `tests/unit/fix-generator.test.ts` | Create | Tests fix generation for key issue types |

---

### Task 1: Fix generator — core templates

**Files:**
- Create: `lib/scanner/fix-generator.ts`

- [ ] **Step 1: Write failing tests first**

```typescript
// tests/unit/fix-generator.test.ts
import { describe, it, expect } from 'vitest';
import { generateFix } from '@/lib/scanner/fix-generator';

describe('generateFix', () => {
  it('returns a fix for missing Product schema on Shopify', () => {
    const fix = generateFix('structuredData_no_json_ld_product_schema_found', 'shopify', {});
    expect(fix).not.toBeNull();
    expect(fix!.code).toContain('@type');
    expect(fix!.code).toContain('Product');
    expect(fix!.language).toBe('json');
    expect(fix!.instruction).toContain('theme');
  });

  it('returns a fix for missing price currency', () => {
    const fix = generateFix('productQuality_incomplete_pricing_data_in_structured_schema', 'shopify', {});
    expect(fix).not.toBeNull();
    expect(fix!.code).toContain('priceCurrency');
    expect(fix!.code).toContain('USD');
  });

  it('returns null for unknown issue id', () => {
    expect(generateFix('unknown_issue_id', 'shopify', {})).toBeNull();
  });

  it('adapts robots.txt fix to the detected bot names', () => {
    const fix = generateFix('aiDiscoverability_gptbot_is_blocked_by_robots_txt', 'shopify', {});
    expect(fix).not.toBeNull();
    expect(fix!.code).toContain('GPTBot');
    expect(fix!.language).toBe('text');
  });
});
```

- [ ] **Step 2: Run — expect FAIL (module not found)**

```bash
npm run test:unit tests/unit/fix-generator.test.ts
```
Expected: FAIL — `Cannot find module '@/lib/scanner/fix-generator'`

- [ ] **Step 3: Implement fix-generator.ts**

```typescript
// lib/scanner/fix-generator.ts
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
  // --- Structured Data ---
  structuredData_no_json_ld_product_schema_found: (platform) => ({
    title: 'Add Product JSON-LD Schema',
    instruction: platform === 'shopify'
      ? 'In your Shopify Admin, go to Online Store → Themes → Edit code → Open `sections/product-template.liquid` (or `main-product.liquid`) and paste this inside a `<script>` tag at the bottom of the product section.'
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

  // --- AI Discoverability ---
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

  // --- Product Quality ---
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

  // --- Merchant Signals ---
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
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm run test:unit tests/unit/fix-generator.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add lib/scanner/fix-generator.ts tests/unit/fix-generator.test.ts
git commit -m "feat: template-based auto-fix generator for scan issues"
```

---

### Task 2: Fixes API endpoint

**Files:**
- Create: `app/api/fixes/[scanId]/route.ts`

- [ ] **Step 1: Write the route**

```typescript
// app/api/fixes/[scanId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getScanResult } from '@/lib/kv';
import { generateAllFixes } from '@/lib/scanner/fix-generator';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ scanId: string }> }
) {
  const { scanId } = await params;
  const result = await getScanResult(scanId);
  if (!result) {
    return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
  }

  const allIssues = Object.values(result.categories).flatMap(c => c.issues);
  // Note: we don't have the actual product price in the scan result — pass undefined
  // so fix templates fall back to their placeholder values.
  const ctx = {
    productPrice: undefined,
    currency: 'USD',
    productUrl: result.normalizedUrl,
  };

  const fixes = generateAllFixes(allIssues, result.metadata.platform, ctx);
  return NextResponse.json({ scanId, fixes, platform: result.metadata.platform });
}
```

- [ ] **Step 2: Test with curl**

```bash
# Replace SCAN_ID with a real ID from a previous scan
curl -s http://localhost:3005/api/fixes/SCAN_ID | python3 -m json.tool | head -40
```
Expected: JSON array of fixes with `code`, `instruction`, `language` fields.

- [ ] **Step 3: Commit**

```bash
git add app/api/fixes/[scanId]/route.ts
git commit -m "feat: fixes API endpoint returns generated code fixes per scan"
```

---

### Task 3: ProGate — email unlock wall

**Files:**
- Create: `components/ProGate.tsx`

The Pro gate checks `localStorage` for a stored email (set when user joins waitlist). If email present → show content. If not → show blur overlay with WaitlistForm.

- [ ] **Step 1: Create ProGate component**

```typescript
// components/ProGate.tsx
'use client';
import { useState, useEffect } from 'react';
import WaitlistForm from './WaitlistForm';

const STORAGE_KEY = 'agentproof_pro_email';

interface ProGateProps {
  children: React.ReactNode;
  label?: string;
}

export default function ProGate({ children, label = 'Pro feature' }: ProGateProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setUnlocked(true);
  }, []);

  // Avoid hydration mismatch — render nothing until client mounts
  if (!mounted) return null;

  if (unlocked) return <>{children}</>;

  return (
    <div style={{ position: 'relative' }} data-testid="pro-gate">
      {/* Blurred preview */}
      <div style={{ filter: 'blur(4px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.6 }}>
        {children}
      </div>

      {/* Overlay */}
      <div
        style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '16px',
          backgroundColor: 'rgba(10, 10, 15, 0.85)',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 10px', borderRadius: '100px',
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            fontSize: '12px', fontFamily: 'var(--font-mono)',
            color: '#818CF8',
          }}
        >
          ⬡ {label}
        </div>
        <p style={{ fontFamily: 'var(--font-heading)', fontWeight: '600', fontSize: '16px', color: 'var(--text-primary)', margin: 0 }}>
          Join the waitlist to unlock auto-generated fixes
        </p>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <WaitlistForm onSuccess={(email) => {
            localStorage.setItem(STORAGE_KEY, email);
            setUnlocked(true);
          }} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update WaitlistForm to accept onSuccess callback**

In `components/WaitlistForm.tsx`, add `onSuccess` prop:

```typescript
interface WaitlistFormProps {
  onSuccess?: (email: string) => void;
}

export default function WaitlistForm({ onSuccess }: WaitlistFormProps = {}) {
  // ...
  // In handleSubmit, after setStatus('success'):
  onSuccess?.(email);
  // ...
}
```

- [ ] **Step 3: Commit**

```bash
git add components/ProGate.tsx components/WaitlistForm.tsx
git commit -m "feat: ProGate component — blur+unlock wall for Pro features"
```

---

### Task 4: FixPanel component

**Files:**
- Create: `components/FixPanel.tsx`

- [ ] **Step 1: Create FixPanel**

```typescript
// components/FixPanel.tsx
'use client';
import { useState, useEffect } from 'react';
import type { GeneratedFix } from '@/lib/scanner/fix-generator';

interface FixPanelProps {
  scanId: string;
}

export default function FixPanel({ scanId }: FixPanelProps) {
  const [fixes, setFixes] = useState<GeneratedFix[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/fixes/${scanId}`)
      .then(r => r.json())
      .then(d => { setFixes(d.fixes ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [scanId]);

  function copyCode(fix: GeneratedFix) {
    navigator.clipboard.writeText(fix.code).then(() => {
      setCopiedId(fix.issueId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  if (loading) return (
    <div style={{ padding: '20px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
      Generating fixes...
    </div>
  );

  if (fixes.length === 0) return (
    <div style={{ padding: '20px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontSize: '14px' }}>
      No auto-fixes available for your current issues.
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} data-testid="fix-panel">
      {fixes.map(fix => (
        <div
          key={fix.issueId}
          style={{
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
            <div>
              <p style={{ fontFamily: 'var(--font-heading)', fontWeight: '600', fontSize: '14px', color: 'var(--text-primary)', margin: '0 0 4px' }}>
                {fix.title}
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                {fix.instruction}
              </p>
            </div>
            {fix.docsUrl && (
              <a href={fix.docsUrl} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: '12px', color: 'var(--accent-teal)', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                Docs ↗
              </a>
            )}
          </div>

          {/* Code block */}
          <div style={{ position: 'relative' }}>
            <pre style={{
              margin: 0, padding: '16px', overflowX: 'auto',
              fontFamily: 'var(--font-mono)', fontSize: '12px',
              color: 'var(--text-secondary)', lineHeight: '1.6',
              backgroundColor: 'var(--bg-primary)',
              maxHeight: '200px',
            }}>
              {fix.code}
            </pre>
            <button
              onClick={() => copyCode(fix)}
              style={{
                position: 'absolute', top: '8px', right: '8px',
                padding: '4px 10px',
                backgroundColor: copiedId === fix.issueId ? 'var(--success)' : 'var(--bg-elevated)',
                color: copiedId === fix.issueId ? '#fff' : 'var(--text-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                fontFamily: 'var(--font-mono)', fontSize: '11px',
                cursor: 'pointer',
              }}
              data-testid={`copy-fix-${fix.issueId}`}
            >
              {copiedId === fix.issueId ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Add FixPanel to results page**

In `app/scan/[id]/page.tsx`, after the `<IssueList />` component and before the waitlist CTA, add:

```tsx
{/* Auto-fix panel (Pro) */}
<div>
  <h2 style={{
    fontFamily: 'var(--font-heading)', fontWeight: '700',
    fontSize: '20px', color: 'var(--text-primary)', marginBottom: '16px',
  }}>
    Auto-Generated Fixes
    <span style={{
      marginLeft: '8px', padding: '2px 8px',
      backgroundColor: 'rgba(99, 102, 241, 0.15)',
      border: '1px solid rgba(99, 102, 241, 0.4)',
      borderRadius: '100px', fontSize: '11px',
      fontFamily: 'var(--font-mono)', color: '#818CF8',
    }}>PRO</span>
  </h2>
  <ProGate label="Auto-Fix Generation">
    <FixPanel scanId={result.id} />
  </ProGate>
</div>
```

Add imports:
```tsx
import ProGate from '@/components/ProGate';
import FixPanel from '@/components/FixPanel';
```

- [ ] **Step 3: Test in browser**

- Visit a scan results page
- Auto-Fix section shows blur overlay
- Submit email → unlocks → fix code blocks appear
- Copy button copies code to clipboard

- [ ] **Step 4: Commit**

```bash
git add components/FixPanel.tsx app/scan/[id]/page.tsx
git commit -m "feat: auto-fix panel with Pro gate — copy-paste code fixes per issue"
```

---
