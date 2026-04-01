import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AgentProof — AI Agent Readiness Scanner for Ecommerce',
  description:
    'Scan your store and get an Agent Readiness Score. See how AI shopping agents like ChatGPT, Gemini, and Perplexity discover and recommend your products.',
  openGraph: {
    type: 'website',
    siteName: 'AgentProof',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif',
          backgroundColor: '#C0C0C0',
          color: '#000000',
          fontSize: '11px',
          minHeight: '100vh',
        }}
      >
        {children}
      </body>
    </html>
  );
}
