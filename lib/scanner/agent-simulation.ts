// lib/scanner/agent-simulation.ts
// Heuristic engine that determines whether AI shopping agents would surface
// a store's products for common consumer queries.
// No external AI API calls — purely based on page signals.

import type {
  AgentSimulationResult,
  SimulatedQuery,
  CategoryResult,
  ScanMetadata,
} from '../types';

interface SimulationInput {
  url: string;
  structuredData: CategoryResult;
  productQuality: CategoryResult;
  protocolReadiness: CategoryResult;
  merchantSignals: CategoryResult;
  aiDiscoverability: CategoryResult;
  metadata: ScanMetadata;
  productName: string | null;
  productCategory: string | null;
  brandName: string | null;
  price: string | null;
}

/** Extract product details from the structured-data issues (they reveal what was found/missing). */
export function extractProductContext(
  structuredData: CategoryResult,
  productQuality: CategoryResult,
): { productName: string | null; productCategory: string | null; brandName: string | null; price: string | null } {
  // We infer from issue titles whether attributes exist
  const hasProduct = !structuredData.issues.some((i) => i.id.includes('no_json_ld_product'));
  const missingAttrs = structuredData.issues.find((i) => i.id.includes('missing'));
  const missingList = missingAttrs?.description ?? '';

  return {
    productName: hasProduct && !missingList.includes('Product name') ? 'detected' : null,
    productCategory: null, // not directly available without re-parsing HTML
    brandName: hasProduct && !missingList.includes('Brand') ? 'detected' : null,
    price: hasProduct && !missingList.includes('Price') ? 'detected' : null,
  };
}

function buildSampleQueries(input: SimulationInput): SimulatedQuery[] {
  const queries: SimulatedQuery[] = [];
  const { structuredData, productQuality, aiDiscoverability, protocolReadiness, metadata } = input;

  const hasSchema = structuredData.percentage >= 40;
  const hasGoodContent = productQuality.percentage >= 50;
  const crawlersAllowed = aiDiscoverability.percentage >= 50;
  const hasProtocols = protocolReadiness.percentage >= 25;
  const hasReviews = !structuredData.issues.some((i) =>
    i.title.toLowerCase().includes('aggregate rating') || i.title.toLowerCase().includes('review')
  );

  // Query 1: Direct brand search
  // For a direct brand query ("What does X sell?"), AI agents can often answer
  // if they can crawl the site at all — even without structured data, the
  // homepage usually has enough visible content for a brand-level answer.
  const hasAnyContent = productQuality.percentage > 0;
  const brandQuerySurfaces = crawlersAllowed && (hasSchema || hasAnyContent);
  queries.push({
    query: `What products does ${domainName(input.url)} sell?`,
    wouldSurface: brandQuerySurfaces,
    reason: brandQuerySurfaces
      ? hasSchema
        ? 'AI crawlers can access your site and structured data describes your products.'
        : 'AI crawlers can access your site and find some product information, but adding structured data would significantly improve accuracy.'
      : !crawlersAllowed
        ? 'AI crawlers are blocked by robots.txt — agents cannot index your content.'
        : 'No product content found on your site for agents to parse.',
    confidence: crawlersAllowed && hasSchema ? 'high' : crawlersAllowed ? 'medium' : 'high',
  });

  // Query 2: Category search
  const categoryQuerySurfaces = (hasSchema || hasGoodContent) && crawlersAllowed;
  queries.push({
    query: `Best ${input.productCategory ?? 'products'} to buy online`,
    wouldSurface: categoryQuerySurfaces,
    reason: categoryQuerySurfaces
      ? 'Rich product data and accessible content make you competitive for category queries.'
      : 'Incomplete product data or blocked crawlers reduce your visibility for category searches.',
    confidence: hasSchema && hasGoodContent ? 'medium' : hasGoodContent ? 'low' : 'low',
  });

  // Query 3: Price comparison
  queries.push({
    query: `Compare prices for ${input.productName ?? 'products'} from ${domainName(input.url)}`,
    wouldSurface: hasSchema && input.price !== null,
    reason: input.price !== null
      ? 'Price data is available in structured markup for agent comparison.'
      : 'No price data in structured markup — agents cannot include you in price comparisons.',
    confidence: input.price !== null ? 'high' : 'high',
  });

  // Query 4: Review-based recommendation
  queries.push({
    query: `What are the best-reviewed products from ${domainName(input.url)}?`,
    wouldSurface: hasReviews && crawlersAllowed,
    reason: hasReviews
      ? 'AggregateRating and review data help agents recommend your top products.'
      : 'No review or rating data in schema — agents cannot rank your products by quality.',
    confidence: hasReviews ? 'medium' : 'high',
  });

  // Query 5: Agent transaction capability
  queries.push({
    query: `Buy ${input.productName ?? 'a product'} from ${domainName(input.url)} for me`,
    wouldSurface: hasProtocols,
    reason: hasProtocols
      ? 'Agentic commerce protocols (UCP/MCP) enable direct agent transactions.'
      : 'No agentic protocols detected — agents cannot transact on your site programmatically.',
    confidence: hasProtocols ? 'medium' : 'high',
  });

  // Query 6: Availability check
  queries.push({
    query: `Is ${input.productName ?? 'this product'} in stock at ${domainName(input.url)}?`,
    wouldSurface: hasSchema && !structuredData.issues.some((i) => i.title.toLowerCase().includes('availability')),
    reason: hasSchema
      ? 'Availability data in schema allows agents to report stock status.'
      : 'No availability data — agents cannot tell users if products are in stock.',
    confidence: 'medium',
  });

  // Query 7: Shipping/return info
  queries.push({
    query: `What is the return policy for ${domainName(input.url)}?`,
    wouldSurface: !input.metadata.siteBlocked && (
      !structuredData.issues.some((i) => i.title.toLowerCase().includes('return'))
    ),
    reason: 'Return policy data helps agents build trust and complete purchase recommendations.',
    confidence: 'medium',
  });

  return queries;
}

