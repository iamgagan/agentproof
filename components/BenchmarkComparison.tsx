'use client';

import { useState, useEffect } from 'react';
import type { BenchmarkStats } from '@/lib/types';

interface Props {
  score: number;
  platform: string | null;
}

export default function BenchmarkComparison({ score, platform }: Props) {
  const [stats, setStats] = useState<BenchmarkStats | null>(null);

  useEffect(() => {
    fetch('/api/benchmarks')
      .then((r) => r.json())
      .then(setStats)
      .catch(() => { /* silent */ });
  }, []);

  if (!stats || stats.totalScanned < 2) return null;

  const platformAvg = platform
    ? stats.byPlatform.find((p) => p.platform === platform)?.avgScore ?? null
    : null;

  const percentile = stats.totalScanned > 0
    ? Math.round(
        (stats.scoreDistribution
          .filter((d) => {
            const low = parseInt(d.range.split('-')[0]);
            return low < score;
          })
          .reduce((s, d) => s + d.count, 0) / stats.totalScanned) * 100
      )
    : null;

  const bars = [
    { label: 'Your Score', value: score, color: score >= 60 ? 'var(--success)' : score >= 30 ? 'var(--warning)' : 'var(--danger)' },
    { label: 'Industry Avg', value: stats.averageScore, color: 'var(--accent-indigo)' },
    ...(platformAvg !== null ? [{ label: `${platform} Avg`, value: platformAvg, color: 'var(--accent-teal)' }] : []),
  ];

  return (
    <div style={{
      width: '100%',
      padding: '16px',
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
    }}>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
        vs. Industry
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
        {bars.map((bar) => (
          <div key={bar.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
                {bar.label}
              </span>
              <span style={{ fontSize: '11px', color: bar.color, fontFamily: 'var(--font-mono)', fontWeight: '600' }}>
                {bar.value}
              </span>
            </div>
            <div style={{ height: '6px', backgroundColor: 'var(--bg-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${bar.value}%`,
                backgroundColor: bar.color,
                borderRadius: '3px',
                transition: 'width 0.5s ease',
              }} />
            </div>
          </div>
        ))}
      </div>

      {percentile !== null && (
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
          Top {100 - percentile}% of {stats.totalScanned} scanned stores
        </p>
      )}
    </div>
  );
}
