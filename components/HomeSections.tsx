'use client';

import BlurIn from './BlurIn';
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
      {/* ── STATS ── */}
      <section
        className="section-divider-top"
        style={{ padding: '80px 24px', backgroundColor: 'var(--bg-surface)' }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <FadeInUp>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', fontFamily: 'var(--font-body)', maxWidth: '560px', lineHeight: 1.7, marginBottom: '48px' }}>
              Your organic traffic is shrinking because AI agents are answering queries directly.
              When someone asks ChatGPT for a recommendation, does your business show up?
            </p>
          </FadeInUp>

          <StaggerContainer style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {STATS.map((stat) => (
              <StaggerItem key={stat.value}>
                <div className="glow-card" style={{ padding: '32px 28px' }}>
                  <div className="stat-value" style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '44px', color: 'var(--accent-teal)', letterSpacing: '-0.03em', marginBottom: '8px' }}>
                    {stat.value}
                  </div>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>
                    {stat.label}
                  </p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)', marginTop: '10px' }}>
                    \u2014 {stat.source}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ── WHAT WE CHECK ── */}
      <section id="what-we-check" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <FadeInUp>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent-teal)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
              5 Critical Areas
            </p>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, fontSize: 'clamp(28px, 4vw, 40px)', color: 'white', marginBottom: '8px', letterSpacing: '-0.02em' }}>
              Why your business might be{' '}
              <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>invisible.</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-body)', marginBottom: '48px', fontSize: '16px', maxWidth: '480px', lineHeight: 1.6 }}>
              We check 5 areas where AI agents decide whether to recommend you \u2014 or your competitor.
            </p>
          </FadeInUp>

          <StaggerContainer style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {CATEGORY_KEYS.map((key) => (
              <StaggerItem key={key}>
                <div className="glow-card" style={{ padding: '28px 24px', height: '100%' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    backgroundColor: 'rgba(0, 229, 204, 0.08)',
                    border: '1px solid rgba(0, 229, 204, 0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-mono)', fontSize: '18px', color: 'var(--accent-teal)',
                    marginBottom: '16px',
                  }}>
                    {CATEGORY_ICONS[key]}
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '16px', color: 'white', marginBottom: '8px' }}>
                    {categoryLabel(key)}
                  </h3>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>
                    {categoryDescription(key)}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="section-divider-top" style={{ padding: '80px 24px', backgroundColor: 'var(--bg-surface)' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <FadeInUp>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent-teal)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
              3 Simple Steps
            </p>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, fontSize: 'clamp(28px, 4vw, 40px)', color: 'white', marginBottom: '48px', letterSpacing: '-0.02em' }}>
              How it{' '}
              <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>works.</span>
            </h2>
          </FadeInUp>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {STEPS.map((step, i) => (
              <FadeInUp key={step.n} delay={i * 0.15}>
                <div className="timeline-step" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', padding: '12px 0' }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700,
                    color: 'var(--accent-teal)', backgroundColor: 'rgba(0, 229, 204, 0.08)',
                    padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(0, 229, 204, 0.2)',
                    flexShrink: 0, width: '47px', textAlign: 'center',
                  }}>
                    {step.n}
                  </div>
                  <div style={{ paddingTop: '4px' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '18px', color: 'white', marginBottom: '6px' }}>
                      {step.title}
                    </h3>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
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
      <section style={{ padding: '80px 24px', maxWidth: '640px', margin: '0 auto' }}>
        <FadeInUp>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent-teal)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>
            Ready?
          </p>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, fontSize: 'clamp(28px, 4vw, 40px)', color: 'white', marginBottom: '12px', letterSpacing: '-0.02em' }}>
            Find out if AI agents can find your{' '}
            <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>business.</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-body)', marginBottom: '40px', fontSize: '15px', lineHeight: 1.6 }}>
            Works with any website \u2014 ecommerce, SaaS, local business, healthcare, and more.
          </p>
          <Scanner />
        </FadeInUp>
      </section>
    </>
  );
}
