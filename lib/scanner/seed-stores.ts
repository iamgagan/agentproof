// lib/scanner/seed-stores.ts
// Well-known ecommerce stores for building the benchmark dataset.

export const SEED_STORES: { url: string; category: string }[] = [
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
  { url: 'https://www.kyliecosmetics.com', category: 'beauty' },
  { url: 'https://www.tatcha.com', category: 'beauty' },

  // Home
  { url: 'https://www.westelm.com', category: 'home' },
  { url: 'https://www.cb2.com', category: 'home' },
  { url: 'https://www.article.com', category: 'home' },
  { url: 'https://www.wayfair.com', category: 'home' },
  { url: 'https://www.potterybarn.com', category: 'home' },
  { url: 'https://www.ikea.com', category: 'home' },
  { url: 'https://www.crateandbarrel.com', category: 'home' },

  // Food & Beverage
  { url: 'https://www.bluebottlecoffee.com', category: 'food' },
  { url: 'https://www.traderjoes.com', category: 'food' },
  { url: 'https://www.thrivemarketplace.com', category: 'food' },
  { url: 'https://www.goldbelly.com', category: 'food' },
  { url: 'https://www.drizly.com', category: 'food' },

  // Sports & Outdoors
  { url: 'https://www.rei.com', category: 'sports' },
  { url: 'https://www.yeti.com', category: 'sports' },
  { url: 'https://www.thenorthface.com', category: 'sports' },
  { url: 'https://www.underarmour.com', category: 'sports' },
  { url: 'https://www.brooksrunning.com', category: 'sports' },
  { url: 'https://www.peloton.com', category: 'sports' },

  // DTC / General
  { url: 'https://www.warbyparker.com', category: 'fashion' },
  { url: 'https://www.casper.com', category: 'home' },
  { url: 'https://www.away.com', category: 'fashion' },
  { url: 'https://www.harrys.com', category: 'beauty' },
  { url: 'https://www.chewy.com', category: 'pets' },
  { url: 'https://www.etsy.com', category: 'marketplace' },
  { url: 'https://www.shopify.com', category: 'platform' },
];
