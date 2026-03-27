import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock KV module before importing the route
vi.mock('@/lib/db', () => ({
  storeWaitlistEntry: vi.fn(),
  getWaitlistEntry: vi.fn(),
}));

import { POST } from '@/app/api/waitlist/route';
import { storeWaitlistEntry, getWaitlistEntry } from '@/lib/db';
import { NextRequest } from 'next/server';

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/waitlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/waitlist', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getWaitlistEntry).mockResolvedValue(null);
    vi.mocked(storeWaitlistEntry).mockResolvedValue(undefined);
  });

  it('rejects missing email', async () => {
    const res = await POST(makeRequest({ scanId: 'abc', score: 50 }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('email');
  });

  it('rejects invalid email format', async () => {
    const res = await POST(makeRequest({ email: 'not-an-email', scanId: 'abc', score: 50 }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Invalid email');
  });

  it('rejects missing scanId', async () => {
    const res = await POST(makeRequest({ email: 'test@example.com', score: 50 }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('scanId');
  });

  it('rejects invalid score', async () => {
    const res = await POST(makeRequest({ email: 'test@example.com', scanId: 'abc', score: 200 }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('score');
  });

  it('stores valid waitlist entry', async () => {
    const res = await POST(makeRequest({
      email: 'test@example.com',
      scanId: 'scan_abc123',
      score: 42,
      url: 'https://example.com',
    }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.alreadySignedUp).toBe(false);
    expect(storeWaitlistEntry).toHaveBeenCalledOnce();
    expect(storeWaitlistEntry).toHaveBeenCalledWith(expect.objectContaining({
      email: 'test@example.com',
      scanId: 'scan_abc123',
      score: 42,
    }));
  });

  it('returns alreadySignedUp for duplicate email', async () => {
    vi.mocked(getWaitlistEntry).mockResolvedValue({
      email: 'test@example.com',
      scanId: 'scan_abc123',
      score: 42,
      url: 'https://example.com',
      timestamp: '2026-01-01T00:00:00Z',
    });

    const res = await POST(makeRequest({
      email: 'test@example.com',
      scanId: 'scan_abc123',
      score: 42,
    }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.alreadySignedUp).toBe(true);
    expect(storeWaitlistEntry).not.toHaveBeenCalled();
  });

  it('normalizes email to lowercase', async () => {
    const res = await POST(makeRequest({
      email: '  Test@EXAMPLE.com  ',
      scanId: 'scan_abc',
      score: 50,
    }));
    expect(res.status).toBe(200);
    expect(getWaitlistEntry).toHaveBeenCalledWith('test@example.com');
  });

  it('rejects invalid JSON', async () => {
    const req = new NextRequest('http://localhost:3000/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
