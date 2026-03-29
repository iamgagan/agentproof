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
  title: 'AgentProof — AI Agent Readiness Scanner',
  description:
    'Scan any website and get an Agent Readiness Score. See how AI agents like ChatGPT, Gemini, and Perplexity discover and recommend your business.',
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
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
      appearance={{
        variables: {
          colorPrimary: '#00E5CC',
          colorBackground: '#12121A',
          colorInputBackground: '#1A1A2E',
          colorInputText: '#F8FAFC',
          colorText: '#F8FAFC',
          colorTextOnPrimaryBackground: '#0A0A0F',
          colorTextSecondary: '#94A3B8',
          colorNeutral: '#F8FAFC',
          borderRadius: '10px',
        },
        elements: {
          formFieldInput: {
            backgroundColor: '#1A1A2E',
            borderColor: '#2D3748',
            color: '#F8FAFC',
          },
          formFieldLabel: { color: '#94A3B8' },
          formFieldInput__identifier: {
            backgroundColor: '#1A1A2E',
            borderColor: '#2D3748',
            color: '#F8FAFC',
          },
          card: { backgroundColor: '#12121A', boxShadow: 'none' },
          cardBox: { backgroundColor: '#12121A', boxShadow: 'none' },
          headerTitle: { color: '#F8FAFC' },
          headerSubtitle: { color: '#94A3B8' },
          socialButtonsBlockButton: {
            backgroundColor: '#1A1A2E',
            borderColor: '#2D3748',
            color: '#F8FAFC',
          },
          socialButtonsBlockButtonText: { color: '#F8FAFC' },
          dividerLine: { backgroundColor: '#2D3748' },
          dividerText: { color: '#64748B' },
          footerActionLink: { color: '#00E5CC' },
          footerActionText: { color: '#94A3B8' },
          formButtonPrimary: {
            backgroundColor: '#00E5CC',
            color: '#0A0A0F',
            fontWeight: '600',
          },
          identityPreviewText: { color: '#F8FAFC' },
          identityPreviewEditButtonIcon: { color: '#00E5CC' },
          formFieldInputPlaceholder: { color: '#64748B' },
          badge: { backgroundColor: '#1A1A2E', color: '#94A3B8' },
          developmentModeChip: { display: 'none' },
          userButtonPopoverCard: { backgroundColor: '#12121A', borderColor: '#2D3748' },
          userButtonPopoverMain: { backgroundColor: '#12121A' },
          userButtonPopoverFooter: { backgroundColor: '#12121A', borderColor: '#2D3748' },
          userButtonPopoverActionButton: { color: '#F8FAFC' },
          userButtonPopoverActionButtonText: { color: '#F8FAFC' },
          userButtonPopoverActionButtonIcon: { color: '#94A3B8' },
          userPreviewMainIdentifier: { color: '#F8FAFC' },
          userPreviewSecondaryIdentifier: { color: '#94A3B8' },
          userButtonPopoverActions: { backgroundColor: '#12121A' },
          menuButton: { color: '#F8FAFC' },
          menuItem: { color: '#F8FAFC' },
          menuList: { backgroundColor: '#12121A' },
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
