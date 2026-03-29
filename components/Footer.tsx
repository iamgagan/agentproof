// components/Footer.tsx
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer-gradient" style={{ padding: '48px 24px', backgroundColor: 'var(--bg-surface)', marginTop: 'auto' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '32px', alignItems: 'start' }}>
        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'linear-gradient(135deg, var(--accent-teal), var(--accent-indigo))' }} />
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '16px', color: 'rgba(255,255,255,0.7)' }}>
              AgentProof
            </span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', fontFamily: 'var(--font-body)', lineHeight: 1.6, maxWidth: '240px' }}>
            AI Agent Readiness Scanner. Find out if AI agents can find your business.
          </p>
        </div>

        {/* Product */}
        <div>
          <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginBottom: '12px', letterSpacing: '0.02em' }}>Product</p>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link href="/#what-we-check" className="nav-link" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', textDecoration: 'none', fontFamily: 'var(--font-body)', width: 'fit-content' }}>Features</Link>
            <Link href="/pricing" className="nav-link" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', textDecoration: 'none', fontFamily: 'var(--font-body)', width: 'fit-content' }}>Pricing</Link>
            <Link href="/blog" className="nav-link" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', textDecoration: 'none', fontFamily: 'var(--font-body)', width: 'fit-content' }}>Blog</Link>
          </nav>
        </div>

        {/* Resources */}
        <div>
          <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginBottom: '12px', letterSpacing: '0.02em' }}>Resources</p>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link href="/#how-it-works" className="nav-link" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', textDecoration: 'none', fontFamily: 'var(--font-body)', width: 'fit-content' }}>How it works</Link>
            <Link href="/blog/ai-agent-readiness-for-ecommerce" className="nav-link" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', textDecoration: 'none', fontFamily: 'var(--font-body)', width: 'fit-content' }}>Getting started</Link>
          </nav>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ maxWidth: '1200px', margin: '32px auto 0', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px', fontFamily: 'var(--font-body)' }}>&copy; 2026 AgentProof. All rights reserved.</p>
        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>Free &middot; No signup required &middot; Results cached 24h</p>
      </div>
    </footer>
  );
}
