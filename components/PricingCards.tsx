'use client';

import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import BlurIn from './BlurIn';
import { StaggerContainer, StaggerItem } from './AnimatedSection';

const FREE_FEATURES = [
  'Agent Readiness Score (0-100)',
  '5 category breakdowns',
  'Top issues list',
  'Agent Simulation summary',
  '1 scan per day',
];

const PRO_FEATURES = [
  'Everything in Free',
  'Auto-Generated Fixes (copy-paste code)',
  'Protocol File Generator (UCP, MCP, robots.txt)',
  'Agent Traffic Pixel + Dashboard',
  'Industry Benchmark Comparison',
  'Full AI Agent Simulation Details',
  'Unlimited scans',
  'Priority support',
];

interface PricingCardsProps {
  success: boolean;
  canceled: boolean;
  proPriceId?: string;
}

export default function PricingCards({ success, canceled, proPriceId }: PricingCardsProps) {
  async function handleCheckout(priceId: string) {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  }

  return (
    <div style={{ padding: '60px 24px 80px', maxWidth: '920px', margin: '0 auto', width: '100%' }}>
      {success && (
        <BlurIn>
          <div style={{ padding: '16px 24px', backgroundColor: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '12px', marginBottom: '32px', textAlign: 'center', color: '#22C55E', fontWeight: 600, fontFamily: 'var(--font-body)' }}>
            Welcome to AgentProof Pro! Your account has been upgraded.
          </div>
        </BlurIn>
      )}

      {canceled && (
        <BlurIn>
          <div style={{ padding: '16px 24px', backgroundColor: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)', borderRadius: '12px', marginBottom: '32px', textAlign: 'center', color: '#EAB308', fontFamily: 'var(--font-body)' }}>
            Checkout canceled. No charges were made.
          </div>
        </BlurIn>
      )}

      <BlurIn delay={0}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent-teal)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px', textAlign: 'center' }}>
          Simple pricing
        </p>
      </BlurIn>
      <BlurIn delay={0.1}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, fontSize: 'clamp(28px, 5vw, 42px)', color: 'white', letterSpacing: '-0.03em', marginBottom: '12px', textAlign: 'center' }}>
          Upgrade to{' '}
          <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>Pro.</span>
        </h1>
      </BlurIn>
      <BlurIn delay={0.2}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px', maxWidth: '500px', margin: '0 auto 48px', lineHeight: 1.6, textAlign: 'center', fontFamily: 'var(--font-body)' }}>
          Get actionable fixes, protocol files, and benchmarks to make your business AI-agent ready.
        </p>
      </BlurIn>

      <StaggerContainer style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {/* Free */}
        <StaggerItem>
          <div className="glow-card" style={{ padding: '36px 32px', borderRadius: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '20px', color: 'white', marginBottom: '8px' }}>Free</h2>
            <div style={{ marginBottom: '24px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '40px', fontWeight: 700, color: 'white' }}>$0</span>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px', marginLeft: '6px' }}>/ forever</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1 }}>
              {FREE_FEATURES.map((f) => (
                <li key={f} style={{ padding: '10px 0', fontSize: '14px', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Check size={14} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} /> {f}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: '28px' }}>
              <a href="/" style={{ display: 'block', textAlign: 'center', padding: '14px', border: '1px solid var(--border)', borderRadius: '9999px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px', fontWeight: 500, fontFamily: 'var(--font-heading)' }}>
                Current Plan
              </a>
            </div>
          </div>
        </StaggerItem>

        {/* Pro */}
        <StaggerItem>
          <div className="glow-card" style={{ padding: '36px 32px', border: '2px solid var(--accent-teal)', borderRadius: '20px', position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '0 0 40px rgba(0, 229, 204, 0.06)' }}>
            <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, var(--accent-teal), #00B8A3)', color: 'var(--bg-primary)', padding: '4px 16px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)' }}>
              Most Popular
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '20px', color: 'white', marginBottom: '8px' }}>Pro</h2>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '40px', fontWeight: 700, color: 'white' }}>$199</span>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px', marginLeft: '6px' }}>one-time</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--accent-teal)', marginBottom: '24px', fontFamily: 'var(--font-body)' }}>
              Lifetime access &mdash; no recurring fees
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1 }}>
              {PRO_FEATURES.map((f) => (
                <li key={f} style={{ padding: '10px 0', fontSize: '14px', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Check size={14} style={{ color: 'var(--accent-teal)', flexShrink: 0 }} /> {f}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: '28px' }}>
              {proPriceId ? (
                <motion.button
                  onClick={() => handleCheckout(proPriceId)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ width: '100%', padding: '16px', backgroundColor: 'white', color: 'var(--bg-primary)', border: 'none', borderRadius: '9999px', fontWeight: 700, fontSize: '15px', cursor: 'pointer', fontFamily: 'var(--font-heading)' }}
                >
                  Get Pro &mdash; $199 One-Time
                </motion.button>
              ) : (
                <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: '13px', fontFamily: 'var(--font-body)' }}>
                  Pricing coming soon. Contact us for early access.
                </p>
              )}
            </div>
          </div>
        </StaggerItem>
      </StaggerContainer>
    </div>
  );
}
