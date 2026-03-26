// app/scan/[id]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScoreGauge from '@/components/ScoreGauge';
import CategoryCard from '@/components/CategoryCard';
import IssueList from '@/components/IssueList';
import ShareBanner from '@/components/ShareBanner';
import WaitlistForm from '@/components/WaitlistForm';
import ProGate from '@/components/ProGate';
import FixPanel from '@/components/FixPanel';
import { getScanResult } from '@/lib/kv';
import { formatScanTime, gradeColor } from '@/lib/utils';

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
    description: `Agent Readiness Score for ${domain}: ${result.overallScore}/100 (Grade ${result.grade} — ${result.gradeLabel}). See what AI shopping agents can and can't see.`,
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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      <main style={{ flex: 1, padding: '48px 24px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        {/* Page header */}
        <div data-testid="results-header" style={{ marginBottom: '48px', textAlign: 'center' }}>
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
            {/* Category cards */}
            <section data-testid="categories-section">
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
                  <CategoryCard key={key} categoryKey={key} result={cat} />
                ))}
              </div>
            </section>

            {/* Top Issues */}
            <section data-testid="issues-section">
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

            {/* Auto-fix panel (Pro) */}
            <div>
              <h2 style={{
                fontFamily: 'var(--font-heading)', fontWeight: '700',
                fontSize: '20px', color: 'var(--text-primary)', marginBottom: '16px',
              }}>
                Auto-Generated Fixes
                <span style={{
                  marginLeft: '8px', padding: '2px 8px',
                  backgroundColor: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.4)',
                  borderRadius: '100px', fontSize: '11px',
                  fontFamily: 'var(--font-mono)', color: '#818CF8',
                }}>PRO</span>
              </h2>
              <ProGate label="Auto-Fix Generation">
                <FixPanel scanId={result.id} />
              </ProGate>
            </div>

            <ShareBanner
              score={result.overallScore}
              grade={result.grade}
              url={result.url}
              scanId={result.id}
            />

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
              size={220}
            />

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
                     key === 'productQuality' ? 'Product Data' :
                     key === 'protocolReadiness' ? 'Protocols' :
                     key === 'merchantSignals' ? 'Merchant' :
                     'Discoverability'}
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
              ← Scan another store
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
