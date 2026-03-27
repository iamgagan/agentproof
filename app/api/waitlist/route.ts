// app/api/waitlist/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { storeWaitlistEntry, getWaitlistEntry } from '@/lib/db';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: { email?: string; scanId?: string; score?: number; url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { email, scanId, score, url } = body;

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'email is required' }, { status: 400 });
  }
  if (!EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
  }
  if (!scanId || typeof scanId !== 'string') {
    return NextResponse.json({ error: 'scanId is required' }, { status: 400 });
  }
  if (typeof score !== 'number' || score < 0 || score > 100) {
    return NextResponse.json({ error: 'score must be a number between 0 and 100' }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Idempotent — if already signed up, return success
  const existing = await getWaitlistEntry(normalizedEmail);
  if (existing) {
    return NextResponse.json({ success: true, alreadySignedUp: true });
  }

  await storeWaitlistEntry({
    email: normalizedEmail,
    scanId,
    score,
    url: url ?? '',
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json({ success: true, alreadySignedUp: false });
}
