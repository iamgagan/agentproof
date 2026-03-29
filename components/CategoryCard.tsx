'use client';

import { useState } from 'react';
import type { CategoryResult } from '@/lib/types';
import { categoryLabel, categoryDescription } from '@/lib/utils';

interface CategoryCardProps {
  categoryKey: string;
  result: CategoryResult;
  vertical?: string;
}

export default function CategoryCard({ categoryKey, result, vertical }: CategoryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const percentage = result.percentage;
  const color = percentage >= 80 ? 'var(--success)' : percentage >= 40 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div
      className="category-card"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        overflow: 'hidden',
      }}
    >
      {/* Card header — clickable to expand */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          padding: '24px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: '600',
                fontSize: '16px',
                color: 'var(--text-primary)',
                marginBottom: '4px',
              }}
            >
              {categoryLabel(categoryKey, vertical)}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
              {categoryDescription(categoryKey, vertical)}
            </p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '16px' }}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: '500',
                fontSize: '20px',
                color: color,
              }}
            >
              {result.score}
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/{result.maxScore}</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {percentage}%
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div
          style={{
            height: '4px',
            backgroundColor: 'var(--border)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${percentage}%`,
              backgroundColor: color,
              borderRadius: '4px',
              transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </div>

        {/* Expand toggle */}
        {result.issues.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--accent-teal)', fontFamily: 'var(--font-body)' }}>
              {expanded ? '▲ Hide' : `▼ Show ${result.issues.length} issue${result.issues.length > 1 ? 's' : ''}`}
            </span>
          </div>
        )}
      </button>

      {/* Expanded issues */}
      {expanded && result.issues.length > 0 && (
        <div
          style={{
            borderTop: '1px solid var(--border)',
            padding: '16px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {result.issues.map((issue) => (
            <div
              key={issue.id}
              style={{
                padding: '16px',
                backgroundColor: 'var(--bg-elevated)',
                borderRadius: '10px',
                borderLeft: `3px solid ${issue.severity === 'critical' ? 'var(--danger)' : issue.severity === 'warning' ? 'var(--warning)' : 'var(--text-muted)'}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: issue.severity === 'critical' ? 'rgba(239,68,68,0.15)' : issue.severity === 'warning' ? 'rgba(234,179,8,0.15)' : 'rgba(100,116,139,0.15)',
                    color: issue.severity === 'critical' ? 'var(--danger)' : issue.severity === 'warning' ? 'var(--warning)' : 'var(--text-muted)',
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.06em',
                  }}
                >
                  {issue.severity}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: '600',
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                  }}
                >
                  {issue.title}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', lineHeight: '1.6', marginBottom: '8px' }}>
                {issue.description}
              </p>
              <div
                style={{
                  fontSize: '13px',
                  color: 'var(--accent-teal)',
                  fontFamily: 'var(--font-body)',
                  padding: '8px 12px',
                  backgroundColor: 'rgba(0, 229, 204, 0.05)',
                  borderRadius: '6px',
                  border: '1px solid rgba(0, 229, 204, 0.1)',
                }}
              >
                <strong>Fix:</strong> {issue.fix}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
