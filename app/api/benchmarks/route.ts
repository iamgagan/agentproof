// app/api/benchmarks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getBenchmarkStats } from '@/lib/db';

// In-memory cache for benchmark stats (refresh every hour)
let cachedStats: { data: unknown; timestamp: number } | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function GET(req: NextRequest) {
  const platform = req.nextUrl.searchParams.get('platform');
  const category = req.nextUrl.searchParams.get('category');

  // For now, return full stats (filtering by platform/category is a future enhancement)
  const now = Date.now();
  if (cachedStats && now - cachedStats.timestamp < CACHE_TTL_MS && !platform && !category) {
    return NextResponse.json(cachedStats.data);
  }

  const stats = await getBenchmarkStats();
  if (!platform && !category) {
    cachedStats = { data: stats, timestamp: now };
  }

  return NextResponse.json(stats);
}
