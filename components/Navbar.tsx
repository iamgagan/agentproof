'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { UserButton, useAuth } from '@clerk/nextjs';

interface NavbarProps {
  /** When true, navbar is transparent (for hero overlay). When false, solid bg. */
  transparent?: boolean;
}

export default function Navbar({ transparent = false }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isSignedIn } = useAuth();

  const navLinks = [
    { label: 'Features', href: '/#what-we-check' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Blog', href: '/blog' },
  ];

  return (
    <>
      <style>{`
        .nav-desktop { display: none; }
        .nav-hamburger { display: flex; }
        .nav-mobile-menu { display: block; }
        @media (min-width: 768px) {
          .nav-desktop { display: flex; }
          .nav-hamburger { display: none !important; }
          .nav-mobile-menu { display: none !important; }
        }
      `}</style>
      <nav style={{
        position: transparent ? 'relative' : 'sticky',
        top: 0,
        zIndex: 50,
        borderBottom: transparent ? 'none' : '1px solid var(--border)',
        backgroundColor: transparent ? 'transparent' : 'rgba(10, 10, 15, 0.85)',
        backdropFilter: transparent ? 'none' : 'blur(16px)',
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          height: '64px',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
        }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--accent-teal), var(--accent-indigo))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 500, color: '#0A0A0F',
            }}>
              AP
            </div>
            <span style={{
              fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700,
              color: 'var(--text-primary)', letterSpacing: '-0.02em',
            }}>
              AgentProof
            </span>
          </Link>

          {/* Desktop links */}
          <div className="nav-desktop" style={{ alignItems: 'center', gap: '32px' }}>
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                style={{
                  fontFamily: 'var(--font-body)', fontSize: '14px',
                  color: 'var(--text-secondary)', textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop auth */}
          <div className="nav-desktop" style={{ alignItems: 'center', gap: '12px' }}>
            {isSignedIn ? (
              <UserButton appearance={{ elements: { avatarBox: { width: '32px', height: '32px' } } }} />
            ) : (
              <>
                <Link href="/sign-in" style={{
                  fontFamily: 'var(--font-body)', fontSize: '14px',
                  color: 'var(--text-secondary)', textDecoration: 'none', padding: '8px 16px',
                }}>
                  Sign In
                </Link>
                <Link href="/sign-up" style={{
                  fontFamily: 'var(--font-body)', fontSize: '14px',
                  color: 'var(--text-primary)', textDecoration: 'none',
                  padding: '8px 16px', borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                }}>
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="nav-hamburger"
            style={{
              alignItems: 'center', justifyContent: 'center',
              padding: '8px', borderRadius: '8px',
              color: 'var(--text-secondary)', background: 'none',
              border: 'none', cursor: 'pointer',
            }}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              key="mobile-menu"
              className="nav-mobile-menu"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                position: 'absolute', left: 0, right: 0, top: '64px', zIndex: 50,
                borderBottom: '1px solid var(--border)',
                backgroundColor: 'rgba(10, 10, 15, 0.95)',
                backdropFilter: 'blur(20px)', padding: '24px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    style={{ fontFamily: 'var(--font-body)', fontSize: '16px', color: 'var(--text-secondary)', textDecoration: 'none' }}
                  >
                    {link.label}
                  </Link>
                ))}
                <div style={{ marginTop: '8px', display: 'flex', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                  {isSignedIn ? (
                    <UserButton />
                  ) : (
                    <>
                      <Link href="/sign-in" style={{ fontSize: '14px', color: 'var(--text-secondary)', padding: '8px 16px', textDecoration: 'none' }}>
                        Sign In
                      </Link>
                      <Link href="/sign-up" style={{ fontSize: '14px', color: 'var(--text-primary)', padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)', textDecoration: 'none' }}>
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
