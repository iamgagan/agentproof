import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '24px',
      background: 'var(--win-face)',
    }}>
      <div className="win-window" style={{ maxWidth: '340px', width: '100%' }}>
        <div className="win-title-bar" style={{ background: 'linear-gradient(90deg, #800000, #C06060)' }}>
          <span>Error</span>
          <div className="win-title-buttons">
            <button className="win-title-btn" style={{ fontWeight: 700 }}>X</button>
          </div>
        </div>
        <div className="win-body" style={{ textAlign: 'center', padding: '20px 16px' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>&#9888;</div>
          <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>
            404
          </p>
          <p style={{ fontSize: '11px', marginBottom: '16px' }}>
            This scan result doesn&apos;t exist or has expired.
          </p>
          <Link
            href="/"
            className="win-btn win-btn-default"
            style={{ textDecoration: 'none', color: '#000000', display: 'inline-block' }}
          >
            Scan a store
          </Link>
        </div>
      </div>
    </div>
  );
}
