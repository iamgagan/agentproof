import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getAllPosts } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog — AgentProof',
  description:
    'Guides, insights, and data on AI agent readiness for ecommerce. Learn how to make your store visible to ChatGPT, Gemini, and other AI shopping agents.',
};

const CATEGORY_COLORS: Record<string, string> = {
  Guide: '#00E5CC',
  'Deep Dive': '#6366F1',
  Strategy: '#EAB308',
  Comparison: '#F472B6',
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <>
      <Header />
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px 80px' }}>
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '42px',
            fontWeight: '700',
            letterSpacing: '-0.03em',
            marginBottom: '12px',
          }}
        >
          Blog
        </h1>
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '18px',
            marginBottom: '48px',
            maxWidth: '600px',
          }}
        >
          Guides, data, and insights on making your ecommerce store visible to AI shopping agents.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {posts.map((post) => (
            <a
              key={post.slug}
              href={`/blog/${post.slug}`}
              style={{
                textDecoration: 'none',
                color: 'inherit',
                display: 'block',
                padding: '28px 32px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                transition: 'border-color 0.2s',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px',
                }}
              >
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    fontFamily: 'var(--font-mono)',
                    color: CATEGORY_COLORS[post.category] || '#00E5CC',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {post.category}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  {post.readTime}
                </span>
              </div>

              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '22px',
                  fontWeight: '600',
                  letterSpacing: '-0.02em',
                  marginBottom: '8px',
                  lineHeight: '1.3',
                }}
              >
                {post.title}
              </h2>

              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '15px',
                  lineHeight: '1.5',
                  margin: 0,
                }}
              >
                {post.subtitle}
              </p>

              <div
                style={{
                  marginTop: '16px',
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                }}
              >
                {new Date(post.date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
            </a>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
