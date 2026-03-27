// lib/db.ts
// Postgres wrapper for all persistent storage (scan results + waitlist).
// Falls back to in-memory Maps when POSTGRES_URL is not set (local dev).

import logger from './logger';
import type { ScanResult } from './types';

export interface WaitlistEntry {
  email: string;
  scanId: string;
  score: number;
  url: string;
  timestamp: string;
}

// ── In-memory fallback for local dev ──
declare global {
  // eslint-disable-next-line no-var
  var __agentproof_waitlist_db: Map<string, WaitlistEntry> | undefined;
  // eslint-disable-next-line no-var
  var __agentproof_scan_db: Map<string, ScanResult> | undefined;
  // eslint-disable-next-line no-var
  var __agentproof_url_index: Map<string, string> | undefined;
  // eslint-disable-next-line no-var
  var __agentproof_pg_pool: import('pg').Pool | undefined;
}
const memWaitlist: Map<string, WaitlistEntry> =
  (globalThis.__agentproof_waitlist_db ??= new Map());
const memScans: Map<string, ScanResult> =
  (globalThis.__agentproof_scan_db ??= new Map());
const memUrlIndex: Map<string, string> =
  (globalThis.__agentproof_url_index ??= new Map());

function hasPostgres(): boolean {
  return !!(process.env.POSTGRES_URL);
}

async function getPool(): Promise<import('pg').Pool> {
  if (globalThis.__agentproof_pg_pool) return globalThis.__agentproof_pg_pool;
  const { Pool } = await import('pg');
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false },
    max: 5,
  });
  globalThis.__agentproof_pg_pool = pool;
  return pool;
}

/** Run CREATE TABLE migrations lazily on first access. */
let migrated = false;
async function ensureTables(): Promise<void> {
  if (migrated) return;
  if (!hasPostgres()) return;
  const pool = await getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS waitlist (
      id            SERIAL PRIMARY KEY,
      email         TEXT UNIQUE NOT NULL,
      scan_id       TEXT NOT NULL,
      score         INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
      url           TEXT NOT NULL DEFAULT '',
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS scan_results (
      id              TEXT PRIMARY KEY,
      normalized_url  TEXT NOT NULL,
      data            JSONB NOT NULL,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_scan_results_url ON scan_results (normalized_url);
  `);
  migrated = true;
}

// ═══════════════════════════════════════════════
// Scan Results
// ═══════════════════════════════════════════════

export async function storeScanResult(id: string, result: ScanResult): Promise<void> {
  if (!hasPostgres()) {
    memScans.set(id, result);
    memUrlIndex.set(result.normalizedUrl, id);
    return;
  }
  try {
    await ensureTables();
    const pool = await getPool();
    await pool.query(
      `INSERT INTO scan_results (id, normalized_url, data, created_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`,
      [id, result.normalizedUrl, JSON.stringify(result), result.timestamp]
    );
  } catch (err) {
    logger.error({ err, id }, 'storeScanResult failed');
    throw err;
  }
}

export async function getScanResult(id: string): Promise<ScanResult | null> {
  if (!hasPostgres()) {
    return memScans.get(id) ?? null;
  }
  try {
    await ensureTables();
    const pool = await getPool();
    const { rows } = await pool.query(
      `SELECT data FROM scan_results WHERE id = $1 LIMIT 1`,
      [id]
    );
    if (rows.length === 0) return null;
    return rows[0].data as ScanResult;
  } catch (err) {
    logger.error({ err, id }, 'getScanResult failed');
    return null;
  }
}

export async function getScanResultByUrl(normalizedUrl: string): Promise<ScanResult | null> {
  if (!hasPostgres()) {
    const id = memUrlIndex.get(normalizedUrl);
    if (!id) return null;
    return memScans.get(id) ?? null;
  }
  try {
    await ensureTables();
    const pool = await getPool();
    // Return the most recent scan for this URL within 24h
    const { rows } = await pool.query(
      `SELECT data FROM scan_results
       WHERE normalized_url = $1
         AND created_at > NOW() - INTERVAL '24 hours'
       ORDER BY created_at DESC
       LIMIT 1`,
      [normalizedUrl]
    );
    if (rows.length === 0) return null;
    return rows[0].data as ScanResult;
  } catch (err) {
    logger.error({ err, normalizedUrl }, 'getScanResultByUrl failed');
    return null;
  }
}

// ═══════════════════════════════════════════════
// Waitlist
// ═══════════════════════════════════════════════

export async function storeWaitlistEntry(entry: WaitlistEntry): Promise<void> {
  if (!hasPostgres()) {
    memWaitlist.set(entry.email, entry);
    logger.info({ email: entry.email, scanId: entry.scanId, score: entry.score }, 'waitlist signup (in-memory)');
    return;
  }
  try {
    await ensureTables();
    const pool = await getPool();
    await pool.query(
      `INSERT INTO waitlist (email, scan_id, score, url, created_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO NOTHING`,
      [entry.email, entry.scanId, entry.score, entry.url, entry.timestamp]
    );
    logger.info({ email: entry.email, scanId: entry.scanId, score: entry.score }, 'waitlist signup stored');
  } catch (err) {
    logger.error({ err, email: entry.email }, 'storeWaitlistEntry failed');
    throw err;
  }
}

export async function getWaitlistEntry(email: string): Promise<WaitlistEntry | null> {
  if (!hasPostgres()) {
    return memWaitlist.get(email) ?? null;
  }
  try {
    await ensureTables();
    const pool = await getPool();
    const { rows } = await pool.query(
      `SELECT email, scan_id AS "scanId", score, url, created_at AS "timestamp"
       FROM waitlist
       WHERE email = $1
       LIMIT 1`,
      [email]
    );
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      email: row.email,
      scanId: row.scanId,
      score: row.score,
      url: row.url,
      timestamp: row.timestamp,
    };
  } catch (err) {
    logger.error({ err, email }, 'getWaitlistEntry failed');
    return null;
  }
}
