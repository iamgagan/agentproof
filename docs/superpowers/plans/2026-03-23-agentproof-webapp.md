# AgentProof Web App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete AgentProof Next.js 15 web app — landing page, scan API, results page, OG image route, and loading animation — on top of the existing scanning engine in `lib/scanner/`.

**Architecture:** Next.js 15 App Router with TypeScript. The scan API route (`POST /api/scan`) calls `runScan()` from `lib/scanner/index.ts`, stores results in Vercel KV (with in-memory fallback for local dev), and returns a `scanId`. The results page (`/scan/[id]`) reads from KV. All UI uses Tailwind CSS v4 (CSS-based config, no tailwind.config.ts).

**Tech Stack:** Next.js 15, React 19, TypeScript 5.7, Tailwind CSS 4, `@tailwindcss/postcss`, `@vercel/kv`, `@vercel/og`, Space Grotesk + DM Sans + JetBrains Mono (Google Fonts via `next/font`), Cheerio (already in scanner).

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `package.json` | Modify | Add `@vercel/kv`; move `@vercel/og` to dependencies |
| `tsconfig.json` | Create | TypeScript config for Next.js 15 App Router |
| `next.config.ts` | Create | Next.js config (30s API timeout, image domains) |
| `postcss.config.mjs` | Create | Tailwind v4 PostCSS plugin |
| `app/globals.css` | Create | `@import "tailwindcss"` + CSS custom properties (color palette) |
| `app/layout.tsx` | Create | Root layout: fonts, metadata, globals |
| `app/page.tsx` | Create | Landing page (hero, stats, categories, how-it-works, CTA) |
| `app/scan/[id]/page.tsx` | Create | Results page: fetches from KV, renders score + categories + issues |
| `app/api/scan/route.ts` | Create | POST: validate URL → runScan → store KV → return scanId |
| `app/api/results/[id]/route.ts` | Create | GET: fetch ScanResult from KV by id |
| `app/api/og/[id]/route.tsx` | Create | Dynamic OG image using `@vercel/og` |
| `lib/kv.ts` | Create | Vercel KV wrapper with in-memory fallback for local dev |
| `lib/utils.ts` | Create | `validateUrl`, `normalizeUrlForCache`, `gradeColor`, `categoryLabel` helpers |
| `components/Header.tsx` | Create | Logo + nav (Server Component) |
| `components/Footer.tsx` | Create | Footer links (Server Component) |
| `components/Scanner.tsx` | Create | URL input form — Client Component, handles submit + redirect |
| `components/ScoreGauge.tsx` | Create | Animated SVG circular gauge with letter grade |
| `components/CategoryCard.tsx` | Create | Expandable category result card |
| `components/IssueList.tsx` | Create | Severity-badged issue list |
| `components/ShareBanner.tsx` | Create | Twitter/LinkedIn share buttons — Client Component |
| `vercel.json` | Create | Set API route `maxDuration: 30` |
| `.env.local` | Create | Template with KV env var names (empty values) |

---

## Task 1: Install dependencies and scaffold config files

**Files:**
- Modify: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `vercel.json`
- Create: `.env.local`

- [ ] **Step 1: Add missing dependencies to package.json**

```json
{
  "name": "agentproof",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "cheerio": "^1.0.0",
    "nanoid": "^5.0.0",
    "@vercel/kv": "^3.0.0",
    "@vercel/og": "^0.6.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.7.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "postcss": "^8.4.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^15.1.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

```bash
cd /Users/gagan/Projects/agentproof
npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Create next.config.ts**

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: '2mb' },
  },
};

export default nextConfig;
```

- [ ] **Step 5: Create postcss.config.mjs**

```javascript
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default config;
```

- [ ] **Step 6: Create vercel.json**

```json
{
  "functions": {
    "app/api/scan/route.ts": {
      "maxDuration": 30
    }
  }
}
```

- [ ] **Step 7: Create .env.local template**

```bash
# Vercel KV — get these from your Vercel project dashboard
KV_REST_API_URL=
KV_REST_API_TOKEN=

# App URL (no trailing slash)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- [ ] **Step 8: Create .gitignore**

```
# dependencies
node_modules/
.pnp
.pnp.js

# next.js
.next/
out/

# production
build/

# env files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
```

- [ ] **Step 9: Initialize git repo and make first commit**

```bash
cd /Users/gagan/Projects/agentproof
git init
git add package.json tsconfig.json next.config.ts postcss.config.mjs vercel.json .gitignore
git commit -m "chore: scaffold Next.js 15 config files"
```

---

## Task 2: Global CSS and design system

**Files:**
- Create: `app/globals.css`

- [ ] **Step 1: Create app/globals.css with Tailwind v4 import and CSS variables**

Tailwind v4 uses `@import "tailwindcss"` — no `@tailwind base/components/utilities` directives.

```css
@import "tailwindcss";

@theme {
  --color-bg-primary: #0A0A0F;
  --color-bg-surface: #12121A;
  --color-bg-elevated: #1A1A2E;
  --color-accent-teal: #00E5CC;
  --color-accent-indigo: #6366F1;
  --color-success: #22C55E;
  --color-warning: #EAB308;
  --color-danger: #EF4444;
  --color-text-primary: #F8FAFC;
  --color-text-secondary: #94A3B8;
  --color-text-muted: #64748B;
  --color-border: #1E293B;
}

:root {
  --bg-primary: #0A0A0F;
  --bg-surface: #12121A;
  --bg-elevated: #1A1A2E;
  --accent-teal: #00E5CC;
  --accent-indigo: #6366F1;
  --success: #22C55E;
  --warning: #EAB308;
  --danger: #EF4444;
  --text-primary: #F8FAFC;
  --text-secondary: #94A3B8;
  --text-muted: #64748B;
  --border: #1E293B;
}

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html, body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  -webkit-font-smoothing: antialiased;
}

/* Score gauge animation */
@keyframes gauge-fill {
  from { stroke-dashoffset: 283; }
  to { stroke-dashoffset: var(--gauge-offset); }
}

.gauge-arc {
  animation: gauge-fill 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

/* Scan progress animation */
@keyframes scan-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.scan-pulse {
  animation: scan-pulse 1.5s ease-in-out infinite;
}

/* Category card glow on hover */
.category-card:hover {
  box-shadow: 0 0 20px rgba(0, 229, 204, 0.08);
  border-color: rgba(0, 229, 204, 0.2);
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
}
```

