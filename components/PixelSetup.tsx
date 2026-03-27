'use client';

import { useState } from 'react';

interface Props {
  siteId: string;
  domain: string;
}

export default function PixelSetup({ siteId, domain }: Props) {
  const [copied, setCopied] = useState(false);

  const embedCode = `<!-- AgentProof AI Agent Traffic Pixel -->
<script src="https://agent-proof.com/pixel.js" data-site="${siteId}" async></script>
<noscript><img src="https://agent-proof.com/api/pixel?s=${siteId}&u=${domain}" alt="" width="1" height="1" style="display:none"></noscript>`;

  const copyCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      padding: '20px',
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
    }}>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
        Track AI Agent Traffic
      </h3>
      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '12px' }}>
        Add this pixel to your site to monitor visits from GPTBot, ClaudeBot, PerplexityBot, and other AI agents in real-time.
      </p>

      <div style={{ position: 'relative' }}>
        <pre style={{
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '12px',
          overflow: 'auto',
          fontSize: '11px',
          lineHeight: '1.5',
          fontFamily: 'var(--font-mono)',
          color: 'var(--accent-teal)',
        }}>
          <code>{embedCode}</code>
        </pre>
        <button
          onClick={copyCode}
          style={{
            position: 'absolute', top: '8px', right: '8px',
            padding: '4px 10px', fontSize: '11px', fontFamily: 'var(--font-mono)',
            backgroundColor: copied ? 'var(--success)' : 'var(--bg-elevated)',
            color: copied ? '#fff' : 'var(--text-secondary)',
            border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer',
          }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
        Paste before &lt;/body&gt; in your site template. Dashboard coming soon at /api/pixel/stats/{siteId}
      </p>
    </div>
  );
}
