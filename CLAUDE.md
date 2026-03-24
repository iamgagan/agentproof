# AgentProof — Multi-Agent Commerce Readiness Scanner

## What This Is

AgentProof is a free web tool that scans any ecommerce URL and generates an "Agent Readiness Score" (0-100) showing how well AI shopping agents (ChatGPT, Gemini, Copilot, Perplexity) can discover, interpret, and recommend their products. Think "Google Lighthouse for agentic commerce."

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **Database**: Vercel KV (Redis) for caching scan results
- **Crawler**: Cheerio + node-fetch for HTML parsing (server-side)

## Project Structure

```
agentproof/
├── app/
│   ├── layout.tsx          # Root layout with fonts, metadata
│   ├── page.tsx            # Landing page with scanner input
│   ├── scan/
│   │   └── [id]/
│   │       └── page.tsx    # Results page (shareable URL)
│   ├── api/
│   │   ├── scan/
│   │   │   └── route.ts    # POST: Initiates a scan
│   │   └── results/
│   │       └── [id]/
│   │           └── route.ts # GET: Fetch scan results
├── components/
│   ├── Scanner.tsx         # URL input + submit button
│   ├── ScoreGauge.tsx      # Animated circular score display
│   ├── CategoryCard.tsx    # Individual scoring category
│   ├── IssueList.tsx       # Prioritized list of issues found
│   ├── ShareBanner.tsx     # "Share your score" social card
│   ├── Header.tsx
│   └── Footer.tsx
├── lib/
│   ├── scanner/
│   │   ├── index.ts        # Main scan orchestrator
│   │   ├── schema.ts       # JSON-LD / structured data checker
│   │   ├── productData.ts  # Product attribute completeness
│   │   ├── protocols.ts    # UCP/ACP/MCP readiness checker
│   │   ├── merchantSignals.ts # Merchant Center signals
│   │   ├── discoverability.ts # AI crawler access + rendering
│   │   └── scoring.ts      # Score calculation engine
│   ├── types.ts            # TypeScript interfaces
│   └── utils.ts            # Helpers
├── public/
│   └── og-image.png
├── CLAUDE.md               # This file
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

## Scoring Engine Specification

The scanner checks 5 categories. Total score: 0-100.

### Category 1: Schema & Structured Data (25 points)

Check the page HTML for:
- [ ] JSON-LD `@type: Product` present (5 pts)
- [ ] Product name, description, image in schema (3 pts)
- [ ] Price + currency in schema via `offers` (3 pts)
- [ ] Availability status in schema (2 pts)
- [ ] Brand in schema (2 pts)
- [ ] SKU or GTIN identifier (2 pts)
- [ ] AggregateRating present (2 pts)
- [ ] Review markup present (2 pts)
- [ ] Organization/LocalBusiness schema on homepage (2 pts)
- [ ] BreadcrumbList schema (2 pts)

Implementation: Parse HTML with Cheerio, extract all `<script type="application/ld+json">` blocks, parse JSON, check for required fields. Handle nested @graph arrays.

### Category 2: Product Data Quality (20 points)

Analyze product pages for AI-interpretable content:
- [ ] Product description > 100 characters (3 pts)
- [ ] Description contains specific attributes like size, material, color, use-case keywords (4 pts)
- [ ] At least 3 product images (2 pts)
- [ ] Image alt text is descriptive, not generic like "IMG_001" or empty (3 pts)
- [ ] Product title is descriptive with brand + product type + key attribute (3 pts)
- [ ] FAQ or Q&A section present on product page (3 pts)
- [ ] Specifications table or structured attributes visible in DOM (2 pts)

Implementation: Analyze DOM content of product pages. Count images, check alt text patterns, measure description length, look for FAQ/spec sections via common CSS selectors and heading text.

### Category 3: Protocol Readiness (20 points)

Check for agentic commerce protocol support:
- [ ] Check for `/ucp.json` or `/.well-known/ucp.json` — returns valid JSON (5 pts)
- [ ] Check for `/agentic-feed` or ACP endpoint indicators (5 pts)
- [ ] Check for MCP server indicators: `/.well-known/mcp.json`, link tags with rel containing "mcp" (4 pts)
- [ ] Check `<link>` tags for agent-related rel attributes (3 pts)
- [ ] Check for Shopify Agentic Storefront indicators: `Shopify.routes`, meta tags with `shopify`, `X-ShopId` header (3 pts)

Implementation: Fetch well-known URLs with 5s timeout, check HTTP status. Parse HTML head for relevant link/meta tags. Check response headers.

### Category 4: Merchant Center Signals (15 points)

Indicators of Google Merchant Center integration:
- [ ] Return policy structured data (ReturnPolicy schema) or visible return policy link on product page (4 pts)
- [ ] Shipping info structured data (OfferShippingDetails) or visible shipping section (3 pts)
- [ ] Product reviews visible with review count (3 pts)
- [ ] Canonical URL properly set via `<link rel="canonical">` (2 pts)
- [ ] Hreflang tags present for international stores (1 pt)
- [ ] sitemap.xml exists and contains product URLs (2 pts)

Implementation: Check schema types, fetch /sitemap.xml, parse for product URL patterns.

### Category 5: AI Discoverability (20 points)

Whether AI crawlers can access and understand the site:
- [ ] robots.txt allows GPTBot (3 pts)
- [ ] robots.txt allows ClaudeBot / anthropic-ai (3 pts)
- [ ] robots.txt allows Google-Extended (3 pts)
- [ ] robots.txt allows PerplexityBot (2 pts)
- [ ] Product content is in initial HTML response, not JS-only rendered (4 pts)
- [ ] Key product info (title, price) found in raw HTML without JS execution (3 pts)
- [ ] Meta description present and > 50 chars (2 pts)

Implementation: Fetch /robots.txt, parse for User-agent directives and Disallow rules. Compare initial HTML fetch content to detect JS-rendering dependency by checking if product-related text exists in raw HTML.

## API Design

### POST /api/scan
```typescript
// Request body
{ url: string }

