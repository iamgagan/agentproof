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
      {/* Win98 group box (fieldset) */}
      <fieldset
        className="win-groove"
        style={{
          padding: '12px 12px 10px',
          margin: 0,
        }}
      >
        <legend
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            color: '#000',
            padding: '0 4px',
          }}
        >
          Enter Store URL
        </legend>

        <div
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <input
            type="text"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(''); }}
            placeholder={placeholder}
            disabled={isPending}
            className="win-input"
            style={{
              flex: 1,
              minWidth: '240px',
              fontFamily: 'var(--font-mono)',
            }}
          />
          <button
            type="submit"
            disabled={isPending || !url.trim() || !validateUrl(url).valid}
            className={`win-btn ${!isPending && url.trim() && validateUrl(url).valid ? 'win-btn-default' : ''}`}
            style={{ whiteSpace: 'nowrap' }}
          >
            {isPending ? 'Scanning...' : isSignedIn ? 'Scan My Site' : 'Sign Up to Scan'}
          </button>
        </div>

        {/* Win98 progress bar during scan */}
        {isPending && (
          <div style={{ marginTop: '10px' }}>
            {scanStage && (
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: '#000',
                  marginBottom: '4px',
                }}
              >
                {scanStage}
              </div>
            )}
            <div className="win-progress" style={{ width: '100%' }}>
              <div
                className="win-progress-bar"
                style={{
                  width: '40%',
                  animation: 'scan-progress 2s ease-in-out infinite',
                }}
              />
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <p
            style={{
              marginTop: '8px',
              fontSize: '11px',
              color: '#FF0000',
              fontFamily: 'var(--font-body)',
            }}
          >
            {error}
          </p>
        )}
      </fieldset>

      <p
        style={{
          marginTop: '8px',
          fontSize: '11px',
          color: '#808080',
          fontFamily: 'var(--font-body)',
          textAlign: 'center',
        }}
      >
        {isSignedIn ? 'Free · Results in ~15 seconds' : 'Free · Sign up in 10 seconds · Results in ~15 seconds'}
      </p>
    </form>
  );
}
