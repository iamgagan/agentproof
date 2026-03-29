'use client';

import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface SplitTextProps {
  children: string;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  staggerDelay?: number;
  duration?: number;
  /** Render a custom element for a specific word (e.g. italic serif) */
  renderWord?: (word: string, index: number) => ReactNode;
}

export default function SplitText({
  children,
  className,
  style,
  delay = 0,
  staggerDelay = 0.08,
  duration = 0.6,
  renderWord,
}: SplitTextProps) {
  const words = children.split(' ');

  return (
    <span className={className} style={{ ...style, display: 'inline' }}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration,
            delay: delay + i * staggerDelay,
            ease: 'easeOut',
          }}
          style={{ display: 'inline-block', marginRight: '0.3em' }}
        >
          {renderWord ? renderWord(word, i) : word}
        </motion.span>
      ))}
    </span>
  );
}
