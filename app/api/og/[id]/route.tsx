// app/api/og/[id]/route.tsx
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getScanResult } from '@/lib/kv';

// nodejs runtime required — lib/kv.ts uses dynamic import incompatible with edge
export const runtime = 'nodejs';

// Resolve grade to a literal hex color (gradeColor() returns CSS vars unusable in ImageResponse)
function resolveGradeColor(grade: string): string {
  switch (grade) {
    case 'A': return '#22C55E';
    case 'B': return '#86EFAC';
    case 'C': return '#EAB308';
    case 'D': return '#FB923C';
    case 'F': return '#EF4444';
    default:  return '#64748B';
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await getScanResult(id);

  if (!result) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0A0A0F',
            color: '#94A3B8',
            fontFamily: 'sans-serif',
            fontSize: '24px',
          }}
        >
          Scan not found
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  const domain = new URL(result.normalizedUrl).hostname;
  const gColor = resolveGradeColor(result.grade);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0A0A0F',
          padding: '64px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Background gradient */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'radial-gradient(ellipse at top left, rgba(0,229,204,0.08) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(99,102,241,0.08) 0%, transparent 50%)',
          }}
        />

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #00E5CC, #6366F1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0A0A0F',
              fontWeight: '700',
              fontSize: '16px',
            }}
          >
            AP
          </div>
          <span style={{ color: '#94A3B8', fontSize: '18px' }}>AgentProof</span>
        </div>

        {/* Main content */}
        <div style={{ display: 'flex', flex: 1, gap: '64px', alignItems: 'center' }}>
          {/* Left: grade + score */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                fontSize: '120px',
                fontWeight: '700',
                color: gColor,
                lineHeight: '1',
                letterSpacing: '-0.04em',
              }}
            >
              {result.grade}
            </div>
            <div
              style={{
                fontSize: '48px',
                fontWeight: '700',
                color: gColor,
                letterSpacing: '-0.02em',
              }}
            >
              {result.overallScore}
              <span style={{ fontSize: '28px', color: '#64748B' }}>/100</span>
            </div>
            <div style={{ fontSize: '18px', color: '#94A3B8' }}>{result.gradeLabel}</div>
          </div>

          {/* Right: domain + category bars */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '20px' }}>
            <div>
              <div style={{ fontSize: '16px', color: '#64748B', marginBottom: '8px' }}>
                Agent Readiness Score for
              </div>
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#F8FAFC',
                  letterSpacing: '-0.02em',
                }}
              >
                {domain}
              </div>
            </div>

            {/* Category mini-bars */}
            {Object.entries(result.categories).map(([key, cat]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '13px', color: '#64748B', width: '110px', flexShrink: 0 }}>
                  {key === 'structuredData'
                    ? 'Schema'
                    : key === 'productQuality'
                    ? 'Product Data'
                    : key === 'protocolReadiness'
                    ? 'Protocols'
                    : key === 'merchantSignals'
                    ? 'Merchant'
                    : 'Discoverability'}
                </div>
                <div
                  style={{
                    flex: 1,
                    height: '6px',
                    backgroundColor: '#1E293B',
                    borderRadius: '3px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${cat.percentage}%`,
                      backgroundColor:
                        cat.percentage >= 80
                          ? '#22C55E'
                          : cat.percentage >= 40
                          ? '#EAB308'
                          : '#EF4444',
                      borderRadius: '3px',
                    }}
                  />
                </div>
                <div
                  style={{ fontSize: '13px', color: '#94A3B8', width: '40px', textAlign: 'right' }}
                >
                  {cat.score}/{cat.maxScore}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '32px', fontSize: '14px', color: '#64748B' }}>
          agentproof.com · Free AI Agent Readiness Scanner for Ecommerce
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
