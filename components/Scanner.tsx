'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { validateUrl } from '@/lib/utils';

export default function Scanner({ placeholder = 'https://yourstore.com' }: { placeholder?: string }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const [scanStage, setScanStage] = useState('');
  const router = useRouter();

  const stages = [
    'Fetching homepage...',
    'Discovering product pages...',
    'Analyzing structured data...',
    'Checking AI crawler access...',
    'Calculating readiness score...',
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const validation = validateUrl(url);
    if (!validation.valid) {
      setError(validation.error ?? 'Invalid URL');
      return;
    }

    startTransition(async () => {
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
      {/* Group box */}
      <fieldset className="win-groove" style={{ padding: '12px', background: 'var(--win-face)' }}>
        <legend style={{ fontFamily: 'var(--font-body)', fontSize: '11px', padding: '0 4px' }}>
          Enter Store URL
        </legend>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontFamily: 'var(--font-body)', fontSize: '11px', flexShrink: 0 }}>
            URL:
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(''); }}
            placeholder={placeholder}
            disabled={isPending}
            data-testid="url-input"
            className="win-input"
            style={{ flex: 1, minWidth: '200px', fontSize: '11px' }}
          />
          <button
            type="submit"
            disabled={isPending || !url.trim() || !validateUrl(url).valid}
            data-testid="scan-button"
            className={`win-btn ${!isPending ? 'win-btn-default' : ''}`}
            style={{ minWidth: '120px' }}
          >
            {isPending ? 'Scanning...' : 'Scan My Store'}
          </button>
        </div>
      </fieldset>

      {/* Win98 progress bar while scanning */}
      {isPending && (
        <div style={{ marginTop: '8px' }}>
          <div className="win-progress" style={{ width: '100%' }}>
            <div
              className="win-progress-bar"
              style={{
                width: '60%',
                animation: 'scan-progress 2s ease-in-out infinite',
              }}
            />
          </div>
          {scanStage && (
            <div
              data-testid="scan-status"
              style={{
                marginTop: '4px',
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                color: '#000000',
              }}
            >
              {scanStage}
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <p
          data-testid="scan-error"
          style={{
            marginTop: '6px',
            fontSize: '11px',
            color: 'var(--danger)',
            fontFamily: 'var(--font-body)',
          }}
        >
          {error}
        </p>
      )}

      <p style={{
        marginTop: '6px',
        fontSize: '11px',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-body)',
        textAlign: 'center',
      }}>
        Free &middot; No signup &middot; Results in ~15 seconds
      </p>
    </form>
  );
}
