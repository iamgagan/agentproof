// app/api/pixel/route.ts
// Receives AI agent visit data from the tracking pixel.

import { NextRequest, NextResponse } from 'next/server';
import { storeAgentVisit } from '@/lib/db';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// 1x1 transparent GIF
const TRANSPARENT_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

// In-memory dedup: key = siteId:agentType:url, value = timestamp
const recentVisits = new Map<string, number>();
const DEDUP_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

function isDuplicate(key: string): boolean {
  const now = Date.now();
  const last = recentVisits.get(key);
  if (last && now - last < DEDUP_WINDOW_MS) return true;
  recentVisits.set(key, now);
  // Cleanup old entries periodically
  if (recentVisits.size > 10000) {
    for (const [k, v] of recentVisits) {
      if (now - v > DEDUP_WINDOW_MS) recentVisits.delete(k);
    }
  }
  return false;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const siteId = String(body.s || '').slice(0, 100);
    const pageUrl = String(body.u || '').slice(0, 2000);
    const userAgent = String(body.a || '').slice(0, 500);
    const agentType = body.t ? String(body.t).slice(0, 50) : null;
    const referrer = body.r ? String(body.r).slice(0, 2000) : null;

    if (!siteId || !pageUrl) {
      return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
    }

    // Only store if it's an AI agent visit
    if (agentType) {
      const dedupKey = `${siteId}:${agentType}:${pageUrl}`;
      if (!isDuplicate(dedupKey)) {
        await storeAgentVisit({
          siteId,
          pageUrl,
          userAgent,
          agentType,
          referrer,
          timestamp: new Date().toISOString(),
        }).catch(() => { /* non-fatal */ });
      }
    }

    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
  } catch {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
  }
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const siteId = params.get('s') || '';
  const pageUrl = params.get('u') || '';
  const agentType = params.get('t') || null;
  const referrer = params.get('r') || null;
  const userAgent = params.get('a') || req.headers.get('user-agent') || '';

  if (siteId && pageUrl && agentType) {
    const dedupKey = `${siteId}:${agentType}:${pageUrl}`;
    if (!isDuplicate(dedupKey)) {
      await storeAgentVisit({
        siteId,
        pageUrl: pageUrl.slice(0, 2000),
        userAgent: userAgent.slice(0, 500),
        agentType: agentType.slice(0, 50),
        referrer: referrer?.slice(0, 2000) ?? null,
        timestamp: new Date().toISOString(),
      }).catch(() => { /* non-fatal */ });
    }
  }

  return new NextResponse(TRANSPARENT_GIF, {
    status: 200,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
