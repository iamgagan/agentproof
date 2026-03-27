// lib/db.ts
// Vercel Postgres wrapper for durable waitlist storage.
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
}
const memStore: Map<string, WaitlistEntry> =
  (globalThis.__agentproof_waitlist_db ??= new Map());

function hasPostgres(): boolean {
  return !!(process.env.POSTGRES_URL);
}

/** Run the CREATE TABLE migration if it doesn't exist. Called lazily on first write. */
let migrated = false;
async function ensureTable(): Promise<void> {
  if (migrated) return;
  if (!hasPostgres()) return;
  const { sql } = await import('@vercel/postgres');
  await sql`
    CREATE TABLE IF NOT EXISTS waitlist (
      id            SERIAL PRIMARY KEY,
      email         TEXT UNIQUE NOT NULL,
      scan_id       TEXT NOT NULL,
      score         INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
      url           TEXT NOT NULL DEFAULT '',
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
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
    const { sql } = await import('@vercel/postgres');
    await sql`
      INSERT INTO waitlist (email, scan_id, score, url, created_at)
      VALUES (${entry.email}, ${entry.scanId}, ${entry.score}, ${entry.url}, ${entry.timestamp})
      ON CONFLICT (email) DO NOTHING
    `;
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
    const { sql } = await import('@vercel/postgres');
    const { rows } = await sql`
      SELECT email, scan_id AS "scanId", score, url, created_at AS "timestamp"
      FROM waitlist
      WHERE email = ${email}
      LIMIT 1
    `;
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
