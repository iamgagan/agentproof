'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Navbar from './Navbar';
import { FadeInUp, StaggerContainer, StaggerItem } from './AnimatedSection';

const CATEGORY_COLORS: Record<string, string> = {
  Guide: '#00E5CC',
  'Deep Dive': '#6366F1',
  Strategy: '#EAB308',
  Comparison: '#F472B6',
};

interface BlogPost {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  readTime: string;
  date: string;
}

export default function BlogList({ posts }: { posts: BlogPost[] }) {
  return (
    <>
      <Navbar />
      <main style={{ flex: 1 }}>
        {/* Hero header */}
        <div
          className="section-divider-top dot-grid-bg"
          style={{
            padding: '48px 24px 52px',
            backgroundColor: 'var(--bg-surface)',
          }}
        >
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <FadeInUp>
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: 'var(--accent-teal)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: '12px',
                }}
              >
                Insights & Guides
              </p>
              <h1
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(32px, 5vw, 48px)',
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  marginBottom: '12px',
                  color: 'var(--text-primary)',
                }}
              >
                Blog
              </h1>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '17px',
                  maxWidth: '520px',
                  lineHeight: '1.6',
                }}
              >
                Guides, data, and insights on making your business visible to AI agents.
              </p>
            </FadeInUp>
          </div>
        </div>

        {/* Post list */}
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px 80px' }}>
          <StaggerContainer style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {posts.map((post) => (
              <StaggerItem key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="blog-card"
                  style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                >
                  <div className="glow-card" style={{ padding: '28px 32px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '14px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          fontFamily: 'var(--font-mono)',
                          color: CATEGORY_COLORS[post.category] || '#00E5CC',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          backgroundColor: `${CATEGORY_COLORS[post.category] || '#00E5CC'}11`,
                          border: `1px solid ${CATEGORY_COLORS[post.category] || '#00E5CC'}33`,
                        }}
                      >
                        {post.category}
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
                        {post.readTime}
                      </span>
                    </div>

                    <h2
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '22px',
                        fontWeight: 600,
                        letterSpacing: '-0.02em',
                        marginBottom: '8px',
                        lineHeight: '1.3',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {post.title}
                    </h2>

                    <p
                      style={{
                        color: 'var(--text-secondary)',
                        fontSize: '15px',
                        lineHeight: '1.6',
                        margin: 0,
                      }}
                    >
                      {post.subtitle}
                    </p>

                    <div
                      style={{
                        marginTop: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                        {new Date(post.date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="blog-arrow" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--accent-teal)', fontFamily: 'var(--font-body)', fontWeight: 500 }}>
                        Read article <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </main>
    </>
  );
}
