// app/api/waitlist/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { storeWaitlistEmail, isEmailOnWaitlist, getKvRateLimiter } from '@/lib/kv';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254; // RFC 5321 maximum
const RATE_LIMIT_WINDOW = 60; // seconds
const RATE_LIMIT_MAX = 5; // max submissions per IP per window

export async function POST(req: NextRequest) {
  // Rate limiting — keyed by IP, 5 requests per 60 seconds
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const limited = await getKvRateLimiter(`waitlist:rl:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW);
  if (limited) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const body = rawBody as Record<string, unknown>;
  const rawEmail = typeof body.email === 'string' ? body.email : undefined;
  const email = rawEmail?.trim().toLowerCase();

  if (!email || email.length > MAX_EMAIL_LENGTH || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }

  const already = await isEmailOnWaitlist(email);
  if (already) {
    return NextResponse.json({ ok: true, alreadyRegistered: true });
  }

  await storeWaitlistEmail(email);
  return NextResponse.json({ ok: true, alreadyRegistered: false });
}
