// tests/unit/schema-quality.test.ts
import { describe, it, expect } from 'vitest';
import { scoreAttrQuality } from '@/lib/scanner/schema-analyzer';

describe('scoreAttrQuality - price/offers', () => {
  it('gives 1pt for valid numeric price + ISO currency', () => {
    const product = { offers: { price: 29.99, priceCurrency: 'USD' } };
    expect(scoreAttrQuality(product, 'offers').points).toBe(1);
  });

  it('gives 0.5pt for string price like "$29.99"', () => {
    const product = { offers: { price: '$29.99', priceCurrency: 'USD' } };
    expect(scoreAttrQuality(product, 'offers').points).toBe(0.5);
  });

  it('gives 0.5pt for non-ISO currency', () => {
    const product = { offers: { price: 10, priceCurrency: 'dollars' } };
    expect(scoreAttrQuality(product, 'offers').points).toBe(0.5);
  });

  it('gives 0pt when offers is missing', () => {
    expect(scoreAttrQuality({}, 'offers').points).toBe(0);
  });

  it('gives 0pt when price is missing from offers', () => {
    const product = { offers: { priceCurrency: 'USD' } };
    expect(scoreAttrQuality(product, 'offers').points).toBe(0);
  });

  it('gives 0pt when currency is missing from offers', () => {
    const product = { offers: { price: 19.99 } };
    expect(scoreAttrQuality(product, 'offers').points).toBe(0);
  });
});

describe('scoreAttrQuality - description', () => {
  it('gives 1pt for 50+ char description', () => {
    const product = { description: 'A'.repeat(50) };
    expect(scoreAttrQuality(product, 'description').points).toBe(1);
  });

  it('gives 0.5pt for short description', () => {
    const product = { description: 'Short desc' };
    expect(scoreAttrQuality(product, 'description').points).toBe(0.5);
  });

  it('gives 0.5pt for placeholder description', () => {
    const product = { description: 'N/A' };
    expect(scoreAttrQuality(product, 'description').points).toBe(0.5);
  });
});

describe('scoreAttrQuality - image', () => {
  it('gives 1pt for absolute https URL', () => {
    const product = { image: 'https://cdn.store.com/products/img.jpg' };
    expect(scoreAttrQuality(product, 'image').points).toBe(1);
  });

  it('gives 0.5pt for relative URL', () => {
    const product = { image: '/products/img.jpg' };
    expect(scoreAttrQuality(product, 'image').points).toBe(0.5);
  });

  it('gives 0.5pt for placeholder URL', () => {
    const product = { image: 'https://cdn.store.com/placeholder.jpg' };
    expect(scoreAttrQuality(product, 'image').points).toBe(0.5);
  });

  it('gives 0.5pt for http (non-HTTPS) absolute URL', () => {
    const product = { image: 'http://cdn.store.com/products/img.jpg' };
    expect(scoreAttrQuality(product, 'image').points).toBe(0.5);
  });
});

describe('scoreAttrQuality - availability', () => {
  it('gives 1pt for valid schema.org URL', () => {
    const product = { offers: { availability: 'https://schema.org/InStock' } };
    expect(scoreAttrQuality(product, 'availability').points).toBe(1);
  });

  it('gives 0.5pt for non-schema.org string', () => {
    const product = { offers: { availability: 'InStock' } };
    expect(scoreAttrQuality(product, 'availability').points).toBe(0.5);
  });
});
