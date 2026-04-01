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
    <div className="win-window" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      <main className="win-face" style={{ flex: 1, padding: '8px 12px' }}>
        {/* Page header */}
        <div style={{ marginBottom: '12px', textAlign: 'center' }}>
          <h1 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>
            {domain}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {result.vertical && (
              <span style={{ fontSize: '11px' }}>
                {VERTICAL_LABELS[result.vertical] ?? 'Business'}
              </span>
            )}
            {result.metadata.platform && (
              <span style={{
                fontSize: '11px',
                color: '#fff',
                backgroundColor: 'navy',
                padding: '1px 6px',
                textTransform: 'capitalize',
              }}>
                {result.metadata.platform}
              </span>
            )}
            <span style={{ fontSize: '11px' }}>
              Scanned in {formatScanTime(result.metadata.totalRequestsTime)}
            </span>
            <span style={{ fontSize: '11px' }}>
              {new Date(result.timestamp).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Mega-brand context note */}
        {isMegaBrand && (
          <div className="win-sunken" style={{ padding: '8px', marginBottom: '8px', fontSize: '12px' }}>
            <strong>Note:</strong> {domain} may still appear in AI agent responses due to massive brand recognition in training data and direct partnerships with AI platforms. This score measures <em>technical readiness</em> — the structured data, protocols, and crawler access that smaller brands need to be discoverable. Major retailers can afford low technical readiness; most brands cannot.
          </div>
        )}

        <div className="results-grid" style={{ display: 'grid', gap: '8px', alignItems: 'start' }}>
          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* AI Agent Simulation */}
            {result.agentSimulation && (
              <AgentSimulation simulation={result.agentSimulation} />
            )}

            {/* Category cards */}
            <div className="win-window">
              <div className="win-title-bar">
                <span className="win-title-text">Category Breakdown</span>
              </div>
              <div className="win-body" style={{ padding: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {categoryEntries.map(([key, cat]) => (
                    <CategoryCard key={key} categoryKey={key} result={cat} vertical={result.vertical} />
                  ))}
                </div>
              </div>
            </div>

            {/* Top Issues */}
            <div className="win-window">
              <div className="win-title-bar">
                <span className="win-title-text">Top Issues to Fix</span>
              </div>
              <div className="win-body" style={{ padding: '8px' }}>
                <IssueList issues={result.topIssues} />
              </div>
            </div>

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
              <div className="win-window">
                <div className="win-title-bar" style={{ backgroundColor: '#c00000' }}>
                  <span className="win-title-text">Scan Warnings</span>
                </div>
                <div className="win-body" style={{ padding: '8px' }}>
                  {result.metadata.errors.map((e, i) => (
                    <p key={i} style={{ fontSize: '12px', color: '#c00000', margin: '2px 0' }}>
                      {'\u2022'} {e}
                    </p>
                  ))}
                </div>
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
          <div style={{ position: 'sticky', top: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Score */}
            <div className="win-window">
              <div className="win-title-bar">
                <span className="win-title-text">Score</span>
              </div>
              <div className="win-body" style={{ padding: '12px', display: 'flex', justifyContent: 'center' }}>
                <ScoreGauge
                  score={result.overallScore}
                  grade={result.grade}
                  gradeLabel={result.gradeLabel}
                  size={200}
                />
              </div>
            </div>

            {/* Benchmark Comparison (Pro) */}
            <ProGate isPro={isPro} featureName="Industry Benchmarks" compact>
              <BenchmarkComparison
                score={result.overallScore}
                platform={result.metadata.platform}
              />
            </ProGate>

            {/* Score summary table */}
            <div className="win-window">
              <div className="win-body-white" style={{ padding: '8px' }}>
                {categoryEntries.map(([key, cat]) => (
                  <div
                    key={key}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '4px 0',
                      borderBottom: '1px solid #c0c0c0',
                      fontSize: '12px',
                    }}
                  >
                    <span>
                      {key === 'structuredData' ? 'Schema' :
                       key === 'protocolReadiness' ? 'Protocols' :
                       key === 'aiDiscoverability' ? 'Discoverability' :
                       categoryLabel(key, result.vertical).split(' ').slice(0, 2).join(' ')}
                    </span>
                    <span style={{
                      fontWeight: 700,
                      color: cat.percentage >= 80 ? '#008000' : cat.percentage >= 40 ? '#808000' : '#c00000',
                    }}>
                      {cat.score}/{cat.maxScore}
                    </span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '6px', fontSize: '13px', fontWeight: 700 }}>
                  <span>Total</span>
                  <span style={{ color: gradeColor(result.grade) }}>
                    {result.overallScore}/100
                  </span>
                </div>
              </div>
            </div>

            {/* Scan another */}
            <a
              href="/"
              className="win-btn"
              style={{
                display: 'block',
                textAlign: 'center',
                textDecoration: 'none',
                color: '#000',
                fontSize: '12px',
                padding: '6px 12px',
              }}
            >
              Scan another site
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
