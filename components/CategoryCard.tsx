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
  const color = percentage >= 80 ? '#008000' : percentage >= 40 ? '#808000' : '#FF0000';

  return (
    <div
      className="category-card win-window"
      style={{ marginBottom: '4px' }}
    >
      {/* Tree-view style header row */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          padding: '6px 8px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontFamily: 'var(--font-body)',
          fontSize: '11px',
          color: '#000',
        }}
      >
        {/* Tree toggle +/- */}
        {result.issues.length > 0 && (
          <span className="win-tree-toggle">
            {expanded ? '\u2212' : '+'}
          </span>
        )}
        {result.issues.length === 0 && (
          <span style={{ display: 'inline-block', width: '9px', marginRight: '4px' }} />
        )}

        {/* Category name */}
        <span style={{ flex: 1, fontWeight: 'bold' }}>
          {categoryLabel(categoryKey, vertical)}
        </span>

        {/* Score display */}
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 'bold',
            color: color,
            whiteSpace: 'nowrap',
          }}
        >
          {result.score}/{result.maxScore}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: '#808080',
            whiteSpace: 'nowrap',
            minWidth: '30px',
            textAlign: 'right',
          }}
        >
          {percentage}%
        </span>
      </button>

      {/* Description */}
      <div style={{ padding: '0 8px 4px 27px', fontSize: '11px', color: '#808080' }}>
        {categoryDescription(categoryKey, vertical)}
      </div>

      {/* Win98 progress bar */}
      <div style={{ padding: '2px 8px 8px' }}>
        <div className="win-progress" style={{ width: '100%' }}>
          <div
            className="win-progress-bar"
            style={{
              width: `${percentage}%`,
              background: color === '#008000'
                ? '#008000'
                : color === '#FF0000'
                  ? '#FF0000'
                  : '#000080',
            }}
          />
        </div>
      </div>

      {/* Issues count hint */}
      {!expanded && result.issues.length > 0 && (
        <div style={{ padding: '0 8px 6px 27px', fontSize: '11px', color: '#000080' }}>
          {result.issues.length} issue{result.issues.length > 1 ? 's' : ''} found
        </div>
      )}

      {/* Expanded issues with tree-view dotted connector lines */}
      {expanded && result.issues.length > 0 && (
        <div
          style={{
            borderTop: '1px solid #808080',
            padding: '6px 8px 6px 16px',
          }}
        >
          {result.issues.map((issue, idx) => {
            const isLast = idx === result.issues.length - 1;
            return (
              <div
                key={issue.id}
                style={{
                  display: 'flex',
                  gap: '0',
                  marginBottom: isLast ? 0 : '2px',
                }}
              >
                {/* Dotted connector line */}
                <div
                  style={{
                    width: '20px',
                    flexShrink: 0,
                    position: 'relative',
                  }}
                >
                  {/* Vertical dotted line */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '4px',
                      top: 0,
                      bottom: isLast ? '50%' : 0,
                      width: '0',
                      borderLeft: '1px dotted #808080',
                    }}
                  />
                  {/* Horizontal dotted connector */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '4px',
                      top: '9px',
                      width: '12px',
                      height: '0',
                      borderTop: '1px dotted #808080',
                    }}
                  />
                </div>

                {/* Issue content */}
                <div
                  className="win-sunken"
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    background: '#FFF',
                    marginBottom: '2px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    {/* Severity badge */}
                    <span
                      className="win-raised"
                      style={{
                        fontSize: '10px',
                        fontFamily: 'var(--font-mono)',
                        padding: '1px 6px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        color: issue.severity === 'critical'
                          ? '#FF0000'
                          : issue.severity === 'warning'
                            ? '#808000'
                            : '#808080',
                        background: issue.severity === 'critical'
                          ? '#FFC0C0'
                          : issue.severity === 'warning'
                            ? '#FFFFC0'
                            : '#C0C0C0',
                        fontWeight: 'bold',
                      }}
                    >
                      {issue.severity}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontWeight: 'bold',
                        fontSize: '11px',
                        color: '#000',
                      }}
                    >
                      {issue.title}
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#000', fontFamily: 'var(--font-body)', lineHeight: 1.5, marginBottom: '6px' }}>
                    {issue.description}
                  </p>
                  <div
                    className="win-groove"
                    style={{
                      fontSize: '11px',
                      color: '#000080',
                      fontFamily: 'var(--font-body)',
                      padding: '4px 8px',
                    }}
                  >
                    <strong>Fix:</strong> {issue.fix}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
