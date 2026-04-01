import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

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
          colorPrimary: '#000080',
          colorBackground: '#C0C0C0',
          colorInputBackground: '#FFFFFF',
          colorInputText: '#000000',
          colorText: '#000000',
          colorTextOnPrimaryBackground: '#FFFFFF',
          colorTextSecondary: '#000000',
          colorNeutral: '#000000',
          borderRadius: '0px',
        },
        elements: {
          formFieldInput: {
            backgroundColor: '#FFFFFF',
            borderColor: '#808080',
            color: '#000000',
            fontFamily: '"Tahoma", "MS Sans Serif", sans-serif',
            fontSize: '11px',
          },
          formFieldLabel: {
            color: '#000000',
            fontFamily: '"Tahoma", "MS Sans Serif", sans-serif',
            fontSize: '11px',
          },
          formFieldInput__identifier: {
            backgroundColor: '#FFFFFF',
            borderColor: '#808080',
            color: '#000000',
          },
          card: {
            backgroundColor: '#C0C0C0',
            boxShadow: 'none',
            border: '2px outset #C0C0C0',
          },
          cardBox: {
            backgroundColor: '#C0C0C0',
            boxShadow: 'none',
          },
          headerTitle: {
            color: '#000000',
            fontFamily: '"Tahoma", "MS Sans Serif", sans-serif',
          },
          headerSubtitle: {
            color: '#000000',
            fontFamily: '"Tahoma", "MS Sans Serif", sans-serif',
          },
          socialButtonsBlockButton: {
            backgroundColor: '#C0C0C0',
            borderColor: '#808080',
            color: '#000000',
            border: '2px outset #C0C0C0',
          },
          socialButtonsBlockButtonText: { color: '#000000' },
          dividerLine: { backgroundColor: '#808080' },
          dividerText: { color: '#808080' },
          footerActionLink: { color: '#000080' },
          footerActionText: { color: '#000000' },
          formButtonPrimary: {
            backgroundColor: '#C0C0C0',
            color: '#000000',
            fontWeight: '400',
            fontFamily: '"Tahoma", "MS Sans Serif", sans-serif',
            fontSize: '11px',
            border: '2px outset #C0C0C0',
            borderRadius: '0px',
            boxShadow: 'none',
          },
          identityPreviewText: { color: '#000000' },
          identityPreviewEditButtonIcon: { color: '#000080' },
          formFieldInputPlaceholder: { color: '#808080' },
          badge: { backgroundColor: '#C0C0C0', color: '#000000' },
          developmentModeChip: { display: 'none' },
          userButtonPopoverCard: {
            backgroundColor: '#C0C0C0',
            borderColor: '#808080',
            border: '2px outset #C0C0C0',
          },
          userButtonPopoverMain: { backgroundColor: '#C0C0C0' },
          userButtonPopoverFooter: {
            backgroundColor: '#C0C0C0',
            borderColor: '#808080',
          },
          userButtonPopoverActionButton: { color: '#000000' },
          userButtonPopoverActionButtonText: { color: '#000000' },
          userButtonPopoverActionButtonIcon: { color: '#000000' },
          userPreviewMainIdentifier: { color: '#000000' },
          userPreviewSecondaryIdentifier: { color: '#808080' },
          userButtonPopoverActions: { backgroundColor: '#C0C0C0' },
          menuButton: { color: '#000000' },
          menuItem: { color: '#000000' },
          menuList: { backgroundColor: '#C0C0C0' },
        },
      }}
    >
      <html lang="en">
        <body
          style={{
            fontFamily: '"Tahoma", "MS Sans Serif", sans-serif',
            backgroundColor: '#C0C0C0',
            color: '#000000',
            fontSize: '11px',
            minHeight: '100vh',
          }}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
