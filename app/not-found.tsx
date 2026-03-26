import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '24px',
        textAlign: 'center',
      }}
    >
      <h1
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '72px',
          fontWeight: 700,
          color: 'var(--accent-teal)',
          marginBottom: '8px',
        }}
      >
        404
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '18px',
          color: 'var(--text-secondary)',
          marginBottom: '32px',
        }}
      >
        This scan result doesn&apos;t exist or has expired.
      </p>
      <Link
        href="/"
        style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 600,
          fontSize: '15px',
          padding: '14px 28px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, var(--accent-teal), #00B8A3)',
          color: '#0A0A0F',
          textDecoration: 'none',
        }}
      >
        ← Scan a store
      </Link>
    </div>
  );
}
