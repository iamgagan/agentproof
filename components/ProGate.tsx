// components/ProGate.tsx
'use client';
import { useState, useEffect } from 'react';
import WaitlistForm from './WaitlistForm';

const STORAGE_KEY = 'agentproof_pro_email';

interface ProGateProps {
  children: React.ReactNode;
  label?: string;
}

export default function ProGate({ children, label = 'Pro feature' }: ProGateProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setUnlocked(true);
  }, []);

  // Avoid hydration mismatch — render nothing until client mounts
  if (!mounted) return null;

  if (unlocked) return <>{children}</>;

  return (
    <div style={{ position: 'relative' }} data-testid="pro-gate">
      {/* Blurred preview */}
      <div style={{ filter: 'blur(4px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.6 }}>
        {children}
      </div>

      {/* Overlay */}
      <div
        style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '16px',
          backgroundColor: 'rgba(10, 10, 15, 0.85)',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 10px', borderRadius: '100px',
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            fontSize: '12px', fontFamily: 'var(--font-mono)',
            color: '#818CF8',
          }}
        >
          ⬡ {label}
        </div>
        <p style={{ fontFamily: 'var(--font-heading)', fontWeight: '600', fontSize: '16px', color: 'var(--text-primary)', margin: 0 }}>
          Join the waitlist to unlock auto-generated fixes
        </p>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <WaitlistForm onSuccess={(email) => {
            localStorage.setItem(STORAGE_KEY, email);
            setUnlocked(true);
          }} />
        </div>
      </div>
    </div>
  );
}
