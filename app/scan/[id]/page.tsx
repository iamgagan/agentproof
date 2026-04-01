// app/scan/[id]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScoreGauge from '@/components/ScoreGauge';
import CategoryCard from '@/components/CategoryCard';
import IssueList from '@/components/IssueList';
import ShareBanner from '@/components/ShareBanner';
import ProGate from '@/components/ProGate';
import FixPanel from '@/components/FixPanel';
import { getScanResult } from '@/lib/kv';
import { formatScanTime } from '@/lib/utils';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const result = await getScanResult(id);
  if (!result) return { title: 'Scan not found - AgentProof' };

  let domain = 'unknown';
  try { domain = new URL(result.normalizedUrl).hostname; } catch { /* fallback */ }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://agentproof.com';

  return {
    title: `${domain} scored ${result.overallScore}/100 - AgentProof`,
    description: `Agent Readiness Score for ${domain}: ${result.overallScore}/100 (Grade ${result.grade} - ${result.gradeLabel}). See what AI shopping agents can and can't see.`,
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

  let domain = 'unknown';
  try { domain = new URL(result.normalizedUrl).hostname; } catch { /* fallback */ }
  const categoryEntries = Object.entries(result.categories);

  return (
    <div className="win-window" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      <main style={{ flex: 1, background: 'var(--win-face)', padding: '8px 12px' }}>
        {/* Page header */}
        <div data-testid="results-header" style={{ marginBottom: '8px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px' }}>
            Agent Readiness Report
          </p>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: '16px',
            color: '#000000',
            marginBottom: '4px',
          }}>
            {domain}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {result.metadata.platform && (
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                background: '#000080',
                color: '#FFFFFF',
                padding: '1px 6px',
                textTransform: 'capitalize',
              }}>
                {result.metadata.platform}
              </span>
            )}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
              Scanned in {formatScanTime(result.metadata.totalRequestsTime)}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
              {new Date(result.timestamp).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div
          className="results-grid"
          style={{
            display: 'grid',
            gap: '8px',
            alignItems: 'start',
          }}
        >
          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Category tree view */}
            <div className="win-window">
              <div className="win-title-bar">
                <span>Category Breakdown</span>
                <div className="win-title-buttons">
                  <button className="win-title-btn">_</button>
                  <button className="win-title-btn">&#9633;</button>
                  <button className="win-title-btn" style={{ fontWeight: 700 }}>X</button>
                </div>
              </div>
              <div className="win-body-white" data-testid="categories-section" style={{ padding: '4px' }}>
                {categoryEntries.map(([key, cat]) => (
                  <CategoryCard key={key} categoryKey={key} result={cat} />
                ))}
              </div>
            </div>

            {/* Top Issues */}
            <div className="win-window">
              <div className="win-title-bar">
                <span>Top Issues to Fix</span>
                <div className="win-title-buttons">
                  <button className="win-title-btn">_</button>
                  <button className="win-title-btn">&#9633;</button>
                  <button className="win-title-btn" style={{ fontWeight: 700 }}>X</button>
                </div>
              </div>
              <div className="win-body" data-testid="issues-section" style={{ padding: '4px' }}>
                <IssueList issues={result.topIssues} />
              </div>
            </div>

            {/* Auto-fix panel (Pro) */}
            <div className="win-window">
              <div className="win-title-bar" style={{ background: 'linear-gradient(90deg, #800080, #C060C0)' }}>
                <span>Auto-Generated Fixes [PRO]</span>
                <div className="win-title-buttons">
                  <button className="win-title-btn">_</button>
                  <button className="win-title-btn">&#9633;</button>
                  <button className="win-title-btn" style={{ fontWeight: 700 }}>X</button>
                </div>
              </div>
              <div className="win-body" style={{ padding: '4px' }}>
                <ProGate label="Auto-Fix Generation">
                  <FixPanel scanId={result.id} />
                </ProGate>
              </div>
            </div>

            <ShareBanner
              score={result.overallScore}
              grade={result.grade}
              url={result.url}
              scanId={result.id}
            />

            {/* Scan errors */}
            {result.metadata.errors.length > 0 && (
              <div className="win-window">
                <div className="win-title-bar" style={{ background: 'linear-gradient(90deg, #800000, #C06060)' }}>
                  <span>Scan Warnings</span>
                  <div className="win-title-buttons">
                    <button className="win-title-btn" style={{ fontWeight: 700 }}>X</button>
                  </div>
                </div>
                <div className="win-body" style={{ padding: '6px' }}>
                  {result.metadata.errors.map((e, i) => (
                    <p key={i} style={{ fontSize: '11px', color: '#FF0000' }}>
                      ! {e}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar - sticky score */}
          <div style={{
            position: 'sticky',
            top: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            {/* Score window */}
            <div className="win-window">
              <div className="win-title-bar">
                <span>Score</span>
                <div className="win-title-buttons">
                  <button className="win-title-btn">_</button>
                  <button className="win-title-btn">&#9633;</button>
                  <button className="win-title-btn" style={{ fontWeight: 700 }}>X</button>
                </div>
              </div>
              <div className="win-body" style={{ display: 'flex', justifyContent: 'center', padding: '12px' }}>
                <ScoreGauge
                  score={result.overallScore}
                  grade={result.grade}
                  gradeLabel={result.gradeLabel}
                  size={220}
                />
              </div>
            </div>

            {/* Score summary table */}
            <div className="win-window">
              <div className="win-title-bar">
                <span>Summary</span>
                <div className="win-title-buttons">
                  <button className="win-title-btn">_</button>
                  <button className="win-title-btn">&#9633;</button>
                  <button className="win-title-btn" style={{ fontWeight: 700 }}>X</button>
                </div>
              </div>
              <div className="win-body-white" style={{ padding: '4px' }}>
                {categoryEntries.map(([key, cat]) => (
                  <div
                    key={key}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '2px 4px',
                      borderBottom: '1px solid var(--win-light)',
                      fontSize: '11px',
                    }}
                  >
                    <span>
                      {key === 'structuredData' ? 'Schema' :
                       key === 'productQuality' ? 'Product Data' :
                       key === 'protocolReadiness' ? 'Protocols' :
                       key === 'merchantSignals' ? 'Merchant' :
                       'Discoverability'}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      color: cat.percentage >= 80 ? '#008000' : cat.percentage >= 40 ? '#808000' : '#FF0000',
                      fontWeight: 700,
                    }}>
                      {cat.score}/{cat.maxScore}
                    </span>
                  </div>
                ))}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '4px 4px 2px',
                  fontWeight: 700,
                  fontSize: '11px',
                }}>
                  <span>Total</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>
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
                color: '#000000',
                padding: '6px',
              }}
            >
              &lt;- Scan another store
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
