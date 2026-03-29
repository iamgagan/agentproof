'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { validateUrl } from '@/lib/utils';

export default function Scanner({ placeholder = 'https://yourbusiness.com' }: { placeholder?: string }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const [scanStage, setScanStage] = useState('');
  const router = useRouter();
  const { isSignedIn } = useAuth();

  const stages = [
    'Fetching homepage…',
    'Detecting business type…',
    'Analyzing structured data…',
    'Checking AI crawler access…',
    'Calculating readiness score…',
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const validation = validateUrl(url);
    if (!validation.valid) {
      setError(validation.error ?? 'Invalid URL');
      return;
    }

    if (!isSignedIn) {
      router.push('/sign-up');
      return;
    }

    startTransition(async () => {
      // Cycle through stages while scanning
      let stageIndex = 0;
      setScanStage(stages[0]);
      const stageInterval = setInterval(() => {
        stageIndex = (stageIndex + 1) % stages.length;
        setScanStage(stages[stageIndex]);
      }, 2500);

      try {
        const res = await fetch('/api/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });

        clearInterval(stageInterval);

        if (!res.ok) {
          const data = await res.json();
          setError(data.error ?? 'Scan failed. Please try again.');
          setScanStage('');
          return;
        }

        const data = await res.json();
        router.push(`/scan/${data.scanId}`);
      } catch {
        clearInterval(stageInterval);
        setError('Network error. Please check your connection and try again.');
        setScanStage('');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'stretch',
          flexWrap: 'wrap',
        }}
      >
        <input
          type="text"
          value={url}
          onChange={(e) => { setUrl(e.target.value); setError(''); }}
          placeholder={placeholder}
          disabled={isPending}
          style={{
            flex: '1',
            minWidth: '280px',
            padding: '16px 20px',
            borderRadius: '12px',
            border: error ? '1.5px solid var(--danger)' : '1.5px solid var(--border)',
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            fontSize: '15px',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => {
            if (!error) e.target.style.borderColor = 'var(--accent-teal)';
          }}
          onBlur={(e) => {
            if (!error) e.target.style.borderColor = 'var(--border)';
          }}
        />
        <button
          type="submit"
          disabled={isPending || !url.trim() || !validateUrl(url).valid}
          style={{
            padding: '16px 28px',
            borderRadius: '12px',
            border: 'none',
            background: isPending
              ? 'var(--bg-elevated)'
              : 'linear-gradient(135deg, var(--accent-teal), #00B8A3)',
            color: isPending ? 'var(--text-muted)' : '#0A0A0F',
            fontFamily: 'var(--font-heading)',
            fontWeight: '600',
            fontSize: '15px',
            cursor: isPending ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap',
            transition: 'opacity 0.2s',
          }}
        >
          {isPending ? 'Scanning…' : isSignedIn ? 'Scan My Site →' : 'Sign Up to Scan →'}
        </button>
      </div>

      {/* Loading animation */}
      {isPending && scanStage && (
        <div
          style={{
            marginTop: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            className="scan-pulse"
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-teal)',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              color: 'var(--accent-teal)',
            }}
          >
            {scanStage}
          </span>
        </div>
      )}

      {/* Progress bar */}
      {isPending && (
        <div
          style={{
            marginTop: '8px',
            height: '2px',
            backgroundColor: 'var(--border)',
            borderRadius: '2px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: '40%',
              background: 'linear-gradient(90deg, var(--accent-teal), var(--accent-indigo))',
              borderRadius: '2px',
              animation: 'scan-progress 2s ease-in-out infinite',
            }}
          />
        </div>
      )}

      {/* Error message */}
      {error && (
        <p
          style={{
            marginTop: '10px',
            fontSize: '13px',
            color: 'var(--danger)',
            fontFamily: 'var(--font-body)',
          }}
        >
          {error}
        </p>
      )}

      <p
        style={{
          marginTop: '12px',
          fontSize: '13px',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-body)',
          textAlign: 'center',
        }}
      >
        {isSignedIn ? 'Free · Results in ~15 seconds' : 'Free · Sign up in 10 seconds · Results in ~15 seconds'}
      </p>
    </form>
  );
}
