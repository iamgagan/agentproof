'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import Navbar from './Navbar';
import { FadeInUp } from './AnimatedSection';

const CATEGORY_COLORS: Record<string, string> = {
  Guide: '#00E5CC',
  'Deep Dive': '#6366F1',
  Strategy: '#EAB308',
  Comparison: '#F472B6',
};

interface Post {
  title: string;
  subtitle: string;
  category: string;
  readTime: string;
  date: string;
  content: string;
}

export default function BlogPostLayout({ post, children }: { post: Post; children: ReactNode }) {
  const catColor = CATEGORY_COLORS[post.category] || '#00E5CC';

  return (
    <>
      <Navbar />
      <main style={{ flex: 1 }}>
        {/* Hero header area */}
        <div
          style={{
            padding: '48px 24px 40px',
            borderBottom: '1px solid var(--border)',
            backgroundColor: 'var(--bg-surface)',
          }}
        >
          <div style={{ maxWidth: '760px', margin: '0 auto' }}>
            <FadeInUp>
              <Link
                href="/blog"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--text-muted)',
                  fontSize: '14px',
                  textDecoration: 'none',
                  marginBottom: '28px',
                  fontFamily: 'var(--font-body)',
                  transition: 'color 0.2s',
                }}
              >
                <ArrowLeft size={14} />
                Back to blog
              </Link>

              {/* Meta */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    fontFamily: 'var(--font-mono)',
                    color: catColor,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    backgroundColor: `${catColor}11`,
                    border: `1px solid ${catColor}33`,
                  }}
                >
                  {post.category}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
                  {post.readTime}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
                  {new Date(post.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              {/* Title */}
              <h1
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(28px, 5vw, 42px)',
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.15,
                  marginBottom: '14px',
                  color: 'var(--text-primary)',
                }}
              >
                {post.title}
              </h1>

              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '18px',
                  lineHeight: 1.6,
                }}
              >
                {post.subtitle}
              </p>
            </FadeInUp>
          </div>
        </div>

        {/* Article content */}
        <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 24px 80px' }}>
          <FadeInUp delay={0.15}>
            <article>{children}</article>
          </FadeInUp>

          {/* Bottom CTA */}
          <FadeInUp delay={0.25}>
            <motion.div
              whileHover={{
                borderColor: 'rgba(0, 229, 204, 0.25)',
                boxShadow: '0 0 40px rgba(0, 229, 204, 0.05)',
              }}
              style={{
                marginTop: '48px',
                padding: '36px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                textAlign: 'center',
              }}
            >
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '22px',
                  fontWeight: 600,
                  marginBottom: '8px',
                  color: 'var(--text-primary)',
                }}
              >
                Check your site&apos;s AI readiness
              </h3>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '15px',
                  marginBottom: '20px',
                  lineHeight: 1.6,
                }}
              >
                Free scan. 15 seconds. See exactly what AI agents see.
              </p>
              <Link
                href="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '14px 28px',
                  background: 'linear-gradient(135deg, var(--accent-teal), #00B8A3)',
                  color: '#0A0A0F',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '15px',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-heading)',
                  border: '1.5px solid rgba(255,255,255,0.2)',
                }}
              >
                Scan My Site &rarr;
              </Link>
            </motion.div>
          </FadeInUp>
        </div>
      </main>
    </>
  );
}
