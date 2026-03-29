import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Footer from '@/components/Footer';
import BlogContent from '@/components/BlogContent';
import BlogPostLayout from '@/components/BlogPostLayout';
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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <BlogPostLayout post={post}>
        <BlogContent content={post.content} />
      </BlogPostLayout>
      <Footer />
    </div>
  );
}
