import { Metadata } from 'next';
import Footer from '@/components/Footer';
import BlogList from '@/components/BlogList';
import { getAllPosts } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog — AgentProof',
  description:
    'Guides, insights, and data on AI agent readiness. Learn how to make your business visible to ChatGPT, Gemini, and other AI agents.',
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <BlogList posts={posts} />
      <Footer />
    </div>
  );
}
