// lib/types.ts

export interface ScanRequest {
  url: string;
}

export interface ScanResult {
  id: string;
  url: string;
  normalizedUrl: string;
  timestamp: string;
  overallScore: number;
  grade: Grade;
  gradeLabel: string;
  categories: {
    structuredData: CategoryResult;
    productQuality: CategoryResult;
    protocolReadiness: CategoryResult;
    merchantSignals: CategoryResult;
    aiDiscoverability: CategoryResult;
  };
  topIssues: Issue[];
  metadata: ScanMetadata;
}

export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface CategoryResult {
  score: number;
  maxScore: number;
  percentage: number;
  issues: Issue[];
}

export interface Issue {
  id: string;
  category: CategoryName;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  impact: string;
  fix: string;
  pointsLost: number;
}

export type CategoryName =
  | 'structuredData'
  | 'productQuality'
  | 'protocolReadiness'
  | 'merchantSignals'
  | 'aiDiscoverability';

export interface ScanMetadata {
  platform: DetectedPlatform | null;
  productPageFound: boolean;
  productPageUrl: string | null;
  siteBlocked: boolean;
  totalRequestsTime: number;
  errors: string[];
}

export type DetectedPlatform =
  | 'shopify'
  | 'woocommerce'
  | 'bigcommerce'
  | 'magento'
  | 'squarespace'
  | 'wix'
  | 'custom';

// Schema.org types we look for
export interface JsonLdData {
  '@type'?: string;
  '@graph'?: JsonLdData[];
  name?: string;
  description?: string;
  image?: string | string[];
  offers?: {
    '@type'?: string;
    price?: string | number;
    lowPrice?: string | number;
    priceCurrency?: string;
    availability?: string;
  };
  brand?: { name?: string } | string;
  sku?: string;
  gtin?: string;
  aggregateRating?: {
    ratingValue?: string | number;
    reviewCount?: string | number;
  };
  review?: unknown[];
  url?: string;
  [key: string]: unknown;
}

// Robots.txt parsed result
export interface RobotsTxtResult {
  found: boolean;
  aiCrawlers: {
    agent: string;
    allowed: boolean;
  }[];
  rawContent: string | null;
}

// Protocol check results
export interface ProtocolCheckResult {
  ucp: {
    found: boolean;
    url: string | null;
    valid: boolean;
  };
  acp: {
    found: boolean;
    url: string | null;
    valid: boolean;
  };
  mcp: {
    found: boolean;
    url: string | null;
    valid: boolean;
  };
  merchantFeed: {
    found: boolean;
    type: string | null;
  };
}

// Grading thresholds
export const GRADE_THRESHOLDS: { min: number; grade: Grade; label: string }[] = [
  { min: 80, grade: 'A', label: 'Agent-Ready' },
  { min: 60, grade: 'B', label: 'Mostly Ready' },
  { min: 40, grade: 'C', label: 'Needs Work' },
  { min: 20, grade: 'D', label: 'Falling Behind' },
  { min: 0, grade: 'F', label: 'Invisible to Agents' },
];

// AI crawlers we check in robots.txt
export const AI_CRAWLERS = [
  'GPTBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Google-Extended',
  'PerplexityBot',
  'Amazonbot',
] as const;

// Category max scores
export const CATEGORY_MAX_SCORES: Record<CategoryName, number> = {
  structuredData: 25,
  productQuality: 20,
  protocolReadiness: 20,
  merchantSignals: 15,
  aiDiscoverability: 20,
};
