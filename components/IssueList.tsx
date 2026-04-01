import type { Issue } from '@/lib/types';
import { categoryLabel } from '@/lib/utils';

interface IssueListProps {
  issues: Issue[];
}

export default function IssueList({ issues }: IssueListProps) {
  if (issues.length === 0) {
    return (
      <div className="win-sunken" style={{ padding: '16px', textAlign: 'center', background: '#FFFFFF' }}>
        <span style={{ fontFamily: 'MS Sans Serif, Tahoma, sans-serif', fontSize: '12px', color: '#008000' }}>
          OK &mdash; No critical issues found
        </span>
      </div>
    );
  }

  const severityConfig = {
    critical: { label: 'CRITICAL', color: '#FFFFFF', bg: '#FF0000' },
    warning:  { label: 'WARNING',  color: '#000000', bg: '#FFFF00' },
    info:     { label: 'INFO',     color: '#000000', bg: '#C0C0C0' },
  };

  return (
    <div className="win-listview" style={{ width: '100%' }}>
      {/* Header row */}
      <div className="win-listview-header">
        <div className="win-listview-header-cell" style={{ width: '36px', textAlign: 'center' }}>#</div>
        <div className="win-listview-header-cell" style={{ width: '80px' }}>Severity</div>
        <div className="win-listview-header-cell" style={{ width: '160px' }}>Category</div>
        <div className="win-listview-header-cell" style={{ flex: 1 }}>Issue</div>
        <div className="win-listview-header-cell" style={{ width: '64px', textAlign: 'right' }}>Pts Lost</div>
      </div>

      {/* Issue rows */}
      {issues.map((issue, i) => {
        const cfg = severityConfig[issue.severity];
        return (
          <div key={issue.id}>
            {/* Main row */}
            <div className="win-listview-row">
              <div className="win-listview-cell" style={{ width: '36px', textAlign: 'center' }}>
                {i + 1}
              </div>
              <div className="win-listview-cell" style={{ width: '80px' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '1px 4px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  fontFamily: 'MS Sans Serif, Tahoma, sans-serif',
                  color: cfg.color,
                  backgroundColor: cfg.bg,
                  border: '1px solid #808080',
                  textTransform: 'uppercase' as const,
                }}>
                  {cfg.label}
                </span>
              </div>
              <div className="win-listview-cell" style={{ width: '160px' }}>
                {categoryLabel(issue.category)}
              </div>
              <div className="win-listview-cell" style={{ flex: 1, fontWeight: 'bold' }}>
                {issue.title}
              </div>
              <div className="win-listview-cell" style={{ width: '64px', textAlign: 'right', color: '#FF0000' }}>
                {issue.pointsLost > 0 ? `−${issue.pointsLost}` : '0'}
              </div>
            </div>

            {/* Detail sub-row */}
            <div style={{
              padding: '6px 8px 8px 44px',
              borderBottom: '1px solid #C0C0C0',
              backgroundColor: '#FFFFFF',
              fontFamily: 'MS Sans Serif, Tahoma, sans-serif',
              fontSize: '11px',
              lineHeight: '1.5',
            }}>
              <div style={{ color: '#000080', marginBottom: '2px' }}>
                <strong>Impact:</strong> {issue.impact}
              </div>
              <div style={{ color: '#008000' }}>
                <strong>Fix:</strong> {issue.fix}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
