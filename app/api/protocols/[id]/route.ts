// app/api/protocols/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getScanResult } from '@/lib/kv';
import { generateProtocolFiles } from '@/lib/scanner/protocol-generator';

export async function GET(
  req: NextRequest,
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

  const protocols = generateProtocolFiles(result);

  // If ?file= param, return raw content for download
  const fileParam = req.nextUrl.searchParams.get('file');
  if (fileParam) {
    const fileMap: Record<string, typeof protocols.ucp> = {
      ucp: protocols.ucp,
      mcp: protocols.mcp,
      robots: protocols.robotsTxt,
    };
    const file = fileMap[fileParam];
    if (!file) {
      return NextResponse.json({ error: 'Unknown file type' }, { status: 400 });
    }
    return new NextResponse(file.content, {
      headers: {
        'Content-Type': fileParam === 'robots' ? 'text/plain' : 'application/json',
        'Content-Disposition': `attachment; filename="${file.filename}"`,
      },
    });
  }

  return NextResponse.json({ scanId: id, protocols });
}
