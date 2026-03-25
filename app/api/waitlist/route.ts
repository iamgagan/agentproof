// app/api/waitlist/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { storeWaitlistEmail, isEmailOnWaitlist } from '@/lib/kv';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }

  const already = await isEmailOnWaitlist(email);
  if (already) {
    return NextResponse.json({ ok: true, alreadyRegistered: true });
  }

  await storeWaitlistEmail(email);
  return NextResponse.json({ ok: true, alreadyRegistered: false });
}
