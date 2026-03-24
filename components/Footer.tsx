// components/Footer.tsx
export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border)',
        padding: '48px 24px',
        backgroundColor: 'var(--bg-surface)',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, var(--accent-teal), var(--accent-indigo))',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: '600',
              fontSize: '15px',
              color: 'var(--text-secondary)',
            }}
          >
            AgentProof
          </span>
        </div>

        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '13px',
            fontFamily: 'var(--font-body)',
          }}
        >
          Free · No signup required · Results cached 24h
        </p>

        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '13px',
            fontFamily: 'var(--font-body)',
          }}
        >
          © 2026 AgentProof
        </p>
      </div>
    </footer>
  );
}
