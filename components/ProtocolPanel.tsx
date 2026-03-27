'use client';

import { useState, useEffect } from 'react';
import type { ProtocolFiles } from '@/lib/types';

interface Props {
  scanId: string;
}

export default function ProtocolPanel({ scanId }: Props) {
  const [protocols, setProtocols] = useState<ProtocolFiles | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/protocols/${scanId}`)
      .then((r) => r.json())
      .then((data) => { setProtocols(data.protocols ?? null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [scanId]);

  if (loading) return <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Generating protocol files...</p>;
  if (!protocols) return null;

  const files = [
    { key: 'ucp', file: protocols.ucp, dlParam: 'ucp' },
    { key: 'mcp', file: protocols.mcp, dlParam: 'mcp' },
    { key: 'robotsTxt', file: protocols.robotsTxt, dlParam: 'robots' },
  ].filter((f) => f.file !== null);

  const toggle = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const copyContent = (key: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <section>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: '600', fontSize: '18px', color: 'var(--text-primary)', marginBottom: '8px' }}>
        Protocol Files (Auto-Generated)
      </h2>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
        Deploy these files to enable AI agent interactions with your store.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {files.map(({ key, file, dlParam }) => (
          <div key={key} style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            overflow: 'hidden',
          }}>
            <button
              onClick={() => toggle(key)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: '600',
                  color: 'var(--accent-teal)',
                  padding: '2px 8px', borderRadius: '4px',
                  backgroundColor: 'rgba(0,229,204,0.1)',
                }}>
                  {file!.filename}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {file!.path}
                </span>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                {expanded.has(key) ? '\u25B2' : '\u25BC'}
              </span>
            </button>

            {expanded.has(key) && (
              <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border)' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '12px 0 8px', lineHeight: '1.5' }}>
                  {file!.description}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--accent-indigo)', marginBottom: '8px', fontStyle: 'italic' }}>
                  {file!.deployInstructions}
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
                    <code>{file!.content}</code>
                  </pre>
                  <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => copyContent(key, file!.content)}
                      style={{
                        padding: '4px 10px', fontSize: '11px', fontFamily: 'var(--font-mono)',
                        backgroundColor: copied === key ? 'var(--success)' : 'var(--bg-elevated)',
                        color: copied === key ? '#fff' : 'var(--text-secondary)',
                        border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer',
                      }}
                    >
                      {copied === key ? 'Copied!' : 'Copy'}
                    </button>
                    <a
                      href={`/api/protocols/${scanId}?file=${dlParam}`}
                      download={file!.filename}
                      style={{
                        padding: '4px 10px', fontSize: '11px', fontFamily: 'var(--font-mono)',
                        backgroundColor: 'var(--bg-elevated)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer',
                        textDecoration: 'none',
                      }}
                    >
                      Download
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
