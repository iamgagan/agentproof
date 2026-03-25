import type { Issue } from '@/lib/types';
import { categoryLabel } from '@/lib/utils';

interface IssueListProps {
  issues: Issue[];
}

export default function IssueList({ issues }: IssueListProps) {
  if (issues.length === 0) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: 'var(--success)', fontFamily: 'var(--font-body)' }}>
        ✓ No critical issues found
      </div>
    );
  }

  const severityConfig = {
    critical: { label: 'Critical', color: 'var(--danger)',      bg: 'rgba(239,68,68,0.1)' },
    warning:  { label: 'Warning',  color: 'var(--warning)',     bg: 'rgba(234,179,8,0.1)' },
    info:     { label: 'Info',     color: 'var(--text-muted)',  bg: 'rgba(100,116,139,0.1)' },
  };

  return (
    <ol data-testid="issue-list" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {issues.map((issue, i) => {
        const cfg = severityConfig[issue.severity];
        return (
          <li
            key={issue.id}
            style={{
              display: 'flex',
              gap: '16px',
              padding: '20px',
              backgroundColor: 'var(--bg-elevated)',
              borderRadius: '12px',
              border: '1px solid var(--border)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                color: 'var(--text-muted)',
                paddingTop: '2px',
                flexShrink: 0,
                width: '20px',
              }}
            >
              {i + 1}.
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: cfg.bg,
                    color: cfg.color,
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.06em',
                    flexShrink: 0,
                  }}
                >
                  {cfg.label}
                </span>
                <span
                  style={{
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {categoryLabel(issue.category)}
                </span>
                {issue.pointsLost > 0 && (
                  <span style={{ fontSize: '12px', color: 'var(--danger)', fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>
                    −{issue.pointsLost} pts
                  </span>
                )}
              </div>
              <h4
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: '600',
                  fontSize: '15px',
                  color: 'var(--text-primary)',
                  marginBottom: '6px',
                }}
              >
                {issue.title}
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', lineHeight: '1.6', marginBottom: '10px' }}>
                {issue.impact}
              </p>
              <div
                style={{
                  fontSize: '13px',
                  color: 'var(--accent-teal)',
                  fontFamily: 'var(--font-body)',
                  lineHeight: '1.5',
                }}
              >
                → {issue.fix}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
