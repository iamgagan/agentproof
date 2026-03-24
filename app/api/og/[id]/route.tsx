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

function getCategoryLabel(key: string): string {
  switch (key) {
    case 'structuredData': return 'Schema';
    case 'productQuality': return 'Product Data';
    case 'protocolReadiness': return 'Protocols';
    case 'merchantSignals': return 'Merchant';
    default: return 'Discoverability';
  }
}

function getBarColor(pct: number): string {
  if (pct >= 80) return '#22C55E';
  if (pct >= 40) return '#EAB308';
  return '#EF4444';
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

  let domain = 'unknown';
  try { domain = new URL(result.normalizedUrl).hostname; } catch { /* fallback */ }
  const gColor = resolveGradeColor(result.grade);
  const categories = Object.entries(result.categories);

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0A0A0F',
          padding: '60px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: '44px' }}>
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
              marginRight: '12px',
            }}
          >
            AP
          </div>
          <div style={{ display: 'flex', color: '#94A3B8', fontSize: '18px' }}>
            AgentProof
          </div>
        </div>

        {/* Body: grade block + right column */}
        <div style={{ display: 'flex', flexDirection: 'row', flex: 1, alignItems: 'center', gap: '60px' }}>

          {/* Left: grade + score */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '180px' }}>
            <div style={{ display: 'flex', fontSize: '120px', fontWeight: '700', color: gColor, lineHeight: '1', letterSpacing: '-4px' }}>
              {result.grade}
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', gap: '4px' }}>
              <div style={{ display: 'flex', fontSize: '48px', fontWeight: '700', color: gColor, letterSpacing: '-1px' }}>
                {`${result.overallScore}`}
              </div>
              <div style={{ display: 'flex', fontSize: '28px', color: '#64748B' }}>
                /100
              </div>
            </div>
            <div style={{ display: 'flex', fontSize: '18px', color: '#94A3B8' }}>
              {result.gradeLabel}
            </div>
          </div>

          {/* Right: domain + bars */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '18px' }}>

            {/* Domain heading */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '4px' }}>
              <div style={{ display: 'flex', fontSize: '16px', color: '#64748B' }}>
                Agent Readiness Score for
              </div>
              <div style={{ display: 'flex', fontSize: '32px', fontWeight: '700', color: '#F8FAFC', letterSpacing: '-1px' }}>
                {domain}
              </div>
            </div>

            {/* Category bars */}
            {categories.map(([key, cat]) => (
              <div key={key} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', fontSize: '13px', color: '#64748B', width: '110px' }}>
                  {getCategoryLabel(key)}
                </div>
                <div style={{ display: 'flex', flex: 1, height: '6px', backgroundColor: '#1E293B', borderRadius: '3px' }}>
                  <div
                    style={{
                      display: 'flex',
                      height: '6px',
                      width: `${cat.percentage}%`,
                      backgroundColor: getBarColor(cat.percentage),
                      borderRadius: '3px',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', fontSize: '13px', color: '#94A3B8', width: '44px', justifyContent: 'flex-end' }}>
                  {`${cat.score}/${cat.maxScore}`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', marginTop: '28px', fontSize: '14px', color: '#64748B' }}>
          agentproof.com
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
