'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Navbar from './Navbar';
import BlurIn from './BlurIn';
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
        {/* Hero header */}
        <div className="section-divider-top" style={{ padding: '48px 24px 40px', backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ maxWidth: '760px', margin: '0 auto' }}>
            <BlurIn delay={0} duration={0.4}>
              <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.4)', fontSize: '14px', textDecoration: 'none', marginBottom: '28px', fontFamily: 'var(--font-body)' }}>
                <ArrowLeft size={14} /> Back to blog
              </Link>
            </BlurIn>

            <BlurIn delay={0.1} duration={0.5}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, fontFamily: 'var(--font-mono)', color: catColor, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '4px 10px', borderRadius: '6px', backgroundColor: `${catColor}11`, border: `1px solid ${catColor}33` }}>
                  {post.category}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>{post.readTime}</span>
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
                  {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </BlurIn>

            <BlurIn delay={0.2} duration={0.5}>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '14px', color: 'white' }}>
                {post.title}
              </h1>
            </BlurIn>

            <BlurIn delay={0.3} duration={0.5}>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '18px', lineHeight: 1.6, fontFamily: 'var(--font-body)' }}>
                {post.subtitle}
              </p>
            </BlurIn>
          </div>
        </div>

        {/* Article */}
        <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 24px 80px' }}>
          <FadeInUp delay={0.15}>
            <article>{children}</article>
          </FadeInUp>

          <FadeInUp delay={0.25}>
            <div className="glow-card" style={{ marginTop: '48px', padding: '36px', textAlign: 'center' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: 500, marginBottom: '8px', color: 'white' }}>
                Check your site&apos;s AI readiness
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', marginBottom: '20px', lineHeight: 1.6, fontFamily: 'var(--font-body)' }}>
                Free scan. 15 seconds. See exactly what AI agents see.
              </p>
              <Link href="/" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '12px 24px', borderRadius: '9999px',
                backgroundColor: 'white', color: 'var(--bg-primary)',
                fontWeight: 600, fontSize: '14px', textDecoration: 'none', fontFamily: 'var(--font-heading)',
              }}>
                Scan My Site <ArrowRight size={14} />
              </Link>
            </div>
          </FadeInUp>
        </div>
      </main>
    </>
  );
}
