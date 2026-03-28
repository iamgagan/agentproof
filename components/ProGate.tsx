'use client';

import { useRouter } from 'next/navigation';

interface ProGateProps {
  isPro: boolean;
  featureName: string;
  children: React.ReactNode;
}

export default function ProGate({ isPro, featureName, children }: ProGateProps) {
  const router = useRouter();

  if (isPro) {
    return <>{children}</>;
  }

  return (
    <div style={{ position: 'relative', marginBottom: '2rem' }}>
      {/* Blurred preview */}
      <div
        style={{
          filter: 'blur(6px)',
          pointerEvents: 'none',
          userSelect: 'none',
          opacity: 0.5,
          maxHeight: '300px',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>

      {/* Overlay CTA */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(10, 10, 15, 0.8)',
          borderRadius: '12px',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#6366F1',
            marginBottom: '0.5rem',
          }}
        >
          Pro Feature
        </div>
        <h3
          style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: '#F8FAFC',
            marginBottom: '0.5rem',
          }}
        >
          {featureName}
        </h3>
        <p
          style={{
            fontSize: '0.875rem',
            color: '#94A3B8',
            marginBottom: '1.5rem',
            maxWidth: '320px',
          }}
        >
          Upgrade to Pro to unlock auto-generated fixes, protocol files, benchmarks, and more.
        </p>
        <button
          onClick={() => router.push('/pricing')}
          style={{
            background: 'linear-gradient(135deg, #00E5CC, #6366F1)',
            color: '#0A0A0F',
            border: 'none',
            padding: '0.75rem 2rem',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          Upgrade to Pro — $200/mo
        </button>
      </div>
    </div>
  );
}
