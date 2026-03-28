# AgentProof Launch — Reddit Posts

---

## r/ecommerce

**Title:** We scanned 41 top ecommerce brands to see how AI agents see their stores — average score was 31/100

**Body:**
I've been researching how AI shopping agents (ChatGPT, Gemini, Copilot, Perplexity) discover and recommend products. These agents are driving 4,700% more traffic to ecommerce YoY, and the trend is only accelerating.

The problem? Most stores are invisible to them.

I built a free tool called AgentProof that scans any ecommerce URL and scores it on 5 dimensions:

- Schema & structured data (can AI parse your products?)
- Product data quality (are descriptions, images, specs rich enough?)
- Protocol readiness (do you support UCP, MCP, or other agentic protocols?)
- Merchant signals (returns, shipping, reviews, sitemaps)
- AI discoverability (are you blocking GPTBot? Is your content server-rendered?)

We scanned 41 major brands and the results were rough — average 31/100. Even some big names scored under 20.

You can scan your store for free at agent-proof.com. Takes about 30 seconds.

Would love feedback from this community. What score did your store get?

---

## r/shopify

**Title:** PSA: Most Shopify stores are blocking AI shopping agents without knowing it — here's how to check

**Body:**
Quick heads up for Shopify merchants:

AI agents like ChatGPT, Gemini, and Perplexity are increasingly recommending products directly to consumers. But many Shopify stores have default robots.txt settings that block these bots.

I built a free scanner (agent-proof.com) that checks your store's AI agent readiness across 5 categories. Takes 30 seconds.

Common issues we're seeing on Shopify stores:
- GPTBot and ClaudeBot blocked by default robots.txt
- Missing or incomplete JSON-LD Product schema
- No agentic commerce protocol support
- Product descriptions too short for AI to meaningfully recommend

The good news: most fixes are quick. The scanner shows you exactly what to fix with copy-paste code.

Not trying to sell anything — the scan is free. Pro plan is there if you want auto-generated fixes but the score and issues are free.

---

## r/SideProject

**Title:** I built a "Google Lighthouse for AI shopping agents" — scans ecommerce stores for AI readiness

**Body:**
Hey r/SideProject!

I noticed that AI agents (ChatGPT, Gemini, Copilot) are becoming a major product discovery channel for ecommerce, but there's no tool that tells merchants how visible they are to these agents.

So I built AgentProof (agent-proof.com).

**What it does:**
- Enter any ecommerce URL
- Get an Agent Readiness Score (0-100) in 30 seconds
- See exactly what's working and what's broken across 5 categories
- Get specific fix recommendations

**Tech stack:** Next.js 14, TypeScript, Cheerio, Postgres, Vercel

**What I learned scanning 41 top brands:**
- Average score: 31/100
- Most stores don't realize they're blocking AI crawlers
- Very few support emerging agentic commerce protocols

Business model: Free scans, $200/mo Pro for auto-generated fixes, protocol file generation, and monitoring.

Would love any feedback on the product or the business model. Happy to answer technical questions about the scanner too.

---

## r/artificial

**Title:** Ecommerce stores are invisible to AI agents — we built a tool to measure and fix it

**Body:**
Interesting data point from a project I've been working on:

We scanned 41 major ecommerce brands to measure how well AI shopping agents can discover, interpret, and recommend their products. We check structured data, content quality, protocol support, and crawler access.

Average score: 31/100.

The gap between "how humans see a store" and "how AI agents see a store" is massive. Most product pages look great in a browser but are essentially blank to an AI agent doing a shopping query.

Key issues:
- Missing JSON-LD structured data (AI agents can't parse unstructured HTML well)
- robots.txt blocking GPTBot, ClaudeBot, PerplexityBot
- JavaScript-rendered content that doesn't exist in raw HTML
- No support for emerging protocols like UCP (Universal Commerce Protocol) or MCP

The tool is at agent-proof.com if anyone wants to try it. Curious what this community thinks about the agentic commerce space more broadly.
