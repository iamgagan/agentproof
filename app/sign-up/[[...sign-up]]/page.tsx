import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
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
            Get your{' '}
            <span style={{ color: 'var(--accent-teal)' }}>Agent Readiness Score</span>
          </h1>

          <p style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-body)',
            lineHeight: '1.6',
            marginBottom: '40px',
          }}>
            Create an account to scan your ecommerce store and see how AI shopping agents
            discover, interpret, and recommend your products.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              'AI Agent Visibility Score (0-100)',
              'Auto-generated code fixes for every issue',
              'Protocol files (UCP, MCP) ready to deploy',
              'Benchmark comparison vs. 41+ top brands',
              'AI agent traffic tracking pixel',
            ].map((feature) => (
              <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: 'var(--accent-teal)', fontSize: '14px', flexShrink: 0 }}>{'\u2713'}</span>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side — sign-up form */}
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
            Create your account
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
            Free to get started
          </p>
        </div>
        <SignUp
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
