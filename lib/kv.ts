// lib/kv.ts
// Vercel KV wrapper with in-memory fallback for local development
// when KV_REST_API_URL / KV_REST_API_TOKEN env vars are not set.

import { cache } from 'react';
import type { ScanResult } from './types';

const TTL_SECONDS = 60 * 60 * 24; // 24 hours

// Use globalThis so the Maps survive Next.js module re-evaluation in dev mode.
// In dev, API routes and page routes run in separate module instances —
// a plain `const Map` would be re-created per instance, making stored scans invisible.
declare global {
  // eslint-disable-next-line no-var
  var __agentproof_scanStore: Map<string, { value: ScanResult; expiresAt: number }> | undefined;
  // eslint-disable-next-line no-var
  var __agentproof_urlIndex: Map<string, { scanId: string; expiresAt: number }> | undefined;
  // eslint-disable-next-line no-var
  var __agentproof_waitlist: Map<string, { value: WaitlistEntry; storedAt: number }> | undefined;
}

export interface WaitlistEntry {
  email: string;
  scanId: string;
  score: number;
  url: string;
  timestamp: string;
}

const scanStore: Map<string, { value: ScanResult; expiresAt: number }> =
  (globalThis.__agentproof_scanStore ??= new Map());
const urlIndex: Map<string, { scanId: string; expiresAt: number }> =
  (globalThis.__agentproof_urlIndex ??= new Map());
const waitlistStore: Map<string, { value: WaitlistEntry; storedAt: number }> =
  (globalThis.__agentproof_waitlist ??= new Map());

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
  try {
    const kv = await getKv();
    if (kv) {
      await kv.set(`scan:${id}`, result, { ex: TTL_SECONDS });
    } else {
      scanStore.set(id, {
        value: result,
        expiresAt: Date.now() + TTL_SECONDS * 1000,
      });
    }
  } catch (err) {
    console.error('[kv] storeScanResult failed:', err);
  }
}

export const getScanResult = cache(async (id: string): Promise<ScanResult | null> => {
  try {
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
  } catch (err) {
    console.error('[kv] getScanResult failed:', err);
    return null;
  }
});

export async function storeUrlIndex(normalizedUrl: string, scanId: string): Promise<void> {
  try {
    const kv = await getKv();
    if (kv) {
      await kv.set(`url:${normalizedUrl}`, scanId, { ex: TTL_SECONDS });
    } else {
      urlIndex.set(normalizedUrl, {
        scanId,
        expiresAt: Date.now() + TTL_SECONDS * 1000,
      });
    }
  } catch (err) {
    console.error('[kv] storeUrlIndex failed:', err);
  }
}

export async function getScanResultByUrl(normalizedUrl: string): Promise<ScanResult | null> {
  try {
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
  } catch (err) {
    console.error('[kv] getScanResultByUrl failed:', err);
    return null;
  }
}

export async function storeWaitlistEntry(entry: WaitlistEntry): Promise<void> {
  try {
    const kv = await getKv();
    if (kv) {
      await kv.set(`waitlist:${entry.email}`, entry);
    } else {
      waitlistStore.set(entry.email, {
        value: entry,
        storedAt: Date.now(),
      });
    }
    console.log(`[waitlist] signup: ${entry.email} (scan: ${entry.scanId}, score: ${entry.score})`);
  } catch (err) {
    console.error('[kv] storeWaitlistEntry failed:', err);
  }
}

export async function getWaitlistEntry(email: string): Promise<WaitlistEntry | null> {
  try {
    const kv = await getKv();
    if (kv) {
      return await kv.get<WaitlistEntry>(`waitlist:${email}`);
    }
    const entry = waitlistStore.get(email);
    if (!entry) return null;
    return entry.value;
  } catch (err) {
    console.error('[kv] getWaitlistEntry failed:', err);
    return null;
  }
}
