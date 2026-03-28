// lib/scanner/crawl-policy.ts
// Analyzes robots.txt + JS dependency + semantic HTML + page size
// This covers the "AI Discoverability" category (20 pts)

import * as cheerio from 'cheerio';
import type { CategoryResult } from '../types';
import { AI_CRAWLERS } from '../types';
import { createIssue } from './scoring';

const CATEGORY = 'aiDiscoverability' as const;

async function fetchRobotsTxt(baseUrl: string): Promise<string | null> {
  try {
    const res = await fetch(`${baseUrl}/robots.txt`, {
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) return await res.text();
    return null;
  } catch {
    return null;
  }
}

function checkCrawlerAccess(robotsTxt: string, agent: string): boolean {
  const lines = robotsTxt.split('\n').map((l) => l.trim().toLowerCase());
  let inAgentBlock = false;
  let isBlocked = false;

  for (const line of lines) {
    if (line.startsWith('user-agent:')) {
      const ua = line.replace('user-agent:', '').trim();
      inAgentBlock = ua === agent.toLowerCase() || ua === '*';
    } else if (inAgentBlock && line.startsWith('disallow:')) {
      const path = line.replace('disallow:', '').trim();
      if (path === '/' || path === '/*') {
        isBlocked = true;
      }
    } else if (inAgentBlock && line.startsWith('allow:')) {
      // Explicit allow overrides
    } else if (line === '') {
      inAgentBlock = false;
    }
  }

  return !isBlocked;
}

export async function analyzeCrawlPolicy(
  url: string,
  homepageHtml: string,
  productPageHtml: string | null,
): Promise<CategoryResult> {
  let score = 0;
  const issues: CategoryResult['issues'] = [];

  // --- Check 1: Robots.txt AI crawler policy (8 pts) ---
  const robotsTxt = await fetchRobotsTxt(url);

  if (robotsTxt) {
    let blockedCrawlers: string[] = [];
    let allowedCrawlers: string[] = [];

    for (const crawler of AI_CRAWLERS) {
      if (checkCrawlerAccess(robotsTxt, crawler)) {
        allowedCrawlers.push(crawler);
      } else {
        blockedCrawlers.push(crawler);
      }
    }

    const crawlerScore = Math.max(0, 8 - Math.round(blockedCrawlers.length * 1.5));
    score += crawlerScore;

    if (blockedCrawlers.length > 0) {
      const severity = blockedCrawlers.length >= 4 ? 'critical' : 'warning';
      issues.push(
        createIssue(
          CATEGORY,
          severity,
          `${blockedCrawlers.length} AI crawlers blocked in robots.txt`,
          `Your robots.txt blocks: ${blockedCrawlers.join(', ')}. These are the crawlers used by major AI shopping agents to index your products.`,
          `Products on your site will not be indexed by ${blockedCrawlers.join(', ')} for shopping recommendations.`,
          `Update your robots.txt to allow these user-agents: ${blockedCrawlers.join(', ')}. Add "Allow: /" rules for each.`,
          8 - crawlerScore
        )
      );
    }
  } else {
    // No robots.txt = all allowed by default
    score += 8;
  }

  // --- Check 2: Product content in raw HTML, not JS-only (5 pts) ---
  // AI agents that don't execute JS (GPTBot, ClaudeBot) see only raw HTML.
  // If key product data only exists after JS runs, agents can't read it.
  const htmlToCheck = productPageHtml || homepageHtml;
  const hasJsonLd = htmlToCheck.includes('application/ld+json');
  const hasProductKeywords = /price|product|add.{0,10}cart|buy.{0,10}now|\$[0-9]|£[0-9]|€[0-9]/i.test(htmlToCheck);
  const hasSchemaOrgRef = htmlToCheck.includes('schema.org');

  if (hasJsonLd && hasProductKeywords) {
    score += 5;
  } else if (hasJsonLd || hasProductKeywords) {
    score += 3;
    issues.push(
      createIssue(
        CATEGORY,
        'warning',
        'Product content may require JavaScript to render',
        'Some product data is present in raw HTML but key elements appear to require JavaScript. AI crawlers like GPTBot and ClaudeBot typically do not execute JavaScript.',
        'Products may not be indexable by AI shopping agents that rely on raw HTML.',
        'Ensure product name, price, and availability are present in the server-rendered HTML, not only injected by JavaScript.',
        2
      )
    );
  } else {
    issues.push(
      createIssue(
        CATEGORY,
        'critical',
        'Product content not found in raw HTML — likely JS-rendered',
        'No product data found in the raw HTML response. The page may rely entirely on JavaScript to render product content, making it invisible to AI crawlers.',
        'AI shopping agents that do not execute JavaScript (GPTBot, ClaudeBot, Google-Extended) will see a blank page and cannot index your products.',
        'Use server-side rendering (SSR) or static generation to include product name, price, and availability in the initial HTML response.',
        5
      )
    );
  }

  // --- Check 3: Semantic HTML structure (3 pts) ---
  const $ = cheerio.load(homepageHtml);
  const hasMain = $('main').length > 0;
  const hasNav = $('nav').length > 0;
  const hasHeadings = $('h1, h2').length > 0;

  const semanticScore = (hasMain ? 1 : 0) + (hasNav ? 1 : 0) + (hasHeadings ? 1 : 0);
  score += semanticScore;

  if (semanticScore < 2) {
    issues.push(
      createIssue(
        CATEGORY,
        'info',
        'Weak semantic HTML structure',
        `Missing semantic elements: ${[!hasMain && '<main>', !hasNav && '<nav>', !hasHeadings && 'heading hierarchy (h1/h2)'].filter(Boolean).join(', ')}. AI crawlers use semantic HTML to understand page structure and identify content regions.`,
        'Agents may misinterpret page structure, reducing the quality of product data extraction.',
        'Use semantic HTML5 elements: <main> for primary content, <nav> for navigation, and proper heading hierarchy.',
        3 - semanticScore
      )
    );
  }

  // --- Check 4: llms.txt presence (2 pts) ---
  let llmsTxtFound = false;
  for (const path of ['/llms.txt', '/.well-known/llms.txt']) {
    try {
      const res = await fetch(`${url}${path}`, {
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const body = await res.text();
        // Verify it's actual text content, not an HTML error page
        if (body.length > 10 && !body.trimStart().startsWith('<!') && !body.trimStart().toLowerCase().startsWith('<html')) {
          llmsTxtFound = true;
          score += 2;
          break;
        }
      }
    } catch { /* try next */ }
  }

  if (!llmsTxtFound) {
    issues.push(
      createIssue(
        CATEGORY,
        'info',
        'No llms.txt file found',
        'llms.txt is an emerging standard that provides AI-friendly content summaries for LLMs. It helps AI agents quickly understand your site without crawling every page.',
        'AI agents may take longer to understand your store or miss key context about your products and brand.',
        'Create a /llms.txt file that summarizes your store, key product categories, policies, and value proposition in plain text.',
        2
      )
    );
  }

  // --- Check 5: Meta description (2 pts) ---
  const metaDesc = $('meta[name="description"]').attr('content') || '';
  if (metaDesc.length >= 50) {
    score += 2;
  } else if (metaDesc.length > 0) {
    score += 1;
    issues.push(
      createIssue(
        CATEGORY,
        'info',
        'Meta description too short',
        `Meta description is ${metaDesc.length} characters. Aim for 120–160 characters describing your store.`,
        'AI agents use meta descriptions for store-level context when there is no other summary available.',
        'Write a meta description of 120–160 characters that describes your store, key products, and value proposition.',
        1
      )
    );
  } else {
    issues.push(
      createIssue(
        CATEGORY,
        'info',
        'No meta description found',
        'No meta description tag found. AI agents use this as a store-level summary when product-level data is unavailable.',
        'Agents may have reduced context about your store when generating shopping recommendations.',
        'Add <meta name="description" content="..."> to your homepage with a 120–160 character store summary.',
        2
      )
    );
  }

  // Ensure we don't exceed maxScore
  score = Math.min(score, 20);

  return {
    score,
    maxScore: 20,
    percentage: Math.round((score / 20) * 100),
    issues,
  };
}
