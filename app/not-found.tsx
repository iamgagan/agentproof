import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '24px',
      background: '#008080',
    }}>
      <div className="win-window" style={{ maxWidth: '420px', width: '100%' }}>
        {/* Red error title bar */}
        <div className="win-title-bar" style={{
          background: 'linear-gradient(90deg, #FF0000, #AA0000)',
        }}>
          <span style={{ fontWeight: 'bold', color: '#FFFFFF', fontSize: '12px' }}>
            Error - Page Not Found
          </span>
          <div className="win-title-buttons">
            <button className="win-title-btn" aria-label="Close">×</button>
          </div>
        </div>

        {/* Body */}
        <div className="win-body" style={{
          padding: '20px',
          fontFamily: 'MS Sans Serif, Tahoma, sans-serif',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
            marginBottom: '20px',
          }}>
            {/* Warning icon */}
            <div style={{
              flexShrink: 0,
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              lineHeight: 1,
            }}>
              &#9888;
            </div>

            <div>
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#000000',
                marginBottom: '8px',
                fontFamily: 'MS Sans Serif, Tahoma, sans-serif',
              }}>
                404
              </div>
              <p style={{
                fontSize: '12px',
                color: '#000000',
                lineHeight: '1.5',
              }}>
                This scan result doesn&apos;t exist or has expired.
              </p>
              <p style={{
                fontSize: '11px',
                color: '#808080',
                marginTop: '4px',
                lineHeight: '1.4',
              }}>
                The page you requested could not be found. It may have been removed or the link may be incorrect.
              </p>
            </div>
          </div>

          {/* Button row */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
          }}>
            <Link
              href="/"
              className="win-btn win-btn-default"
              style={{
                display: 'inline-block',
                padding: '6px 24px',
                fontSize: '12px',
                fontFamily: 'MS Sans Serif, Tahoma, sans-serif',
                textDecoration: 'none',
                color: '#000000',
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              Scan a Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
