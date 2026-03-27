import { SignIn } from '@clerk/nextjs';

const STATS = [
  { value: '4,700%', label: 'YoY increase in AI agent traffic to ecommerce' },
  { value: '87%', label: 'of stores lack basic agent readiness' },
  { value: '$3-5T', label: 'projected agentic commerce market by 2030' },
];

export default function SignInPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left side — product context */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 48px',
          backgroundColor: 'var(--bg-primary)',
        }}
      >
        <div style={{ maxWidth: '480px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, var(--accent-teal), var(--accent-indigo))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-mono)',
                fontWeight: '500',
                fontSize: '14px',
                color: '#0A0A0F',
              }}
            >
              AP
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: '700', fontSize: '20px', color: 'var(--text-primary)' }}>
              AgentProof
            </span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: '700',
              fontSize: '32px',
              lineHeight: '1.15',
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              marginBottom: '16px',
            }}
          >
            How do AI shopping agents{' '}
            <span style={{ color: 'var(--accent-teal)' }}>see your store?</span>
          </h1>

          <p style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-body)',
            lineHeight: '1.6',
            marginBottom: '40px',
          }}>
            ChatGPT, Gemini, and Copilot are the new storefront. AgentProof scans your site and
            shows exactly what AI agents can and can&apos;t see — with a score out of 100 and
            prioritized fixes.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {STATS.map((stat) => (
              <div key={stat.value} style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                <span style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: '700',
                  fontSize: '24px',
                  color: 'var(--accent-teal)',
                  letterSpacing: '-0.02em',
                  flexShrink: 0,
                  minWidth: '80px',
                }}>
                  {stat.value}
                </span>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '48px',
            padding: '16px 20px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
          }}>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', lineHeight: '1.6' }}>
              &quot;We scanned 41 top ecommerce brands. The average Agent Readiness Score was 31 out of 100.
              Zero scored agent-ready.&quot;
            </p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '8px' }}>
              — AgentProof Benchmark Data, March 2026
            </p>
          </div>
        </div>
      </div>

      {/* Right side — sign-in form */}
      <div
        style={{
          width: '480px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 40px',
          backgroundColor: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border)',
        }}
      >
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: '600',
            fontSize: '22px',
            color: 'var(--text-primary)',
            marginBottom: '6px',
          }}>
            Sign in
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
            to scan your store
          </p>
        </div>
        <SignIn
          appearance={{
            elements: {
              rootBox: { width: '100%', maxWidth: '380px' },
              cardBox: {
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                boxShadow: 'none',
              },
              card: {
                backgroundColor: 'transparent',
                boxShadow: 'none',
              },
              headerTitle: { color: '#F8FAFC' },
              headerSubtitle: { color: '#94A3B8' },
              socialButtonsBlockButton: {
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                color: '#F8FAFC',
              },
              socialButtonsBlockButtonText: { color: '#F8FAFC' },
              formFieldLabel: { color: '#94A3B8' },
              formFieldInput: {
                backgroundColor: '#1A1A2E',
                border: '1px solid var(--border)',
                color: '#F8FAFC',
              },
              formButtonPrimary: {
                backgroundColor: '#00E5CC',
                color: '#0A0A0F',
                fontWeight: '600',
              },
              footerActionLink: { color: '#00E5CC' },
              footerActionText: { color: '#94A3B8' },
              dividerLine: { backgroundColor: 'var(--border)' },
              dividerText: { color: '#64748B' },
              identityPreviewText: { color: '#F8FAFC' },
              identityPreviewEditButton: { color: '#00E5CC' },
              formFieldInputShowPasswordButton: { color: '#94A3B8' },
              alertText: { color: '#F8FAFC' },
              formFieldWarningText: { color: '#EAB308' },
              formFieldErrorText: { color: '#EF4444' },
            },
          }}
        />
      </div>
    </div>
  );
}
