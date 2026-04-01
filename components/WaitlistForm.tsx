'use client';
import { useState } from 'react';

const PRO_STORAGE_KEY = 'agentproof_pro_email';

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
      localStorage.setItem(PRO_STORAGE_KEY, email);
      onSuccess?.(email);
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="win-sunken" style={{ padding: '8px', textAlign: 'center', background: '#FFFFFF', fontSize: '11px' }}>
        <span style={{ color: '#008000', fontWeight: 700 }}>OK</span> - You&apos;re on the list. We&apos;ll notify you when Pro launches.
      </div>
    );
  }

  if (status === 'duplicate') {
    return (
      <div className="win-sunken" style={{ padding: '8px', textAlign: 'center', background: '#FFFFFF', fontSize: '11px' }}>
        You&apos;re already on the waitlist. We&apos;ll be in touch!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} data-testid="waitlist-form" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
      <label style={{ fontSize: '11px', flexShrink: 0 }}>Email:</label>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        data-testid="waitlist-email-input"
        className="win-input"
        style={{ flex: '1 1 180px', minWidth: 0, fontSize: '11px' }}
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        data-testid="waitlist-submit-btn"
        className="win-btn"
      >
        {status === 'loading' ? 'Joining...' : 'Join Waitlist'}
      </button>
      {status === 'error' && (
        <p style={{ width: '100%', textAlign: 'center', color: 'var(--danger)', fontSize: '11px' }}>
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}
