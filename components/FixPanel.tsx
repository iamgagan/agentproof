'use client';

import { useState, useEffect } from 'react';
import type { FixSuggestion } from '@/lib/types';

interface Props {
  scanId: string;
}

export default function FixPanel({ scanId }: Props) {
  const [fixes, setFixes] = useState<FixSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/fixes/${scanId}`)
      .then((r) => r.json())
      .then((data) => { setFixes(data.fixes ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [scanId]);

  if (loading) return <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Loading fixes...</p>;
  if (fixes.length === 0) return null;

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const copySnippet = (id: string, snippet: string) => {
    navigator.clipboard.writeText(snippet);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const severityColor = (s: string) =>
    s === 'critical' ? 'var(--danger)' : s === 'warning' ? 'var(--warning)' : 'var(--text-muted)';

  return (
    <section>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: '600', fontSize: '18px', color: 'var(--text-primary)', marginBottom: '16px' }}>
        Auto-Generated Fixes
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {fixes.map((fix) => (
          <div key={fix.issueId} style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            overflow: 'hidden',
          }}>
            <button
              onClick={() => toggle(fix.issueId)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: '600',
                  color: severityColor(fix.severity), textTransform: 'uppercase',
                  padding: '2px 6px', borderRadius: '4px',
                  backgroundColor: fix.severity === 'critical' ? 'rgba(239,68,68,0.1)' : fix.severity === 'warning' ? 'rgba(234,179,8,0.1)' : 'rgba(100,116,139,0.1)',
                }}>
                  {fix.severity}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>
                  {fix.title}
                </span>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                {expanded.has(fix.issueId) ? '\u25B2' : '\u25BC'}
              </span>
            </button>

            {expanded.has(fix.issueId) && (
              <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border)' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '12px 0 8px', lineHeight: '1.5' }}>
                  {fix.instructions}
                </p>
                <div style={{ position: 'relative' }}>
                  <pre style={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '14px',
                    overflow: 'auto',
                    maxHeight: '400px',
                    fontSize: '11px',
                    lineHeight: '1.5',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-secondary)',
                  }}>
                    <code>{fix.codeSnippet}</code>
                  </pre>
                  <button
                    onClick={() => copySnippet(fix.issueId, fix.codeSnippet)}
                    style={{
                      position: 'absolute', top: '8px', right: '8px',
                      padding: '4px 10px', fontSize: '11px', fontFamily: 'var(--font-mono)',
                      backgroundColor: copied === fix.issueId ? 'var(--success)' : 'var(--bg-elevated)',
                      color: copied === fix.issueId ? '#fff' : 'var(--text-secondary)',
                      border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer',
                    }}
                  >
                    {copied === fix.issueId ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                {fix.platform && (
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', fontStyle: 'italic' }}>
                    Platform detected: {fix.platform}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
