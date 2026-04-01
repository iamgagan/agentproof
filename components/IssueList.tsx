import type { Issue } from '@/lib/types';
import { categoryLabel } from '@/lib/utils';

interface IssueListProps {
  issues: Issue[];
}

export default function IssueList({ issues }: IssueListProps) {
  if (issues.length === 0) {
    return (
      <div className="win-sunken" style={{ padding: '12px', textAlign: 'center', background: '#FFFFFF', fontSize: '11px' }}>
        <span style={{ color: '#008000', fontWeight: 700 }}>OK</span> - No critical issues found
      </div>
    );
  }

  return (
    <div className="win-listview" data-testid="issue-list">
      {/* Header */}
      <div className="win-listview-header">
        <div className="win-listview-header-cell" style={{ width: '28px' }}>#</div>
        <div className="win-listview-header-cell" style={{ width: '65px' }}>Severity</div>
        <div className="win-listview-header-cell" style={{ width: '100px' }}>Category</div>
        <div className="win-listview-header-cell" style={{ flex: 1 }}>Issue</div>
        <div className="win-listview-header-cell" style={{ width: '50px' }}>Pts Lost</div>
      </div>

      {issues.map((issue, i) => (
        <div key={issue.id}>
          {/* Main row */}
          <div className="win-listview-row" style={{ cursor: 'default' }}>
            <div className="win-listview-cell" style={{ width: '28px' }}>{i + 1}</div>
            <div className="win-listview-cell" style={{ width: '65px' }}>
              <span style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                padding: '0 3px',
                background:
                  issue.severity === 'critical' ? '#FF0000' :
                  issue.severity === 'warning' ? '#808000' :
                  '#808080',
                color: '#FFFFFF',
                textTransform: 'uppercase',
              }}>
                {issue.severity}
              </span>
            </div>
            <div className="win-listview-cell" style={{ width: '100px', fontSize: '10px' }}>
              {categoryLabel(issue.category)}
            </div>
            <div className="win-listview-cell" style={{ flex: 1 }}>
              <strong>{issue.title}</strong>
            </div>
            <div className="win-listview-cell" style={{
              width: '50px',
              color: '#FF0000',
              fontFamily: 'var(--font-mono)',
              textAlign: 'right',
            }}>
              {issue.pointsLost > 0 ? `-${issue.pointsLost}` : '-'}
            </div>
          </div>
          {/* Detail sub-row */}
          <div style={{
            padding: '2px 8px 4px 28px',
            background: '#FFFFFF',
            borderBottom: '1px solid var(--win-light)',
            fontSize: '11px',
          }}>
            <span style={{ color: '#000000' }}>{issue.impact}</span>
            <br />
            <span style={{ color: '#000080' }}>-&gt; {issue.fix}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
