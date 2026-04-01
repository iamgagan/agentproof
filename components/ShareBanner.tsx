'use client';

interface ShareBannerProps {
  score: number;
  grade: string;
  url: string;
  scanId: string;
}

export default function ShareBanner({ score, grade, url, scanId }: ShareBannerProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://agentproof.com';
  const shareUrl = `${appUrl}/scan/${scanId}`;

  let domain = url;
  try {
    domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
  } catch {
    // keep url as-is
  }

  const tweetText = encodeURIComponent(
    `${domain} scored ${score}/100 (Grade: ${grade}) on AgentProof's AI Agent Readiness scan. How does your store score?\n${shareUrl}`
  );
  const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

  function handleCopyLink() {
    navigator.clipboard.writeText(shareUrl).catch(() => {});
  }

  return (
    <div className="win-window">
      <div className="win-title-bar">
        <span>Share Your Score</span>
        <div className="win-title-buttons">
          <button className="win-title-btn">_</button>
          <button className="win-title-btn">&#9633;</button>
          <button className="win-title-btn" style={{ fontWeight: 700 }}>X</button>
        </div>
      </div>
      <div className="win-body" style={{ padding: '12px' }}>
        <p style={{ fontSize: '11px', marginBottom: '8px' }}>
          Share your Agent Readiness Score. Challenge your competitors to beat it!
        </p>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="win-btn"
            style={{ textDecoration: 'none', color: '#000000', display: 'inline-block' }}
          >
            Share on X
          </a>
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="win-btn"
            style={{ textDecoration: 'none', color: '#000000', display: 'inline-block' }}
          >
            Share on LinkedIn
          </a>
          <button onClick={handleCopyLink} className="win-btn">
            Copy Link
          </button>
        </div>
      </div>
    </div>
  );
}
