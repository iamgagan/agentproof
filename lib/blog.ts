import fs from 'fs';
import path from 'path';

export interface BlogPost {
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  readTime: string;
  category: string;
  content: string;
}

const CONTENT_DIR = path.join(process.cwd(), 'content');

const POST_META: Record<string, Omit<BlogPost, 'slug' | 'content'>> = {
  'can-chatgpt-find-your-store': {
    title: 'Can ChatGPT Find Your Store? How to Check in 30 Seconds',
    subtitle: 'We scanned 41 top brands. The average score was 31/100.',
    date: '2026-03-28',
    readTime: '8 min read',
    category: 'Guide',
  },
  'ai-agent-readiness-for-ecommerce': {
    title: 'What Is AI Agent Readiness for Ecommerce? The Complete Guide',
    subtitle: 'The 5 pillars, the checklist, and the ROI framework.',
    date: '2026-03-28',
    readTime: '12 min read',
    category: 'Deep Dive',
  },
  'ecommerce-seo-vs-ai-optimization': {
    title: 'Ecommerce SEO vs AI Agent Optimization: What\'s Different',
    subtitle: 'They overlap — but diverge in critical ways.',
    date: '2026-03-28',
    readTime: '10 min read',
    category: 'Strategy',
  },
  'agentproof-vs-isagentready': {
    title: 'AgentProof vs IsAgentReady: Which Scanner Should You Use?',
    subtitle: 'A fair, detailed comparison of both AI readiness tools.',
    date: '2026-03-28',
    readTime: '9 min read',
    category: 'Comparison',
  },
};

const SLUG_TO_FILE: Record<string, string> = {
  'can-chatgpt-find-your-store': 'blog-01-can-chatgpt-find-your-store.md',
  'ai-agent-readiness-for-ecommerce': 'blog-02-ai-agent-readiness-for-ecommerce.md',
  'ecommerce-seo-vs-ai-optimization': 'blog-03-ecommerce-seo-vs-ai-optimization.md',
  'agentproof-vs-isagentready': 'comparison-agentproof-vs-isagentready.md',
};

export function getAllPosts(): BlogPost[] {
  return Object.entries(POST_META).map(([slug, meta]) => {
    const filename = SLUG_TO_FILE[slug];
    const filePath = path.join(CONTENT_DIR, filename);
    const content = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';
    // Strip the first H1 line (title is in meta)
    const contentWithoutTitle = content.replace(/^#\s+.+\n+/, '');
    return { slug, ...meta, content: contentWithoutTitle };
  });
}

export function getPost(slug: string): BlogPost | null {
  const meta = POST_META[slug];
  if (!meta) return null;

  const filename = SLUG_TO_FILE[slug];
  const filePath = path.join(CONTENT_DIR, filename);
  if (!fs.existsSync(filePath)) return null;

  const content = fs.readFileSync(filePath, 'utf-8');
  const contentWithoutTitle = content.replace(/^#\s+.+\n+/, '');
  return { slug, ...meta, content: contentWithoutTitle };
}

export function getPostSlugs(): string[] {
  return Object.keys(POST_META);
}