function domainName(url: string): string {
  try {
    return new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

function computeVisibilityScore(queries: SimulatedQuery[], categoryScores: {
  structuredData: CategoryResult;
  productQuality: CategoryResult;
  protocolReadiness: CategoryResult;
  merchantSignals: CategoryResult;
  aiDiscoverability: CategoryResult;
}): number {
  // 50% from query surfacing rate, 50% from category scores
  const surfaceRate = queries.filter((q) => q.wouldSurface).length / Math.max(queries.length, 1);

  const totalScore = Object.values(categoryScores).reduce((s, c) => s + c.score, 0);
  const totalMax = Object.values(categoryScores).reduce((s, c) => s + c.maxScore, 0);
  const categoryRate = totalScore / Math.max(totalMax, 1);

  return Math.round((surfaceRate * 50 + categoryRate * 50));
}

function identifyCompetitiveGaps(queries: SimulatedQuery[], categoryScores: {
  structuredData: CategoryResult;
  productQuality: CategoryResult;
  protocolReadiness: CategoryResult;
  merchantSignals: CategoryResult;
  aiDiscoverability: CategoryResult;
}): string[] {
  const gaps: string[] = [];

  if (categoryScores.structuredData.percentage < 50) {
    gaps.push('Competitors with complete JSON-LD Product schema will be preferred by AI agents for product recommendations.');
  }
  if (categoryScores.aiDiscoverability.percentage < 50) {
    gaps.push('Sites that allow AI crawlers (GPTBot, ClaudeBot) will be indexed and surfaced while yours remains invisible.');
  }
  if (categoryScores.protocolReadiness.percentage < 25) {
    gaps.push('Stores implementing UCP/MCP protocols will enable direct AI-agent transactions — a capability you lack.');
  }
  if (categoryScores.productQuality.percentage < 50) {
    gaps.push('Richer product descriptions, images, and FAQs give competitors more content for agents to match against queries.');
  }
  if (categoryScores.merchantSignals.percentage < 50) {
    gaps.push('Missing return policy, shipping data, and sitemap reduce agent trust signals compared to compliant competitors.');
  }

  const blockedQueries = queries.filter((q) => !q.wouldSurface);
  if (blockedQueries.length > queries.length / 2) {
    gaps.push(`Your store would NOT surface for ${blockedQueries.length} of ${queries.length} common AI shopping queries.`);
  }

  return gaps;
}

function generateRecommendations(queries: SimulatedQuery[], categoryScores: {
  structuredData: CategoryResult;
  productQuality: CategoryResult;
  protocolReadiness: CategoryResult;
  merchantSignals: CategoryResult;
  aiDiscoverability: CategoryResult;
}): string[] {
  const recs: string[] = [];

  // Prioritize by impact
  if (categoryScores.aiDiscoverability.percentage < 50) {
    recs.push('URGENT: Update robots.txt to allow GPTBot, ClaudeBot, and PerplexityBot. This is the #1 barrier to AI visibility.');
  }
  if (categoryScores.structuredData.percentage < 40) {
    recs.push('Add JSON-LD Product schema to every product page with name, price, availability, brand, and images.');
  }
  if (categoryScores.productQuality.percentage < 50) {
    recs.push('Enrich product descriptions to 150+ characters with specific attributes (size, material, use-case).');
  }
  if (categoryScores.protocolReadiness.percentage < 25) {
    recs.push('Deploy a ucp.json file at /.well-known/ucp.json to signal agent-readiness to AI shopping platforms.');
  }
  if (categoryScores.merchantSignals.percentage < 50) {
    recs.push('Add ReturnPolicy and OfferShippingDetails schema to build merchant trust signals.');
  }

  // Add review recommendation if missing
  const missingReviews = categoryScores.structuredData.issues.some(
    (i) => i.title.toLowerCase().includes('rating') || i.title.toLowerCase().includes('review')
  );
  if (missingReviews) {
    recs.push('Add AggregateRating and Review schema — products with ratings are 3x more likely to be recommended by AI agents.');
  }

  return recs.slice(0, 6);
}

export function simulateAgentDiscovery(
  url: string,
  categories: {
    structuredData: CategoryResult;
    productQuality: CategoryResult;
    protocolReadiness: CategoryResult;
    merchantSignals: CategoryResult;
    aiDiscoverability: CategoryResult;
  },
  metadata: ScanMetadata,
): AgentSimulationResult {
  const { productName, productCategory, brandName, price } = extractProductContext(
    categories.structuredData,
    categories.productQuality,
  );

  const input: SimulationInput = {
    url,
    ...categories,
    metadata,
    productName,
    productCategory,
    brandName,
    price,
  };

  const sampleQueries = buildSampleQueries(input);
  const visibilityScore = computeVisibilityScore(sampleQueries, categories);
  const competitiveGaps = identifyCompetitiveGaps(sampleQueries, categories);
  const recommendations = generateRecommendations(sampleQueries, categories);

  return { visibilityScore, sampleQueries, competitiveGaps, recommendations };
}