- [ ] **Step 2: Commit**

```bash
git add app/globals.css
git commit -m "feat: add global CSS with design system variables and animations"
```

---

## Task 3: Root layout with fonts and metadata

**Files:**
- Create: `app/layout.tsx`

- [ ] **Step 1: Create app/layout.tsx**

```typescript
import type { Metadata } from 'next';
import { Space_Grotesk, DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['500', '600', '700'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'AgentProof — AI Agent Readiness Scanner for Ecommerce',
  description:
    'Scan your store and get an Agent Readiness Score. See how AI shopping agents like ChatGPT, Gemini, and Perplexity discover and recommend your products.',
  openGraph: {
    type: 'website',
    siteName: 'AgentProof',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body
        style={{
          fontFamily: 'var(--font-body), system-ui, sans-serif',
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          minHeight: '100vh',
        }}
      >
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/gagan/Projects/agentproof
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: add root layout with Space Grotesk, DM Sans, JetBrains Mono fonts"
```

---

## Task 4: KV storage wrapper and utils

**Files:**
- Create: `lib/kv.ts`
- Create: `lib/utils.ts`

- [ ] **Step 1: Create lib/kv.ts with Vercel KV + in-memory fallback**

Two separate Maps prevent the type confusion of storing strings and objects in the same collection.

```typescript
// lib/kv.ts
// Vercel KV wrapper with in-memory fallback for local development
// when KV_REST_API_URL / KV_REST_API_TOKEN env vars are not set.

import type { ScanResult } from './types';

const TTL_SECONDS = 60 * 60 * 24; // 24 hours

// Separate maps prevent type confusion between scan results and URL→id index
const scanStore = new Map<string, { value: ScanResult; expiresAt: number }>();
const urlIndex  = new Map<string, { scanId: string; expiresAt: number }>();

async function getKv() {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    const { kv } = await import('@vercel/kv');
    return kv;
  }
  return null;
}

function isExpired(expiresAt: number): boolean {
  return Date.now() > expiresAt;
}

export async function storeScanResult(id: string, result: ScanResult): Promise<void> {
  const kv = await getKv();
  if (kv) {
    await kv.set(`scan:${id}`, result, { ex: TTL_SECONDS });
  } else {
    scanStore.set(id, {
      value: result,
      expiresAt: Date.now() + TTL_SECONDS * 1000,
    });
  }
}

export async function getScanResult(id: string): Promise<ScanResult | null> {
  const kv = await getKv();
  if (kv) {
    return await kv.get<ScanResult>(`scan:${id}`);
  }
  const entry = scanStore.get(id);
  if (!entry) return null;
  if (isExpired(entry.expiresAt)) {
    scanStore.delete(id);
    return null;
  }
  return entry.value;
}

export async function storeUrlIndex(normalizedUrl: string, scanId: string): Promise<void> {
  const kv = await getKv();
  if (kv) {
    await kv.set(`url:${normalizedUrl}`, scanId, { ex: TTL_SECONDS });
  } else {
    urlIndex.set(normalizedUrl, {
      scanId,
      expiresAt: Date.now() + TTL_SECONDS * 1000,
    });
  }
}

export async function getScanResultByUrl(normalizedUrl: string): Promise<ScanResult | null> {
  const kv = await getKv();
  if (kv) {
    const id = await kv.get<string>(`url:${normalizedUrl}`);
    if (!id) return null;
    return await kv.get<ScanResult>(`scan:${id}`);
  }
  const entry = urlIndex.get(normalizedUrl);
  if (!entry) return null;
  if (isExpired(entry.expiresAt)) {
    urlIndex.delete(normalizedUrl);
    return null;
  }
  return await getScanResult(entry.scanId);
}
```

- [ ] **Step 2: Create lib/utils.ts**

```typescript
// lib/utils.ts

export function validateUrl(input: string): { valid: boolean; error?: string } {
  const trimmed = input.trim();
  if (!trimmed) return { valid: false, error: 'Please enter a URL' };

  let url = trimmed;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'URL must use http or https' };
    }
    if (!parsed.hostname.includes('.')) {
      return { valid: false, error: 'Please enter a valid domain' };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'Please enter a valid URL' };
  }
}

export function normalizeUrlForCache(input: string): string {
  let url = input.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  const parsed = new URL(url);
  return `${parsed.protocol}//${parsed.hostname.toLowerCase()}${parsed.pathname.replace(/\/+$/, '')}`;
}

export function gradeColor(grade: string): string {
  switch (grade) {
    case 'A': return 'var(--success)';
    case 'B': return '#86EFAC'; // light green
    case 'C': return 'var(--warning)';
    case 'D': return '#FB923C'; // orange
    case 'F': return 'var(--danger)';
    default:  return 'var(--text-muted)';
  }
}

export function scoreColor(score: number): string {
  if (score >= 80) return 'var(--success)';
  if (score >= 40) return 'var(--warning)';
  return 'var(--danger)';
}

export function categoryLabel(key: string): string {
  const labels: Record<string, string> = {
    structuredData:    'Schema & Structured Data',
    productQuality:    'Product Data Quality',
    protocolReadiness: 'Protocol Readiness',
    merchantSignals:   'Merchant Center Signals',
    aiDiscoverability: 'AI Discoverability',
  };
  return labels[key] ?? key;
}

export function categoryIcon(key: string): string {
  const icons: Record<string, string> = {
    structuredData:    '⬡',
    productQuality:    '◈',
    protocolReadiness: '◉',
    merchantSignals:   '◎',
    aiDiscoverability: '◈',
  };
  return icons[key] ?? '○';
}

export function categoryDescription(key: string): string {
  const desc: Record<string, string> = {
    structuredData:    'JSON-LD Product schema, breadcrumbs, ratings markup',
    productQuality:    'Descriptions, images, alt text, specs, FAQs',
    protocolReadiness: 'UCP, ACP, MCP endpoint availability',
    merchantSignals:   'Return policy, shipping info, sitemap, canonical URLs',
    aiDiscoverability: 'robots.txt crawler access, server-side rendering',
  };
  return desc[key] ?? '';
}

