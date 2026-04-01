'use client';

import { useState } from 'react';
import type { CategoryResult } from '@/lib/types';
import { categoryLabel, categoryDescription } from '@/lib/utils';

interface CategoryCardProps {
  categoryKey: string;
  result: CategoryResult;
}

export default function CategoryCard({ categoryKey, result }: CategoryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const percentage = result.percentage;
  const color =
    percentage >= 80 ? '#008000' :
    percentage >= 40 ? '#808000' :
    '#FF0000';

  return (
    <div
      data-testid={`category-card-${categoryKey}`}
      style={{ marginBottom: '2px' }}
    >
      {/* Tree view row */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '2px 4px',
          cursor: 'pointer',
          background: expanded ? '#000080' : 'transparent',
          color: expanded ? '#FFFFFF' : '#000000',
          fontFamily: 'var(--font-body)',
          fontSize: '11px',
        }}
      >
        {/* Tree toggle */}
        {result.issues.length > 0 ? (
          <span className="win-tree-toggle" style={{
            color: '#000000',
            background: '#FFFFFF',
          }}>
            {expanded ? '-' : '+'}
          </span>
        ) : (
          <span style={{ width: '9px', display: 'inline-block' }} />
        )}

        {/* Category icon */}
        <span style={{ fontFamily: 'var(--font-mono)', width: '16px', textAlign: 'center' }}>
          &#128196;
        </span>

        {/* Name */}
        <span style={{ fontWeight: 700, flex: '1' }}>
          {categoryLabel(categoryKey)}
        </span>

        {/* Score */}
        <span style={{
          fontFamily: 'var(--font-mono)',
          color: expanded ? '#FFFFFF' : color,
          fontWeight: 700,
        }}>
          {result.score}/{result.maxScore}
        </span>

        {/* Percentage */}
        <span style={{
          fontFamily: 'var(--font-mono)',
          color: expanded ? '#C0C0C0' : 'var(--text-muted)',
          width: '40px',
          textAlign: 'right',
        }}>
          {percentage}%
        </span>
      </div>

      {/* Win98 progress bar (mini) */}
      <div style={{ marginLeft: '29px', marginTop: '1px', marginBottom: '2px' }}>
        <div style={{
          border: '1px solid var(--win-shadow)',
          height: '10px',
          background: '#FFFFFF',
          padding: '1px',
        }}>
          <div style={{
            height: '100%',
            width: `${percentage}%`,
            background: color === '#008000'
              ? 'repeating-linear-gradient(90deg, #008000 0px, #008000 6px, transparent 6px, transparent 8px)'
              : color === '#808000'
              ? 'repeating-linear-gradient(90deg, #808000 0px, #808000 6px, transparent 6px, transparent 8px)'
              : 'repeating-linear-gradient(90deg, #FF0000 0px, #FF0000 6px, transparent 6px, transparent 8px)',
          }} />
        </div>
      </div>

      {/* Expanded issues */}
      {expanded && result.issues.length > 0 && (
        <div style={{
          marginLeft: '29px',
          borderLeft: '1px dotted var(--win-shadow)',
          paddingLeft: '8px',
        }}>
          {result.issues.map((issue) => (
            <div
              key={issue.id}
              className="win-sunken"
              style={{
                padding: '6px 8px',
                background: '#FFFFFF',
                marginBottom: '4px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <span style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  padding: '0 4px',
                  background: issue.severity === 'critical' ? '#FF0000' : issue.severity === 'warning' ? '#808000' : '#808080',
                  color: '#FFFFFF',
                  textTransform: 'uppercase',
                }}>
                  {issue.severity}
                </span>
                <span style={{ fontWeight: 700, fontSize: '11px' }}>
                  {issue.title}
                </span>
              </div>
              <p style={{ fontSize: '11px', lineHeight: 1.4, marginBottom: '4px' }}>
                {issue.description}
              </p>
              <div style={{
                fontSize: '11px',
                color: '#000080',
                padding: '4px 6px',
                background: '#F0F0FF',
                border: '1px solid #C0C0E0',
              }}>
                <strong>Fix:</strong> {issue.fix}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
