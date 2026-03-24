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
  url: string
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

  // --- Check 2: JavaScript dependency (5 pts) ---
  // We check this by seeing if the homepage HTML (already fetched) contains
  // product-related structured data in the raw response.
  // This is handled in the main orchestrator — here we score based on
  // whether JSON-LD was found in raw HTML (passed via the main scan).
  // For now, award points based on presence of JSON-LD in raw HTML.
  // TODO: The orchestrator should pass this signal
  score += 5; // Placeholder — refined during integration

  // --- Check 3: Semantic HTML (4 pts) ---
  // TODO: Check for <main>, <article>, <nav>, <section>, heading hierarchy
  score += 0; // Placeholder — needs homepage HTML passed in

  // --- Check 4: Page size (3 pts) ---
  // TODO: Check Content-Length of homepage response
  score += 0; // Placeholder — needs response size passed in

  return {
    score,
    maxScore: 20,
    percentage: Math.round((score / 20) * 100),
    issues,
  };
}