// Response
{
  scanId: string,
  status: "completed",
  results: ScanResults
}
```

For MVP, scan runs synchronously in the API route (within Vercel's 30s limit). Results are cached in Vercel KV keyed by normalized URL hash.

### GET /api/results/[id]
```typescript
// Response
{
  scanId: string,
  url: string,
  overallScore: number,
  grade: "A" | "B" | "C" | "D" | "F",
  categories: {
    schemaStructuredData: CategoryResult,
    productDataQuality: CategoryResult,
    protocolReadiness: CategoryResult,
    merchantSignals: CategoryResult,
    aiDiscoverability: CategoryResult
  },
  topIssues: Issue[],
  scannedAt: string
}
```

### TypeScript Interfaces

```typescript
interface ScanResults {
  scanId: string;
  url: string;
  overallScore: number;
  grade: "A" | "B" | "C" | "D" | "F";
  categories: Record<string, CategoryResult>;
  topIssues: Issue[];
  scannedAt: string;
}

interface CategoryResult {
  name: string;
  score: number;
  maxScore: number;
  checks: Check[];
}

interface Check {
  id: string;
  name: string;
  description: string;
  passed: boolean;
  points: number;
  maxPoints: number;
  details?: string;
  fixSuggestion?: string;
}

interface Issue {
  severity: "critical" | "warning" | "info";
  category: string;
  title: string;
  description: string;
  impact: string;
  fix: string;
}
```

## Scan Flow

1. Validate URL input (must be valid URL with http/https)
2. Normalize URL (strip trailing slash, lowercase hostname)
3. Check Vercel KV cache — if fresh results exist (< 24h), return cached
4. Fetch the homepage HTML with realistic browser User-Agent header
5. Try to discover a product page:
   - Look for links matching patterns: /product/, /products/, /shop/, /item/, /p/
   - Also check for JSON-LD Product schema on the homepage itself
   - If found, fetch the first product page for detailed analysis
6. Run all 5 category checkers in parallel using Promise.all()
7. Calculate scores per category and overall
8. Generate top 5 issues sorted by severity and point impact
9. Compute letter grade: A (80-100), B (60-79), C (40-59), D (20-39), F (0-19)
10. Store results in Vercel KV with 24h TTL
11. Return results

## Edge Cases to Handle

- Sites that block non-browser user agents → use realistic Chrome UA string
- Sites entirely JS-rendered → the "no content without JS" check catches this and scores it as a negative
- Multiple product schema types → check for both Product and ProductGroup
- Nested @graph arrays in JSON-LD → flatten and search recursively
- Handle HTTP redirects (301/302) by following them
- Handle 403/429 responses → report as "unable to scan, site may be blocking automated requests"
- Handle timeouts (> 5s per request) → skip that check with a note
- Handle malformed JSON-LD → try/catch each block, skip invalid ones
- Handle sites with no product pages found → still score homepage-level checks, note that no product page was detected

## Landing Page Design

### Aesthetic: "Dark observatory" — mission control for your store's AI visibility. Dark backgrounds, electric teal accents, clean data visualization, monospace data readouts.

### Hero Section
- Headline: **"How do AI shopping agents see your store?"**
- Subheadline: "ChatGPT, Gemini, and Copilot are the new storefront. Find out if you're invisible."
- URL input field (large, prominent) with "Scan My Store →" button
- Below input: "Free • No signup • Results in 30 seconds"

### Problem Section
- "Google organic traffic is down 20-50% for ecommerce brands. AI agents are replacing search."
- Three stat cards with numbers:
  - "4,700%" — YoY increase in AI agent traffic to ecommerce (Adobe)
  - "87%" — of stores lack basic agent readiness
  - "$3-5T" — projected agentic commerce market by 2030 (McKinsey)

### What We Check Section
- 5 cards for the 5 scoring categories, each with an icon and brief description
- Cards should have a subtle glow effect on hover

### How It Works Section
- 3 steps: Enter URL → Scanner agents analyze → Get score + fix recommendations
- Visual with numbered steps and connecting lines

### CTA Section
- "Ready to see your score?" with another URL input field
- Below: "Trusted by merchants on WooCommerce, BigCommerce, Magento, and Shopify"

### Results Page
- Top: Large animated circular gauge (0-100) with letter grade
- Color-coded: Green (80+), Yellow (40-79), Red (0-39)
- URL displayed below the score
- 5 category cards in a grid, each expandable to show individual checks
- Each check shows: ✓ or ✗, name, points earned/max, and a fix suggestion if failed
- Right sidebar or bottom section: "Top Issues" panel with severity badges (Critical/Warning/Info)
- Share banner: "Share your Agent Readiness Score" with Twitter/LinkedIn share buttons
- The share URL should be the /scan/[id] page itself, which loads from cache
- Bottom CTA: "Want auto-generated fixes? Join the AgentProof Pro waitlist" — email capture

## Color Palette

```css
:root {
  --bg-primary: #0A0A0F;
  --bg-surface: #12121A;
  --bg-elevated: #1A1A2E;
  --accent-teal: #00E5CC;
  --accent-indigo: #6366F1;
  --success: #22C55E;
  --warning: #EAB308;
  --danger: #EF4444;
  --text-primary: #F8FAFC;
  --text-secondary: #94A3B8;
  --text-muted: #64748B;
  --border: #1E293B;
}
```

## Fonts

Use `next/font/google`:
- **Headings**: "Space Grotesk" (weight 500-700) — actually, use "Outfit" or "Syne" for something less generic
- **Body**: "Geist" via `next/font/local` (included with Next.js) or "DM Sans"
- **Monospace/Data**: "Geist Mono" or "JetBrains Mono" for scores, URLs, technical details

## Environment Variables

```
KV_REST_API_URL=         # Vercel KV Redis URL
KV_REST_API_TOKEN=       # Vercel KV token
NEXT_PUBLIC_APP_URL=     # https://agentproof.com or localhost
```

## Vercel Config

```json
// vercel.json
{
  "functions": {
    "app/api/scan/route.ts": {
      "maxDuration": 30
    }
  }
}
```

## Key Implementation Details

### Robots.txt Parser
```typescript
function checkRobotsTxt(robotsTxt: string, botName: string): boolean {
  const lines = robotsTxt.split('\n');
  let currentAgent = '';
  let isRelevant = false;
  
  for (const line of lines) {
    const trimmed = line.trim().toLowerCase();
    if (trimmed.startsWith('user-agent:')) {
      currentAgent = trimmed.replace('user-agent:', '').trim();
      isRelevant = currentAgent === '*' || currentAgent === botName.toLowerCase();
    }
    if (isRelevant && trimmed.startsWith('disallow:')) {
      const path = trimmed.replace('disallow:', '').trim();
      if (path === '/' || path === '/*') return false; // blocked
    }
  }
  return true; // allowed by default
}
```

### JSON-LD Extractor
```typescript
function extractJsonLd(html: string): any[] {
  const $ = cheerio.load(html);
  const schemas: any[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html() || '');
      if (Array.isArray(data)) schemas.push(...data);
      else if (data['@graph']) schemas.push(...data['@graph']);
      else schemas.push(data);
    } catch {}
  });
  return schemas;
}
```

### Product Page Discovery
```typescript
function findProductPageUrl(html: string, baseUrl: string): string | null {
  const $ = cheerio.load(html);
  const productPatterns = [
    /\/products?\//i,
    /\/shop\//i,
    /\/item\//i,
    /\/p\//i,
    /\/catalog\//i,
    /\/collection.*\/products?\//i
  ];
  
  const links: string[] = [];
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (href) links.push(href);
  });
  
  for (const link of links) {
    for (const pattern of productPatterns) {
      if (pattern.test(link)) {
        try {
          return new URL(link, baseUrl).href;
        } catch {}
      }
    }
  }
  return null;
}
```

## Build & Run Commands

```bash
npx create-next-app@latest agentproof --typescript --tailwind --app --src-dir=false
cd agentproof
npm install cheerio @vercel/kv nanoid
npm run dev
```

## What NOT to Build (MVP scope control)

- No user accounts or authentication
- No payment processing
- No competitor comparison (Pro feature, later)
- No auto-fix generation (Pro feature, later)
- No PDF report export
- No email capture beyond a simple waitlist form
- No database beyond Vercel KV cache
- Keep it to scanning ONE URL at a time
