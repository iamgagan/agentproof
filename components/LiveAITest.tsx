'use client';

import type { LiveAITestResult } from '@/lib/types';

interface Props {
  result: LiveAITestResult;
}

export default function LiveAITest({ result }: Props) {
  const mentionRate = result.queriesTested > 0
    ? Math.round((result.mentionedIn / result.queriesTested) * 100)
    : 0;

  const rateColor = mentionRate >= 60 ? 'var(--success)' : mentionRate >= 30 ? 'var(--warning)' : 'var(--danger)';

  return (
    <section
      style={{
        padding: '24px',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: '600',
            fontSize: '18px',
            color: 'var(--text-primary)',
          }}
        >
          Live AI Query Test
        </h2>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--bg-primary)',
            backgroundColor: 'var(--accent-teal)',
            padding: '2px 8px',
            borderRadius: '4px',
            fontWeight: '600',
          }}
        >
          LIVE
        </span>
      </div>

      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
        We asked GPT-4o real shopping queries about your store. Here&apos;s whether it mentioned you.
      </p>

      {/* Summary */}
      <div
        style={{
          display: 'flex',
          gap: '20px',
          marginBottom: '20px',
          padding: '14px',
          backgroundColor: 'var(--bg-elevated)',
          borderRadius: '8px',
        }}
      >
        <div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: '700', color: rateColor }}>
            {mentionRate}%
          </p>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Mention Rate</p>
        </div>
        <div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>
            {result.mentionedIn}/{result.queriesTested}
          </p>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Queries Mentioned</p>
        </div>
      </div>

      {/* Individual queries */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {result.queries.map((q, i) => {
          const mentioned = q.mentionsBrand || q.mentionsUrl;
          return (
            <details
              key={i}
              style={{
                padding: '12px 14px',
                backgroundColor: 'var(--bg-elevated)',
                border: `1px solid ${mentioned ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                borderRadius: '8px',
              }}
            >
              <summary
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  listStyle: 'none',
                }}
              >
                <span style={{ fontSize: '14px' }}>{mentioned ? '\u2713' : '\u2717'}</span>
                <span style={{ fontSize: '13px', color: 'var(--text-primary)', flex: 1 }}>
                  &quot;{q.query}&quot;
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: q.confidence === 'high' ? 'rgba(34,197,94,0.15)' : q.confidence === 'medium' ? 'rgba(234,179,8,0.15)' : 'rgba(239,68,68,0.15)',
                    color: q.confidence === 'high' ? 'var(--success)' : q.confidence === 'medium' ? 'var(--warning)' : 'var(--danger)',
                  }}
                >
                  {q.confidence}
                </span>
              </summary>
              <div style={{ marginTop: '10px', padding: '10px', backgroundColor: 'var(--bg-primary)', borderRadius: '6px' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                  {q.aiResponse}
                </p>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <span style={{ fontSize: '11px', color: q.mentionsBrand ? 'var(--success)' : 'var(--text-muted)' }}>
                    Brand: {q.mentionsBrand ? 'Mentioned' : 'Not mentioned'}
                  </span>
                  <span style={{ fontSize: '11px', color: q.mentionsUrl ? 'var(--success)' : 'var(--text-muted)' }}>
                    URL: {q.mentionsUrl ? 'Mentioned' : 'Not mentioned'}
                  </span>
                </div>
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}
