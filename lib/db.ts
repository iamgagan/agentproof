// lib/db.ts
// Postgres wrapper for all persistent storage (scan results + waitlist).
// Falls back to in-memory Maps when POSTGRES_URL is not set (local dev).

import logger from './logger';
import type { ScanResult, AgentVisit, AgentVisitStats, BenchmarkEntry, BenchmarkStats } from './types';

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
  // eslint-disable-next-line no-var
  var __agentproof_agent_visits: AgentVisit[] | undefined;
  // eslint-disable-next-line no-var
  var __agentproof_benchmarks: BenchmarkEntry[] | undefined;
}
const memWaitlist: Map<string, WaitlistEntry> =
  (globalThis.__agentproof_waitlist_db ??= new Map());
const memScans: Map<string, ScanResult> =
  (globalThis.__agentproof_scan_db ??= new Map());
const memUrlIndex: Map<string, string> =
  (globalThis.__agentproof_url_index ??= new Map());
const memAgentVisits: AgentVisit[] =
  (globalThis.__agentproof_agent_visits ??= []);
const memBenchmarks: BenchmarkEntry[] =
  (globalThis.__agentproof_benchmarks ??= []);

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

    CREATE TABLE IF NOT EXISTS agent_visits (
      id          SERIAL PRIMARY KEY,
      site_id     TEXT NOT NULL,
      page_url    TEXT NOT NULL,
      user_agent  TEXT NOT NULL,
      agent_type  TEXT NOT NULL,
      referrer    TEXT,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_agent_visits_site ON agent_visits (site_id, created_at);

    CREATE TABLE IF NOT EXISTS benchmarks (
      id                      SERIAL PRIMARY KEY,
      normalized_url          TEXT NOT NULL,
      domain                  TEXT NOT NULL,
      platform                TEXT,
      category                TEXT,
      overall_score           INTEGER NOT NULL,
      structured_data_score   INTEGER NOT NULL,
      product_quality_score   INTEGER NOT NULL,
      protocol_score          INTEGER NOT NULL,
      merchant_score          INTEGER NOT NULL,
      discoverability_score   INTEGER NOT NULL,
      scan_id                 TEXT NOT NULL,
      scanned_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_benchmarks_platform ON benchmarks (platform);
    CREATE INDEX IF NOT EXISTS idx_benchmarks_category ON benchmarks (category);
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

// ═══════════════════════════════════════════════
// Agent Visits (Pixel Tracking)
// ═══════════════════════════════════════════════

export async function storeAgentVisit(visit: AgentVisit): Promise<void> {
  if (!hasPostgres()) {
    memAgentVisits.push(visit);
    return;
  }
  try {
    await ensureTables();
    const pool = await getPool();
    await pool.query(
      `INSERT INTO agent_visits (site_id, page_url, user_agent, agent_type, referrer, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [visit.siteId, visit.pageUrl, visit.userAgent, visit.agentType, visit.referrer, visit.timestamp]
    );
  } catch (err) {
    logger.error({ err, siteId: visit.siteId }, 'storeAgentVisit failed');
  }
}

export async function getAgentVisitStats(siteId: string): Promise<AgentVisitStats> {
  const empty: AgentVisitStats = {
    totalVisits: 0,
    uniqueAgents: [],
    visitsByAgent: {},
    visitsByDay: [],
    topPages: [],
  };

  if (!hasPostgres()) {
    const visits = memAgentVisits.filter((v) => v.siteId === siteId);
    return {
      totalVisits: visits.length,
      uniqueAgents: [...new Set(visits.map((v) => v.agentType))],
      visitsByAgent: visits.reduce<Record<string, number>>((acc, v) => {
        acc[v.agentType] = (acc[v.agentType] || 0) + 1;
        return acc;
      }, {}),
      visitsByDay: [],
      topPages: [],
    };
  }

  try {
    await ensureTables();
    const pool = await getPool();
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [totalRes, agentRes, dailyRes, pagesRes] = await Promise.all([
      pool.query(`SELECT COUNT(*) AS total FROM agent_visits WHERE site_id = $1 AND created_at > $2`, [siteId, since]),
      pool.query(`SELECT agent_type, COUNT(*) AS count FROM agent_visits WHERE site_id = $1 AND created_at > $2 GROUP BY agent_type ORDER BY count DESC`, [siteId, since]),
      pool.query(`SELECT DATE(created_at) AS date, COUNT(*) AS count FROM agent_visits WHERE site_id = $1 AND created_at > $2 GROUP BY DATE(created_at) ORDER BY date`, [siteId, since]),
      pool.query(`SELECT page_url, COUNT(*) AS count FROM agent_visits WHERE site_id = $1 AND created_at > $2 GROUP BY page_url ORDER BY count DESC LIMIT 10`, [siteId, since]),
    ]);

    const visitsByAgent: Record<string, number> = {};
    for (const row of agentRes.rows) {
      visitsByAgent[row.agent_type] = parseInt(row.count);
    }

    return {
      totalVisits: parseInt(totalRes.rows[0]?.total ?? '0'),
      uniqueAgents: agentRes.rows.map((r: { agent_type: string }) => r.agent_type),
      visitsByAgent,
      visitsByDay: dailyRes.rows.map((r: { date: string; count: string }) => ({ date: r.date, count: parseInt(r.count) })),
      topPages: pagesRes.rows.map((r: { page_url: string; count: string }) => ({ url: r.page_url, count: parseInt(r.count) })),
    };
  } catch (err) {
    logger.error({ err, siteId }, 'getAgentVisitStats failed');
    return empty;
  }
}

// ═══════════════════════════════════════════════
// Benchmarks
// ═══════════════════════════════════════════════

export async function storeBenchmarkEntry(entry: BenchmarkEntry): Promise<void> {
  if (!hasPostgres()) {
    memBenchmarks.push(entry);
    return;
  }
  try {
    await ensureTables();
    const pool = await getPool();
    await pool.query(
      `INSERT INTO benchmarks (normalized_url, domain, platform, category, overall_score,
         structured_data_score, product_quality_score, protocol_score, merchant_score,
         discoverability_score, scan_id, scanned_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        entry.normalizedUrl, entry.domain, entry.platform, entry.category,
        entry.overallScore,
        entry.categoryScores.structuredData, entry.categoryScores.productQuality,
        entry.categoryScores.protocolReadiness, entry.categoryScores.merchantSignals,
        entry.categoryScores.aiDiscoverability,
        entry.scanId, entry.scannedAt,
      ]
    );
  } catch (err) {
    logger.error({ err, domain: entry.domain }, 'storeBenchmarkEntry failed');
  }
}

export async function getBenchmarkStats(): Promise<BenchmarkStats> {
  const empty: BenchmarkStats = {
    totalScanned: 0,
    averageScore: 0,
    medianScore: 0,
    scoreDistribution: [],
    byPlatform: [],
    byCategory: [],
    topPerformers: [],
    bottomPerformers: [],
  };

  if (!hasPostgres()) {
    if (memBenchmarks.length === 0) return empty;
    const scores = memBenchmarks.map((b) => b.overallScore).sort((a, b) => a - b);
    return {
      totalScanned: memBenchmarks.length,
      averageScore: Math.round(scores.reduce((s, v) => s + v, 0) / scores.length),
      medianScore: scores[Math.floor(scores.length / 2)],
      scoreDistribution: [],
      byPlatform: [],
      byCategory: [],
      topPerformers: memBenchmarks.sort((a, b) => b.overallScore - a.overallScore).slice(0, 5).map((b) => ({ domain: b.domain, score: b.overallScore, platform: b.platform })),
      bottomPerformers: memBenchmarks.sort((a, b) => a.overallScore - b.overallScore).slice(0, 5).map((b) => ({ domain: b.domain, score: b.overallScore, platform: b.platform })),
    };
  }

  try {
    await ensureTables();
    const pool = await getPool();

    const [statsRes, platformRes, categoryRes, topRes, bottomRes, distRes] = await Promise.all([
      pool.query(`SELECT COUNT(*) AS total, AVG(overall_score) AS avg, PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY overall_score) AS median FROM benchmarks`),
      pool.query(`SELECT platform, AVG(overall_score)::int AS avg_score, COUNT(*) AS count FROM benchmarks WHERE platform IS NOT NULL GROUP BY platform ORDER BY avg_score DESC`),
      pool.query(`SELECT category, AVG(overall_score)::int AS avg_score, COUNT(*) AS count FROM benchmarks WHERE category IS NOT NULL GROUP BY category ORDER BY avg_score DESC`),
      pool.query(`SELECT domain, overall_score AS score, platform FROM benchmarks ORDER BY overall_score DESC LIMIT 5`),
      pool.query(`SELECT domain, overall_score AS score, platform FROM benchmarks ORDER BY overall_score ASC LIMIT 5`),
      pool.query(`
        SELECT
          CASE
            WHEN overall_score >= 80 THEN '80-100'
            WHEN overall_score >= 60 THEN '60-79'
            WHEN overall_score >= 40 THEN '40-59'
            WHEN overall_score >= 20 THEN '20-39'
            ELSE '0-19'
          END AS range,
          COUNT(*) AS count
        FROM benchmarks
        GROUP BY range
        ORDER BY range DESC
      `),
    ]);

    const row = statsRes.rows[0];
    return {
      totalScanned: parseInt(row?.total ?? '0'),
      averageScore: Math.round(parseFloat(row?.avg ?? '0')),
      medianScore: Math.round(parseFloat(row?.median ?? '0')),
      scoreDistribution: distRes.rows.map((r: { range: string; count: string }) => ({ range: r.range, count: parseInt(r.count) })),
      byPlatform: platformRes.rows.map((r: { platform: string; avg_score: number; count: string }) => ({ platform: r.platform, avgScore: r.avg_score, count: parseInt(r.count) })),
      byCategory: categoryRes.rows.map((r: { category: string; avg_score: number; count: string }) => ({ category: r.category, avgScore: r.avg_score, count: parseInt(r.count) })),
      topPerformers: topRes.rows.map((r: { domain: string; score: number; platform: string | null }) => ({ domain: r.domain, score: r.score, platform: r.platform })),
      bottomPerformers: bottomRes.rows.map((r: { domain: string; score: number; platform: string | null }) => ({ domain: r.domain, score: r.score, platform: r.platform })),
    };
  } catch (err) {
    logger.error({ err }, 'getBenchmarkStats failed');
    return empty;
  }
}
