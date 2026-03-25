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
}

const scanStore: Map<string, { value: ScanResult; expiresAt: number }> =
  (globalThis.__agentproof_scanStore ??= new Map());
const urlIndex: Map<string, { scanId: string; expiresAt: number }> =
  (globalThis.__agentproof_urlIndex ??= new Map());

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

export const getScanResult = cache(async (id: string): Promise<ScanResult | null> => {
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
});

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

// --- Rate limiting ---
// Returns true if the caller is over the limit (should be blocked).
// Uses KV incr + expire when available; always allows in dev (no KV).
export async function getKvRateLimiter(key: string, max: number, windowSeconds: number): Promise<boolean> {
  const kv = await getKv();
  if (!kv) return false; // dev mode — no rate limiting
  const count = await kv.incr(key);
  if (count === 1) {
    // First request in window — set expiry
    await kv.expire(key, windowSeconds);
  }
  return count > max;
}