export function formatScanTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add lib/kv.ts lib/utils.ts
git commit -m "feat: add KV storage wrapper with memory fallback and utility helpers"
```

---

## Task 5: Scan API routes

**Files:**
- Create: `app/api/scan/route.ts`
- Create: `app/api/results/[id]/route.ts`

- [ ] **Step 1: Create app/api/scan/route.ts**

```typescript
// app/api/scan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { runScan } from '@/lib/scanner/index';
import { storeScanResult, getScanResultByUrl, storeUrlIndex } from '@/lib/kv';
import { validateUrl, normalizeUrlForCache } from '@/lib/utils';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { url } = body;
  if (!url) {
    return NextResponse.json({ error: 'url is required' }, { status: 400 });
  }

  const validation = validateUrl(url);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const normalizedUrl = normalizeUrlForCache(url);

  // Check cache first
  try {
    const cached = await getScanResultByUrl(normalizedUrl);
    if (cached) {
      return NextResponse.json({ scanId: cached.id, cached: true, results: cached });
    }
  } catch {
    // Cache miss is fine — proceed with scan
  }

  // Run the scan
  let result;
  try {
    result = await runScan(url);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Scan failed';
    return NextResponse.json({ error: message }, { status: 422 });
  }

  // Store results
  try {
    await storeScanResult(result.id, result);
    await storeUrlIndex(normalizedUrl, result.id);
  } catch {
    // Storage failure is non-fatal — return results anyway
  }

  return NextResponse.json({ scanId: result.id, cached: false, results: result });
}
```

- [ ] **Step 2: Create app/api/results/[id]/route.ts**

```typescript
// app/api/results/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getScanResult } from '@/lib/kv';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || !id.startsWith('scan_')) {
    return NextResponse.json({ error: 'Invalid scan ID' }, { status: 400 });
  }

  const result = await getScanResult(id);
  if (!result) {
    return NextResponse.json({ error: 'Scan not found or expired' }, { status: 404 });
  }

  return NextResponse.json(result);
}
```

- [ ] **Step 3: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Start dev server and test the scan endpoint manually**

```bash
npm run dev
# In another terminal:
curl -X POST http://localhost:3000/api/scan \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}' | jq '.scanId'
```

Expected: A `scanId` like `scan_abc123def`.

- [ ] **Step 5: Commit**

```bash
git add app/api/scan/route.ts app/api/results/[id]/route.ts
git commit -m "feat: add POST /api/scan and GET /api/results/[id] routes"
```

---

## Task 6: Header and Footer components

**Files:**
- Create: `components/Header.tsx`
- Create: `components/Footer.tsx`

- [ ] **Step 1: Create components/Header.tsx**

```tsx
// components/Header.tsx
export default function Header() {
  return (
    <header
      style={{
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'rgba(10, 10, 15, 0.8)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--accent-teal), var(--accent-indigo))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-mono)',
              fontWeight: '500',
              fontSize: '14px',
              color: '#0A0A0F',
            }}
          >
            AP
          </div>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: '700',
              fontSize: '18px',
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            AgentProof
          </span>
        </a>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <a
            href="#how-it-works"
            style={{
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '14px',
              fontFamily: 'var(--font-body)',
            }}
          >
            How it works
          </a>
          <a
            href="#what-we-check"
            style={{
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '14px',
              fontFamily: 'var(--font-body)',
            }}
          >
            What we check
          </a>
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Create components/Footer.tsx**

```tsx
// components/Footer.tsx
export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border)',
        padding: '48px 24px',
        backgroundColor: 'var(--bg-surface)',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, var(--accent-teal), var(--accent-indigo))',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: '600',
              fontSize: '15px',
              color: 'var(--text-secondary)',
            }}
          >
            AgentProof
          </span>
        </div>

        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '13px',
            fontFamily: 'var(--font-body)',
          }}
        >
          Free • No signup required • Results cached 24h
        </p>

        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '13px',
            fontFamily: 'var(--font-body)',
          }}
        >
          © 2026 AgentProof
        </p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/Header.tsx components/Footer.tsx
git commit -m "feat: add Header and Footer components"
```

---

## Task 7: Scanner Client Component

**Files:**
- Create: `components/Scanner.tsx`

This is the most interactive component — handles user input, API call, loading state, redirect.

- [ ] **Step 1: Create components/Scanner.tsx**

```tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { validateUrl } from '@/lib/utils';

export default function Scanner({ placeholder = 'https://yourstore.com' }: { placeholder?: string }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const [scanStage, setScanStage] = useState('');
  const router = useRouter();

  const stages = [
    'Fetching homepage…',
    'Discovering product pages…',
    'Analyzing structured data…',
    'Checking AI crawler access…',
    'Calculating readiness score…',
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const validation = validateUrl(url);
    if (!validation.valid) {
      setError(validation.error ?? 'Invalid URL');
      return;
    }

    startTransition(async () => {
      // Cycle through stages while scanning
      let stageIndex = 0;
      setScanStage(stages[0]);
      const stageInterval = setInterval(() => {
        stageIndex = (stageIndex + 1) % stages.length;
        setScanStage(stages[stageIndex]);
      }, 2500);

      try {
        const res = await fetch('/api/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });

        clearInterval(stageInterval);

        if (!res.ok) {
          const data = await res.json();
          setError(data.error ?? 'Scan failed. Please try again.');
          setScanStage('');
          return;
        }

        const data = await res.json();
        router.push(`/scan/${data.scanId}`);
      } catch {
        clearInterval(stageInterval);
        setError('Network error. Please check your connection and try again.');
        setScanStage('');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'stretch',
          flexWrap: 'wrap',
        }}
      >
        <input
          type="text"
          value={url}
          onChange={(e) => { setUrl(e.target.value); setError(''); }}
          placeholder={placeholder}
          disabled={isPending}
          style={{
            flex: '1',
            minWidth: '280px',
            padding: '16px 20px',
            borderRadius: '12px',
            border: error ? '1.5px solid var(--danger)' : '1.5px solid var(--border)',
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            fontSize: '15px',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => {
            if (!error) e.target.style.borderColor = 'var(--accent-teal)';
          }}
          onBlur={(e) => {
            if (!error) e.target.style.borderColor = 'var(--border)';
          }}
        />
        <button
          type="submit"
          disabled={isPending || !url.trim()}
          style={{
            padding: '16px 28px',
            borderRadius: '12px',
            border: 'none',
            background: isPending
              ? 'var(--bg-elevated)'
              : 'linear-gradient(135deg, var(--accent-teal), #00B8A3)',
            color: isPending ? 'var(--text-muted)' : '#0A0A0F',
            fontFamily: 'var(--font-heading)',
            fontWeight: '600',
            fontSize: '15px',
            cursor: isPending ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap',
            transition: 'opacity 0.2s',
          }}
        >
          {isPending ? 'Scanning…' : 'Scan My Store →'}
        </button>
      </div>

      {/* Loading animation */}
      {isPending && scanStage && (
        <div
          style={{
            marginTop: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            className="scan-pulse"
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-teal)',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              color: 'var(--accent-teal)',
            }}
          >
            {scanStage}
          </span>
        </div>
      )}

      {/* Progress bar */}
      {isPending && (
        <div
          style={{
            marginTop: '8px',
            height: '2px',
            backgroundColor: 'var(--border)',
            borderRadius: '2px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: '40%',
              background: 'linear-gradient(90deg, var(--accent-teal), var(--accent-indigo))',
              borderRadius: '2px',
              animation: 'scan-progress 2s ease-in-out infinite',
            }}
          />
        </div>
      )}

      {/* Error message */}
      {error && (
        <p
          style={{
            marginTop: '10px',
            fontSize: '13px',
            color: 'var(--danger)',
            fontFamily: 'var(--font-body)',
          }}
        >
          {error}
        </p>
      )}

      <p
        style={{
          marginTop: '12px',
          fontSize: '13px',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-body)',
          textAlign: 'center',
        }}
      >
        Free · No signup · Results in ~15 seconds
      </p>
    </form>
  );
}
```

- [ ] **Step 2: Add scan-progress keyframe to globals.css**

Open `app/globals.css` and append:

```css
@keyframes scan-progress {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(150%); }
  100% { transform: translateX(350%); }
}
```

- [ ] **Step 3: Commit**

```bash
git add components/Scanner.tsx app/globals.css
git commit -m "feat: add Scanner client component with loading animation"
```

---

## Task 8: Landing page

**Files:**
- Create: `app/page.tsx`

- [ ] **Step 1: Create app/page.tsx**

```tsx
// app/page.tsx
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Scanner from '@/components/Scanner';
import { categoryLabel, categoryDescription } from '@/lib/utils';

const CATEGORY_KEYS = [
  'structuredData',
  'productQuality',
  'protocolReadiness',
  'merchantSignals',
  'aiDiscoverability',
] as const;

const CATEGORY_ICONS: Record<string, string> = {
  structuredData:    '{ }',
  productQuality:    '◈',
  protocolReadiness: '⬡',
  merchantSignals:   '◎',
  aiDiscoverability: '◉',
};

const STATS = [
  { value: '4,700%', label: 'YoY increase in AI agent traffic to ecommerce', source: 'Adobe' },
  { value: '87%', label: 'of stores lack basic agent readiness signals', source: 'est.' },
  { value: '$3–5T', label: 'projected agentic commerce market by 2030', source: 'McKinsey' },
];

export default function HomePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      <main style={{ flex: 1 }}>
        {/* ── HERO ── */}
        <section
          style={{
            padding: '100px 24px 80px',
            textAlign: 'center',
            maxWidth: '860px',
            margin: '0 auto',
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '100px',
              border: '1px solid rgba(0, 229, 204, 0.3)',
              backgroundColor: 'rgba(0, 229, 204, 0.05)',
              marginBottom: '32px',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-teal)', display: 'inline-block' }} />
            <span style={{ fontSize: '13px', color: 'var(--accent-teal)', fontFamily: 'var(--font-mono)' }}>
              Free · Agent Readiness Scanner
            </span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: '700',
              fontSize: 'clamp(36px, 6vw, 64px)',
              lineHeight: '1.1',
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              marginBottom: '20px',
            }}
          >
            How do AI shopping agents<br />
            <span style={{ color: 'var(--accent-teal)' }}>see your store?</span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(16px, 2.5vw, 20px)',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-body)',
              lineHeight: '1.6',
              marginBottom: '48px',
              maxWidth: '600px',
              margin: '0 auto 48px',
            }}
          >
            ChatGPT, Gemini, and Copilot are the new storefront.
            Find out if you&apos;re invisible to them.
          </p>

          <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            <Scanner />
          </div>
        </section>

        {/* ── PROBLEM / STATS ── */}
        <section
          style={{
            padding: '80px 24px',
            backgroundColor: 'var(--bg-surface)',
            borderTop: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
            <p
              style={{
                fontSize: '15px',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-body)',
                maxWidth: '640px',
                margin: '0 auto 48px',
                lineHeight: '1.7',
              }}
            >
              Google organic traffic is down 20–50% for ecommerce brands.
              AI agents are replacing search — and most stores are invisible to them.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '24px',
              }}
            >
              {STATS.map((stat) => (
                <div
                  key={stat.value}
                  style={{
                    padding: '32px 24px',
                    backgroundColor: 'var(--bg-elevated)',
                    borderRadius: '16px',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontWeight: '700',
                      fontSize: '42px',
                      color: 'var(--accent-teal)',
                      letterSpacing: '-0.03em',
                      marginBottom: '8px',
                    }}
                  >
                    {stat.value}
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', lineHeight: '1.5' }}>
                    {stat.label}
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '8px' }}>
                    — {stat.source}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHAT WE CHECK ── */}
        <section
          id="what-we-check"
          style={{ padding: '80px 24px', maxWidth: '1100px', margin: '0 auto' }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: '700',
              fontSize: 'clamp(24px, 4vw, 36px)',
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              textAlign: 'center',
              marginBottom: '12px',
            }}
          >
            What we check
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', marginBottom: '48px', fontSize: '15px' }}>
            5 categories · 100 points total
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            {CATEGORY_KEYS.map((key) => (
              <div
                key={key}
                className="category-card"
                style={{
                  padding: '28px 24px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  transition: 'all 0.3s ease',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '22px',
                    color: 'var(--accent-teal)',
                    marginBottom: '12px',
                  }}
                >
                  {CATEGORY_ICONS[key]}
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: '600',
                    fontSize: '16px',
                    color: 'var(--text-primary)',
                    marginBottom: '8px',
                  }}
                >
                  {categoryLabel(key)}
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', lineHeight: '1.6' }}>
                  {categoryDescription(key)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section
          id="how-it-works"
          style={{
            padding: '80px 24px',
            backgroundColor: 'var(--bg-surface)',
            borderTop: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: '700',
                fontSize: 'clamp(24px, 4vw, 36px)',
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
                marginBottom: '48px',
              }}
            >
              How it works
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', textAlign: 'left' }}>
              {[
                { n: '01', title: 'Enter your store URL', desc: 'Paste any ecommerce URL — Shopify, WooCommerce, BigCommerce, Magento, or custom.' },
                { n: '02', title: 'Scanner agents analyze', desc: 'We crawl your homepage and product pages, checking structured data, AI crawler access, protocol support, and more.' },
                { n: '03', title: 'Get your score + fix list', desc: 'Receive a 0-100 Agent Readiness Score with a prioritized list of exactly what to fix and how.' },
              ].map((step) => (
                <div
                  key={step.n}
                  style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13px',
                      color: 'var(--accent-teal)',
                      backgroundColor: 'rgba(0, 229, 204, 0.08)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(0, 229, 204, 0.2)',
                      flexShrink: 0,
                    }}
                  >
                    {step.n}
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: '600', fontSize: '18px', color: 'var(--text-primary)', marginBottom: '6px' }}>
                      {step.title}
                    </h3>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BOTTOM CTA ── */}
        <section style={{ padding: '80px 24px', textAlign: 'center', maxWidth: '640px', margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: '700',
              fontSize: 'clamp(24px, 4vw, 36px)',
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              marginBottom: '12px',
            }}
          >
            Ready to see your score?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', marginBottom: '40px', fontSize: '15px' }}>
            Trusted by merchants on WooCommerce, BigCommerce, Magento, and Shopify.
          </p>
          <Scanner />
        </section>
      </main>

      <Footer />
    </div>
  );
}
```

- [ ] **Step 2: Test landing page renders**

```bash
npm run dev
# Open http://localhost:3000
```

Expected: Dark observatory page with hero, stats, category cards, how-it-works sections.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add landing page with hero, stats, category grid, and CTA sections"
```

---

## Task 9: ScoreGauge component

**Files:**
- Create: `components/ScoreGauge.tsx`

- [ ] **Step 1: Create components/ScoreGauge.tsx**

The gauge uses an SVG circle with `stroke-dasharray` + `stroke-dashoffset` to draw the arc. Circumference of r=45 circle = 2π×45 ≈ 283. We expose `--gauge-offset` as a CSS variable so the CSS animation in `globals.css` can use it.

```tsx
// components/ScoreGauge.tsx
import { gradeColor, scoreColor } from '@/lib/utils';

interface ScoreGaugeProps {
  score: number;        // 0–100
  grade: string;        // A–F
  gradeLabel: string;
  size?: number;        // default 200
}

export default function ScoreGauge({
  score,
  grade,
  gradeLabel,
  size = 200,
}: ScoreGaugeProps) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius; // 282.74
  const offset = circumference - (score / 100) * circumference;
  const color = scoreColor(score);
  const center = size / 2;
  const strokeWidth = 8;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Background track */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth={strokeWidth}
          />
          {/* Score arc */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="gauge-arc"
            style={{ '--gauge-offset': offset } as React.CSSProperties}
          />
        </svg>

        {/* Center content */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: '700',
              fontSize: `${size * 0.22}px`,
              color: color,
              lineHeight: '1',
              letterSpacing: '-0.04em',
            }}
          >
            {score}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: `${size * 0.08}px`,
              color: 'var(--text-muted)',
              marginTop: '4px',
            }}
          >
            / 100
          </span>
        </div>
      </div>

      {/* Grade badge */}
      <div
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: '700',
            fontSize: '48px',
            color: gradeColor(grade),
            lineHeight: '1',
            letterSpacing: '-0.04em',
          }}
        >
          {grade}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--text-muted)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {gradeLabel}
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/ScoreGauge.tsx
git commit -m "feat: add animated SVG ScoreGauge component"
```

---

## Task 10: CategoryCard and IssueList components

**Files:**
- Create: `components/CategoryCard.tsx`
- Create: `components/IssueList.tsx`

- [ ] **Step 1: Create components/CategoryCard.tsx**

```tsx
'use client';

