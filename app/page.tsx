// app/page.tsx
import Footer from '@/components/Footer';
import Scanner from '@/components/Scanner';
import HeroSection from '@/components/HeroSection';
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
  productQuality:    '[]',
  protocolReadiness: '<>',
  merchantSignals:   '::',
  aiDiscoverability: '>>',
};

const STATS = [
  { value: '4,700%', label: 'YoY increase in AI agent traffic to business websites', source: 'Adobe' },
  { value: '87%', label: 'of businesses lack basic AI agent readiness', source: 'est.' },
  { value: '$3-5T', label: 'projected agentic commerce market by 2030', source: 'McKinsey' },
];

export default function HomePage() {
  return (
    <div className="win-window" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ── HERO (with Win98 Navbar, scanner) ── */}
      <HeroSection />

      <main style={{ flex: 1, padding: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* ── STATS / MARKET INTELLIGENCE ── */}
        <div className="win-window">
          <div className="win-title-bar">
            <span>Market Intelligence</span>
            <div className="win-title-buttons">
              <button className="win-title-btn" aria-label="Minimize">_</button>
              <button className="win-title-btn" aria-label="Maximize">&#9633;</button>
              <button className="win-title-btn" aria-label="Close">X</button>
            </div>
          </div>
          <div className="win-body" style={{ padding: '12px' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#000000', marginBottom: '12px', textAlign: 'center' }}>
              Your organic traffic is shrinking because AI agents are answering queries directly.
              When someone asks ChatGPT for a recommendation, does your business show up?
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
              {STATS.map((stat) => (
                <div
                  key={stat.value}
                  className="win-sunken"
                  style={{ padding: '12px', background: '#FFFFFF', textAlign: 'center' }}
                >
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '18px', color: '#000080', marginBottom: '4px' }}>
                    {stat.value}
                  </div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#000000', lineHeight: '1.5' }}>
                    {stat.label}
                  </p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--win-shadow)', marginTop: '4px' }}>
                    -- {stat.source}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── WHAT WE CHECK ── */}
        <div className="win-window" id="what-we-check">
          <div className="win-title-bar">
            <span>What We Check</span>
            <div className="win-title-buttons">
              <button className="win-title-btn" aria-label="Minimize">_</button>
              <button className="win-title-btn" aria-label="Maximize">&#9633;</button>
              <button className="win-title-btn" aria-label="Close">X</button>
            </div>
          </div>
          <div className="win-body" style={{ padding: '8px' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#000000', marginBottom: '8px', textAlign: 'center' }}>
              We check 5 areas where AI agents decide whether to recommend you — or your competitor.
            </p>
            <div className="win-listview">
              {/* Header */}
              <div className="win-listview-header">
                <div className="win-listview-header-cell" style={{ width: '36px', textAlign: 'center' }}>#</div>
                <div className="win-listview-header-cell" style={{ width: '44px', textAlign: 'center' }}>Icon</div>
                <div className="win-listview-header-cell" style={{ width: '200px' }}>Category</div>
                <div className="win-listview-header-cell" style={{ flex: 1 }}>Description</div>
              </div>
              {/* Rows */}
              {CATEGORY_KEYS.map((key, i) => (
                <div key={key} className="win-listview-row">
                  <div className="win-listview-cell" style={{ width: '36px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                    {i + 1}
                  </div>
                  <div className="win-listview-cell" style={{ width: '44px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                    {CATEGORY_ICONS[key]}
                  </div>
                  <div className="win-listview-cell" style={{ width: '200px', fontWeight: 700 }}>
                    {categoryLabel(key)}
                  </div>
                  <div className="win-listview-cell" style={{ flex: 1 }}>
                    {categoryDescription(key)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── HOW IT WORKS ── */}
        <div className="win-window" id="how-it-works">
          <div className="win-title-bar">
            <span>How It Works</span>
            <div className="win-title-buttons">
              <button className="win-title-btn" aria-label="Minimize">_</button>
              <button className="win-title-btn" aria-label="Maximize">&#9633;</button>
              <button className="win-title-btn" aria-label="Close">X</button>
            </div>
          </div>
          <div className="win-body" style={{ padding: '12px' }}>
            {[
              { n: '1', title: 'Enter any website URL', desc: 'Works with any business — ecommerce, SaaS, local business, healthcare, travel, real estate, and more.' },
              { n: '2', title: 'We auto-detect & analyze', desc: 'We identify your business type and scan for structured data, AI crawler access, protocol support, and content quality.' },
              { n: '3', title: 'Get your score + fix list', desc: 'Receive a 0-100 Agent Readiness Score with a prioritized list of exactly what to fix and how.' },
            ].map((step) => (
              <div
                key={step.n}
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  marginBottom: step.n === '3' ? 0 : '12px',
                  paddingBottom: step.n === '3' ? 0 : '12px',
                  borderBottom: step.n === '3' ? 'none' : '1px solid var(--win-shadow)',
                }}
              >
                <div
                  className="win-sunken"
                  style={{
                    background: '#FFFFFF',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#000080',
                    padding: '4px 8px',
                    flexShrink: 0,
                    textAlign: 'center',
                    minWidth: '32px',
                  }}
                >
                  Step {step.n}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '11px', color: '#000000', marginBottom: '2px' }}>
                    {step.title}
                  </div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#000000', lineHeight: '1.5' }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── BOTTOM CTA ── */}
        <div className="win-window">
          <div className="win-title-bar">
            <span>Scan Your Site</span>
            <div className="win-title-buttons">
              <button className="win-title-btn" aria-label="Minimize">_</button>
              <button className="win-title-btn" aria-label="Maximize">&#9633;</button>
              <button className="win-title-btn" aria-label="Close">X</button>
            </div>
          </div>
          <div className="win-body" style={{ padding: '16px', textAlign: 'center', maxWidth: '540px', margin: '0 auto' }}>
            <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '13px', color: '#000000', marginBottom: '8px' }}>
              Find out if AI agents can find your business
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#000000', marginBottom: '12px' }}>
              Works with any website — ecommerce, SaaS, local business, healthcare, and more.
            </p>
            <Scanner />
          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <Footer />
    </div>
  );
}
