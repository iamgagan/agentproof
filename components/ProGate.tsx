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
    const devBypass = new URLSearchParams(window.location.search).get('pro') === '1';
    if (saved || devBypass) setUnlocked(true);
  }, []);

  if (!mounted) return null;
  if (unlocked) return <>{children}</>;

  return (
    <div style={{ position: 'relative' }} data-testid="pro-gate">
      {/* Blurred preview */}
      <div style={{ filter: 'blur(3px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.5 }}>
        {children}
      </div>

      {/* Win98 dialog overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(192, 192, 192, 0.9)',
      }}>
        <div className="win-window" style={{ maxWidth: '380px', width: '100%' }}>
          <div className="win-title-bar" style={{ background: 'linear-gradient(90deg, #800080, #C060C0)' }}>
            <span>{label}</span>
            <div className="win-title-buttons">
              <button className="win-title-btn" style={{ fontWeight: 700 }}>X</button>
            </div>
          </div>
          <div className="win-body" style={{ textAlign: 'center', padding: '16px 12px' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>&#128274;</div>
            <p style={{ fontWeight: 700, fontSize: '11px', marginBottom: '8px' }}>
              Join the waitlist to unlock auto-generated fixes
            </p>
            <WaitlistForm onSuccess={(email) => {
              localStorage.setItem(STORAGE_KEY, email);
              setUnlocked(true);
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}
