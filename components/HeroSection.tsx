'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { ArrowRight, Menu, X, Shield, Zap, BarChart3 } from 'lucide-react';
import { UserButton, useAuth } from '@clerk/nextjs';
import BackgroundVideo from './BackgroundVideo';
import Scanner from './Scanner';

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

/* ── Navbar ── */
function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isSignedIn } = useAuth();

  const navLinks = [
    { label: 'Features', href: '#what-we-check' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Blog', href: '/blog' },
  ];

  return (
    <nav className="relative z-50">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 no-underline">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-teal to-accent-indigo font-mono text-sm font-medium text-[#0A0A0F]">
            AP
          </div>
          <span className="text-lg font-bold tracking-tight text-text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
            AgentProof
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-text-secondary transition-colors hover:text-text-primary no-underline"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop auth */}
        <div className="hidden items-center gap-3 md:flex">
          {isSignedIn ? (
            <UserButton appearance={{ elements: { avatarBox: { width: '32px', height: '32px' } } }} />
          ) : (
            <>
              <Link
                href="/sign-in"
                className="rounded-lg px-4 py-2 text-sm text-text-secondary transition-colors hover:text-text-primary no-underline"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-text-primary backdrop-blur-sm transition-all hover:bg-white/10 no-underline"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex items-center justify-center rounded-lg p-2 text-text-secondary md:hidden"
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
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-0 right-0 top-16 z-50 border-b border-border bg-bg-primary/95 px-6 py-6 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-base text-text-secondary transition-colors hover:text-text-primary no-underline"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-2 flex gap-3 border-t border-border pt-4">
                {isSignedIn ? (
                  <UserButton />
                ) : (
                  <>
                    <Link href="/sign-in" className="rounded-lg px-4 py-2 text-sm text-text-secondary no-underline">
                      Sign In
                    </Link>
                    <Link href="/sign-up" className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-text-primary no-underline">
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
  );
}

/* ── Primary CTA Button ── */
function PrimaryButton({ children, href }: { children: React.ReactNode; href: string }) {
  return (
    <motion.a
      href={href}
      className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl px-7 py-3.5 text-[15px] font-semibold text-[#0A0A0F] no-underline"
      style={{ fontFamily: 'var(--font-heading)' }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Glow */}
      <div className="absolute inset-0 -z-10 rounded-xl bg-[#00B8A3] opacity-20 blur-lg transition-opacity group-hover:opacity-60" />
      {/* Background gradient */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent-teal to-[#00B8A3]" />
      {/* Inner stroke overlay */}
      <div className="absolute inset-0 rounded-xl border-[1.5px] border-white/20" />
      {/* Content */}
      <span className="relative z-10">{children}</span>
      <ArrowRight
        size={16}
        className="relative z-10 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
      />
    </motion.a>
  );
}

/* ── Secondary Button ── */
function SecondaryButton({ children, href }: { children: React.ReactNode; href: string }) {
  return (
    <motion.a
      href={href}
      className="group relative inline-flex items-center gap-2 rounded-xl border-[1.5px] border-white/10 bg-white/5 px-7 py-3.5 text-[15px] font-semibold text-text-primary no-underline backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
      style={{ fontFamily: 'var(--font-heading)' }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.a>
  );
}

/* ── Social Proof Avatars ── */
function SocialProof() {
  const avatars = [
    { bg: 'bg-gradient-to-br from-violet-500 to-fuchsia-500', initials: 'JK' },
    { bg: 'bg-gradient-to-br from-emerald-500 to-teal-500', initials: 'SM' },
    { bg: 'bg-gradient-to-br from-amber-500 to-orange-500', initials: 'AR' },
  ];

  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-2.5">
        {avatars.map((avatar) => (
          <div
            key={avatar.initials}
            className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-bg-primary text-xs font-medium text-white ${avatar.bg}`}
          >
            {avatar.initials}
          </div>
        ))}
      </div>
      <span className="text-sm text-text-secondary" style={{ fontFamily: 'var(--font-body)' }}>
        Trusted by <span className="font-medium text-text-primary">210k+</span> businesses worldwide
      </span>
    </div>
  );
}

/* ── Feature Pill ── */
function FeaturePills() {
  const features = [
    { icon: Shield, label: 'AI Agent Readiness' },
    { icon: Zap, label: 'Auto-Detect Vertical' },
    { icon: BarChart3, label: '0-100 Score in 15s' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      {features.map((f) => (
        <div
          key={f.label}
          className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm"
        >
          <f.icon size={14} className="text-accent-teal" />
          <span className="text-xs font-medium text-text-secondary" style={{ fontFamily: 'var(--font-body)' }}>
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
    <section className="relative min-h-screen overflow-hidden bg-bg-primary">
      {/* Top gradient bar */}
      <div className="h-[5px] w-full bg-gradient-to-r from-[#ccf] via-[#e7d04c] to-[#31fb78]" />

      {/* Background video */}
      <BackgroundVideo />

      {/* Very subtle gradient overlay for text readability — NOT a dark overlay */}
      <div className="pointer-events-none absolute inset-0 -z-[5] bg-gradient-to-b from-bg-primary/40 via-transparent to-bg-primary/80" />

      {/* Navbar */}
      <Navbar />

      {/* Hero content */}
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-84px)] max-w-7xl flex-col items-center justify-center px-6 py-20 text-center">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex max-w-4xl flex-col items-center gap-8"
        >
          {/* Badge */}
          <motion.div variants={fadeUp}>
            <div className="inline-flex items-center gap-2 rounded-full border border-accent-teal/30 bg-accent-teal/5 px-4 py-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent-teal" />
              <span className="text-[13px] text-accent-teal" style={{ fontFamily: 'var(--font-mono)' }}>
                Free scan &middot; No signup &middot; 15 seconds
              </span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="text-4xl font-bold leading-[1.08] tracking-tight text-text-primary sm:text-5xl md:text-6xl lg:text-7xl"
            style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.03em' }}
          >
            AI agents are answering
            <br />
            your customers right now.
            <br />
            <span className="bg-gradient-to-r from-accent-teal to-[#00B8A3] bg-clip-text text-transparent">
              Can they find you?
            </span>
          </motion.h1>

          {/* Subhead */}
          <motion.p
            variants={fadeUp}
            className="max-w-xl text-base leading-relaxed text-white/70 sm:text-lg md:text-xl"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            ChatGPT, Gemini, and Copilot are the new discovery layer — and most
            businesses are invisible to them. Find out where you stand.
          </motion.p>

          {/* Feature pills */}
          <motion.div variants={fadeUp}>
            <FeaturePills />
          </motion.div>

          {/* CTA Buttons */}
          <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-4">
            <PrimaryButton href="#scan">Scan My Site</PrimaryButton>
            <SecondaryButton href="#how-it-works">See How It Works</SecondaryButton>
          </motion.div>

          {/* Scanner (inline) */}
          <motion.div variants={fadeUp} className="w-full max-w-xl" id="scan">
            <Scanner placeholder="https://yourbusiness.com" />
          </motion.div>

          {/* Social proof */}
          <motion.div variants={fadeUp}>
            <SocialProof />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
