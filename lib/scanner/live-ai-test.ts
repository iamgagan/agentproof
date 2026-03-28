// lib/scanner/live-ai-test.ts
// Sends real shopping queries to OpenAI and checks if the store is mentioned

import type { LiveAITestResult, LiveAIQuery } from '../types';

const OPENAI_TIMEOUT = 10000;
const MAX_TOKENS = 500;

function extractBrandName(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, '').split('.')[0];
  } catch {
    return url;
  }
}

function generateQueries(brand: string, url: string): string[] {
  return [
    `What products does ${brand} sell?`,
    `Is ${brand} a good place to shop online?`,
    `Can you recommend ${brand} for online shopping?`,
    `What do customers say about shopping at ${url}?`,
    `Where can I find products from ${brand}?`,
  ];
}

function checkMention(response: string, brand: string, url: string): { mentionsBrand: boolean; mentionsUrl: boolean } {
  const lower = response.toLowerCase();
  const brandLower = brand.toLowerCase();
  const hostname = new URL(url).hostname.toLowerCase();

  return {
    mentionsBrand: lower.includes(brandLower),
    mentionsUrl: lower.includes(hostname) || lower.includes(url.toLowerCase()),
  };
}

async function queryOpenAI(query: string): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful shopping assistant. Answer concisely about products, brands, and online stores.',
          },
          { role: 'user', content: query },
        ],
        max_tokens: MAX_TOKENS,
        temperature: 0.3,
      }),
      signal: AbortSignal.timeout(OPENAI_TIMEOUT),
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}

export async function runLiveAITest(url: string): Promise<LiveAITestResult | null> {
  if (!process.env.OPENAI_API_KEY) return null;

  const brand = extractBrandName(url);
  const queries = generateQueries(brand, url);
  const results: LiveAIQuery[] = [];

  // Run queries in parallel (all 5 at once for speed)
  const responses = await Promise.all(
    queries.map(async (query) => {
      const aiResponse = await queryOpenAI(query);
      return { query, aiResponse };
    })
  );

  for (const { query, aiResponse } of responses) {
    if (!aiResponse) {
      results.push({
        query,
        aiResponse: '[No response — API error or timeout]',
        mentionsBrand: false,
        mentionsUrl: false,
        confidence: 'low',
      });
      continue;
    }

    const { mentionsBrand, mentionsUrl } = checkMention(aiResponse, brand, url);
    const confidence: 'high' | 'medium' | 'low' =
      mentionsBrand && mentionsUrl ? 'high' :
      mentionsBrand || mentionsUrl ? 'medium' : 'low';

    results.push({
      query,
      aiResponse,
      mentionsBrand,
      mentionsUrl,
      confidence,
    });
  }

  const mentionedIn = results.filter((r) => r.mentionsBrand || r.mentionsUrl).length;

  return {
    queriesTested: results.length,
    mentionedIn,
    queries: results,
  };
}
