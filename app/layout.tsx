import type { Metadata } from 'next';
import { Space_Grotesk, DM_Sans, JetBrains_Mono } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['500', '600', '700'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
});

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
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#00E5CC',
          colorBackground: '#12121A',
          colorInputBackground: '#1A1A2E',
          colorText: '#F8FAFC',
          colorTextSecondary: '#94A3B8',
          borderRadius: '10px',
        },
      }}
    >
      <html
        lang="en"
        className={`${spaceGrotesk.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
      >
        <body
          style={{
            fontFamily: 'var(--font-body), system-ui, sans-serif',
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            minHeight: '100vh',
          }}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
