// app/scan/[id]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScoreGauge from '@/components/ScoreGauge';
import CategoryCard from '@/components/CategoryCard';
import IssueList from '@/components/IssueList';
import ShareBanner from '@/components/ShareBanner';
import ConciergeCTA from '@/components/ConciergeCTA';
import AgentSimulation from '@/components/AgentSimulation';
import FixPanel from '@/components/FixPanel';
import ProtocolPanel from '@/components/ProtocolPanel';
import PixelSetup from '@/components/PixelSetup';
import BenchmarkComparison from '@/components/BenchmarkComparison';
import ProGate from '@/components/ProGate';
import LiveAITest from '@/components/LiveAITest';
import { getScanResult } from '@/lib/kv';
import { isProUser } from '@/lib/pro';
import { formatScanTime, gradeColor, categoryLabel } from '@/lib/utils';
import { VERTICAL_LABELS } from '@/lib/types';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const result = await getScanResult(id);
  if (!result) return { title: 'Scan not found — AgentProof' };

  let domain = 'unknown';
  try { domain = new URL(result.normalizedUrl).hostname; } catch { /* fallback */ }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://agentproof.com';

  return {
    title: `${domain} scored ${result.overallScore}/100 — AgentProof`,
    description: `Agent Readiness Score for ${domain}: ${result.overallScore}/100 (Grade ${result.grade} — ${result.gradeLabel}). See what AI agents can and can't see about your business.`,
    openGraph: {
      images: [`${appUrl}/api/og/${id}`],
    },
    twitter: {
      card: 'summary_large_image',
      images: [`${appUrl}/api/og/${id}`],
    },
  };
}

