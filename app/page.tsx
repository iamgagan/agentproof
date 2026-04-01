// app/page.tsx
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Scanner from '@/components/Scanner';
import WaitlistForm from '@/components/WaitlistForm';
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
  { value: '4,700%', label: 'YoY increase in AI agent traffic to ecommerce', source: 'Adobe' },
  { value: '87%', label: 'of stores lack basic agent readiness signals', source: 'est.' },
  { value: '$3-5T', label: 'projected agentic commerce market by 2030', source: 'McKinsey' },
];

export default function HomePage() {
  return (
    <div className="win-window" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      <main style={{ flex: 1, background: 'var(--win-face)', padding: '0' }}>
        {/* ── HERO ── */}
        <div style={{ padding: '16px 12px 12px' }}>
          <div className="win-window" style={{ maxWidth: '700px', margin: '0 auto' }}>
            <div className="win-title-bar">
              <span>AgentProof - Welcome</span>
              <div className="win-title-buttons">
                <button className="win-title-btn">_</button>
                <button className="win-title-btn">&#9633;</button>
                <button className="win-title-btn" style={{ fontWeight: 700 }}>X</button>
              </div>
            </div>
            <div className="win-body" style={{ textAlign: 'center', padding: '20px 16px' }}>
              {/* Napster-style cat */}
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>&#128049;</div>

              <h1 style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '18px',
                color: '#000000',
                marginBottom: '8px',
              }}>
                How do AI shopping agents see your store?
              </h1>

              <p style={{
                fontSize: '11px',
                color: '#000000',
                fontFamily: 'var(--font-body)',
                lineHeight: 1.5,
                marginBottom: '16px',
              }}>
                ChatGPT, Gemini, and Copilot are the new storefront.<br />
                Find out if you&apos;re invisible to them.
              </p>

              <Scanner />
            </div>
          </div>
        </div>

        {/* ── PROBLEM / STATS ── */}
        <div style={{ padding: '0 12px 12px' }}>
          <div className="win-window" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div className="win-title-bar">
              <span>Market Intelligence</span>
              <div className="win-title-buttons">
                <button className="win-title-btn">_</button>
                <button className="win-title-btn">&#9633;</button>
                <button className="win-title-btn" style={{ fontWeight: 700 }}>X</button>
              </div>
            </div>
            <div className="win-body">
              <p style={{
                fontSize: '11px',
                color: '#000000',
                fontFamily: 'var(--font-body)',
                textAlign: 'center',
                marginBottom: '12px',
                lineHeight: 1.5,
              }}>
                Google organic traffic is down 20-50% for ecommerce brands.
                AI agents are replacing search - and most stores are invisible to them.
              </p>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {STATS.map((stat) => (
                  <div
                    key={stat.value}
                    className="win-sunken"
                    style={{
                      padding: '12px 16px',
                      background: '#FFFFFF',
                      textAlign: 'center',
                      flex: '1 1 180px',
                      maxWidth: '280px',
                    }}
                  >
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      fontSize: '24px',
                      color: '#000080',
                      marginBottom: '4px',
                    }}>
                      {stat.value}
                    </div>
                    <p style={{ fontSize: '11px', color: '#000000', fontFamily: 'var(--font-body)', lineHeight: 1.4 }}>
                      {stat.label}
                    </p>
                    <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                      Source: {stat.source}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── WHAT WE CHECK ── */}
        <div id="what-we-check" style={{ padding: '0 12px 12px' }}>
          <div className="win-window" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div className="win-title-bar">
              <span>What We Check - 5 Categories</span>
              <div className="win-title-buttons">
                <button className="win-title-btn">_</button>
                <button className="win-title-btn">&#9633;</button>
                <button className="win-title-btn" style={{ fontWeight: 700 }}>X</button>
              </div>
            </div>
            <div className="win-body">
              <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                5 categories &middot; 100 points total
              </p>

              <div className="win-listview">
                {/* Header */}
                <div className="win-listview-header">
                  <div className="win-listview-header-cell" style={{ width: '40px' }}>#</div>
                  <div className="win-listview-header-cell" style={{ width: '40px' }}>Icon</div>
                  <div className="win-listview-header-cell" style={{ flex: '1' }}>Category</div>
                  <div className="win-listview-header-cell" style={{ flex: '2' }}>Description</div>
                </div>
                {/* Rows */}
                {CATEGORY_KEYS.map((key, i) => (
                  <div key={key} className="win-listview-row">
                    <div className="win-listview-cell" style={{ width: '40px' }}>{i + 1}</div>
                    <div className="win-listview-cell" style={{ width: '40px', fontFamily: 'var(--font-mono)' }}>
                      {CATEGORY_ICONS[key]}
                    </div>
                    <div className="win-listview-cell" style={{ flex: '1', fontWeight: 700 }}>
                      {categoryLabel(key)}
                    </div>
                    <div className="win-listview-cell" style={{ flex: '2' }}>
                      {categoryDescription(key)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── HOW IT WORKS ── */}
        <div id="how-it-works" style={{ padding: '0 12px 12px' }}>
          <div className="win-window" style={{ maxWidth: '700px', margin: '0 auto' }}>
            <div className="win-title-bar">
              <span>How It Works</span>
              <div className="win-title-buttons">
                <button className="win-title-btn">_</button>
                <button className="win-title-btn">&#9633;</button>
                <button className="win-title-btn" style={{ fontWeight: 700 }}>X</button>
              </div>
            </div>
            <div className="win-body">
              {[
                { n: 'Step 1:', title: 'Enter your store URL', desc: 'Paste any ecommerce URL - Shopify, WooCommerce, BigCommerce, Magento, or custom.' },
                { n: 'Step 2:', title: 'Scanner agents analyze', desc: 'We crawl your homepage and product pages, checking structured data, AI crawler access, protocol support, and more.' },
                { n: 'Step 3:', title: 'Get your score + fix list', desc: 'Receive a 0-100 Agent Readiness Score with a prioritized list of exactly what to fix and how.' },
              ].map((step) => (
                <div
                  key={step.n}
                  style={{
                    display: 'flex',
                    gap: '8px',
                    padding: '6px 0',
                    borderBottom: '1px solid var(--win-light)',
                    alignItems: 'flex-start',
                  }}
                >
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: '#000080',
                    fontWeight: 700,
                    flexShrink: 0,
                    width: '50px',
                  }}>
                    {step.n}
                  </span>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '11px' }}>{step.title}</span>
                    <br />
                    <span style={{ fontSize: '11px', color: '#000000' }}>{step.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── PRO ── */}
        <div id="pro" style={{ padding: '0 12px 12px' }}>
          <div className="win-window" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div className="win-title-bar" style={{ background: 'linear-gradient(90deg, #800080, #C060C0)' }}>
              <span>AgentProof Pro - Premium Features</span>
              <div className="win-title-buttons">
                <button className="win-title-btn">_</button>
                <button className="win-title-btn">&#9633;</button>
                <button className="win-title-btn" style={{ fontWeight: 700 }}>X</button>
              </div>
            </div>
            <div className="win-body">
              <p style={{ textAlign: 'center', fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>
                Don&apos;t just find issues - fix them
              </p>
              <p style={{ textAlign: 'center', fontSize: '11px', color: '#000000', marginBottom: '12px' }}>
                AgentProof Pro generates the exact code to fix every issue on your results page. Copy, paste, ship.
              </p>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {[
                  {
                    icon: '</> ',
                    title: 'Copy-paste code fixes',
                    desc: 'Every issue comes with a ready-to-use code snippet. Platform-specific for Shopify, WooCommerce, or custom stacks.',
                  },
                  {
                    icon: '{ } ',
                    title: 'Structured data templates',
                    desc: 'Missing Product schema? Get the full JSON-LD block pre-filled with your store\'s context.',
                  },
                  {
                    icon: '>>> ',
                    title: 'AI crawler allow blocks',
                    desc: 'Generate the correct robots.txt rules to let GPTBot, ClaudeBot, and PerplexityBot index your store.',
                  },
                ].map((feat) => (
                  <div
                    key={feat.title}
                    className="win-sunken"
                    style={{
                      padding: '10px',
                      background: '#FFFFFF',
                      flex: '1 1 220px',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#000080', marginBottom: '4px' }}>
                      {feat.icon}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '11px', marginBottom: '4px' }}>
                      {feat.title}
                    </div>
                    <p style={{ fontSize: '11px', color: '#000000', lineHeight: 1.4 }}>
                      {feat.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Waitlist group box */}
              <fieldset className="win-groove" style={{ padding: '12px', background: 'var(--win-face)' }}>
                <legend style={{ fontFamily: 'var(--font-body)', fontSize: '11px', padding: '0 4px' }}>
                  Join the Pro Waitlist
                </legend>
                <p style={{ fontSize: '11px', marginBottom: '8px', textAlign: 'center' }}>
                  Run a free scan, then sign up below to access the code fixes on your results page.
                </p>
                <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                  <WaitlistForm />
                </div>
              </fieldset>
            </div>
          </div>
        </div>

        {/* ── BOTTOM CTA ── */}
        <div style={{ padding: '0 12px 16px' }}>
          <div className="win-window" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="win-title-bar">
              <span>Scan Your Store</span>
              <div className="win-title-buttons">
                <button className="win-title-btn">_</button>
                <button className="win-title-btn">&#9633;</button>
                <button className="win-title-btn" style={{ fontWeight: 700 }}>X</button>
              </div>
            </div>
            <div className="win-body" style={{ textAlign: 'center', padding: '16px' }}>
              <p style={{ fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>
                Ready to see your score?
              </p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Trusted by merchants on WooCommerce, BigCommerce, Magento, and Shopify.
              </p>
              <Scanner />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
