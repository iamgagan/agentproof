import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not set — Stripe features will be disabled');
}

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-03-25.dahlia',
      typescript: true,
    })
  : null;

export const PLANS = {
  pro: {
    name: 'AgentProof Pro',
    priceMonthly: 200,
    priceYearly: 1000,
    features: [
      'Auto-Generated Fixes (copy-paste code)',
      'Protocol File Generator (UCP, MCP, robots.txt)',
      'Agent Traffic Pixel + Dashboard',
      'Industry Benchmark Comparison',
      'Full AI Agent Simulation Details',
      'Unlimited scans',
      'Priority support',
    ],
  },
  free: {
    name: 'Free',
    features: [
      'Agent Readiness Score (0-100)',
      '5 category breakdowns',
      'Top issues list',
      'Agent Simulation summary',
      '1 scan per day',
    ],
  },
} as const;

export const PRO_FEATURES = [
  'fixes',
  'protocols',
  'pixel',
  'benchmarks',
  'fullSimulation',
] as const;

export type ProFeature = (typeof PRO_FEATURES)[number];
