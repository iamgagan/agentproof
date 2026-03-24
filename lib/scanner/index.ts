// lib/scanner/index.ts
// Main scan orchestrator — coordinates all analysis agents

import { analyzeStructuredData } from './schema-analyzer';
import { analyzeProductQuality } from './product-analyzer';
import { checkProtocols } from './protocol-checker';
import { analyzeCrawlPolicy } from './crawl-policy';
import { analyzeMerchantSignals } from './merchant-signals';
import { calculateScore, generateGrade, rankIssues } from './scoring';
import type {
  ScanResult,
  CategoryResult,
  Issue,
  DetectedPlatform,
  ScanMetadata,
} from '../types';

function normalizeUrl(input: string): string {
  let url = input.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  // Remove trailing slash
  url = url.replace(/\/+$/, '');
  return url;
}

function generateScanId(): string {
  return 'scan_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

function detectPlatform(html: string, headers: Headers): DetectedPlatform | null {
  const headerStr = Array.from(headers.entries()).map(([k, v]) => `${k}: ${v}`).join('\n').toLowerCase();
  const htmlLower = html.toLowerCase();

  if (htmlLower.includes('shopify') || headerStr.includes('shopify')) return 'shopify';
  if (htmlLower.includes('woocommerce') || htmlLower.includes('wp-content')) return 'woocommerce';
  if (htmlLower.includes('bigcommerce') || headerStr.includes('bigcommerce')) return 'bigcommerce';
  if (htmlLower.includes('magento') || htmlLower.includes('mage')) return 'magento';
  if (htmlLower.includes('squarespace')) return 'squarespace';
  if (htmlLower.includes('wix.com') || htmlLower.includes('wixsite')) return 'wix';
  return 'custom';
}

function findProductPageUrl(html: string, baseUrl: string): string | null {
  // Patterns that indicate product pages
  const productPatterns = [
    /href=["'](\/products\/[^"'?#]+)/gi,
    /href=["'](\/product\/[^"'?#]+)/gi,
    /href=["'](\/shop\/[^"'?#]+)/gi,
    /href=["'](\/item\/[^"'?#]+)/gi,
    /href=["'](\/p\/[^"'?#]+)/gi,
    /href=["']([^"']*\/dp\/[^"'?#]+)/gi,
  ];

  for (const pattern of productPatterns) {
    const match = pattern.exec(html);
    if (match?.[1]) {
      const path = match[1];
      if (path.startsWith('http')) return path;
      return new URL(path, baseUrl).toString();
    }
  }

  return null;
}

export async function runScan(inputUrl: string): Promise<ScanResult> {
  const startTime = Date.now();
  const url = normalizeUrl(inputUrl);
  const scanId = generateScanId();
  const errors: string[] = [];

  // Step 1: Fetch homepage
  let homepageHtml = '';
  let homepageHeaders = new Headers();
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'AgentProof/1.0 (https://agentproof.com; commerce readiness scanner)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    });
    homepageHtml = await res.text();
    homepageHeaders = res.headers;
  } catch (err) {
    throw new Error(`Could not reach ${url}. Please check the URL and try again.`);
  }

  // Step 2: Detect platform
  const platform = detectPlatform(homepageHtml, homepageHeaders);

  // Step 3: Find and fetch a product page
  let productPageUrl = findProductPageUrl(homepageHtml, url);
  let productPageHtml: string | null = null;

  if (productPageUrl) {
    try {
      const res = await fetch(productPageUrl, {
        headers: {
          'User-Agent': 'AgentProof/1.0 (https://agentproof.com; commerce readiness scanner)',
          'Accept': 'text/html,application/xhtml+xml',
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(8000),
      });
      productPageHtml = await res.text();
    } catch {
      errors.push('Could not fetch product page for detailed analysis');
      productPageUrl = null;
    }
  }

  // Step 4: Run all analyzers in parallel
  const [
    structuredDataResult,
    productQualityResult,
    protocolResult,
    crawlPolicyResult,
    merchantSignalsResult,
  ] = await Promise.all([
    analyzeStructuredData(homepageHtml, productPageHtml, url).catch((e) => {
      errors.push(`Structured data analysis error: ${e.message}`);
      return { score: 0, maxScore: 25, percentage: 0, issues: [] } as CategoryResult;
    }),
    analyzeProductQuality(homepageHtml, productPageHtml, url).catch((e) => {
      errors.push(`Product quality analysis error: ${e.message}`);
      return { score: 0, maxScore: 20, percentage: 0, issues: [] } as CategoryResult;
    }),
    checkProtocols(url, platform).catch((e) => {
      errors.push(`Protocol check error: ${e.message}`);
      return { score: 0, maxScore: 20, percentage: 0, issues: [] } as CategoryResult;
    }),
    analyzeCrawlPolicy(url).catch((e) => {
      errors.push(`Crawl policy analysis error: ${e.message}`);
      return { score: 0, maxScore: 20, percentage: 0, issues: [] } as CategoryResult;
    }),
    analyzeMerchantSignals(homepageHtml, productPageHtml, url).catch((e) => {
      errors.push(`Merchant signals analysis error: ${e.message}`);
      return { score: 0, maxScore: 15, percentage: 0, issues: [] } as CategoryResult;
    }),
  ]);

  // Step 5: Calculate overall score
  const categories = {
    structuredData: structuredDataResult,
    productQuality: productQualityResult,
    protocolReadiness: protocolResult,
    merchantSignals: merchantSignalsResult,
    aiDiscoverability: crawlPolicyResult,
  };

  const overallScore = calculateScore(categories);
  const { grade, label } = generateGrade(overallScore);

  // Step 6: Collect and rank all issues
  const allIssues: Issue[] = Object.values(categories).flatMap((c) => c.issues);
  const topIssues = rankIssues(allIssues).slice(0, 5);

  const metadata: ScanMetadata = {
    platform,
    productPageFound: !!productPageHtml,
    productPageUrl,
    totalRequestsTime: Date.now() - startTime,
    errors,
  };

  return {
    id: scanId,
    url: inputUrl,
    normalizedUrl: url,
    timestamp: new Date().toISOString(),
    overallScore,
    grade,
    gradeLabel: label,
    categories,
    topIssues,
    metadata,
  };
}
