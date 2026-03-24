// app/api/results/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getScanResult } from '@/lib/kv';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || !id.startsWith('scan_')) {
    return NextResponse.json({ error: 'Invalid scan ID' }, { status: 400 });
  }

  const result = await getScanResult(id);
  if (!result) {
    return NextResponse.json({ error: 'Scan not found or expired' }, { status: 404 });
  }

  return NextResponse.json(result);
}
