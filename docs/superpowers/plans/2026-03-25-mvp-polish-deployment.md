# MVP Polish + Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the mailto waitlist stub with real email capture, add unit tests for quality scoring, and deploy to Vercel with all env vars configured.

**Architecture:** Emails stored as a Redis set in Vercel KV (`waitlist:emails`). WaitlistForm is a client component; the capture endpoint is a Next.js API route. Unit tests use Vitest (no browser needed). Vercel deployment uses existing `vercel.json` with env vars set via CLI.

**Tech Stack:** Next.js 15 App Router, TypeScript, Vercel KV (Redis), Vitest, Vercel CLI

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `lib/kv.ts` | Modify | Add `storeWaitlistEmail`, `getWaitlistEmails` |
| `app/api/waitlist/route.ts` | Create | POST: validate + store email in KV |
| `components/WaitlistForm.tsx` | Create | Client email input with submit + success state |
| `app/scan/[id]/page.tsx:162-194` | Modify | Replace mailto `<a>` with `<WaitlistForm />` |
| `tests/unit/scoring.test.ts` | Create | Unit tests for `calculateScore`, `generateGrade`, `rankIssues` |
| `tests/unit/schema-quality.test.ts` | Create | Unit tests for `scoreAttrQuality` (the new quality checks) |
| `tests/unit/product-discovery.test.ts` | Create | Unit test for `&amp;` decode and Liquid template skip |
| `vitest.config.ts` | Create | Vitest config pointing at `tests/unit/` |

---

### Task 1: Add Vitest for unit tests

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (add vitest + script)

- [ ] **Step 1: Install vitest**

```bash
npm install -D vitest @vitejs/plugin-react
```

- [ ] **Step 2: Create vitest config**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
```

- [ ] **Step 3: Add test script to package.json**

Add to `"scripts"`:
```json
"test:unit": "vitest run"
```

- [ ] **Step 4: Run to confirm vitest works (no tests yet)**

```bash
npm run test:unit
```
Expected: `No test files found`

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts package.json package-lock.json
git commit -m "chore: add vitest for unit tests"
```

---

### Task 2: Unit tests for scoring functions

**Files:**
- Create: `tests/unit/scoring.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// tests/unit/scoring.test.ts
import { describe, it, expect } from 'vitest';
import { calculateScore, generateGrade, rankIssues } from '@/lib/scanner/scoring';
import type { CategoryResult, Issue } from '@/lib/types';

const makeCategory = (score: number, maxScore: number): CategoryResult => ({
  score, maxScore, percentage: Math.round((score / maxScore) * 100), issues: [],
});

describe('calculateScore', () => {
  it('sums scores across all categories', () => {
    const cats = {
      structuredData: makeCategory(20, 25),
      productQuality: makeCategory(15, 20),
      protocolReadiness: makeCategory(10, 20),
      merchantSignals: makeCategory(8, 15),
      aiDiscoverability: makeCategory(16, 20),
    };
    expect(calculateScore(cats)).toBe(69);
  });

  it('clamps total score at 100 when sum exceeds 100', () => {
    // calculateScore sums cat.score values then clamps the total.
    // It does NOT clamp individual categories — if you pass score > maxScore that's allowed.
    // Total here = 25+20+20+15+25 = 105, clamped to 100.
    const cats = {
      structuredData: makeCategory(25, 25),
      productQuality: makeCategory(20, 20),
      protocolReadiness: makeCategory(20, 20),
      merchantSignals: makeCategory(15, 15),
      aiDiscoverability: makeCategory(25, 20),
    };
    expect(calculateScore(cats)).toBe(100);
  });

  it('returns 0 for all zero scores', () => {
    const cats = {
      structuredData: makeCategory(0, 25),
      productQuality: makeCategory(0, 20),
      protocolReadiness: makeCategory(0, 20),
      merchantSignals: makeCategory(0, 15),
      aiDiscoverability: makeCategory(0, 20),
    };
    expect(calculateScore(cats)).toBe(0);
  });
});

describe('generateGrade', () => {
  it.each([
    [100, 'A'], [80, 'A'], [79, 'B'], [60, 'B'],
    [59, 'C'], [40, 'C'], [39, 'D'], [20, 'D'],
    [19, 'F'], [0, 'F'],
  ])('score %i → grade %s', (score, expected) => {
    expect(generateGrade(score).grade).toBe(expected);
  });
});

describe('rankIssues', () => {
  it('sorts by pointsLost descending', () => {
    const issues: Issue[] = [
      { id: 'a', category: 'structuredData', severity: 'info', title: 'A', description: '', impact: '', fix: '', pointsLost: 2 },
      { id: 'b', category: 'structuredData', severity: 'critical', title: 'B', description: '', impact: '', fix: '', pointsLost: 8 },
      { id: 'c', category: 'structuredData', severity: 'warning', title: 'C', description: '', impact: '', fix: '', pointsLost: 4 },
    ];
    const ranked = rankIssues(issues);
    expect(ranked.map(i => i.id)).toEqual(['b', 'c', 'a']);
  });

  it('breaks ties by severity', () => {
    const issues: Issue[] = [
      { id: 'warn', category: 'structuredData', severity: 'warning', title: '', description: '', impact: '', fix: '', pointsLost: 4 },
      { id: 'crit', category: 'structuredData', severity: 'critical', title: '', description: '', impact: '', fix: '', pointsLost: 4 },
    ];
    const ranked = rankIssues(issues);
    expect(ranked[0].id).toBe('crit');
  });

  it('does not mutate the input array', () => {
    const issues: Issue[] = [
      { id: 'a', category: 'structuredData', severity: 'info', title: '', description: '', impact: '', fix: '', pointsLost: 1 },
      { id: 'b', category: 'structuredData', severity: 'critical', title: '', description: '', impact: '', fix: '', pointsLost: 8 },
    ];
    const original = [...issues];
    rankIssues(issues);
    expect(issues).toEqual(original);
  });
});
```

