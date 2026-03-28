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
      <div
        style={{
          width: '100%',
          padding: '20px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: '0.7rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#6366F1',
            marginBottom: '6px',
          }}
        >
          Pro Feature
        </div>
        <h3
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: '#F8FAFC',
            marginBottom: '6px',
          }}
        >
          {featureName}
        </h3>
        <p
          style={{
            fontSize: '0.75rem',
            color: '#94A3B8',
            marginBottom: '12px',
          }}
        >
          Upgrade to unlock this feature.
        </p>
        <button
          onClick={() => router.push('/pricing')}
          style={{
            background: 'linear-gradient(135deg, #00E5CC, #6366F1)',
            color: '#0A0A0F',
            border: 'none',
            padding: '8px 20px',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '0.8rem',
            cursor: 'pointer',
          }}
        >
          Upgrade to Pro — $200/mo
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '2rem',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        textAlign: 'center',
        marginBottom: '1rem',
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
          margin: '0 auto 1.5rem',
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
  );
}
