# Pro — Monitoring + Competitor Comparison Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let merchants track their score over time (weekly re-scans with email alerts on drops) and compare against a competitor URL side-by-side.

**Architecture:**
- **Monitoring:** Vercel Cron triggers weekly re-scans for all subscribed URLs. Score history stored in Vercel KV as a sorted set per URL. Email alerts sent via Resend (free tier: 3k emails/month). Merchants subscribe by submitting their URL + email on the monitoring page.
- **Comparison:** Two URLs scanned in parallel (`Promise.all`), results returned as a single comparison payload. New `/compare` page with side-by-side category breakdown and delta indicators.

**Tech Stack:** Next.js 15 App Router, TypeScript, Vercel KV, Vercel Cron, Resend (email), existing scanner

**Prerequisites:** Plans 1 and 2 must be complete. Specifically: Vitest + `test:unit` script from Plan 1 must be installed, and `tests/unit/` directory must exist before running unit tests in Task 2.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `lib/resend.ts` | Create | Resend email client + alert template |
| `lib/monitoring.ts` | Create | Subscribe URL, store history, check for score drops |
| `app/api/monitoring/subscribe/route.ts` | Create | POST: save URL+email subscription in KV |
| `app/api/cron/rescan/route.ts` | Create | GET: Vercel Cron — re-scan all subscriptions |
| `app/monitor/page.tsx` | Create | Monitoring sign-up page |
| `vercel.json` | Modify | Add cron configuration |
| `app/api/compare/route.ts` | Create | POST: scan two URLs in parallel, return comparison |
| `components/CompareTable.tsx` | Create | Side-by-side score breakdown with delta badges |
| `app/compare/page.tsx` | Create | Comparison landing page with two URL inputs |
| `tests/unit/monitoring.test.ts` | Create | Unit tests for score-drop detection |

---

### Task 1: Resend email client

**Files:**
- Create: `lib/resend.ts`

- [ ] **Step 1: Install Resend SDK**

```bash
npm install resend
```

- [ ] **Step 2: Add RESEND_API_KEY to env**

```bash
# In .env.local
RESEND_API_KEY=re_your_key_here
# Get free API key at resend.com (3k emails/month free)
```

For Vercel:
```bash
npx vercel env add RESEND_API_KEY production
```

- [ ] **Step 3: Create Resend client**

```typescript
// lib/resend.ts
import { Resend } from 'resend';

// Lazy-initialize so missing env var doesn't break non-email flows
function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY not configured');
  return new Resend(key);
}

export interface ScoreAlertData {
  toEmail: string;
  storeUrl: string;
  previousScore: number;
  currentScore: number;
  grade: string;
  scanId: string;
  topIssues: { title: string; severity: string }[];
}

export async function sendScoreDropAlert(data: ScoreAlertData): Promise<void> {
  const resend = getResend();
  const drop = data.previousScore - data.currentScore;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://agentproof.com';
  const scanUrl = `${appUrl}/scan/${data.scanId}`;

  await resend.emails.send({
    from: 'AgentProof <alerts@agentproof.com>',
    to: data.toEmail,
    subject: `⚠️ Your agent readiness score dropped ${drop} points — ${new URL(data.storeUrl).hostname}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #0A0A0F; font-size: 24px;">Score Alert for ${new URL(data.storeUrl).hostname}</h1>
        <p style="color: #475569;">Your Agent Readiness Score dropped from <strong>${data.previousScore}</strong> to <strong>${data.currentScore}</strong> (Grade: ${data.grade}).</p>
        <p style="color: #475569;">Top issues detected:</p>
        <ul>
          ${data.topIssues.slice(0, 3).map(i => `<li style="color: #475569;"><strong>${i.severity.toUpperCase()}</strong>: ${i.title}</li>`).join('')}
        </ul>
        <a href="${scanUrl}" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #00E5CC; color: #0A0A0F; border-radius: 8px; text-decoration: none; font-weight: 600;">View Full Report →</a>
        <p style="color: #94A3B8; font-size: 12px; margin-top: 24px;">
          You're receiving this because you subscribed to weekly monitoring for ${data.storeUrl}.<br>
          <a href="${appUrl}/monitor/unsubscribe?email=${encodeURIComponent(data.toEmail)}&url=${encodeURIComponent(data.storeUrl)}" style="color: #94A3B8;">Unsubscribe</a>
        </p>
      </div>
    `,
  });
}

export async function sendWelcomeAlert(toEmail: string, storeUrl: string, score: number, grade: string, scanId: string): Promise<void> {
  const resend = getResend();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://agentproof.com';

  await resend.emails.send({
    from: 'AgentProof <alerts@agentproof.com>',
    to: toEmail,
    subject: `✓ Monitoring active — ${new URL(storeUrl).hostname} scores ${score}/100`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #0A0A0F;">Monitoring activated for ${new URL(storeUrl).hostname}</h1>
        <p style="color: #475569;">Current score: <strong>${score}/100</strong> (Grade: ${grade})</p>
        <p style="color: #475569;">We'll email you if your score drops. Weekly summary every Monday.</p>
        <a href="${appUrl}/scan/${scanId}" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #00E5CC; color: #0A0A0F; border-radius: 8px; text-decoration: none; font-weight: 600;">View Your Report →</a>
      </div>
    `,
  });
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/resend.ts package.json package-lock.json
git commit -m "feat: Resend email client for score drop alerts"
```

---

### Task 2: Monitoring data layer

**Files:**
- Create: `lib/monitoring.ts`
- Modify: `lib/kv.ts`

Score history is stored as a Redis sorted set: `history:{normalizedUrl}` where score = timestamp, value = JSON `{ score, grade, scanId, timestamp }`.

Subscriptions stored as a Redis hash: `monitor:sub:{normalizedUrl}` → `{ email, url, createdAt }`.
An index set `monitor:urls` holds all subscribed normalizedUrls for the cron to iterate.

- [ ] **Step 1: Write tests first**

```typescript
// tests/unit/monitoring.test.ts
import { describe, it, expect } from 'vitest';
import { detectScoreDrop } from '@/lib/monitoring';

