// app/api/fixes/[scanId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getScanResult } from '@/lib/kv';
import { generateAllFixes } from '@/lib/scanner/fix-generator';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ scanId: string }> }
) {
  const { scanId } = await params;
  const result = await getScanResult(scanId);
  if (!result) {
    return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
  }

  const allIssues = Object.values(result.categories).flatMap(c => c.issues);
  const ctx = {
    productPrice: undefined,
    currency: 'USD',
    productUrl: result.normalizedUrl,
  };

  const fixes = generateAllFixes(allIssues, result.metadata.platform, ctx);
  return NextResponse.json({ scanId, fixes, platform: result.metadata.platform });
}