- [ ] **Step 2: Run — expect PASS (logic already implemented)**

```bash
npm run test:unit
```
Expected: all 8 tests pass

- [ ] **Step 3: Commit**

```bash
git add tests/unit/scoring.test.ts
git commit -m "test: unit tests for scoring functions"
```

---

### Task 3: Unit tests for schema quality scoring

**Files:**
- Create: `tests/unit/schema-quality.test.ts`

The `scoreAttrQuality` function is not exported yet — export it first.

- [ ] **Step 1: Export `scoreAttrQuality` from schema-analyzer.ts**

In `lib/scanner/schema-analyzer.ts`, change:
```typescript
function scoreAttrQuality(product: JsonLdData, key: string): ...
```
to:
```typescript
export function scoreAttrQuality(product: JsonLdData, key: string): ...
```

- [ ] **Step 2: Write failing tests**

```typescript
// tests/unit/schema-quality.test.ts
import { describe, it, expect } from 'vitest';
import { scoreAttrQuality } from '@/lib/scanner/schema-analyzer';

describe('scoreAttrQuality - price/offers', () => {
  it('gives 1pt for valid numeric price + ISO currency', () => {
    const product = { offers: { price: 29.99, priceCurrency: 'USD', availability: 'https://schema.org/InStock' } };
    expect(scoreAttrQuality(product, 'offers').points).toBe(1);
  });

  it('gives 0.5pt for string price like "$29.99"', () => {
    const product = { offers: { price: '$29.99', priceCurrency: 'USD' } };
    expect(scoreAttrQuality(product, 'offers').points).toBe(0.5);
  });

  it('gives 0.5pt for non-ISO currency', () => {
    const product = { offers: { price: 10, priceCurrency: 'dollars' } };
    expect(scoreAttrQuality(product, 'offers').points).toBe(0.5);
  });

  it('gives 0pt when offers is missing', () => {
    expect(scoreAttrQuality({}, 'offers').points).toBe(0);
  });
});

describe('scoreAttrQuality - description', () => {
  it('gives 1pt for 50+ char description', () => {
    // Threshold in schema-analyzer.ts is desc.length >= 50 (not 100)
    const product = { description: 'A'.repeat(50) };
    expect(scoreAttrQuality(product, 'description').points).toBe(1);
  });

  it('gives 0.5pt for short description', () => {
    const product = { description: 'Short desc' };
    expect(scoreAttrQuality(product, 'description').points).toBe(0.5);
  });

  it('gives 0.5pt for placeholder description', () => {
    const product = { description: 'N/A' };
    expect(scoreAttrQuality(product, 'description').points).toBe(0.5);
  });
});

describe('scoreAttrQuality - image', () => {
  it('gives 1pt for absolute https URL', () => {
    const product = { image: 'https://cdn.store.com/products/img.jpg' };
    expect(scoreAttrQuality(product, 'image').points).toBe(1);
  });

  it('gives 0.5pt for relative URL', () => {
    const product = { image: '/products/img.jpg' };
    expect(scoreAttrQuality(product, 'image').points).toBe(0.5);
  });

  it('gives 0.5pt for placeholder URL', () => {
    const product = { image: 'https://cdn.store.com/placeholder.jpg' };
    expect(scoreAttrQuality(product, 'image').points).toBe(0.5);
  });
});

describe('scoreAttrQuality - availability', () => {
  it('gives 1pt for valid schema.org URL', () => {
    const product = { offers: { availability: 'https://schema.org/InStock' } };
    expect(scoreAttrQuality(product, 'availability').points).toBe(1);
  });

  it('gives 0.5pt for non-schema.org string', () => {
    const product = { offers: { availability: 'InStock' } };
    expect(scoreAttrQuality(product, 'availability').points).toBe(0.5);
  });
});
```

