'use client';

import type { AgentSimulationResult } from '@/lib/types';

interface Props {
  simulation: AgentSimulationResult;
}

export default function AgentSimulation({ simulation }: Props) {
  const { visibilityScore, sampleQueries, competitiveGaps, recommendations } = simulation;
  const scoreColor = visibilityScore >= 60 ? 'var(--success)' : visibilityScore >= 30 ? 'var(--warning)' : 'var(--danger)';

  return (
    <section style={{ marginBottom: '32px' }}>
      <div style={{
        padding: '24px',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: '600', fontSize: '18px', color: 'var(--text-primary)' }}>
            AI Agent Visibility
          </h2>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '24px',
            fontWeight: '700',
            color: scoreColor,
          }}>
            {visibilityScore}/100
          </div>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>
          How likely AI shopping agents are to surface your products for common consumer queries.
        </p>

        {/* Sample Queries */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
            Sample Shopping Queries
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sampleQueries.map((q, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '10px 12px',
                backgroundColor: 'var(--bg-elevated)',
                borderRadius: '8px',
                border: `1px solid ${q.wouldSurface ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
              }}>
                <span style={{
                  flexShrink: 0,
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  backgroundColor: q.wouldSurface ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                  color: q.wouldSurface ? 'var(--success)' : 'var(--danger)',
                }}>
                  {q.wouldSurface ? '\u2713' : '\u2717'}
                </span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    &quot;{q.query}&quot;
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    {q.reason}
                  </p>
                </div>
                <span style={{
                  flexShrink: 0,
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-muted)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: 'var(--bg-primary)',
                }}>
                  {q.confidence}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Competitive Gaps */}
        {competitiveGaps.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: '600', color: 'var(--danger)', marginBottom: '8px' }}>
              Competitive Gaps
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {competitiveGaps.map((gap, i) => (
                <li key={i} style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', paddingLeft: '16px', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0, color: 'var(--danger)' }}>•</span>
                  {gap}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: '600', color: 'var(--accent-teal)', marginBottom: '8px' }}>
              Recommendations
            </h3>
            <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px', counterReset: 'rec' }}>
              {recommendations.map((rec, i) => (
                <li key={i} style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', paddingLeft: '24px', position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: 0,
                    fontFamily: 'var(--font-mono)', fontSize: '10px',
                    color: 'var(--accent-teal)',
                    backgroundColor: 'rgba(0,229,204,0.1)',
                    borderRadius: '4px', padding: '1px 5px',
                  }}>
                    {i + 1}
                  </span>
                  {rec}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}
