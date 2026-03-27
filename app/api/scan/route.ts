// app/api/scan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { runScan } from '@/lib/scanner/index';
import { storeScanResult, getScanResultByUrl } from '@/lib/kv';
import { validateUrl, normalizeUrlForCache } from '@/lib/utils';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { url } = body;
  if (!url) {
    return NextResponse.json({ error: 'url is required' }, { status: 400 });
  }

  const validation = validateUrl(url);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const normalizedUrl = normalizeUrlForCache(url);

  // Check cache first
  try {
    const cached = await getScanResultByUrl(normalizedUrl);
    if (cached) {
      return NextResponse.json({ scanId: cached.id, cached: true, results: cached });
    }
  } catch {
    // Cache miss is fine — proceed with scan
  }

  // Run the scan
  let result;
  try {
    result = await runScan(url);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Scan failed';
    return NextResponse.json({ error: message }, { status: 422 });
  }

  // Store results
  try {
    await storeScanResult(result.id, result);
  } catch {
    // Storage failure is non-fatal — return results anyway
  }

  return NextResponse.json({ scanId: result.id, cached: false, results: result });
}
