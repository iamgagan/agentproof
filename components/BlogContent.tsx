'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

interface BlogContentProps {
  content: string;
}

const components: Components = {
  h2: ({ children }) => (
    <h2
      style={{
        fontFamily: 'var(--font-heading)',
        fontSize: '28px',
        fontWeight: '600',
        letterSpacing: '-0.02em',
        marginTop: '48px',
        marginBottom: '16px',
        paddingBottom: '8px',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3
      style={{
        fontFamily: 'var(--font-heading)',
        fontSize: '20px',
        fontWeight: '600',
        marginTop: '32px',
        marginBottom: '12px',
      }}
    >
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p
      style={{
        fontSize: '16px',
        lineHeight: '1.75',
        color: 'var(--text-secondary)',
        marginBottom: '16px',
      }}
    >
      {children}
    </p>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      style={{ color: 'var(--accent-teal)', textDecoration: 'underline' }}
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
    >
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{children}</strong>
  ),
  ul: ({ children }) => (
    <ul
      style={{
        paddingLeft: '24px',
        marginBottom: '16px',
        color: 'var(--text-secondary)',
        lineHeight: '1.75',
      }}
    >
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol
      style={{
        paddingLeft: '24px',
        marginBottom: '16px',
        color: 'var(--text-secondary)',
        lineHeight: '1.75',
      }}
    >
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li style={{ marginBottom: '6px' }}>{children}</li>
  ),
  blockquote: ({ children }) => (
    <blockquote
      style={{
        borderLeft: '3px solid var(--accent-teal)',
        paddingLeft: '20px',
        margin: '24px 0',
        color: 'var(--text-secondary)',
        fontStyle: 'italic',
      }}
    >
      {children}
    </blockquote>
  ),
  code: ({ children, className }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '14px',
            backgroundColor: 'var(--bg-elevated)',
            padding: '2px 6px',
            borderRadius: '4px',
            color: '#00E5CC',
          }}
        >
          {children}
        </code>
      );
    }
    return (
      <code
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          lineHeight: '1.6',
        }}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre
      style={{
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '16px 20px',
        overflowX: 'auto',
        marginBottom: '16px',
        fontSize: '13px',
        fontFamily: 'var(--font-mono)',
        lineHeight: '1.6',
      }}
    >
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '14px',
        }}
      >
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th
      style={{
        textAlign: 'left',
        padding: '10px 14px',
        borderBottom: '2px solid var(--border)',
        fontWeight: '600',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-heading)',
        fontSize: '13px',
        textTransform: 'uppercase',
        letterSpacing: '0.03em',
      }}
    >
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td
      style={{
        padding: '10px 14px',
        borderBottom: '1px solid var(--border)',
        color: 'var(--text-secondary)',
      }}
    >
      {children}
    </td>
  ),
  hr: () => (
    <hr
      style={{
        border: 'none',
        borderTop: '1px solid var(--border)',
        margin: '40px 0',
      }}
    />
  ),
  img: ({ src, alt }) => (
    <img
      src={src}
      alt={alt || ''}
      style={{
        maxWidth: '100%',
        borderRadius: '8px',
        margin: '16px 0',
      }}
    />
  ),
};

export default function BlogContent({ content }: BlogContentProps) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </ReactMarkdown>
  );
}