- [ ] **Step 3: Run — expect PASS**

```bash
npm run test:unit
```

- [ ] **Step 4: Commit**

```bash
git add lib/scanner/schema-analyzer.ts tests/unit/schema-quality.test.ts
git commit -m "test: unit tests for schema quality scoring"
```

---

### Task 4: Unit tests for sitemap & product page discovery fixes

**Files:**
- Create: `tests/unit/product-discovery.test.ts`

These test the two bugs fixed: `&amp;` in sitemap URLs and Liquid template placeholders.

The helper functions `findProductPageInHtml` are currently unexported — export them.

- [ ] **Step 1: Export `findProductPageInHtml` from index.ts**

In `lib/scanner/index.ts`, change:
```typescript
function findProductPageInHtml(html: string, baseUrl: string): string | null {
```
to:
```typescript
export function findProductPageInHtml(html: string, baseUrl: string): string | null {
```

- [ ] **Step 2: Write tests**

```typescript
// tests/unit/product-discovery.test.ts
import { describe, it, expect } from 'vitest';
import { findProductPageInHtml } from '@/lib/scanner/index';

const BASE = 'https://www.example.com';

describe('findProductPageInHtml', () => {
  it('finds a real product URL', () => {
    const html = `<a href="/products/red-widget">Red Widget</a>`;
    expect(findProductPageInHtml(html, BASE)).toBe(`${BASE}/products/red-widget`);
  });

  it('skips Liquid template placeholders', () => {
    const html = `<a href="/products/{{ product.handle }}">Item</a>`;
    expect(findProductPageInHtml(html, BASE)).toBeNull();
  });

  it('skips Liquid placeholder and finds the next real URL', () => {
    const html = `
      <a href="/products/{{ product.handle }}">Template</a>
      <a href="/products/real-product-name">Real Product</a>
    `;
    expect(findProductPageInHtml(html, BASE)).toBe(`${BASE}/products/real-product-name`);
  });

  it('returns null when no product URLs found', () => {
    const html = `<a href="/about">About</a><a href="/contact">Contact</a>`;
    expect(findProductPageInHtml(html, BASE)).toBeNull();
  });

  it('resolves relative product URLs against base', () => {
    // Note: regex captures relative paths only (href="/products/...").
    // Absolute hrefs like href="https://..." are not matched by the pattern.
    const html = `<a href="/products/blue-widget">Widget</a>`;
    expect(findProductPageInHtml(html, BASE)).toBe(`${BASE}/products/blue-widget`);
  });
});
```

- [ ] **Step 3: Run — expect PASS**

```bash
npm run test:unit
```
Expected: 5 tests pass

- [ ] **Step 4: Commit**

```bash
git add lib/scanner/index.ts tests/unit/product-discovery.test.ts
git commit -m "test: product page discovery unit tests"
```

---

### Task 5: Waitlist email capture — KV + API

**Files:**
- Modify: `lib/kv.ts`
- Create: `app/api/waitlist/route.ts`

- [ ] **Step 1: Add waitlist functions to lib/kv.ts**

Append to the bottom of `lib/kv.ts`:

```typescript
// --- Waitlist ---

declare global {
  // eslint-disable-next-line no-var
  var __agentproof_waitlist: Set<string> | undefined;
}
const waitlistStore: Set<string> = (globalThis.__agentproof_waitlist ??= new Set());

export async function storeWaitlistEmail(email: string): Promise<void> {
  const kv = await getKv();
  if (kv) {
    await kv.sadd('waitlist:emails', email);
  } else {
    waitlistStore.add(email);
  }
}

export async function isEmailOnWaitlist(email: string): Promise<boolean> {
  const kv = await getKv();
  if (kv) {
    return (await kv.sismember('waitlist:emails', email)) === 1;
  }
  return waitlistStore.has(email);
}

export async function getWaitlistCount(): Promise<number> {
  const kv = await getKv();
  if (kv) {
    return await kv.scard('waitlist:emails');
  }
  return waitlistStore.size;
}
```

- [ ] **Step 2: Create waitlist API route**

```typescript
// app/api/waitlist/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { storeWaitlistEmail, isEmailOnWaitlist } from '@/lib/kv';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }

  const already = await isEmailOnWaitlist(email);
  if (already) {
    return NextResponse.json({ ok: true, alreadyRegistered: true });
  }

  await storeWaitlistEmail(email);
  return NextResponse.json({ ok: true, alreadyRegistered: false });
}
```

