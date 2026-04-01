'use client';

import { useState } from 'react';
import Link from 'next/link';
import { UserButton, useAuth } from '@clerk/nextjs';
import Scanner from './Scanner';

/* ── Navbar ── */
function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isSignedIn } = useAuth();

  const navLinks = [
    { label: 'File', href: '/' },
    { label: 'Features', href: '/#what-we-check' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Blog', href: '/blog' },
  ];

  return (
    <nav>
      {/* Win98 title bar */}
      <div className="win-title-bar">
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span role="img" aria-label="cat">&#128049;</span> AgentProof
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isSignedIn && (
            <UserButton appearance={{ elements: { avatarBox: { width: '16px', height: '16px' } } }} />
          )}
          <div className="win-title-buttons">
            <button className="win-title-btn" aria-label="Minimize">_</button>
            <button className="win-title-btn" aria-label="Maximize">&#9633;</button>
            <button className="win-title-btn" aria-label="Close">X</button>
          </div>
        </div>
      </div>

      {/* Win98 menu bar */}
      <div className="win-menubar">
        {/* Desktop menu */}
        <div className="hidden md:flex items-center" style={{ gap: 0 }}>
          {navLinks.map((link) => (
            <Link key={link.label} href={link.href} className="win-menu-item">
              {link.label}
            </Link>
          ))}
          {!isSignedIn && (
            <>
              <Link href="/sign-in" className="win-menu-item">Sign In</Link>
              <Link href="/sign-up" className="win-menu-item">Sign Up</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="win-menu-item md:hidden"
          style={{ fontWeight: 700 }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? '[X]' : '[=]'}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div
          style={{
            background: 'var(--win-face)',
            borderBottom: '1px solid var(--win-shadow)',
            padding: '4px 0',
          }}
          className="md:hidden"
        >
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="win-menu-item"
              style={{ display: 'block', padding: '4px 12px' }}
            >
              {link.label}
            </Link>
          ))}
          {!isSignedIn && (
            <div style={{ borderTop: '1px solid var(--win-shadow)', marginTop: '4px', paddingTop: '4px' }}>
              <Link href="/sign-in" onClick={() => setMobileOpen(false)} className="win-menu-item" style={{ display: 'block', padding: '4px 12px' }}>
                Sign In
              </Link>
              <Link href="/sign-up" onClick={() => setMobileOpen(false)} className="win-menu-item" style={{ display: 'block', padding: '4px 12px' }}>
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

/* ── Main Hero Section ── */
export default function HeroSection() {
  return (
    <section>
      {/* Navbar with Win98 title bar + menu bar */}
      <Navbar />

      {/* Hero content window */}
      <div style={{ padding: '8px' }}>
        <div className="win-window" style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div className="win-title-bar">
            <span>Welcome to AgentProof</span>
            <div className="win-title-buttons">
              <button className="win-title-btn" aria-label="Minimize">_</button>
              <button className="win-title-btn" aria-label="Maximize">&#9633;</button>
              <button className="win-title-btn" aria-label="Close">X</button>
            </div>
          </div>

          <div className="win-body" style={{ padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>&#128049;</div>

            <h1
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '16px',
                marginBottom: '8px',
                color: '#000000',
              }}
            >
              How do AI shopping agents see your store?
            </h1>

            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                color: '#000000',
                marginBottom: '16px',
                lineHeight: '1.6',
              }}
            >
              ChatGPT, Gemini, and Copilot are the new discovery layer &mdash;
              and most businesses are invisible to them. Find out where you stand.
            </p>

            <div id="scan" style={{ marginBottom: '12px' }}>
              <Scanner placeholder="https://yourbusiness.com" />
            </div>

            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--win-shadow)',
              }}
            >
              Free &middot; No signup &middot; Results in 15 seconds
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
