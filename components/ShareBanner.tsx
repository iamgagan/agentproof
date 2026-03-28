'use client';

import { useState } from 'react';

interface ShareBannerProps {
  score: number;
  grade: string;
  url: string;
  scanId: string;
}

export default function ShareBanner({ score, grade, url, scanId }: ShareBannerProps) {
  const [copied, setCopied] = useState(false);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://agent-proof.com';
  const shareUrl = `${appUrl}/scan/${scanId}`;

  let domain = url;
  try {
    domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
  } catch {
    // keep url as-is if parsing fails
  }

  const tweetText = encodeURIComponent(
    `${domain} scored ${score}/100 (Grade: ${grade}) on AgentProof's AI Agent Readiness scan. How does your store score?\n${shareUrl}`
  );
  const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

  function handleCopyLink() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // Fallback for non-HTTPS or restricted contexts
      const textarea = document.createElement('textarea');
      textarea.value = shareUrl;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div
      style={{
        padding: '20px 24px',
        background: 'linear-gradient(135deg, rgba(0,229,204,0.08), rgba(99,102,241,0.08))',
        border: '1px solid rgba(0,229,204,0.15)',
        borderRadius: '16px',
      }}
    >
      <h3
        style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: '600',
          fontSize: '16px',
          color: 'var(--text-primary)',
          marginBottom: '4px',
        }}
      >
        Share your Agent Readiness Score
      </h3>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', marginBottom: '14px' }}>
        Challenge your competitors to beat your score
      </p>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '10px 20px',
            backgroundColor: '#1DA1F2',
            color: '#fff',
            borderRadius: '8px',
            fontFamily: 'var(--font-heading)',
            fontWeight: '600',
            fontSize: '14px',
            textDecoration: 'none',
          }}
        >
          Share on X / Twitter
        </a>
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '10px 20px',
            backgroundColor: '#0A66C2',
            color: '#fff',
            borderRadius: '8px',
            fontFamily: 'var(--font-heading)',
            fontWeight: '600',
            fontSize: '14px',
            textDecoration: 'none',
          }}
        >
          Share on LinkedIn
        </a>
        <button
          onClick={handleCopyLink}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '10px 20px',
            backgroundColor: copied ? 'rgba(0,229,204,0.15)' : 'var(--bg-elevated)',
            color: copied ? '#00E5CC' : 'var(--text-secondary)',
            border: `1px solid ${copied ? '#00E5CC' : 'var(--border)'}`,
            borderRadius: '8px',
            fontFamily: 'var(--font-heading)',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
      </div>
    </div>
  );
}
