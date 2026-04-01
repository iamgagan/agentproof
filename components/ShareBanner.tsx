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
    <div className="win-window">
      {/* Title bar */}
      <div className="win-title-bar">
        <span>Share Your Score</span>
        <div className="win-title-buttons">
          <button className="win-title-btn" aria-label="Minimize">_</button>
          <button className="win-title-btn" aria-label="Maximize">&#9633;</button>
          <button className="win-title-btn" aria-label="Close">&#215;</button>
        </div>
      </div>

      {/* Window body */}
      <div className="win-body" style={{ padding: '12px' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#000', marginBottom: '4px', fontWeight: 'bold' }}>
          Share your Agent Readiness Score
        </p>
        <p style={{ fontSize: '11px', color: '#808080', fontFamily: 'var(--font-body)', marginBottom: '12px' }}>
          Challenge your competitors to beat your score
        </p>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="win-btn"
            style={{
              flex: 1,
              minWidth: '100px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Share on X / Twitter
          </a>
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="win-btn"
            style={{
              flex: 1,
              minWidth: '100px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Share on LinkedIn
          </a>
          <button
            onClick={handleCopyLink}
            className={`win-btn ${copied ? '' : 'win-btn-default'}`}
            style={{
              flex: 1,
              minWidth: '100px',
            }}
          >
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>
    </div>
  );
}
