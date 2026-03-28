// components/Header.tsx
import { UserButton } from '@clerk/nextjs';

export default function Header() {
  return (
    <>
      <style>{`
        .header-nav-link {
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 14px;
          font-family: var(--font-body);
        }
        @media (max-width: 640px) {
          .header-nav-link { display: none; }
        }
      `}</style>
      <header
        style={{
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'rgba(10, 10, 15, 0.8)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 24px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, var(--accent-teal), var(--accent-indigo))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-mono)',
                fontWeight: '500',
                fontSize: '14px',
                color: '#0A0A0F',
              }}
            >
              AP
            </div>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: '700',
                fontSize: '18px',
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
              }}
            >
              AgentProof
            </span>
          </a>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <a href="#how-it-works" className="header-nav-link">
              How it works
            </a>
            <a href="#what-we-check" className="header-nav-link">
              What we check
            </a>
            <a href="/blog" className="header-nav-link">
              Blog
            </a>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: { width: '32px', height: '32px' },
                },
              }}
            />
          </nav>
        </div>
      </header>
    </>
  );
}
