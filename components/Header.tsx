// components/Header.tsx
import { UserButton } from '@clerk/nextjs';

export default function Header() {
  return (
    <header className="win-window" style={{ padding: 0 }}>
      {/* Title Bar */}
      <div className="win-title-bar">
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span role="img" aria-label="cat">&#128049;</span>
          AgentProof - AI Agent Readiness Scanner
        </span>
        <div className="win-title-buttons">
          <button className="win-title-btn" aria-label="Minimize">_</button>
          <button className="win-title-btn" aria-label="Maximize">&#9633;</button>
          <button className="win-title-btn" aria-label="Close">&#10005;</button>
        </div>
      </div>

      {/* Menu Bar */}
      <div className="win-menubar">
        <a href="/" className="win-menu-item">
          <u>F</u>ile
        </a>
        <a href="/#what-we-check" className="win-menu-item">
          <u>V</u>iew
        </a>
        <a href="/#how-it-works" className="win-menu-item">
          <u>S</u>can
        </a>
        <a href="/blog" className="win-menu-item">
          <u>B</u>log
        </a>
        <a href="/help" className="win-menu-item">
          <u>H</u>elp
        </a>
        <div style={{ marginLeft: 'auto', paddingRight: '4px', display: 'flex', alignItems: 'center' }}>
          <UserButton
            appearance={{
              elements: {
                avatarBox: { width: '16px', height: '16px' },
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
