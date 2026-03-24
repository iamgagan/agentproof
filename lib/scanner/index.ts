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

const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

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

const PRODUCT_URL_PATTERNS = [
  /href=["'](\/products\/[^"'?#]{5,})/gi,
  /href=["'](\/product\/[^"'?#]{5,})/gi,
  /href=["'](\/shop\/[^"'?#]{10,})/gi,
  /href=["'](\/item\/[^"'?#]{5,})/gi,
  /href=["'](\/p\/[^"'?#]{5,})/gi,
  /href=["']([^"']*\/dp\/[^"'?#]+)/gi,
  /href=["'](\/catalog\/product\/[^"'?#]+)/gi,
];

const SITEMAP_PRODUCT_PATTERNS = [
  /\/products?\//i,
  /\/shop\//i,
  /\/item\//i,
  /\/p\//i,
  /\/catalog\/product\//i,
  /\/dp\//i,
];

function findProductPageInHtml(html: string, baseUrl: string): string | null {
  for (const pattern of PRODUCT_URL_PATTERNS) {
    pattern.lastIndex = 0;
    const match = pattern.exec(html);
    if (match?.[1]) {
      const path = match[1];
      try {
        return path.startsWith('http') ? path : new URL(path, baseUrl).toString();
      } catch { continue; }
    }
  }
  return null;
}

async function findProductPageViaSitemap(baseUrl: string): Promise<string | null> {
  const sitemapCandidates = [
    `${baseUrl}/sitemap.xml`,
    `${baseUrl}/sitemap_index.xml`,
    `${baseUrl}/sitemap_products_1.xml`,
  ];

  for (const sitemapUrl of sitemapCandidates) {
    try {
      const res = await fetch(sitemapUrl, {
        headers: { 'User-Agent': BROWSER_UA },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) continue;
      const xml = await res.text();

      // If sitemap index, look for a product-specific child sitemap first
      if (xml.includes('<sitemapindex')) {
        const productSitemapMatch = xml.match(/<loc>([^<]*product[^<]*)<\/loc>/i);
        if (productSitemapMatch?.[1]) {
          const childRes = await fetch(productSitemapMatch[1], {
            headers: { 'User-Agent': BROWSER_UA },
            signal: AbortSignal.timeout(5000),
          });
          if (childRes.ok) {
            const childXml = await childRes.text();
            const urlMatch = childXml.match(/<loc>([^<]+)<\/loc>/);
            if (urlMatch?.[1]) return urlMatch[1];
          }
        }
        // Fall through to first child sitemap
        const firstChild = xml.match(/<loc>([^<]+)<\/loc>/);
        if (firstChild?.[1] && firstChild[1] !== sitemapUrl) {
          const childRes = await fetch(firstChild[1], {
            headers: { 'User-Agent': BROWSER_UA },
            signal: AbortSignal.timeout(5000),
          });
          if (childRes.ok) {
            const childXml = await childRes.text();
            for (const pattern of SITEMAP_PRODUCT_PATTERNS) {
              const m = childXml.match(new RegExp(`<loc>([^<]*${pattern.source}[^<]*)</loc>`, 'i'));
              if (m?.[1]) return m[1];
            }
          }
        }
        continue;
      }

      // Regular sitemap — search for product URLs
      for (const pattern of SITEMAP_PRODUCT_PATTERNS) {
        const m = xml.match(new RegExp(`<loc>([^<]*${pattern.source}[^<]*)</loc>`, 'i'));
        if (m?.[1]) return m[1];
      }
    } catch { /* try next */ }
  }

  return null;
}

export async function runScan(inputUrl: string): Promise<ScanResult> {
  const startTime = Date.now();
  const url = normalizeUrl(inputUrl);
  const scanId = generateScanId();
  const errors: string[] = [];

  const fetchHeaders = {
    'User-Agent': BROWSER_UA,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
  };

  // Step 1: Fetch homepage
  let homepageHtml = '';
  let homepageHeaders = new Headers();
  let siteBlocked = false;
  try {
    const res = await fetch(url, {
      headers: fetchHeaders,
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    });
    if (res.status === 403 || res.status === 429 || res.status === 503) {
      siteBlocked = true;
      errors.push(`Site returned HTTP ${res.status} — may be blocking automated access`);
    }
    homepageHtml = await res.text();
    homepageHeaders = res.headers;
  } catch (err) {
    throw new Error(`Could not reach ${url}. Please check the URL and try again.`);
  }

  // Step 2: Detect platform
  const platform = detectPlatform(homepageHtml, homepageHeaders);

  // Step 3: Find and fetch a product page — HTML links first, sitemap fallback
  let productPageUrl = findProductPageInHtml(homepageHtml, url);
  if (!productPageUrl) {
    productPageUrl = await findProductPageViaSitemap(url);
  }
  let productPageHtml: string | null = null;

  if (productPageUrl) {
    try {
      const res = await fetch(productPageUrl, {
        headers: fetchHeaders,
        redirect: 'follow',
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        productPageHtml = await res.text();
      }
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
    analyzeCrawlPolicy(url, homepageHtml, productPageHtml).catch((e) => {
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
    siteBlocked,
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
