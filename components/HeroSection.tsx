'use client';

import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import BackgroundVideo from './BackgroundVideo';
import Scanner from './Scanner';
import Navbar from './Navbar';
import BlurIn from './BlurIn';
import SplitText from './SplitText';

export default function HeroSection() {
  return (
    <section
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-primary)',
      }}
    >
      {/* Background video — z-0, shifted right + scaled */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          marginLeft: '200px',
          transform: 'scale(1.2)',
          transformOrigin: 'left center',
        }}
      >
        <BackgroundVideo />
      </div>

      {/* Bottom fade gradient — z-10 */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '160px',
          zIndex: 10,
          background: 'linear-gradient(to top, var(--bg-primary), transparent)',
          pointerEvents: 'none',
        }}
      />

      {/* Left-side dark gradient for text readability */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 5,
          background: 'linear-gradient(90deg, var(--bg-primary) 0%, rgba(7,6,18,0.85) 35%, rgba(7,6,18,0.4) 60%, transparent 80%)',
          pointerEvents: 'none',
        }}
      />

      {/* Content — z-20 */}
      <div style={{ position: 'relative', zIndex: 20 }}>
        <Navbar transparent />

        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', maxWidth: '640px' }}>
            {/* Badge + Heading + Subtitle group */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Badge */}
              <BlurIn delay={0} duration={0.6}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 16px',
                    borderRadius: '9999px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(8px)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    width: 'fit-content',
                  }}
                >
                  <Sparkles size={12} style={{ color: 'rgba(255,255,255,0.8)' }} />
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: 'rgba(255,255,255,0.8)',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    AI Agent Readiness Scanner
                  </span>
                </div>
              </BlurIn>

              {/* Main Heading */}
              <h1
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 500,
                  fontSize: 'clamp(36px, 6vw, 60px)',
                  lineHeight: 1.2,
                  color: 'white',
                }}
              >
                <SplitText delay={0.1} staggerDelay={0.08} duration={0.6}>
                  How Do AI Agents See
                </SplitText>
                <br />
                <SplitText delay={0.6} staggerDelay={0.08} duration={0.6}>
                  Your
                </SplitText>
                {' '}
                <SplitText
                  delay={0.7}
                  staggerDelay={0.08}
                  duration={0.6}
                  style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}
                >
                  Business?
                </SplitText>
              </h1>

              {/* Subtitle */}
              <BlurIn delay={0.4} duration={0.6}>
                <p
                  style={{
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: '18px',
                    fontWeight: 400,
                    lineHeight: 1.7,
                    maxWidth: '560px',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  ChatGPT, Gemini, and Copilot are the new discovery layer. Scan any
                  website and get a 0-100 readiness score with actionable fixes — in 15 seconds.
                </p>
              </BlurIn>
            </div>

            {/* CTA Buttons + Scanner */}
            <BlurIn delay={0.6} duration={0.6}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Scanner input */}
                <div style={{ maxWidth: '520px' }}>
                  <Scanner placeholder="https://yourbusiness.com" />
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                  <Link
                    href="#scan"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 20px',
                      borderRadius: '9999px',
                      backgroundColor: 'white',
                      color: 'var(--bg-primary)',
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 600,
                      fontSize: '14px',
                      textDecoration: 'none',
                      transition: 'opacity 0.2s',
                    }}
                  >
                    Scan My Site <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="#how-it-works"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 32px',
                      borderRadius: '9999px',
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(8px)',
                      color: 'white',
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 500,
                      fontSize: '14px',
                      textDecoration: 'none',
                      transition: 'background-color 0.2s',
                    }}
                  >
                    See How It Works
                  </Link>
                </div>
              </div>
            </BlurIn>
          </div>
        </div>
      </div>
    </section>
  );
}
