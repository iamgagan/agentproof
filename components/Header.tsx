// components/Header.tsx
export default function Header() {
  return (
    <header data-testid="site-header">
      {/* Win98 Title Bar */}
      <div className="win-title-bar" style={{ padding: '3px 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* Napster-style cat icon */}
          <span style={{ fontSize: '12px' }}>
            &#128049;
          </span>
          <span style={{ color: '#FFFFFF', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '11px' }}>
            AgentProof - AI Agent Readiness Scanner
          </span>
        </div>
        <div className="win-title-buttons">
          <button className="win-title-btn" aria-label="Minimize">_</button>
          <button className="win-title-btn" aria-label="Maximize">&#9633;</button>
          <button className="win-title-btn" aria-label="Close" style={{ fontWeight: 700 }}>X</button>
        </div>
      </div>

      {/* Win98 Menu Bar */}
      <nav className="win-menubar" style={{ padding: '2px 0' }}>
        <a href="/" className="win-menu-item" style={{ textDecoration: 'none', color: '#000000' }}>
          <u>F</u>ile
        </a>
        <a href="/#what-we-check" className="win-menu-item" style={{ textDecoration: 'none', color: '#000000' }}>
          <u>V</u>iew
        </a>
        <a href="/#how-it-works" className="win-menu-item" style={{ textDecoration: 'none', color: '#000000' }}>
          <u>S</u>can
        </a>
        <a href="/#pro" className="win-menu-item" style={{ textDecoration: 'none', color: '#000000' }}>
          <u>P</u>ro
        </a>
        <a href="https://github.com/anthropics/claude-code/issues" target="_blank" rel="noopener noreferrer" className="win-menu-item" style={{ textDecoration: 'none', color: '#000000' }}>
          <u>H</u>elp
        </a>
      </nav>
    </header>
  );
}