describe('detectScoreDrop', () => {
  it('returns true when score drops by 5 or more points', () => {
    expect(detectScoreDrop(70, 63)).toBe(true);
    expect(detectScoreDrop(50, 40)).toBe(true);
  });

  it('returns false for small drops under threshold', () => {
    expect(detectScoreDrop(70, 67)).toBe(false);
    expect(detectScoreDrop(70, 70)).toBe(false);
  });

  it('returns false when score improves', () => {
    expect(detectScoreDrop(60, 75)).toBe(false);
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npm run test:unit tests/unit/monitoring.test.ts
```

- [ ] **Step 3: Create monitoring.ts**

```typescript
// lib/monitoring.ts
import type { ScanResult } from './types';

export const SCORE_DROP_THRESHOLD = 5;

export function detectScoreDrop(previousScore: number, currentScore: number): boolean {
  return previousScore - currentScore >= SCORE_DROP_THRESHOLD;
}

export interface ScoreHistoryEntry {
  score: number;
  grade: string;
  scanId: string;
  timestamp: string;
}

export interface MonitorSubscription {
  email: string;
  url: string;
  normalizedUrl: string;
  createdAt: string;
}
```

- [ ] **Step 4: Add KV functions for monitoring**

Append to `lib/kv.ts`:

```typescript
// --- Monitoring ---

export async function addScoreHistory(normalizedUrl: string, entry: import('./monitoring').ScoreHistoryEntry): Promise<void> {
  const kv = await getKv();
  const key = `history:${normalizedUrl}`;
  const score = new Date(entry.timestamp).getTime(); // use timestamp as sort score
  if (kv) {
    await kv.zadd(key, { score, member: JSON.stringify(entry) });
    // Keep only last 52 entries (1 year of weekly scans)
    await kv.zremrangebyrank(key, 0, -53);
  }
}

export async function getScoreHistory(normalizedUrl: string): Promise<import('./monitoring').ScoreHistoryEntry[]> {
  const kv = await getKv();
  if (!kv) return [];
  const key = `history:${normalizedUrl}`;  // fix: declare key before use
  const raw = await kv.zrange(key, 0, -1) as string[];
  return raw.map(r => JSON.parse(r));
}

export async function saveMonitorSubscription(sub: import('./monitoring').MonitorSubscription): Promise<void> {
  const kv = await getKv();
  if (kv) {
    await kv.hset(`monitor:sub:${sub.normalizedUrl}`, sub);
    await kv.sadd('monitor:urls', sub.normalizedUrl);
  }
}

export async function getMonitorSubscription(normalizedUrl: string): Promise<import('./monitoring').MonitorSubscription | null> {
  const kv = await getKv();
  if (!kv) return null;
  return await kv.hgetall(`monitor:sub:${normalizedUrl}`) as import('./monitoring').MonitorSubscription | null;
}

export async function getAllMonitoredUrls(): Promise<string[]> {
  const kv = await getKv();
  if (!kv) return [];
  return await kv.smembers('monitor:urls');
}
```

- [ ] **Step 5: Run tests — expect PASS**

```bash
npm run test:unit tests/unit/monitoring.test.ts
```

- [ ] **Step 6: Commit**

```bash
git add lib/monitoring.ts lib/kv.ts tests/unit/monitoring.test.ts
git commit -m "feat: monitoring data layer — score history + subscriptions in KV"
```

---

### Task 3: Monitoring subscribe API + page

**Files:**
- Create: `app/api/monitoring/subscribe/route.ts`
- Create: `app/monitor/page.tsx`

- [ ] **Step 1: Create subscribe endpoint**

```typescript
// app/api/monitoring/subscribe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateUrl, normalizeUrlForCache } from '@/lib/utils';
import { saveMonitorSubscription, getMonitorSubscription, storeScanResult, storeUrlIndex, addScoreHistory } from '@/lib/kv';
import { runScan } from '@/lib/scanner/index';
import { sendWelcomeAlert } from '@/lib/resend';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const { url, email } = await req.json().catch(() => ({}));

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }
  const validation = validateUrl(url);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const normalizedUrl = normalizeUrlForCache(url);

  // Check if already subscribed
  const existing = await getMonitorSubscription(normalizedUrl);
  if (existing) {
    return NextResponse.json({ ok: true, alreadySubscribed: true, message: 'Already monitoring this URL.' });
  }

  // Run initial scan
  const result = await runScan(url);
  await storeScanResult(result.id, result);
  await storeUrlIndex(normalizedUrl, result.id);
  await addScoreHistory(normalizedUrl, {
    score: result.overallScore,
    grade: result.grade,
    scanId: result.id,
    timestamp: result.timestamp,
  });

  await saveMonitorSubscription({ email, url, normalizedUrl, createdAt: new Date().toISOString() });

  // Send welcome email (best-effort)
  try {
    await sendWelcomeAlert(email, url, result.overallScore, result.grade, result.id);
  } catch { /* don't fail if email fails */ }

  return NextResponse.json({ ok: true, scanId: result.id, score: result.overallScore, grade: result.grade });
}
```

- [ ] **Step 2: Create monitoring sign-up page**

```tsx
// app/monitor/page.tsx
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MonitorForm from '@/components/MonitorForm';

export const metadata = { title: 'Monitor Your Score — AgentProof' };

export default function MonitorPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main style={{ flex: 1, padding: '80px 24px', maxWidth: '640px', margin: '0 auto', width: '100%' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: '700', fontSize: 'clamp(28px, 5vw, 48px)', color: 'var(--text-primary)', marginBottom: '16px', letterSpacing: '-0.02em' }}>
          Monitor your<br /><span style={{ color: 'var(--accent-teal)' }}>Agent Readiness Score</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', fontSize: '16px', marginBottom: '48px', lineHeight: '1.6' }}>
          Get an email alert whenever your score drops — theme updates, app changes, and plugin conflicts can silently break your structured data.
        </p>
        <MonitorForm />
      </main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 3: Create MonitorForm component**

```typescript
// components/MonitorForm.tsx
'use client';
import { useState } from 'react';

export default function MonitorForm() {
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<{ score: number; grade: string; scanId: string } | null>(null);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setError('');
    try {
      const res = await fetch('/api/monitoring/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed'); setStatus('error'); return; }
      setResult({ score: data.score, grade: data.grade, scanId: data.scanId });
      setStatus('success');
    } catch {
      setError('Something went wrong. Please try again.');
      setStatus('error');
    }
  }

  if (status === 'success' && result) {
    return (
      <div style={{ padding: '32px', backgroundColor: 'var(--bg-surface)', border: '1px solid rgba(0, 229, 204, 0.2)', borderRadius: '16px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '48px', color: 'var(--accent-teal)', margin: '0 0 8px' }}>{result.score}</p>
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: 'var(--text-primary)', marginBottom: '16px' }}>Grade {result.grade} — Monitoring active</p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>Check your email for your welcome report. We'll alert you if your score drops.</p>
        <a href={`/scan/${result.scanId}`} style={{ color: 'var(--accent-teal)', fontFamily: 'var(--font-heading)', fontWeight: '600' }}>View full report →</a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://yourstore.com" required
        style={{ padding: '14px 16px', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: '15px', outline: 'none' }} />
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required
        style={{ padding: '14px 16px', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: '15px', outline: 'none' }} />
      <button type="submit" disabled={status === 'loading'}
        style={{ padding: '14px', backgroundColor: 'var(--accent-teal)', color: '#0A0A0F', border: 'none', borderRadius: '10px', fontFamily: 'var(--font-heading)', fontWeight: '600', fontSize: '15px', cursor: 'pointer' }}>
        {status === 'loading' ? 'Setting up monitoring...' : 'Start monitoring — free →'}
      </button>
      {error && <p style={{ color: 'var(--danger)', fontSize: '13px', fontFamily: 'var(--font-body)', textAlign: 'center' }}>{error}</p>}
    </form>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add app/api/monitoring/subscribe/route.ts app/monitor/page.tsx components/MonitorForm.tsx
git commit -m "feat: monitoring subscribe page and API — email alerts for score drops"
```

---

### Task 4: Vercel Cron re-scan job

**Files:**
- Create: `app/api/cron/rescan/route.ts`
- Modify: `vercel.json`

- [ ] **Step 1: Create cron route**

```typescript
// app/api/cron/rescan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAllMonitoredUrls, getMonitorSubscription, getScanResultByUrl, addScoreHistory, storeScanResult, storeUrlIndex } from '@/lib/kv';
import { runScan } from '@/lib/scanner/index';
import { detectScoreDrop } from '@/lib/monitoring';
import { sendScoreDropAlert } from '@/lib/resend';
import { normalizeUrlForCache } from '@/lib/utils';

// Vercel Cron protection — only callable by Vercel's cron system
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const urls = await getAllMonitoredUrls();
  const results = await Promise.allSettled(urls.map(async (normalizedUrl) => {
    const sub = await getMonitorSubscription(normalizedUrl);
    if (!sub) return;

    const previous = await getScanResultByUrl(normalizedUrl);
    const previousScore = previous?.overallScore ?? null;

    const fresh = await runScan(sub.url);
    await storeScanResult(fresh.id, fresh);
    await storeUrlIndex(normalizedUrl, fresh.id);
    await addScoreHistory(normalizedUrl, {
      score: fresh.overallScore,
      grade: fresh.grade,
      scanId: fresh.id,
      timestamp: fresh.timestamp,
    });

    if (previousScore !== null && detectScoreDrop(previousScore, fresh.overallScore)) {
      await sendScoreDropAlert({
        toEmail: sub.email,
        storeUrl: sub.url,
        previousScore,
        currentScore: fresh.overallScore,
        grade: fresh.grade,
        scanId: fresh.id,
        topIssues: fresh.topIssues.slice(0, 3),
      });
    }
  }));

  const succeeded = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  return NextResponse.json({ processed: urls.length, succeeded, failed });
}
```

- [ ] **Step 2: Add CRON_SECRET to env**

```bash
# Generate a random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy the output

# Add to .env.local
echo "CRON_SECRET=your_generated_secret" >> .env.local

# Add to Vercel
npx vercel env add CRON_SECRET production
```

- [ ] **Step 3: Update vercel.json to add cron**

```json
{
  "functions": {
    "app/api/scan/route.ts": { "maxDuration": 30 },
    "app/api/monitoring/subscribe/route.ts": { "maxDuration": 30 },
    "app/api/compare/route.ts": { "maxDuration": 60 },
    "app/api/cron/rescan/route.ts": { "maxDuration": 300 }
  },
  "crons": [
    {
      "path": "/api/cron/rescan",
      "schedule": "0 9 * * 1"
    }
  ]
}
```

`0 9 * * 1` = 9am UTC every Monday.

- [ ] **Step 4: Commit**

```bash
git add app/api/cron/rescan/route.ts vercel.json .env.local
git commit -m "feat: weekly re-scan cron job with score drop email alerts"
```

---

### Task 5: Competitor comparison

**Files:**
- Create: `app/api/compare/route.ts`
- Create: `components/CompareTable.tsx`
- Create: `app/compare/page.tsx`

- [ ] **Step 1: Create compare API**

```typescript
// app/api/compare/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { runScan } from '@/lib/scanner/index';
import { validateUrl } from '@/lib/utils';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const { urlA, urlB } = await req.json().catch(() => ({}));

  const vA = validateUrl(urlA);
  const vB = validateUrl(urlB);

  if (!vA.valid) return NextResponse.json({ error: `URL A: ${vA.error}` }, { status: 400 });
  if (!vB.valid) return NextResponse.json({ error: `URL B: ${vB.error}` }, { status: 400 });
  if (urlA === urlB) return NextResponse.json({ error: 'URLs must be different' }, { status: 400 });

  const [resultA, resultB] = await Promise.all([runScan(urlA), runScan(urlB)]);

  return NextResponse.json({
    a: {
      url: urlA, score: resultA.overallScore, grade: resultA.grade,
      categories: resultA.categories, platform: resultA.metadata.platform,
      scanId: resultA.id,
    },
    b: {
      url: urlB, score: resultB.overallScore, grade: resultB.grade,
      categories: resultB.categories, platform: resultB.metadata.platform,
      scanId: resultB.id,
    },
  });
}
```

- [ ] **Step 2: Create CompareTable component**

```typescript
// components/CompareTable.tsx
'use client';

const CATEGORY_LABELS: Record<string, string> = {
  structuredData: 'Schema & Structured Data',
  productQuality: 'Product Data Quality',
  protocolReadiness: 'Protocol Readiness',
  merchantSignals: 'Merchant Signals',
  aiDiscoverability: 'AI Discoverability',
};

interface CompareResult {
  url: string;
  score: number;
  grade: string;
  categories: Record<string, { score: number; maxScore: number; percentage: number }>;
  platform: string | null;
  scanId: string;
}

interface CompareTableProps {
  a: CompareResult;
  b: CompareResult;
}

function Delta({ a, b }: { a: number; b: number }) {
  const diff = a - b;
  if (diff === 0) return <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span>;
  return (
    <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: diff > 0 ? 'var(--success)' : 'var(--danger)' }}>
      {diff > 0 ? `+${diff}` : diff}
    </span>
  );
}

export default function CompareTable({ a, b }: CompareTableProps) {
  const hostname = (url: string) => { try { return new URL(url).hostname; } catch { return url; } };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-muted)', fontSize: '13px', borderBottom: '1px solid var(--border)' }}>Category</th>
            <th style={{ textAlign: 'center', padding: '12px 16px', color: 'var(--accent-teal)', fontSize: '13px', borderBottom: '1px solid var(--border)' }}>{hostname(a.url)}</th>
            <th style={{ textAlign: 'center', padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px', borderBottom: '1px solid var(--border)' }}>{hostname(b.url)}</th>
            <th style={{ textAlign: 'center', padding: '12px 16px', color: 'var(--text-muted)', fontSize: '12px', borderBottom: '1px solid var(--border)' }}>Delta</th>
          </tr>
        </thead>
        <tbody>
          {/* Overall row */}
          <tr style={{ backgroundColor: 'var(--bg-elevated)' }}>
            <td style={{ padding: '16px', fontWeight: '700', color: 'var(--text-primary)', fontSize: '15px' }}>Overall Score</td>
            <td style={{ padding: '16px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: '700', fontSize: '20px', color: 'var(--accent-teal)' }}>{a.score}<span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/100</span></td>
            <td style={{ padding: '16px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: '700', fontSize: '20px', color: 'var(--text-secondary)' }}>{b.score}<span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/100</span></td>
            <td style={{ padding: '16px', textAlign: 'center' }}><Delta a={a.score} b={b.score} /></td>
          </tr>
          {/* Category rows */}
          {Object.keys(CATEGORY_LABELS).map((key) => {
            const catA = a.categories[key];
            const catB = b.categories[key];
            if (!catA || !catB) return null;
            return (
              <tr key={key} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '14px' }}>{CATEGORY_LABELS[key]}</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '14px', color: catA.percentage >= 60 ? 'var(--success)' : catA.percentage >= 30 ? 'var(--warning)' : 'var(--danger)' }}>{catA.score}/{catA.maxScore}</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '14px', color: catB.percentage >= 60 ? 'var(--success)' : catB.percentage >= 30 ? 'var(--warning)' : 'var(--danger)' }}>{catB.score}/{catB.maxScore}</td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}><Delta a={catA.score} b={catB.score} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Links to full reports */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <a href={`/scan/${a.scanId}`} style={{ color: 'var(--accent-teal)', fontFamily: 'var(--font-body)', fontSize: '14px' }}>
          Full report: {hostname(a.url)} →
        </a>
        <a href={`/scan/${b.scanId}`} style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', fontSize: '14px' }}>
          Full report: {hostname(b.url)} →
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create compare page**

```tsx
// app/compare/page.tsx
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CompareForm from '@/components/CompareForm';

export const metadata = { title: 'Compare Stores — AgentProof' };

export default function ComparePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main style={{ flex: 1, padding: '80px 24px', maxWidth: '860px', margin: '0 auto', width: '100%' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: '700', fontSize: 'clamp(28px, 5vw, 48px)', color: 'var(--text-primary)', marginBottom: '16px', letterSpacing: '-0.02em', textAlign: 'center' }}>
          Compare Agent Readiness<br /><span style={{ color: 'var(--accent-teal)' }}>side by side</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', fontSize: '16px', marginBottom: '48px', textAlign: 'center', lineHeight: '1.6' }}>
          See exactly how you stack up against a competitor — category by category.
        </p>
        <CompareForm />
      </main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 4: Create CompareForm client component**

```typescript
// components/CompareForm.tsx
'use client';
import { useState } from 'react';
import CompareTable from './CompareTable';

export default function CompareForm() {
  const [urlA, setUrlA] = useState('');
  const [urlB, setUrlB] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setError('');
    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urlA, urlB }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed'); setStatus('error'); return; }
      setResult(data);
      setStatus('done');
    } catch {
      setError('Something went wrong. Please try again.');
      setStatus('error');
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <input type="url" value={urlA} onChange={e => setUrlA(e.target.value)} placeholder="Your store URL" required
            style={{ padding: '14px 16px', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--accent-teal)', borderRadius: '10px', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: '14px', outline: 'none' }} />
          <input type="url" value={urlB} onChange={e => setUrlB(e.target.value)} placeholder="Competitor URL" required
            style={{ padding: '14px 16px', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: '14px', outline: 'none' }} />
        </div>
        <button type="submit" disabled={status === 'loading'}
          style={{ padding: '14px', backgroundColor: 'var(--accent-teal)', color: '#0A0A0F', border: 'none', borderRadius: '10px', fontFamily: 'var(--font-heading)', fontWeight: '600', fontSize: '15px', cursor: 'pointer' }}>
          {status === 'loading' ? 'Scanning both stores...' : 'Compare →'}
        </button>
        {error && <p style={{ color: 'var(--danger)', fontSize: '13px', textAlign: 'center' }}>{error}</p>}
      </form>

      {status === 'done' && result && (
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
          <CompareTable a={result.a} b={result.b} />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Add Compare + Monitor links to Header**

In `components/Header.tsx`, add nav links:
```tsx
<a href="/compare" style={{ color: 'var(--text-secondary)', fontSize: '14px', fontFamily: 'var(--font-body)', textDecoration: 'none' }}>Compare</a>
<a href="/monitor" style={{ color: 'var(--text-secondary)', fontSize: '14px', fontFamily: 'var(--font-body)', textDecoration: 'none' }}>Monitor</a>
```

- [ ] **Step 6: Test compare flow**

```bash
curl -s -X POST http://localhost:3005/api/compare \
  -H "Content-Type: application/json" \
  -d '{"urlA":"https://apricotyarn.com","urlB":"https://thespicehut.com"}' | python3 -m json.tool | grep '"score"'
```
Expected: two different scores.

- [ ] **Step 7: Commit**

```bash
git add app/api/compare/route.ts components/CompareTable.tsx components/CompareForm.tsx app/compare/page.tsx components/Header.tsx
git commit -m "feat: competitor comparison — side-by-side score breakdown"
```

---

### Task 6: Deploy everything

- [ ] **Step 1: Run all unit tests**

```bash
npm run test:unit
```
Expected: all passing

- [ ] **Step 2: Build check**

```bash
npm run build
```
Expected: clean build, no type errors

- [ ] **Step 3: Set all new env vars on Vercel**

```bash
npx vercel env add RESEND_API_KEY production
npx vercel env add CRON_SECRET production
```

- [ ] **Step 4: Deploy to production**

```bash
npx vercel --prod
```

- [ ] **Step 5: Verify cron is registered**

In Vercel Dashboard → your project → Settings → Crons — confirm the Monday 9am job appears.

- [ ] **Step 6: Smoke test Pro features**

- Visit `/compare` — scan two stores, see CompareTable
- Visit `/monitor` — subscribe with an email, check KV for stored subscription
- Visit a scan result — check Pro gate blurs fixes, submit email → fixes unlock
- Manually trigger cron: `curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://agentproof.com/api/cron/rescan`

- [ ] **Step 7: Final commit**

```bash
git add .
git commit -m "feat: full Pro tier — monitoring, alerts, competitor comparison deployed"
```

---
