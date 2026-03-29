'use client';

import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface AnimatedSectionProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function FadeInUp({ children, delay = 0, style }: AnimatedSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({ children, style }: AnimatedSectionProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: { staggerChildren: 0.1, delayChildren: 0.1 },
        },
      }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, style }: AnimatedSectionProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
      }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

export function GlowCard({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <motion.div
      whileHover={{
        borderColor: 'rgba(0, 229, 204, 0.3)',
        boxShadow: '0 0 30px rgba(0, 229, 204, 0.06)',
      }}
      transition={{ duration: 0.25 }}
      style={{
        padding: '28px 24px',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        transition: 'all 0.3s ease',
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}