export default async function ScanResultPage({ params }: Props) {
  const { id } = await params;
  const result = await getScanResult(id);

  if (!result) {
    notFound();
  }

  const isPro = await isProUser();
  let domain = 'unknown';
  try { domain = new URL(result.normalizedUrl).hostname; } catch { /* fallback */ }
  const categoryEntries = Object.entries(result.categories);

  // Mega-brands that appear in AI agent responses due to training data and
  // direct partnerships, regardless of technical readiness signals.
  const megaBrands = ['amazon.com', 'walmart.com', 'target.com', 'ebay.com', 'bestbuy.com', 'costco.com', 'homedepot.com', 'lowes.com', 'macys.com', 'nordstrom.com', 'wayfair.com', 'etsy.com'];
  const cleanDomain = domain.replace('www.', '');
  const isMegaBrand = megaBrands.includes(cleanDomain);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      <main style={{ flex: 1, padding: '48px 24px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        {/* Page header */}
        <div style={{ marginBottom: '48px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Agent Readiness Report
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: '700',
              fontSize: 'clamp(22px, 4vw, 32px)',
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              marginBottom: '8px',
            }}
          >
            {domain}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {result.vertical && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent-teal)', backgroundColor: 'rgba(0,229,204,0.08)', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(0,229,204,0.2)' }}>
                {VERTICAL_LABELS[result.vertical] ?? 'Business'}
              </span>
            )}
            {result.metadata.platform && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)', backgroundColor: 'var(--bg-elevated)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border)', textTransform: 'capitalize' }}>
                {result.metadata.platform}
              </span>
            )}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
              Scanned in {formatScanTime(result.metadata.totalRequestsTime)}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
              {new Date(result.timestamp).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Mega-brand context note */}
        {isMegaBrand && (
          <div
            style={{
              padding: '14px 20px',
              backgroundColor: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: '10px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
            <span style={{ fontSize: '16px', flexShrink: 0 }}>*</span>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              <strong style={{ color: 'var(--accent-indigo)' }}>Note:</strong> {domain} may still appear in AI agent responses due to massive brand recognition in training data and direct partnerships with AI platforms. This score measures <em>technical readiness</em> — the structured data, protocols, and crawler access that smaller brands need to be discoverable. Major retailers can afford low technical readiness; most brands cannot.
            </p>
          </div>
        )}

        <div
          className="results-grid"
          style={{
            display: 'grid',
            gap: '32px',
            alignItems: 'start',
          }}
        >
          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* AI Agent Simulation */}
            {result.agentSimulation && (
              <AgentSimulation simulation={result.agentSimulation} />
            )}

            {/* Category cards */}
            <section>
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: '600',
                  fontSize: '18px',
                  color: 'var(--text-primary)',
                  marginBottom: '16px',
                }}
              >
                Category Breakdown
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {categoryEntries.map(([key, cat]) => (
                  <CategoryCard key={key} categoryKey={key} result={cat} vertical={result.vertical} />
                ))}
              </div>
            </section>

            {/* Top Issues */}
            <section>
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: '600',
                  fontSize: '18px',
                  color: 'var(--text-primary)',
                  marginBottom: '16px',
                }}
              >
                Top Issues to Fix
              </h2>
              <IssueList issues={result.topIssues} />
            </section>

            {/* Live AI Query Test (Pro) */}
            {result.liveAITest && (
              <ProGate isPro={isPro} featureName="Live AI Query Test">
                <LiveAITest result={result.liveAITest} />
              </ProGate>
            )}

            {/* Auto-Generated Fixes (Pro) */}
            <ProGate isPro={isPro} featureName="Auto-Generated Fixes">
              <FixPanel scanId={result.id} />
            </ProGate>

            {/* Protocol Files (Pro) */}
            <ProGate isPro={isPro} featureName="Protocol File Generator">
              <ProtocolPanel scanId={result.id} />
            </ProGate>

            <ShareBanner
              score={result.overallScore}
              grade={result.grade}
              url={result.url}
              scanId={result.id}
            />

            {/* Pixel Setup (Pro) */}
            <ProGate isPro={isPro} featureName="Agent Traffic Pixel">
              <PixelSetup
                siteId={Buffer.from(result.normalizedUrl).toString('base64').slice(0, 20)}
                domain={domain}
              />
            </ProGate>

            {/* Scan errors (if any) */}
            {result.metadata.errors.length > 0 && (
              <div
                style={{
                  padding: '16px',
                  backgroundColor: 'rgba(239,68,68,0.05)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: '10px',
                }}
              >
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>
                  Scan warnings
                </p>
                {result.metadata.errors.map((e, i) => (
                  <p key={i} style={{ fontSize: '13px', color: 'var(--danger)', fontFamily: 'var(--font-body)' }}>
                    • {e}
                  </p>
                ))}
              </div>
            )}

            {/* Concierge fix CTA */}
            <ConciergeCTA
              scanId={result.id}
              score={result.overallScore}
              url={result.url}
            />
          </div>

          {/* Right sidebar — sticky score */}
          <div
            style={{
              position: 'sticky',
              top: '88px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              alignItems: 'center',
            }}
          >
            <ScoreGauge
              score={result.overallScore}
              grade={result.grade}
              gradeLabel={result.gradeLabel}
              size={200}
            />

            {/* Benchmark Comparison (Pro) */}
            <ProGate isPro={isPro} featureName="Industry Benchmarks" compact>
              <BenchmarkComparison
                score={result.overallScore}
                platform={result.metadata.platform}
              />
            </ProGate>

            {/* Score summary table */}
            <div
              style={{
                width: '100%',
                padding: '20px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
              }}
            >
              {categoryEntries.map(([key, cat]) => (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
                    {key === 'structuredData' ? 'Schema' :
                     key === 'protocolReadiness' ? 'Protocols' :
                     key === 'aiDiscoverability' ? 'Discoverability' :
                     categoryLabel(key, result.vertical).split(' ').slice(0, 2).join(' ')}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13px',
                      color: cat.percentage >= 80 ? 'var(--success)' : cat.percentage >= 40 ? 'var(--warning)' : 'var(--danger)',
                    }}
                  >
                    {cat.score}/{cat.maxScore}
                  </span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px' }}>
                <span style={{ fontSize: '14px', fontFamily: 'var(--font-heading)', fontWeight: '600', color: 'var(--text-primary)' }}>
                  Total
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: '500',
                    fontSize: '14px',
                    color: gradeColor(result.grade),
                  }}
                >
                  {result.overallScore}/100
                </span>
              </div>
            </div>

            {/* Scan another */}
            <a
              href="/"
              style={{
                width: '100%',
                display: 'block',
                textAlign: 'center',
                padding: '12px',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                textDecoration: 'none',
                backgroundColor: 'var(--bg-surface)',
              }}
            >
              ← Scan another site
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