import { useState } from 'react';
import type { CategoryResult } from '@/lib/types';
import { categoryLabel, categoryDescription } from '@/lib/utils';

interface CategoryCardProps {
  categoryKey: string;
  result: CategoryResult;
}

export default function CategoryCard({ categoryKey, result }: CategoryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const percentage = result.percentage;
  const color = percentage >= 80 ? 'var(--success)' : percentage >= 40 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div
      className="category-card"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        overflow: 'hidden',
      }}
    >
      {/* Card header */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          padding: '24px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: '600',
                fontSize: '16px',
                color: 'var(--text-primary)',
                marginBottom: '4px',
              }}
            >
              {categoryLabel(categoryKey)}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
              {categoryDescription(categoryKey)}
            </p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '16px' }}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: '500',
                fontSize: '20px',
                color: color,
              }}
            >
              {result.score}
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/{result.maxScore}</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {percentage}%
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div
          style={{
            height: '4px',
            backgroundColor: 'var(--border)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${percentage}%`,
              backgroundColor: color,
              borderRadius: '4px',
              transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </div>

        {/* Expand toggle */}
        {result.issues.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--accent-teal)', fontFamily: 'var(--font-body)' }}>
              {expanded ? '▲ Hide' : `▼ Show ${result.issues.length} issue${result.issues.length > 1 ? 's' : ''}`}
            </span>
          </div>
        )}
      </button>

      {/* Expanded issues */}
      {expanded && result.issues.length > 0 && (
        <div
          style={{
            borderTop: '1px solid var(--border)',
            padding: '16px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {result.issues.map((issue) => (
            <div
              key={issue.id}
              style={{
                padding: '16px',
                backgroundColor: 'var(--bg-elevated)',
                borderRadius: '10px',
                borderLeft: `3px solid ${issue.severity === 'critical' ? 'var(--danger)' : issue.severity === 'warning' ? 'var(--warning)' : 'var(--text-muted)'}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: issue.severity === 'critical' ? 'rgba(239,68,68,0.15)' : issue.severity === 'warning' ? 'rgba(234,179,8,0.15)' : 'rgba(100,116,139,0.15)',
                    color: issue.severity === 'critical' ? 'var(--danger)' : issue.severity === 'warning' ? 'var(--warning)' : 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  {issue.severity}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: '600',
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                  }}
                >
                  {issue.title}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', lineHeight: '1.6', marginBottom: '8px' }}>
                {issue.description}
              </p>
              <div
                style={{
                  fontSize: '13px',
                  color: 'var(--accent-teal)',
                  fontFamily: 'var(--font-body)',
                  padding: '8px 12px',
                  backgroundColor: 'rgba(0, 229, 204, 0.05)',
                  borderRadius: '6px',
                  border: '1px solid rgba(0, 229, 204, 0.1)',
                }}
              >
                <strong>Fix:</strong> {issue.fix}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create components/IssueList.tsx**

```tsx
// components/IssueList.tsx
import type { Issue } from '@/lib/types';
import { categoryLabel } from '@/lib/utils';

interface IssueListProps {
  issues: Issue[];
}

export default function IssueList({ issues }: IssueListProps) {
  if (issues.length === 0) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: 'var(--success)', fontFamily: 'var(--font-body)' }}>
        ✓ No critical issues found
      </div>
    );
  }

  const severityConfig = {
    critical: { label: 'Critical', color: 'var(--danger)', bg: 'rgba(239,68,68,0.1)' },
    warning:  { label: 'Warning',  color: 'var(--warning)', bg: 'rgba(234,179,8,0.1)' },
    info:     { label: 'Info',     color: 'var(--text-muted)', bg: 'rgba(100,116,139,0.1)' },
  };

  return (
    <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {issues.map((issue, i) => {
        const cfg = severityConfig[issue.severity];
        return (
          <li
            key={issue.id}
            style={{
              display: 'flex',
              gap: '16px',
              padding: '20px',
              backgroundColor: 'var(--bg-elevated)',
              borderRadius: '12px',
              border: '1px solid var(--border)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                color: 'var(--text-muted)',
                paddingTop: '2px',
                flexShrink: 0,
                width: '20px',
              }}
            >
              {i + 1}.
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: cfg.bg,
                    color: cfg.color,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    flexShrink: 0,
                  }}
                >
                  {cfg.label}
                </span>
                <span
                  style={{
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {categoryLabel(issue.category)}
                </span>
                {issue.pointsLost > 0 && (
                  <span style={{ fontSize: '12px', color: 'var(--danger)', fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>
                    −{issue.pointsLost} pts
                  </span>
                )}
              </div>
              <h4
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: '600',
                  fontSize: '15px',
                  color: 'var(--text-primary)',
                  marginBottom: '6px',
                }}
              >
                {issue.title}
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', lineHeight: '1.6', marginBottom: '10px' }}>
                {issue.impact}
              </p>
              <div
                style={{
                  fontSize: '13px',
                  color: 'var(--accent-teal)',
                  fontFamily: 'var(--font-body)',
                  lineHeight: '1.5',
                }}
              >
                → {issue.fix}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/CategoryCard.tsx components/IssueList.tsx
git commit -m "feat: add CategoryCard (expandable) and IssueList components"
```

---

## Task 11: ShareBanner component

**Files:**
- Create: `components/ShareBanner.tsx`

- [ ] **Step 1: Create components/ShareBanner.tsx**

```tsx
'use client';

interface ShareBannerProps {
  score: number;
  grade: string;
  url: string;
  scanId: string;
}

export default function ShareBanner({ score, grade, url, scanId }: ShareBannerProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://agentproof.com';
  const shareUrl = `${appUrl}/scan/${scanId}`;
  const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;

  const tweetText = encodeURIComponent(
    `${domain} scored ${score}/100 (Grade: ${grade}) on AgentProof's AI Agent Readiness scan. How does your store score? 👇\n${shareUrl}`
  );
  const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;

  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

  return (
    <div
      style={{
        padding: '28px',
        background: 'linear-gradient(135deg, rgba(0,229,204,0.08), rgba(99,102,241,0.08))',
        border: '1px solid rgba(0,229,204,0.15)',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div>
        <h3
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: '600',
            fontSize: '16px',
            color: 'var(--text-primary)',
            marginBottom: '4px',
          }}
        >
          Share your Agent Readiness Score
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
          Challenge your competitors to beat your score
        </p>
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            backgroundColor: '#1DA1F2',
            color: '#fff',
            borderRadius: '8px',
            fontFamily: 'var(--font-heading)',
            fontWeight: '600',
            fontSize: '14px',
            textDecoration: 'none',
          }}
        >
          Share on X / Twitter
        </a>
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            backgroundColor: '#0A66C2',
            color: '#fff',
            borderRadius: '8px',
            fontFamily: 'var(--font-heading)',
            fontWeight: '600',
            fontSize: '14px',
            textDecoration: 'none',
          }}
        >
          Share on LinkedIn
        </a>
        <button
          onClick={() => navigator.clipboard.writeText(shareUrl)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            backgroundColor: 'var(--bg-elevated)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            fontFamily: 'var(--font-heading)',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Copy Link
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/ShareBanner.tsx
git commit -m "feat: add ShareBanner with Twitter, LinkedIn, and copy-link buttons"
```

---

## Task 12: Results page

**Files:**
- Create: `app/scan/[id]/page.tsx`

- [ ] **Step 1: Create app/scan/[id]/page.tsx**

```tsx
// app/scan/[id]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScoreGauge from '@/components/ScoreGauge';
import CategoryCard from '@/components/CategoryCard';
import IssueList from '@/components/IssueList';
import ShareBanner from '@/components/ShareBanner';
import { getScanResult } from '@/lib/kv';
import { formatScanTime, gradeColor } from '@/lib/utils';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const result = await getScanResult(id);
  if (!result) return { title: 'Scan not found — AgentProof' };

  const domain = new URL(result.normalizedUrl).hostname;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://agentproof.com';

  return {
    title: `${domain} scored ${result.overallScore}/100 — AgentProof`,
    description: `Agent Readiness Score for ${domain}: ${result.overallScore}/100 (Grade ${result.grade} — ${result.gradeLabel}). See what AI shopping agents can and can't see.`,
    openGraph: {
      images: [`${appUrl}/api/og/${id}`],
    },
    twitter: {
      card: 'summary_large_image',
      images: [`${appUrl}/api/og/${id}`],
    },
  };
}

export default async function ScanResultPage({ params }: Props) {
  const { id } = await params;
  const result = await getScanResult(id);

  if (!result) {
    notFound();
  }

  const domain = new URL(result.normalizedUrl).hostname;
  const categoryEntries = Object.entries(result.categories);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      <main style={{ flex: 1, padding: '48px 24px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        {/* Page header */}
        <div style={{ marginBottom: '48px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Agent Readiness Report
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: '700',
              fontSize: 'clamp(22px, 4vw, 32px)',
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              marginBottom: '8px',
            }}
          >
            {domain}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {result.metadata.platform && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)', backgroundColor: 'var(--bg-elevated)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border)', textTransform: 'capitalize' }}>
                {result.metadata.platform}
              </span>
            )}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
              Scanned in {formatScanTime(result.metadata.totalRequestsTime)}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
              {new Date(result.timestamp).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 300px',
            gap: '32px',
            alignItems: 'start',
          }}
        >
          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Category cards */}
            <section>
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: '600',
                  fontSize: '18px',
                  color: 'var(--text-primary)',
                  marginBottom: '16px',
                }}
              >
                Category Breakdown
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {categoryEntries.map(([key, cat]) => (
                  <CategoryCard key={key} categoryKey={key} result={cat} />
                ))}
              </div>
            </section>

            {/* Top Issues */}
            <section>
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: '600',
                  fontSize: '18px',
                  color: 'var(--text-primary)',
                  marginBottom: '16px',
                }}
              >
                Top Issues to Fix
              </h2>
              <IssueList issues={result.topIssues} />
            </section>

            <ShareBanner
              score={result.overallScore}
              grade={result.grade}
              url={result.url}
              scanId={result.id}
            />

            {/* Errors (if any) */}
            {result.metadata.errors.length > 0 && (
              <div
                style={{
                  padding: '16px',
                  backgroundColor: 'rgba(239,68,68,0.05)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: '10px',
                }}
              >
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>
                  Scan warnings
                </p>
                {result.metadata.errors.map((e, i) => (
                  <p key={i} style={{ fontSize: '13px', color: 'var(--danger)', fontFamily: 'var(--font-body)' }}>
                    • {e}
                  </p>
                ))}
              </div>
            )}

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
                AgentProof Pro will generate the exact code changes to fix every issue. Join the waitlist.
              </p>
              <a
                href="mailto:waitlist@agentproof.com"
                style={{
                  display: 'inline-block',
                  padding: '12px 28px',
                  backgroundColor: 'var(--accent-teal)',
                  color: '#0A0A0F',
                  borderRadius: '10px',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: '600',
                  fontSize: '14px',
                  textDecoration: 'none',
                }}
              >
                Join the Pro waitlist →
              </a>
            </div>
          </div>

          {/* Right sidebar — score */}
          <div
            style={{
              position: 'sticky',
              top: '88px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              alignItems: 'center',
            }}
          >
            <ScoreGauge
              score={result.overallScore}
              grade={result.grade}
              gradeLabel={result.gradeLabel}
              size={220}
            />

            {/* Score summary */}
            <div
              style={{
                width: '100%',
                padding: '20px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
              }}
            >
              {categoryEntries.map(([key, cat]) => (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
                    {key === 'structuredData' ? 'Schema' :
                     key === 'productQuality' ? 'Product Data' :
                     key === 'protocolReadiness' ? 'Protocols' :
                     key === 'merchantSignals' ? 'Merchant' :
                     'Discoverability'}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13px',
                      color: cat.percentage >= 80 ? 'var(--success)' : cat.percentage >= 40 ? 'var(--warning)' : 'var(--danger)',
                    }}
                  >
                    {cat.score}/{cat.maxScore}
                  </span>
                </div>
              ))}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '12px',
                }}
              >
                <span style={{ fontSize: '14px', fontFamily: 'var(--font-heading)', fontWeight: '600', color: 'var(--text-primary)' }}>
                  Total
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: '500',
                    fontSize: '14px',
                    color: gradeColor(result.grade),
                  }}
                >
                  {result.overallScore}/100
                </span>
              </div>
            </div>

            {/* Scan another */}
            <a
              href="/"
              style={{
                width: '100%',
                display: 'block',
                textAlign: 'center',
                padding: '12px',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                textDecoration: 'none',
                backgroundColor: 'var(--bg-surface)',
              }}
            >
              ← Scan another store
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
```

- [ ] **Step 2: Test the results page end-to-end**

```bash
# 1. Start dev server
npm run dev

