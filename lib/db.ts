// lib/db.ts
// Postgres wrapper for durable waitlist storage using pg (works with any Postgres provider).
// Falls back to in-memory Map when POSTGRES_URL is not set (local dev).

import logger from './logger';

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
  var __agentproof_pg_pool: import('pg').Pool | undefined;
}
const memStore: Map<string, WaitlistEntry> =
  (globalThis.__agentproof_waitlist_db ??= new Map());

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

/** Run the CREATE TABLE migration if it doesn't exist. Called lazily on first write. */
let migrated = false;
async function ensureTable(): Promise<void> {
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
    )
  `);
  migrated = true;
}

export async function storeWaitlistEntry(entry: WaitlistEntry): Promise<void> {
  if (!hasPostgres()) {
    memStore.set(entry.email, entry);
    logger.info({ email: entry.email, scanId: entry.scanId, score: entry.score }, 'waitlist signup (in-memory)');
    return;
  }

  try {
    await ensureTable();
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
    return memStore.get(email) ?? null;
  }

  try {
    await ensureTable();
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
