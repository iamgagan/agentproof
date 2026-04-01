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

  if (loading) return (
    <p style={{ fontSize: '12px', color: '#808080', fontFamily: 'MS Sans Serif, Tahoma, sans-serif' }}>
      Loading fixes...
    </p>
  );
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

  const severityBadge = (s: string) => {
    const config = {
      critical: { label: 'CRITICAL', color: '#FFFFFF', bg: '#FF0000' },
      warning:  { label: 'WARNING',  color: '#000000', bg: '#FFFF00' },
      info:     { label: 'INFO',     color: '#000000', bg: '#C0C0C0' },
    };
    const c = config[s as keyof typeof config] ?? config.info;
    return (
      <span style={{
        display: 'inline-block',
        padding: '1px 4px',
        fontSize: '10px',
        fontWeight: 'bold',
        fontFamily: 'MS Sans Serif, Tahoma, sans-serif',
        color: c.color,
        backgroundColor: c.bg,
        border: '1px solid #808080',
        textTransform: 'uppercase' as const,
      }}>
        {c.label}
      </span>
    );
  };

  return (
    <section>
      <div style={{
        fontFamily: 'MS Sans Serif, Tahoma, sans-serif',
        fontSize: '13px',
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: '8px',
      }}>
        Auto-Generated Fixes
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {fixes.map((fix) => {
          const isOpen = expanded.has(fix.issueId);
          return (
            <div key={fix.issueId} className="win-window">
              {/* Title bar / toggle */}
              <div
                className="win-title-bar"
                onClick={() => toggle(fix.issueId)}
                style={{ cursor: 'pointer' }}
              >
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}>
                  <span>{isOpen ? '\u25BC' : '\u25B6'}</span>
                  {fix.title}
                </span>
                <div className="win-title-buttons">
                  <button
                    className="win-title-btn"
                    onClick={(e) => { e.stopPropagation(); toggle(fix.issueId); }}
                    aria-label="Toggle"
                  >
                    {isOpen ? '\u2212' : '+'}
                  </button>
                </div>
              </div>

              {/* Body content */}
              <div className="win-body" style={{
                padding: '8px',
                fontFamily: 'MS Sans Serif, Tahoma, sans-serif',
              }}>
                {/* Severity badge row */}
                <div style={{ marginBottom: '6px' }}>
                  {severityBadge(fix.severity)}
                </div>

                {isOpen && (
                  <>
                    {/* Instructions */}
                    <p style={{
                      fontSize: '11px',
                      color: '#000000',
                      lineHeight: '1.5',
                      marginBottom: '8px',
                    }}>
                      {fix.instructions}
                    </p>

                    {/* Code snippet */}
                    <div style={{ position: 'relative' }}>
                      <pre className="win-sunken" style={{
                        background: '#FFFFFF',
                        padding: '8px',
                        overflow: 'auto',
                        maxHeight: '400px',
                        fontSize: '11px',
                        lineHeight: '1.4',
                        fontFamily: 'Fixedsys, Courier New, monospace',
                        color: '#000000',
                      }}>
                        <code>{fix.codeSnippet}</code>
                      </pre>
                      <button
                        className="win-btn"
                        onClick={() => copySnippet(fix.issueId, fix.codeSnippet)}
                        style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          padding: '2px 8px',
                          fontSize: '10px',
                          fontFamily: 'MS Sans Serif, Tahoma, sans-serif',
                          cursor: 'pointer',
                          backgroundColor: copied === fix.issueId ? '#008000' : undefined,
                          color: copied === fix.issueId ? '#FFFFFF' : undefined,
                        }}
                      >
                        {copied === fix.issueId ? 'Copied!' : 'Copy'}
                      </button>
                    </div>

                    {/* Platform note */}
                    {fix.platform && (
                      <p style={{
                        fontSize: '10px',
                        color: '#808080',
                        marginTop: '6px',
                        fontStyle: 'italic',
                      }}>
                        Platform detected: {fix.platform}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
