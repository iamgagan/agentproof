// components/FixPanel.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import type { GeneratedFix } from '@/lib/scanner/fix-generator';

interface FixPanelProps {
  scanId: string;
}

export default function FixPanel({ scanId }: FixPanelProps) {
  const [fixes, setFixes] = useState<GeneratedFix[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch(`/api/fixes/${encodeURIComponent(scanId)}`)
      .then(r => { if (!r.ok) throw new Error('fetch failed'); return r.json(); })
      .then(d => { setFixes(d.fixes ?? []); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [scanId]);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  function copyCode(fix: GeneratedFix) {
    navigator.clipboard.writeText(fix.code).then(() => {
      setCopiedId(fix.issueId);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {
      // Clipboard API unavailable — select the text as fallback (no-op for now)
    });
  }

  if (loading) return (
    <div style={{ padding: '20px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
      Generating fixes...
    </div>
  );

  if (error) return (
    <div style={{ padding: '20px', color: 'var(--danger)', fontFamily: 'var(--font-body)', fontSize: '14px' }}>
      Could not load fixes. Please try refreshing the page.
    </div>
  );

  if (fixes.length === 0) return (
    <div style={{ padding: '20px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontSize: '14px' }}>
      No auto-fixes available for your current issues.
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} data-testid="fix-panel">
      {fixes.map(fix => (
        <div
          key={fix.issueId}
          style={{
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
            <div>
              <p style={{ fontFamily: 'var(--font-heading)', fontWeight: '600', fontSize: '14px', color: 'var(--text-primary)', margin: '0 0 4px' }}>
                {fix.title}
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                {fix.instruction}
              </p>
            </div>
            {fix.docsUrl?.startsWith('https://') && (
              <a href={fix.docsUrl} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: '12px', color: 'var(--accent-teal)', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                Docs ↗
              </a>
            )}
          </div>

          {/* Code block */}
          <div style={{ position: 'relative' }}>
            <pre style={{
              margin: 0, padding: '16px', overflowX: 'auto',
              fontFamily: 'var(--font-mono)', fontSize: '12px',
              color: 'var(--text-secondary)', lineHeight: '1.6',
              backgroundColor: 'var(--bg-primary)',
              maxHeight: '200px',
            }}>
              {fix.code}
            </pre>
            <button
              onClick={() => copyCode(fix)}
              style={{
                position: 'absolute', top: '8px', right: '8px',
                padding: '4px 10px',
                backgroundColor: copiedId === fix.issueId ? 'var(--success)' : 'var(--bg-elevated)',
                color: copiedId === fix.issueId ? '#fff' : 'var(--text-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                fontFamily: 'var(--font-mono)', fontSize: '11px',
                cursor: 'pointer',
              }}
              data-testid={`copy-fix-${fix.issueId}`}
            >
              {copiedId === fix.issueId ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
