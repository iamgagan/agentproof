'use client';

import { motion } from 'motion/react';
import { ArrowRight, Shield, Zap, BarChart3 } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import BackgroundVideo from './BackgroundVideo';
import Scanner from './Scanner';
import Navbar from './Navbar';

/* ── Stagger animation config ── */
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
};

/* Navbar is now imported from ./Navbar */

/* ── Primary CTA Button ── */
function PrimaryButton({ children, href }: { children: React.ReactNode; href: string }) {
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      {/* Glow behind button */}
      <div
        className="group-hover-glow"
        style={{
          position: 'absolute',
          inset: '-8px',
          borderRadius: '20px',
          background: 'var(--accent-teal)',
          opacity: 0.15,
          filter: 'blur(20px)',
          transition: 'opacity 0.3s',
          pointerEvents: 'none',
        }}
      />
      <motion.a
        href={href}
        className="no-underline"
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '14px 28px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, var(--accent-teal), #00B8A3)',
          border: '1.5px solid rgba(255,255,255,0.2)',
          fontFamily: 'var(--font-heading)',
          fontWeight: 600,
          fontSize: '15px',
          color: '#0A0A0F',
          cursor: 'pointer',
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        onHoverStart={(e) => {
          const glow = (e.target as HTMLElement).parentElement?.querySelector('.group-hover-glow') as HTMLElement;
          if (glow) glow.style.opacity = '0.5';
        }}
        onHoverEnd={(e) => {
          const glow = (e.target as HTMLElement).parentElement?.querySelector('.group-hover-glow') as HTMLElement;
          if (glow) glow.style.opacity = '0.15';
        }}
      >
        {children}
        <ArrowRight size={16} />
      </motion.a>
    </div>
  );
}

/* ── Secondary Button ── */
function SecondaryButton({ children, href }: { children: React.ReactNode; href: string }) {
  return (
    <motion.a
      href={href}
      className="no-underline"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '14px 28px',
        borderRadius: '12px',
        border: '1.5px solid rgba(255,255,255,0.12)',
        backgroundColor: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px)',
        fontFamily: 'var(--font-heading)',
        fontWeight: 600,
        fontSize: '15px',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.12)' }}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.a>
  );
}

/* ── Social Proof Avatars ── */
function SocialProof() {
  const avatars = [
    { bg: 'linear-gradient(135deg, #8B5CF6, #D946EF)', initials: 'JK' },
    { bg: 'linear-gradient(135deg, #10B981, #14B8A6)', initials: 'SM' },
    { bg: 'linear-gradient(135deg, #F59E0B, #F97316)', initials: 'AR' },
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ display: 'flex' }}>
        {avatars.map((avatar, i) => (
          <div
            key={avatar.initials}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: avatar.bg,
              border: '2px solid var(--bg-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 500,
              color: 'white',
              marginLeft: i > 0 ? '-10px' : 0,
            }}
          >
            {avatar.initials}
          </div>
        ))}
      </div>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-secondary)' }}>
        Trusted by <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>210k+</span> businesses worldwide
      </span>
    </div>
  );
}

/* ── Feature Pills ── */
function FeaturePills() {
  const features = [
    { icon: Shield, label: 'AI Agent Readiness' },
    { icon: Zap, label: 'Auto-Detect Vertical' },
    { icon: BarChart3, label: '0-100 Score in 15s' },
  ];

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px' }}>
      {features.map((f) => (
        <div
          key={f.label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '100px',
            border: '1px solid rgba(255,255,255,0.08)',
            backgroundColor: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <f.icon size={14} style={{ color: 'var(--accent-teal)' }} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>
            {f.label}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Main Hero Section ── */
export default function HeroSection() {
  return (
    <section style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Top gradient bar */}
      <div
        style={{
          position: 'relative',
          zIndex: 20,
          height: '5px',
          width: '100%',
          background: 'linear-gradient(90deg, #ccf, #e7d04c, #31fb78)',
        }}
      />

      {/* Background video — z-index 0, sits above nothing */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <BackgroundVideo />
      </div>

      {/* Gradient overlay for readability — sits above video */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background: 'linear-gradient(180deg, rgba(10,10,15,0.6) 0%, rgba(10,10,15,0.3) 40%, rgba(10,10,15,0.5) 70%, rgba(10,10,15,0.85) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* All content sits above overlay */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* Navbar */}
        <Navbar transparent />

        {/* Hero content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 'calc(100vh - 84px)',
            maxWidth: '960px',
            margin: '0 auto',
            padding: '80px 24px',
            textAlign: 'center',
          }}
        >
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}
          >
            {/* Badge */}
            <motion.div variants={fadeUp}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 14px',
                  borderRadius: '100px',
                  border: '1px solid rgba(0, 229, 204, 0.3)',
                  backgroundColor: 'rgba(0, 229, 204, 0.05)',
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-teal)', display: 'inline-block' }} />
                <span style={{ fontSize: '13px', color: 'var(--accent-teal)', fontFamily: 'var(--font-mono)' }}>
                  Free scan &middot; No signup &middot; 15 seconds
                </span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: 'clamp(36px, 7vw, 72px)',
                lineHeight: 1.08,
                letterSpacing: '-0.03em',
                color: 'var(--text-primary)',
              }}
            >
              AI agents are answering
              <br />
              your customers right now.
              <br />
              <span
                style={{
                  background: 'linear-gradient(135deg, var(--accent-teal), #00B8A3)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Can they find you?
              </span>
            </motion.h1>

            {/* Subhead */}
            <motion.p
              variants={fadeUp}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'clamp(16px, 2.5vw, 20px)',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.7)',
                maxWidth: '560px',
              }}
            >
              ChatGPT, Gemini, and Copilot are the new discovery layer — and most
              businesses are invisible to them. Find out where you stand.
            </motion.p>

            {/* Feature pills */}
            <motion.div variants={fadeUp}>
              <FeaturePills />
            </motion.div>

            {/* CTA Buttons */}
            <motion.div variants={fadeUp} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px' }}>
              <PrimaryButton href="#scan">Scan My Site</PrimaryButton>
              <SecondaryButton href="#how-it-works">See How It Works</SecondaryButton>
            </motion.div>

            {/* Scanner */}
            <motion.div variants={fadeUp} style={{ width: '100%', maxWidth: '560px' }} id="scan">
              <Scanner placeholder="https://yourbusiness.com" />
            </motion.div>

            {/* Social proof */}
            <motion.div variants={fadeUp}>
              <SocialProof />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
