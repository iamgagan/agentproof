// app/api/pixel/stats/[siteId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAgentVisitStats } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;

  if (!siteId) {
    return NextResponse.json({ error: 'siteId is required' }, { status: 400 });
  }

  const stats = await getAgentVisitStats(siteId);
  return NextResponse.json(stats);
}
