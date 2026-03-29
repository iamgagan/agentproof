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
  vertical: VerticalType;
  agentSimulation: AgentSimulationResult | null;
  liveAITest: LiveAITestResult | null;
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

// ── Business Vertical Detection ──

export type VerticalType =
  | 'ecommerce'
  | 'saas'
  | 'local_business'
  | 'travel'
  | 'healthcare'
  | 'real_estate'
  | 'b2b_services'
  | 'general';

export const VERTICAL_LABELS: Record<VerticalType, string> = {
  ecommerce: 'Ecommerce',
  saas: 'SaaS / Software',
  local_business: 'Local Business',
  travel: 'Travel & Hospitality',
  healthcare: 'Healthcare',
  real_estate: 'Real Estate',
  b2b_services: 'B2B Services',
  general: 'Business',
};

/** Signals used by detectVertical() to classify a site */
export interface VerticalSignals {
  schemaTypes: string[];
  metaKeywords: string[];
  urlPatterns: string[];
  domKeywords: string[];
}

export const VERTICAL_SIGNALS: Record<VerticalType, VerticalSignals> = {
  ecommerce: {
    schemaTypes: ['Product', 'ProductGroup', 'Offer', 'AggregateOffer', 'ShoppingCenter'],
    metaKeywords: ['shop', 'store', 'buy', 'cart', 'checkout', 'add to cart', 'shopify', 'woocommerce', 'bigcommerce', 'magento'],
    urlPatterns: ['/products/', '/product/', '/shop/', '/cart', '/collections/', '/catalog/'],
    domKeywords: ['add to cart', 'buy now', 'shop now', 'free shipping', 'in stock', 'out of stock', 'shopify'],
  },
  saas: {
    schemaTypes: ['SoftwareApplication', 'WebApplication', 'MobileApplication'],
    metaKeywords: ['saas', 'software', 'platform', 'api', 'dashboard', 'integration', 'workflow', 'automation'],
    urlPatterns: ['/pricing', '/plans', '/features', '/integrations', '/docs', '/api', '/changelog'],
    domKeywords: ['start free trial', 'get started', 'sign up free', 'request demo', 'book a demo', 'per month', 'per user', 'enterprise plan'],
  },
  local_business: {
    schemaTypes: ['LocalBusiness', 'Restaurant', 'Store', 'AutoRepair', 'HealthAndBeautyBusiness', 'LodgingBusiness', 'FoodEstablishment'],
    metaKeywords: ['near me', 'local', 'visit us', 'hours', 'directions', 'appointment'],
    urlPatterns: ['/locations', '/contact', '/hours', '/menu', '/reservations', '/book-appointment'],
    domKeywords: ['open hours', 'visit us', 'get directions', 'book appointment', 'call us', 'walk-in'],
  },
  travel: {
    schemaTypes: ['Hotel', 'TouristAttraction', 'LodgingBusiness', 'TravelAction', 'Flight', 'BusTrip', 'TouristDestination'],
    metaKeywords: ['hotel', 'travel', 'booking', 'resort', 'vacation', 'flight', 'tours', 'destination'],
    urlPatterns: ['/rooms', '/booking', '/destinations', '/tours', '/flights', '/hotels'],
    domKeywords: ['book now', 'check availability', 'check-in', 'check-out', 'guests', 'rooms available', 'per night'],
  },
  healthcare: {
    schemaTypes: ['MedicalOrganization', 'Physician', 'Hospital', 'MedicalClinic', 'Dentist', 'MedicalBusiness'],
    metaKeywords: ['health', 'medical', 'clinic', 'doctor', 'patient', 'telehealth', 'wellness', 'therapy'],
    urlPatterns: ['/patients', '/providers', '/services', '/conditions', '/appointments', '/telehealth'],
    domKeywords: ['schedule appointment', 'patient portal', 'find a doctor', 'book visit', 'insurance accepted', 'telehealth'],
  },
  real_estate: {
    schemaTypes: ['RealEstateAgent', 'Residence', 'Apartment', 'House', 'RealEstateListing'],
    metaKeywords: ['real estate', 'property', 'homes', 'listing', 'mortgage', 'rent', 'buy home'],
    urlPatterns: ['/listings', '/properties', '/homes', '/rentals', '/agents', '/mortgage'],
    domKeywords: ['for sale', 'for rent', 'bedrooms', 'bathrooms', 'sq ft', 'mls', 'open house', 'schedule tour'],
  },
  b2b_services: {
    schemaTypes: ['ProfessionalService', 'FinancialService', 'LegalService', 'AccountingService', 'EmploymentAgency'],
    metaKeywords: ['consulting', 'enterprise', 'solutions', 'services', 'b2b', 'agency', 'partner'],
    urlPatterns: ['/solutions', '/case-studies', '/industries', '/partners', '/resources', '/whitepaper'],
    domKeywords: ['request a quote', 'contact sales', 'schedule consultation', 'enterprise', 'roi', 'case study'],
  },
  general: {
    schemaTypes: [],
    metaKeywords: [],
    urlPatterns: [],
    domKeywords: [],
  },
};

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

// ── AI Agent Simulation ──

export interface AgentSimulationResult {
  visibilityScore: number;
  sampleQueries: SimulatedQuery[];
  competitiveGaps: string[];
  recommendations: string[];
}

export interface SimulatedQuery {
  query: string;
  wouldSurface: boolean;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
}

// ── Live AI Query Test ──

export interface LiveAITestResult {
  queriesTested: number;
  mentionedIn: number;
  queries: LiveAIQuery[];
}

export interface LiveAIQuery {
  query: string;
  aiResponse: string;
  mentionsBrand: boolean;
  mentionsUrl: boolean;
  confidence: 'high' | 'medium' | 'low';
}

// ── Fix Generation ──

export interface FixSuggestion {
  issueId: string;
  category: string;
  title: string;
  severity: 'critical' | 'warning' | 'info';
  codeSnippet: string;
  language: 'html' | 'json' | 'javascript' | 'text';
  instructions: string;
  platform?: string;
}

// ── Agent Traffic Pixel ──

export interface AgentVisit {
  siteId: string;
  pageUrl: string;
  userAgent: string;
  agentType: string;
  referrer: string | null;
  timestamp: string;
}

export interface AgentVisitStats {
  totalVisits: number;
  uniqueAgents: string[];
  visitsByAgent: Record<string, number>;
  visitsByDay: { date: string; count: number }[];
  topPages: { url: string; count: number }[];
}

// ── Protocol Generation ──

export interface ProtocolFile {
  filename: string;
  path: string;
  content: string;
  description: string;
  deployInstructions: string;
}

export interface ProtocolFiles {
  ucp: ProtocolFile | null;
  mcp: ProtocolFile | null;
  robotsTxt: ProtocolFile | null;
}

// ── Benchmark Dataset ──

export interface BenchmarkEntry {
  domain: string;
  normalizedUrl: string;
  platform: string | null;
  category: string | null;
  overallScore: number;
  categoryScores: {
    structuredData: number;
    productQuality: number;
    protocolReadiness: number;
    merchantSignals: number;
    aiDiscoverability: number;
  };
  scanId: string;
  scannedAt: string;
}

export interface BenchmarkStats {
  totalScanned: number;
  averageScore: number;
  medianScore: number;
  scoreDistribution: { range: string; count: number }[];
  byPlatform: { platform: string; avgScore: number; count: number }[];
  byCategory: { category: string; avgScore: number; count: number }[];
  topPerformers: { domain: string; score: number; platform: string | null }[];
  bottomPerformers: { domain: string; score: number; platform: string | null }[];
}
