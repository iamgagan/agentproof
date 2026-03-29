'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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

function PricingContent() {
  const params = useSearchParams();
  const success = params.get('success');
  const canceled = params.get('canceled');

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

  const proPriceId = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main style={{ flex: 1, padding: '80px 24px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
        {success && (
          <div style={{
            padding: '16px 24px',
            backgroundColor: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: '10px',
            marginBottom: '32px',
            textAlign: 'center',
            color: '#22C55E',
            fontWeight: 600,
          }}>
            Welcome to AgentProof Pro! Your account has been upgraded.
          </div>
        )}

        {canceled && (
          <div style={{
            padding: '16px 24px',
            backgroundColor: 'rgba(234,179,8,0.1)',
            border: '1px solid rgba(234,179,8,0.3)',
            borderRadius: '10px',
            marginBottom: '32px',
            textAlign: 'center',
            color: '#EAB308',
          }}>
            Checkout canceled. No charges were made.
          </div>
        )}

        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: 'clamp(28px, 5vw, 40px)',
            color: 'var(--text-primary)',
            marginBottom: '12px',
          }}>
            Upgrade to Pro
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '500px', margin: '0 auto' }}>
            Get actionable fixes, protocol files, and benchmarks to make your business AI-agent ready.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
        }}>
          {/* Free Plan */}
          <div style={{
            padding: '32px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              fontSize: '20px',
              color: 'var(--text-primary)',
              marginBottom: '8px',
            }}>
              Free
            </h2>
            <div style={{ marginBottom: '24px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '36px', fontWeight: 700, color: 'var(--text-primary)' }}>$0</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}> / forever</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {FREE_FEATURES.map((f) => (
                <li key={f} style={{
                  padding: '8px 0',
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <span style={{ color: 'var(--text-muted)' }}>&#10003;</span> {f}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: '24px' }}>
              <a
                href="/"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '12px',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                Current Plan
              </a>
            </div>
          </div>

          {/* Pro Plan */}
          <div style={{
            padding: '32px',
            backgroundColor: 'var(--bg-surface)',
            border: '2px solid var(--accent-teal)',
            borderRadius: '16px',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              top: '-12px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'var(--accent-teal)',
              color: '#0A0A0F',
              padding: '4px 16px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Most Popular
            </div>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              fontSize: '20px',
              color: 'var(--text-primary)',
              marginBottom: '8px',
            }}>
              Pro
            </h2>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '36px', fontWeight: 700, color: 'var(--text-primary)' }}>$199</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}> one-time</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--accent-teal)', marginBottom: '24px' }}>
              Lifetime access — no recurring fees
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {PRO_FEATURES.map((f) => (
                <li key={f} style={{
                  padding: '8px 0',
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <span style={{ color: 'var(--accent-teal)' }}>&#10003;</span> {f}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: '24px' }}>
              {proPriceId ? (
                <button
                  onClick={() => handleCheckout(proPriceId)}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: 'linear-gradient(135deg, #00E5CC, #6366F1)',
                    color: '#0A0A0F',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '15px',
                    cursor: 'pointer',
                  }}
                >
                  Get Pro — $199 One-Time
                </button>
              ) : (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  Pricing coming soon. Contact us for early access.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense>
      <PricingContent />
    </Suspense>
  );
}
