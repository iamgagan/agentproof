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
    }).catch(() => {});
  }

  if (loading) return (
    <div style={{ padding: '8px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
      Generating fixes...
    </div>
  );

  if (error) return (
    <div className="win-sunken" style={{ padding: '8px', background: '#FFFFFF', fontSize: '11px' }}>
      <span style={{ color: '#FF0000' }}>Error:</span> Could not load fixes. Please try refreshing the page.
    </div>
  );

  if (fixes.length === 0) return (
    <div className="win-sunken" style={{ padding: '8px', background: '#FFFFFF', fontSize: '11px' }}>
      No auto-fixes available for your current issues.
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }} data-testid="fix-panel">
      {fixes.map(fix => (
        <div key={fix.issueId} className="win-window">
          {/* Header */}
          <div style={{
            padding: '4px 8px',
            background: 'var(--win-face)',
            borderBottom: '1px solid var(--win-shadow)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '8px',
          }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: '11px', margin: '0 0 2px' }}>
                {fix.title}
              </p>
              <p style={{ fontSize: '11px', color: '#000000', margin: 0, lineHeight: 1.4 }}>
                {fix.instruction}
              </p>
            </div>
            {fix.docsUrl?.startsWith('https://') && (
              <a href={fix.docsUrl} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: '11px', color: '#0000FF', whiteSpace: 'nowrap', flexShrink: 0 }}>
                Docs
              </a>
            )}
          </div>

          {/* Code block - sunken textarea style */}
          <div style={{ position: 'relative' }}>
            <pre className="win-sunken" style={{
              margin: '4px',
              padding: '4px 6px',
              overflowX: 'auto',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: '#000000',
              lineHeight: 1.5,
              background: '#FFFFFF',
              maxHeight: '180px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}>
              {fix.code}
            </pre>
            <button
              onClick={() => copyCode(fix)}
              className="win-btn"
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                minWidth: '50px',
                padding: '2px 8px',
                fontSize: '10px',
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
