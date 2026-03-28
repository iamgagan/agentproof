// scripts/seed-benchmarks.ts
// Bulk-scans seed stores against the live API to build the benchmark dataset.
// Usage: npx tsx scripts/seed-benchmarks.ts

const SEED_STORES = [
  // Fashion
  { url: 'https://www.nike.com', category: 'fashion' },
  { url: 'https://www.allbirds.com', category: 'fashion' },
  { url: 'https://www.bombas.com', category: 'fashion' },
  { url: 'https://www.everlane.com', category: 'fashion' },
  { url: 'https://www.patagonia.com', category: 'fashion' },
  { url: 'https://www.uniqlo.com', category: 'fashion' },
  { url: 'https://www.lululemon.com', category: 'fashion' },
  { url: 'https://www.nordstrom.com', category: 'fashion' },
  { url: 'https://www.zara.com', category: 'fashion' },
  { url: 'https://www.asos.com', category: 'fashion' },
  { url: 'https://www.warbyparker.com', category: 'fashion' },
  { url: 'https://www.away.com', category: 'fashion' },

  // Electronics
  { url: 'https://www.apple.com', category: 'electronics' },
  { url: 'https://www.bestbuy.com', category: 'electronics' },
  { url: 'https://www.samsung.com', category: 'electronics' },
  { url: 'https://www.bose.com', category: 'electronics' },
  { url: 'https://www.sonos.com', category: 'electronics' },
  { url: 'https://www.anker.com', category: 'electronics' },
  { url: 'https://www.logitech.com', category: 'electronics' },
  { url: 'https://www.razer.com', category: 'electronics' },

  // Beauty
  { url: 'https://www.glossier.com', category: 'beauty' },
  { url: 'https://www.sephora.com', category: 'beauty' },
  { url: 'https://www.ulta.com', category: 'beauty' },
  { url: 'https://www.fentybeauty.com', category: 'beauty' },
  { url: 'https://www.theordinary.com', category: 'beauty' },
  { url: 'https://www.tatcha.com', category: 'beauty' },
  { url: 'https://www.harrys.com', category: 'beauty' },

  // Home
  { url: 'https://www.westelm.com', category: 'home' },
  { url: 'https://www.cb2.com', category: 'home' },
  { url: 'https://www.article.com', category: 'home' },
  { url: 'https://www.wayfair.com', category: 'home' },
  { url: 'https://www.potterybarn.com', category: 'home' },
  { url: 'https://www.ikea.com', category: 'home' },
  { url: 'https://www.crateandbarrel.com', category: 'home' },
  { url: 'https://www.casper.com', category: 'home' },

  // Food & Beverage
  { url: 'https://www.bluebottlecoffee.com', category: 'food' },
  { url: 'https://www.goldbelly.com', category: 'food' },

  // Sports & Outdoors
  { url: 'https://www.rei.com', category: 'sports' },
  { url: 'https://www.yeti.com', category: 'sports' },
  { url: 'https://www.thenorthface.com', category: 'sports' },
  { url: 'https://www.underarmour.com', category: 'sports' },
  { url: 'https://www.brooksrunning.com', category: 'sports' },
  { url: 'https://www.peloton.com', category: 'sports' },

  // Marketplace / Platform
  { url: 'https://www.etsy.com', category: 'marketplace' },
  { url: 'https://www.chewy.com', category: 'pets' },
];

const API_URL = process.env.API_URL || 'https://agent-proof.com';

interface ScanResponse {
  scanId: string;
  cached: boolean;
  results: {
    overallScore: number;
    grade: string;
    metadata: { platform: string | null };
  };
  error?: string;
}

async function scanStore(url: string, index: number, total: number): Promise<void> {
  const domain = new URL(url).hostname.replace('www.', '');
  process.stdout.write(`[${index + 1}/${total}] Scanning ${domain}... `);

  try {
    const res = await fetch(`${API_URL}/api/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.log(`FAILED (${res.status}): ${text.slice(0, 100)}`);
      return;
    }

    const data: ScanResponse = await res.json();
    const cached = data.cached ? ' (cached)' : '';
    console.log(
      `${data.results.overallScore}/100 [${data.results.grade}] platform=${data.results.metadata.platform ?? 'unknown'}${cached}`
    );
  } catch (err) {
    console.log(`ERROR: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function main() {
  console.log(`\nAgentProof Benchmark Seeder`);
  console.log(`Target: ${API_URL}`);
  console.log(`Stores: ${SEED_STORES.length}\n`);

  const results: { domain: string; score: number | null }[] = [];

  for (let i = 0; i < SEED_STORES.length; i++) {
    await scanStore(SEED_STORES[i].url, i, SEED_STORES.length);
    // 3s delay between scans to avoid overwhelming the API
    if (i < SEED_STORES.length - 1) {
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  console.log(`\nDone! ${SEED_STORES.length} stores scanned.`);
  console.log(`View benchmark stats: ${API_URL}/api/benchmarks`);
}

main().catch(console.error);
