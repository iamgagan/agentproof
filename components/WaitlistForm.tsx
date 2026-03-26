'use client';
import { useState } from 'react';

interface WaitlistFormProps {
  onSuccess?: (email: string) => void;
}

export default function WaitlistForm({ onSuccess }: WaitlistFormProps = {}) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'duplicate' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setStatus('error'); return; }
      setStatus(data.alreadyRegistered ? 'duplicate' : 'success');
      onSuccess?.(email); // unlock Pro gate regardless of duplicate status
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--accent-teal)', fontFamily: 'var(--font-heading)', fontWeight: '600' }}>
        ✓ You're on the list — we'll notify you when Pro launches.
      </div>
    );
  }

  if (status === 'duplicate') {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', fontSize: '14px' }}>
        You're already on the waitlist. We'll be in touch!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} data-testid="waitlist-form" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        data-testid="waitlist-email-input"
        style={{
          flex: '1 1 220px',
          padding: '12px 16px',
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          outline: 'none',
          minWidth: '0',
        }}
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        data-testid="waitlist-submit-btn"
        style={{
          padding: '12px 24px',
          backgroundColor: 'var(--accent-teal)',
          color: '#0A0A0F',
          border: 'none',
          borderRadius: '10px',
          fontFamily: 'var(--font-heading)',
          fontWeight: '600',
          fontSize: '14px',
          cursor: status === 'loading' ? 'not-allowed' : 'pointer',
          opacity: status === 'loading' ? 0.7 : 1,
          flexShrink: 0,
        }}
      >
        {status === 'loading' ? 'Joining...' : 'Join the Pro waitlist →'}
      </button>
      {status === 'error' && (
        <p style={{ width: '100%', textAlign: 'center', color: 'var(--danger)', fontSize: '13px', fontFamily: 'var(--font-body)' }}>
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}
