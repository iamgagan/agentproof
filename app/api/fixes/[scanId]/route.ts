// app/api/fixes/[scanId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getScanResult, getKvRateLimiter } from '@/lib/kv';
import { generateAllFixes } from '@/lib/scanner/fix-generator';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ scanId: string }> }
) {
  // Rate limiting — keyed by IP, 30 requests per 60 seconds
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const limited = await getKvRateLimiter(`fixes:rl:${ip}`, 30, 60);
  if (limited) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { scanId } = await params;

  // Validate scanId format
  if (!scanId || !scanId.startsWith('scan_') || scanId.length > 64) {
    return NextResponse.json({ error: 'Invalid scan ID' }, { status: 400 });
  }

  let result;
  try {
    result = await getScanResult(scanId);
  } catch {
    return NextResponse.json({ error: 'Storage unavailable' }, { status: 503 });
  }

  if (!result) {
    return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
  }

  const allIssues = Object.values(result.categories).flatMap(c => c.issues);
  const ctx = {
    currency: 'USD',
    productUrl: result.normalizedUrl,
  };

  const fixes = generateAllFixes(allIssues, result.metadata.platform, ctx);
  return NextResponse.json({ scanId, fixes, platform: result.metadata.platform });
}
