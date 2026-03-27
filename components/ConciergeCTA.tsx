'use client';

import { useState } from 'react';

interface ConciergeCTAProps {
  scanId: string;
  score: number;
  url: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ConciergeCTA({ scanId, score, url }: ConciergeCTAProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const trimmed = email.trim();
    if (!trimmed) {
      setError('Please enter your email');
      return;
    }
    if (!EMAIL_RE.test(trimmed)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, scanId, score, url }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }

      setSubmitted(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div
        style={{
          padding: '28px',
          backgroundColor: 'rgba(0, 229, 204, 0.05)',
          border: '1px solid rgba(0, 229, 204, 0.3)',
          borderRadius: '16px',
          textAlign: 'center',
        }}
      >
        <p style={{ fontFamily: 'var(--font-heading)', fontWeight: '600', fontSize: '18px', color: 'var(--accent-teal)', marginBottom: '8px' }}>
          You&apos;re on the list!
        </p>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
          We&apos;ll reach out within 24 hours with a plan to fix your score.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '28px',
        background: 'linear-gradient(135deg, rgba(0, 229, 204, 0.06), rgba(99, 102, 241, 0.06))',
        border: '1px solid rgba(0, 229, 204, 0.2)',
        borderRadius: '16px',
        textAlign: 'center',
      }}
    >
      <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: '600', fontSize: '18px', color: 'var(--text-primary)', marginBottom: '8px' }}>
        Want us to fix this for you?
      </h3>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', marginBottom: '6px' }}>
        Our team will implement the fixes to improve your Agent Readiness Score.
      </p>
      <p style={{ fontSize: '24px', fontFamily: 'var(--font-heading)', fontWeight: '700', color: 'var(--accent-teal)', marginBottom: '20px' }}>
        $299 flat fee
      </p>

      <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            placeholder="you@yourstore.com"
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '10px',
              border: error ? '1.5px solid var(--danger)' : '1.5px solid var(--border)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '14px',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={loading || !email.trim()}
            style={{
              padding: '12px 20px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, var(--accent-teal), #00B8A3)',
              color: '#0A0A0F',
              fontFamily: 'var(--font-heading)',
              fontWeight: '600',
              fontSize: '14px',
              cursor: loading ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {loading ? 'Sending…' : 'Get a quote →'}
          </button>
        </div>
        {error && (
          <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--danger)', fontFamily: 'var(--font-body)' }}>
            {error}
          </p>
        )}
      </form>

      <p style={{ marginTop: '14px', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
        JSON-LD schema · robots.txt · canonical URLs · meta descriptions
      </p>
    </div>
  );
}
