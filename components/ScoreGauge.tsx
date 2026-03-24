// components/ScoreGauge.tsx
import { gradeColor, scoreColor } from '@/lib/utils';

interface ScoreGaugeProps {
  score: number;        // 0–100
  grade: string;        // A–F
  gradeLabel: string;
  size?: number;        // default 200
}

export default function ScoreGauge({
  score,
  grade,
  gradeLabel,
  size = 200,
}: ScoreGaugeProps) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius; // 282.74
  const offset = circumference - (score / 100) * circumference;
  const color = scoreColor(score);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Background track */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth={8}
          />
          {/* Score arc */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="gauge-arc"
            style={{ '--gauge-offset': offset } as React.CSSProperties}
          />
        </svg>

        {/* Center content */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: '700',
              fontSize: `${size * 0.22}px`,
              color: color,
              lineHeight: '1',
              letterSpacing: '-0.04em',
            }}
          >
            {score}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: `${size * 0.08}px`,
              color: 'var(--text-muted)',
              marginTop: '4px',
            }}
          >
            / 100
          </span>
        </div>
      </div>

      {/* Grade badge */}
      <div
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: '700',
            fontSize: '48px',
            color: gradeColor(grade),
            lineHeight: '1',
            letterSpacing: '-0.04em',
          }}
        >
          {grade}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--text-muted)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {gradeLabel}
        </span>
      </div>
    </div>
  );
}
