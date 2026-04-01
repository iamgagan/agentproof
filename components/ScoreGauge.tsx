// components/ScoreGauge.tsx
import { gradeColor, scoreColor } from '@/lib/utils';

interface ScoreGaugeProps {
  score: number;        // 0-100
  grade: string;        // A-F
  gradeLabel: string;
  size?: number;        // default 200
}

export default function ScoreGauge({
  score,
  grade,
  gradeLabel,
  size = 200,
}: ScoreGaugeProps) {
  const color = scoreColor(score);
  const gColor = gradeColor(grade);
  const percentage = Math.min(100, Math.max(0, score));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      {/* Large mono score in sunken panel */}
      <div
        className="win-sunken"
        style={{
          width: size,
          padding: '16px 8px',
          background: '#FFF',
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 'bold',
            fontSize: `${Math.max(32, size * 0.22)}px`,
            color: color,
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}
        >
          {score}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: `${Math.max(12, size * 0.08)}px`,
            color: '#808080',
            marginLeft: '4px',
          }}
        >
          / 100
        </span>
      </div>

      {/* Win98 progress bar */}
      <div
        className="win-progress"
        style={{ width: size, height: '20px' }}
      >
        <div
          className="win-progress-bar"
          style={{
            width: `${percentage}%`,
            background: color === '#008000' || color === 'var(--success)'
              ? '#008000'
              : color === '#FF0000' || color === 'var(--danger)'
                ? '#FF0000'
                : '#000080',
          }}
        />
      </div>

      {/* Grade badge in raised panel */}
      <div
        className="win-raised"
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '8px 20px',
          background: '#C0C0C0',
          gap: '2px',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 'bold',
            fontSize: '36px',
            color: gColor,
            lineHeight: 1,
          }}
        >
          {grade}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            color: '#808080',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          {gradeLabel}
        </span>
      </div>
    </div>
  );
}
