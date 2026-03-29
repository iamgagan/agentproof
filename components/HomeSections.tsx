'use client';

import { motion } from 'motion/react';
import { FadeInUp, StaggerContainer, StaggerItem } from './AnimatedSection';
import Scanner from './Scanner';
import { categoryLabel, categoryDescription } from '@/lib/utils';

const CATEGORY_KEYS = [
  'structuredData',
  'productQuality',
  'protocolReadiness',
  'merchantSignals',
  'aiDiscoverability',
] as const;

const CATEGORY_ICONS: Record<string, string> = {
  structuredData:    '{ }',
  productQuality:    '\u25C8',
  protocolReadiness: '\u2B21',
  merchantSignals:   '\u25CE',
  aiDiscoverability: '\u25C9',
};

const STATS = [
  { value: '4,700%', label: 'YoY increase in AI agent traffic to business websites', source: 'Adobe' },
  { value: '87%', label: 'of businesses lack basic AI agent readiness', source: 'est.' },
  { value: '$3\u20135T', label: 'projected agentic commerce market by 2030', source: 'McKinsey' },
];

const STEPS = [
  { n: '01', title: 'Enter any website URL', desc: 'Works with any business \u2014 ecommerce, SaaS, local business, healthcare, travel, real estate, and more.' },
  { n: '02', title: 'We auto-detect & analyze', desc: 'We identify your business type and scan for structured data, AI crawler access, protocol support, and content quality.' },
  { n: '03', title: 'Get your score + fix list', desc: 'Receive a 0-100 Agent Readiness Score with a prioritized list of exactly what to fix and how.' },
];

export default function HomeSections() {
  return (
    <>
      {/* ── PROBLEM / STATS ── */}
      <section
        className="section-divider-top dot-grid-bg ambient-glow"
        style={{
          padding: '80px 24px',
          backgroundColor: 'var(--bg-surface)',
        }}
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <FadeInUp>
            <p
              style={{
                fontSize: '15px',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-body)',
                maxWidth: '640px',
                margin: '0 auto 48px',
                lineHeight: '1.7',
              }}
            >
              Your organic traffic is shrinking because AI agents are answering queries directly.
              When someone asks ChatGPT for a recommendation, does your business show up?
            </p>
          </FadeInUp>

          <StaggerContainer
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '24px',
            }}
          >
            {STATS.map((stat) => (
              <StaggerItem key={stat.value}>
                <div className="glow-card" style={{ padding: '32px 24px' }}>
                  <div
                    className="stat-value"
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 700,
                      fontSize: '42px',
                      color: 'var(--accent-teal)',
                      letterSpacing: '-0.03em',
                      marginBottom: '8px',
                    }}
                  >
                    {stat.value}
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', lineHeight: '1.5' }}>
                    {stat.label}
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '8px' }}>
                    \u2014 {stat.source}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ── WHAT WE CHECK ── */}
      <section
        id="what-we-check"
        className="ambient-glow"
        style={{ padding: '80px 24px', maxWidth: '1100px', margin: '0 auto', position: 'relative' }}
      >
        <FadeInUp>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--accent-teal)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              textAlign: 'center',
              marginBottom: '10px',
            }}
          >
            5 Critical Areas
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: 'clamp(24px, 4vw, 36px)',
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              textAlign: 'center',
              marginBottom: '12px',
            }}
          >
            Why your business might be invisible
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', marginBottom: '48px', fontSize: '15px', maxWidth: '540px', margin: '0 auto 48px' }}>
            We check 5 areas where AI agents decide whether to recommend you \u2014 or your competitor.
          </p>
        </FadeInUp>

        <StaggerContainer
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
          }}
        >
          {CATEGORY_KEYS.map((key) => (
            <StaggerItem key={key}>
              <div className="glow-card" style={{ padding: '28px 24px', height: '100%' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(0, 229, 204, 0.08)',
                    border: '1px solid rgba(0, 229, 204, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '18px',
                    color: 'var(--accent-teal)',
                    marginBottom: '16px',
                  }}
                >
                  {CATEGORY_ICONS[key]}
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 600,
                    fontSize: '16px',
                    color: 'var(--text-primary)',
                    marginBottom: '8px',
                  }}
                >
                  {categoryLabel(key)}
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', lineHeight: '1.6' }}>
                  {categoryDescription(key)}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section
        id="how-it-works"
        className="section-divider-top dot-grid-bg"
        style={{
          padding: '80px 24px',
          backgroundColor: 'var(--bg-surface)',
        }}
      >
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <FadeInUp>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: 'var(--accent-teal)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                textAlign: 'center',
                marginBottom: '10px',
              }}
            >
              3 Simple Steps
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: 'clamp(24px, 4vw, 36px)',
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
                textAlign: 'center',
                marginBottom: '48px',
              }}
            >
              How it works
            </h2>
          </FadeInUp>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
            {STEPS.map((step, i) => (
              <FadeInUp key={step.n} delay={i * 0.15}>
                <div className="timeline-step" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', padding: '12px 0' }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: 'var(--accent-teal)',
                      backgroundColor: 'rgba(0, 229, 204, 0.08)',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid rgba(0, 229, 204, 0.2)',
                      flexShrink: 0,
                      width: '47px',
                      textAlign: 'center',
                    }}
                  >
                    {step.n}
                  </div>
                  <div style={{ paddingTop: '4px' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '18px', color: 'var(--text-primary)', marginBottom: '6px' }}>
                      {step.title}
                    </h3>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section style={{ padding: '80px 24px', textAlign: 'center', maxWidth: '640px', margin: '0 auto' }}>
        <FadeInUp>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--accent-teal)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '14px',
            }}
          >
            Ready?
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: 'clamp(24px, 4vw, 36px)',
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              marginBottom: '12px',
            }}
          >
            Find out if AI agents can find your business
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', marginBottom: '40px', fontSize: '15px', lineHeight: 1.6 }}>
            Works with any website \u2014 ecommerce, SaaS, local business, healthcare, and more.
          </p>
          <Scanner />
        </FadeInUp>
      </section>
    </>
  );
}
