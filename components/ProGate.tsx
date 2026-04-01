'use client';

import { useRouter } from 'next/navigation';

interface ProGateProps {
  isPro: boolean;
  featureName: string;
  children: React.ReactNode;
  compact?: boolean;
}

export default function ProGate({ isPro, featureName, children, compact }: ProGateProps) {
  const router = useRouter();

  if (isPro) {
    return <>{children}</>;
  }

  if (compact) {
    return (
      <div className="win-raised" style={{
        padding: '12px',
        background: 'var(--win-face)',
        textAlign: 'center',
        fontFamily: 'MS Sans Serif, Tahoma, sans-serif',
      }}>
        <div style={{
          fontSize: '10px',
          fontWeight: 'bold',
          color: '#800080',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '4px',
        }}>
          Pro Feature
        </div>
        <div style={{
          fontSize: '12px',
          fontWeight: 'bold',
          color: '#000000',
          marginBottom: '4px',
        }}>
          {featureName}
        </div>
        <div style={{
          fontSize: '11px',
          color: '#808080',
          marginBottom: '8px',
        }}>
          Upgrade to unlock this feature.
        </div>
        <button
          className="win-btn"
          onClick={() => router.push('/pricing')}
          style={{
            fontSize: '11px',
            padding: '4px 16px',
            cursor: 'pointer',
            fontFamily: 'MS Sans Serif, Tahoma, sans-serif',
          }}
        >
          Upgrade to Pro &mdash; $200/mo
        </button>
      </div>
    );
  }

  return (
    <div className="win-window" style={{ maxWidth: '400px', margin: '0 auto 16px' }}>
      {/* Title bar with purple gradient */}
      <div className="win-title-bar" style={{
        background: 'linear-gradient(90deg, #800080, #FF00FF)',
      }}>
        <span style={{ fontWeight: 'bold', color: '#FFFFFF', fontSize: '12px' }}>
          {featureName}
        </span>
        <div className="win-title-buttons">
          <button className="win-title-btn" aria-label="Close">×</button>
        </div>
      </div>

      {/* Body */}
      <div className="win-body" style={{
        padding: '20px',
        textAlign: 'center',
        fontFamily: 'MS Sans Serif, Tahoma, sans-serif',
      }}>
        <div style={{
          fontSize: '11px',
          fontWeight: 'bold',
          color: '#800080',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '8px',
        }}>
          Pro Feature
        </div>

        <div style={{
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#000000',
          marginBottom: '8px',
        }}>
          {featureName}
        </div>

        <p style={{
          fontSize: '11px',
          color: '#808080',
          marginBottom: '16px',
          maxWidth: '280px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          Upgrade to Pro to unlock auto-generated fixes, protocol files, benchmarks, and more.
        </p>

        <button
          className="win-btn win-btn-default"
          onClick={() => router.push('/pricing')}
          style={{
            fontSize: '12px',
            padding: '6px 24px',
            cursor: 'pointer',
            fontFamily: 'MS Sans Serif, Tahoma, sans-serif',
          }}
        >
          Upgrade to Pro &mdash; $200/mo
        </button>
      </div>
    </div>
  );
}
