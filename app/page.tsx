// app/page.tsx
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Scanner from '@/components/Scanner';
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
  productQuality:    '◈',
  protocolReadiness: '⬡',
  merchantSignals:   '◎',
  aiDiscoverability: '◉',
};

const STATS = [
  { value: '4,700%', label: 'YoY increase in AI agent traffic to ecommerce', source: 'Adobe' },
  { value: '87%', label: 'of stores lack basic agent readiness signals', source: 'est.' },
  { value: '$3–5T', label: 'projected agentic commerce market by 2030', source: 'McKinsey' },
];

export default function HomePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      <main style={{ flex: 1 }}>
        {/* ── HERO ── */}
        <section
          style={{
            padding: '100px 24px 80px',
            textAlign: 'center',
            maxWidth: '860px',
            margin: '0 auto',
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '100px',
              border: '1px solid rgba(0, 229, 204, 0.3)',
              backgroundColor: 'rgba(0, 229, 204, 0.05)',
              marginBottom: '32px',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-teal)', display: 'inline-block' }} />
            <span style={{ fontSize: '13px', color: 'var(--accent-teal)', fontFamily: 'var(--font-mono)' }}>
              Free scan · No signup · 15 seconds
            </span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: '700',
              fontSize: 'clamp(36px, 6vw, 64px)',
              lineHeight: '1.1',
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              marginBottom: '20px',
            }}
          >
            ChatGPT is recommending products<br />
            to your customers right now.<br />
            <span style={{ color: 'var(--accent-teal)' }}>Can it find yours?</span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(16px, 2.5vw, 20px)',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-body)',
              lineHeight: '1.6',
              marginBottom: '48px',
              maxWidth: '600px',
              margin: '0 auto 48px',
            }}
          >
            AI shopping agents are the new storefront — and most stores are invisible to them.
            Find out where you stand in 15 seconds.
          </p>

          <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            <Scanner />
          </div>
        </section>

        {/* ── PROBLEM / STATS ── */}
        <section
          style={{
            padding: '80px 24px',
            backgroundColor: 'var(--bg-surface)',
            borderTop: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
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
              Your Google traffic is shrinking because AI agents are answering shopping queries directly.
              When a customer asks ChatGPT for a recommendation, does your store show up?
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '24px',
              }}
            >
              {STATS.map((stat) => (
                <div
                  key={stat.value}
                  style={{
                    padding: '32px 24px',
                    backgroundColor: 'var(--bg-elevated)',
                    borderRadius: '16px',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontWeight: '700',
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
                    — {stat.source}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHAT WE CHECK ── */}
        <section
          id="what-we-check"
          style={{ padding: '80px 24px', maxWidth: '1100px', margin: '0 auto' }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: '700',
              fontSize: 'clamp(24px, 4vw, 36px)',
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              textAlign: 'center',
              marginBottom: '12px',
            }}
          >
            Why your store might be invisible
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', marginBottom: '48px', fontSize: '15px' }}>
            We check 5 areas where AI agents decide whether to recommend you — or your competitor.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            {CATEGORY_KEYS.map((key) => (
              <div
                key={key}
                className="category-card"
                style={{
                  padding: '28px 24px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  transition: 'all 0.3s ease',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '22px',
                    color: 'var(--accent-teal)',
                    marginBottom: '12px',
                  }}
                >
                  {CATEGORY_ICONS[key]}
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: '600',
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
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section
          id="how-it-works"
          style={{
            padding: '80px 24px',
            backgroundColor: 'var(--bg-surface)',
            borderTop: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: '700',
                fontSize: 'clamp(24px, 4vw, 36px)',
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
                marginBottom: '48px',
              }}
            >
              How it works
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', textAlign: 'left' }}>
              {[
                { n: '01', title: 'Enter your store URL', desc: 'Paste any ecommerce URL — Shopify, WooCommerce, BigCommerce, Magento, or custom.' },
                { n: '02', title: 'Scanner agents analyze', desc: 'We crawl your homepage and product pages, checking structured data, AI crawler access, protocol support, and more.' },
                { n: '03', title: 'Get your score + fix list', desc: 'Receive a 0-100 Agent Readiness Score with a prioritized list of exactly what to fix and how.' },
              ].map((step) => (
                <div
                  key={step.n}
                  style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13px',
                      color: 'var(--accent-teal)',
                      backgroundColor: 'rgba(0, 229, 204, 0.08)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(0, 229, 204, 0.2)',
                      flexShrink: 0,
                    }}
                  >
                    {step.n}
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: '600', fontSize: '18px', color: 'var(--text-primary)', marginBottom: '6px' }}>
                      {step.title}
                    </h3>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BOTTOM CTA ── */}
        <section style={{ padding: '80px 24px', textAlign: 'center', maxWidth: '640px', margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: '700',
              fontSize: 'clamp(24px, 4vw, 36px)',
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              marginBottom: '12px',
            }}
          >
            Find out if AI agents can find your store
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', marginBottom: '40px', fontSize: '15px' }}>
            Works with Shopify, WooCommerce, BigCommerce, Magento, and custom stores.
          </p>
          <Scanner />
        </section>
      </main>

      <Footer />
    </div>
  );
}