- [ ] **Step 3: Verify with curl**

```bash
curl -s -X POST http://localhost:3005/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```
Expected: `{"ok":true,"alreadyRegistered":false}`

```bash
# Second call — should detect duplicate
curl -s -X POST http://localhost:3005/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```
Expected: `{"ok":true,"alreadyRegistered":true}`

- [ ] **Step 4: Commit**

```bash
git add lib/kv.ts app/api/waitlist/route.ts
git commit -m "feat: waitlist email capture API backed by Vercel KV"
```

---

### Task 6: WaitlistForm component

**Files:**
- Create: `components/WaitlistForm.tsx`

- [ ] **Step 1: Create the component**

```typescript
// components/WaitlistForm.tsx
'use client';
import { useState } from 'react';

export default function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'duplicate' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setStatus('error'); return; }
      setStatus(data.alreadyRegistered ? 'duplicate' : 'success');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--accent-teal)', fontFamily: 'var(--font-heading)', fontWeight: '600' }}>
        ✓ You're on the list — we'll notify you when Pro launches.
      </div>
    );
  }

  if (status === 'duplicate') {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', fontSize: '14px' }}>
        You're already on the waitlist. We'll be in touch!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} data-testid="waitlist-form" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        data-testid="waitlist-email-input"
        style={{
          flex: '1 1 220px',
          padding: '12px 16px',
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          outline: 'none',
          minWidth: '0',
        }}
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        data-testid="waitlist-submit-btn"
        style={{
          padding: '12px 24px',
          backgroundColor: 'var(--accent-teal)',
          color: '#0A0A0F',
          border: 'none',
          borderRadius: '10px',
          fontFamily: 'var(--font-heading)',
          fontWeight: '600',
          fontSize: '14px',
          cursor: status === 'loading' ? 'not-allowed' : 'pointer',
          opacity: status === 'loading' ? 0.7 : 1,
          flexShrink: 0,
        }}
      >
        {status === 'loading' ? 'Joining...' : 'Join the Pro waitlist →'}
      </button>
      {status === 'error' && (
        <p style={{ width: '100%', textAlign: 'center', color: 'var(--danger)', fontSize: '13px', fontFamily: 'var(--font-body)' }}>
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}
```

- [ ] **Step 2: Replace mailto in results page**

In `app/scan/[id]/page.tsx`, replace lines 162–194 (the Pro waitlist CTA div) with:

```tsx
{/* Pro waitlist CTA */}
<div
  style={{
    padding: '28px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    textAlign: 'center',
  }}
>
  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: '600', fontSize: '18px', color: 'var(--text-primary)', marginBottom: '8px' }}>
    Want auto-generated fixes?
  </h3>
  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', marginBottom: '20px' }}>
    AgentProof Pro generates the exact code to fix every issue. Join the waitlist.
  </p>
  <WaitlistForm />
</div>
```

And add the import at the top of the file:
```tsx
import WaitlistForm from '@/components/WaitlistForm';
```

- [ ] **Step 3: Verify in browser**

Visit `http://localhost:3005/scan/[any-id]`, submit an email. Should show success message.

- [ ] **Step 4: Commit**

```bash
git add components/WaitlistForm.tsx app/scan/[id]/page.tsx
git commit -m "feat: replace mailto waitlist with real email capture form"
```

---

### Task 7: Deploy to Vercel

- [ ] **Step 1: Install Vercel CLI if not present**

```bash
npx vercel --version || npm i -g vercel
```

- [ ] **Step 2: Link project**

```bash
npx vercel link
```
Follow prompts: select your Vercel account, create new project named `agentproof`.

- [ ] **Step 3: Set environment variables**

```bash
npx vercel env add KV_REST_API_URL production
# paste your Vercel KV URL when prompted

npx vercel env add KV_REST_API_TOKEN production
# paste your Vercel KV token when prompted

npx vercel env add NEXT_PUBLIC_APP_URL production
# enter: https://agentproof.com (or your vercel.app URL initially)
```

Get KV credentials from: Vercel Dashboard → Storage → your KV database → `.env.local` tab.

- [ ] **Step 4: Deploy to preview**

```bash
npx vercel
```
Expected: preview URL like `https://agentproof-xyz.vercel.app`

- [ ] **Step 5: Smoke test the preview**

- Visit the preview URL — homepage loads
- Scan a URL — results appear
- Submit waitlist email — success message shows

- [ ] **Step 6: Promote to production**

```bash
npx vercel --prod
```

- [ ] **Step 7: Commit deployment marker**

```bash
git add vercel.json .vercel/project.json
git commit -m "chore: Vercel deployment configured"
# Do NOT git add .env.local — it contains secrets
```

---
