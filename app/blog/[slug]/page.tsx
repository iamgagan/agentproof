import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlogContent from '@/components/BlogContent';
import { getPost, getPostSlugs } from '@/lib/blog';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  return {
    title: `${post.title} — AgentProof Blog`,
    description: post.subtitle,
    openGraph: {
      title: post.title,
      description: post.subtitle,
      type: 'article',
      siteName: 'AgentProof',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.subtitle,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <>
      <Header />
      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 24px 80px' }}>
        {/* Back link */}
        <a
          href="/blog"
          style={{
            color: 'var(--text-muted)',
            fontSize: '14px',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '32px',
          }}
        >
          ← Back to blog
        </a>

        {/* Meta */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          <span
            style={{
              fontSize: '12px',
              fontWeight: '600',
              fontFamily: 'var(--font-mono)',
              color: '#00E5CC',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {post.category}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            {post.readTime}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
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
            fontSize: '38px',
            fontWeight: '700',
            letterSpacing: '-0.03em',
            lineHeight: '1.2',
            marginBottom: '12px',
          }}
        >
          {post.title}
        </h1>

        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '18px',
            lineHeight: '1.5',
            marginBottom: '40px',
          }}
        >
          {post.subtitle}
        </p>

        <hr
          style={{
            border: 'none',
            borderTop: '1px solid var(--border)',
            marginBottom: '40px',
          }}
        />

        {/* Content */}
        <article>
          <BlogContent content={post.content} />
        </article>

        {/* CTA */}
        <div
          style={{
            marginTop: '48px',
            padding: '32px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            textAlign: 'center',
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '22px',
              fontWeight: '600',
              marginBottom: '8px',
            }}
          >
            Check your store&apos;s AI readiness
          </h3>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '15px',
              marginBottom: '20px',
            }}
          >
            Free scan. 30 seconds. See exactly what AI agents see.
          </p>
          <a
            href="/"
            style={{
              display: 'inline-block',
              padding: '12px 28px',
              backgroundColor: 'var(--accent-teal)',
              color: '#0A0A0F',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '15px',
              textDecoration: 'none',
              fontFamily: 'var(--font-heading)',
            }}
          >
            Scan My Store →
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}