# 2. Run a scan
SCAN_ID=$(curl -s -X POST http://localhost:3000/api/scan \
  -H "Content-Type: application/json" \
  -d '{"url":"https://demo.myshopify.com"}' | jq -r '.scanId')

echo "Scan ID: $SCAN_ID"

# 3. Open the results page
open "http://localhost:3000/scan/$SCAN_ID"
```

Expected: Results page renders with score gauge, category cards, and issues.

- [ ] **Step 3: Commit**

```bash
git add app/scan/[id]/page.tsx
git commit -m "feat: add results page with ScoreGauge, CategoryCard, IssueList, ShareBanner"
```

---

## Task 13: Dynamic OG image route

**Files:**
- Create: `app/api/og/[id]/route.tsx`

- [ ] **Step 1: Create app/api/og/[id]/route.tsx**

```tsx
// app/api/og/[id]/route.tsx
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getScanResult } from '@/lib/kv';
import { gradeColor } from '@/lib/utils';

// Use nodejs runtime — edge runtime cannot use @vercel/kv's dynamic import
export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await getScanResult(id);

  if (!result) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0A0A0F',
            color: '#94A3B8',
            fontFamily: 'sans-serif',
            fontSize: '24px',
          }}
        >
          Scan not found
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  const domain = new URL(result.normalizedUrl).hostname;
  const gColor = gradeColor(result.grade);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0A0A0F',
          padding: '64px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Background gradient */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(ellipse at top left, rgba(0,229,204,0.08) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(99,102,241,0.08) 0%, transparent 50%)',
          }}
        />

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #00E5CC, #6366F1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0A0A0F',
              fontWeight: '700',
              fontSize: '16px',
            }}
          >
            AP
          </div>
          <span style={{ color: '#94A3B8', fontSize: '18px' }}>AgentProof</span>
        </div>

        {/* Main content */}
        <div style={{ display: 'flex', flex: 1, gap: '64px', alignItems: 'center' }}>
          {/* Left: score */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                fontSize: '120px',
                fontWeight: '700',
                color: gColor,
                lineHeight: '1',
                letterSpacing: '-0.04em',
              }}
            >
              {result.grade}
            </div>
            <div
              style={{
                fontSize: '48px',
                fontWeight: '700',
                color: gColor,
                letterSpacing: '-0.02em',
              }}
            >
              {result.overallScore}<span style={{ fontSize: '28px', color: '#64748B' }}>/100</span>
            </div>
            <div style={{ fontSize: '18px', color: '#94A3B8' }}>{result.gradeLabel}</div>
          </div>

          {/* Right: details */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '20px' }}>
            <div>
              <div style={{ fontSize: '16px', color: '#64748B', marginBottom: '8px' }}>Agent Readiness Score for</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#F8FAFC', letterSpacing: '-0.02em' }}>
                {domain}
              </div>
            </div>

            {/* Category mini-bars */}
            {Object.entries(result.categories).map(([key, cat]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '13px', color: '#64748B', width: '110px', flexShrink: 0 }}>
                  {key === 'structuredData' ? 'Schema' :
                   key === 'productQuality' ? 'Product Data' :
                   key === 'protocolReadiness' ? 'Protocols' :
                   key === 'merchantSignals' ? 'Merchant' :
                   'Discoverability'}
                </div>
                <div style={{ flex: 1, height: '6px', backgroundColor: '#1E293B', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${cat.percentage}%`,
                      backgroundColor: cat.percentage >= 80 ? '#22C55E' : cat.percentage >= 40 ? '#EAB308' : '#EF4444',
                      borderRadius: '3px',
                    }}
                  />
                </div>
                <div style={{ fontSize: '13px', color: '#94A3B8', width: '40px', textAlign: 'right' }}>
                  {cat.score}/{cat.maxScore}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '32px', fontSize: '14px', color: '#64748B' }}>
          agentproof.com · Free AI Agent Readiness Scanner for Ecommerce
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

- [ ] **Step 2: Test OG image**

```bash
# After running a scan, test the OG image endpoint
open "http://localhost:3000/api/og/$SCAN_ID"
```

Expected: A 1200×630 image with grade, score, domain, and category mini-bars.

- [ ] **Step 3: Commit**

```bash
git add app/api/og/[id]/route.tsx
git commit -m "feat: add dynamic OG image route with score, grade, and category bars"
```

---

## Task 14: Build verification and TypeScript check

- [ ] **Step 1: Run TypeScript type check**

```bash
npx tsc --noEmit
```

Expected: Zero errors.

- [ ] **Step 2: Run Next.js build**

```bash
npm run build
```

Expected: Build succeeds. Note any warnings — fix errors, warnings are OK.

- [ ] **Step 3: Fix any build errors**

Common issues:
- Missing `'use client'` directive on components using hooks → add it
- `params` must be `Promise<{...}>` in Next.js 15 → already used in plan
- `@vercel/kv` dynamic import may need adjustment in edge runtime → if so, export `runtime = 'nodejs'` on results routes

- [ ] **Step 4: Run dev server and do a full manual test**

```bash
npm run dev
```

Test flow:
1. Open `http://localhost:3000` — landing page loads
2. Enter a real store URL (e.g., `gymshark.com`) and click Scan
3. Loading animation plays with stage text
4. Results page loads with score gauge, category cards, issues
5. Click a category card to expand issues
6. Click "Share on X" — opens Twitter with pre-filled text
7. Click "Copy Link" — URL copies to clipboard
8. Visit `/api/og/<scanId>` — OG image renders

- [ ] **Step 5: Commit final state**

```bash
git add -A
git commit -m "feat: complete AgentProof MVP — scanner, results, OG image, landing page"
```

---

## Task 15: Deploy to Vercel

- [ ] **Step 1: Push to GitHub**

```bash
gh repo create agentproof --public --source=. --push
```

Or manually:
```bash
git remote add origin git@github.com:<your-username>/agentproof.git
git push -u origin main
```

- [ ] **Step 2: Deploy to Vercel**

```bash
npx vercel --prod
```

Or connect the GitHub repo at `vercel.com/new`.

- [ ] **Step 3: Set environment variables in Vercel dashboard**

Go to Vercel project → Settings → Environment Variables. Add:
- `KV_REST_API_URL` — from Vercel KV storage tab
- `KV_REST_API_TOKEN` — from Vercel KV storage tab
- `NEXT_PUBLIC_APP_URL` — `https://your-domain.vercel.app`

- [ ] **Step 4: Create a Vercel KV store**

Vercel Dashboard → Storage → Create → KV (Redis). Link it to the project.

- [ ] **Step 5: Re-deploy with env vars**

```bash
npx vercel --prod
```

- [ ] **Step 6: Smoke test production**

1. Open production URL
2. Run a scan on a real store
3. Verify results page loads
4. Check OG image at `/api/og/<scanId>`
5. Verify social sharing links work

---

## Notes

- **Tailwind v4 CSS config**: No `tailwind.config.ts` needed. Colors are defined in `@theme {}` in `globals.css`.
- **KV fallback**: Without KV env vars, results live only in memory (lost on server restart). This is fine for local dev.
- **`crawl-policy.ts` TODOs**: The file has placeholder `score += 5` comments. These work for MVP but should be wired up fully post-launch.
- **Responsive layout**: The results page uses a 2-column grid that will stack on mobile. For true mobile support, media queries should be added in a follow-up.
- **Font CSS variables**: Space Grotesk = `var(--font-heading)`, DM Sans = `var(--font-body)`, JetBrains Mono = `var(--font-mono)`.
