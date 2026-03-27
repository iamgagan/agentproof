import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '24px',
    }}>
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: '700',
          fontSize: '28px',
          color: 'var(--text-primary)',
          marginBottom: '8px',
        }}>
          AgentProof
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          color: 'var(--text-secondary)',
        }}>
          Sign in to scan your store
        </p>
      </div>
      <SignIn
        appearance={{
          elements: {
            rootBox: { width: '100%', maxWidth: '420px' },
          },
        }}
      />
    </div>
  );
}
