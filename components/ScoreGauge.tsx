// components/ScoreGauge.tsx

interface ScoreGaugeProps {
  score: number;
  grade: string;
  gradeLabel: string;
  size?: number;
}

export default function ScoreGauge({
  score,
  grade,
  gradeLabel,
}: ScoreGaugeProps) {
  const percentage = score;
  const gradeColorValue =
    grade === 'A' ? '#008000' :
    grade === 'B' ? '#000080' :
    grade === 'C' ? '#808000' :
    grade === 'D' ? '#FF8000' :
    '#FF0000';

  return (
    <div data-testid="score-gauge" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      {/* Large score display */}
      <div className="win-sunken" style={{
        background: '#FFFFFF',
        padding: '16px 24px',
        textAlign: 'center',
        minWidth: '160px',
      }}>
        <div
          data-testid="score-value"
          style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            fontSize: '48px',
            color: gradeColorValue,
            lineHeight: 1,
          }}
        >
          {score}
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          marginTop: '2px',
        }}>
          / 100
        </div>
      </div>

      {/* Win98 progress bar */}
      <div style={{ width: '100%' }}>
        <div style={{ fontSize: '11px', marginBottom: '2px', textAlign: 'center' }}>
          Agent Readiness:
        </div>
        <div className="win-progress" style={{ width: '100%' }}>
          <div
            className="win-progress-bar"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Grade badge */}
      <div className="win-raised" style={{
        padding: '6px 16px',
        textAlign: 'center',
        background: 'var(--win-face)',
      }}>
        <span
          data-testid="grade-value"
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: '28px',
            color: gradeColorValue,
            lineHeight: 1,
          }}
        >
          {grade}
        </span>
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: '10px',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          {gradeLabel}
        </div>
      </div>
    </div>
  );
}
