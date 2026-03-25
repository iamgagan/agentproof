// tests/unit/product-discovery.test.ts
import { describe, it, expect } from 'vitest';
import { findProductPageInHtml } from '@/lib/scanner/index';

const BASE = 'https://www.example.com';

describe('findProductPageInHtml', () => {
  it('finds /products/ URL', () => {
    const html = `<a href="/products/red-widget">Red Widget</a>`;
    expect(findProductPageInHtml(html, BASE)).toBe(`${BASE}/products/red-widget`);
  });

  it('finds /item/ URL', () => {
    const html = `<a href="/item/blue-mug">Mug</a>`;
    expect(findProductPageInHtml(html, BASE)).toBe(`${BASE}/item/blue-mug`);
  });

  it('finds /p/ URL', () => {
    const html = `<a href="/p/canvas-bag">Bag</a>`;
    expect(findProductPageInHtml(html, BASE)).toBe(`${BASE}/p/canvas-bag`);
  });

  it('finds /catalog/product/ URL', () => {
    const html = `<a href="/catalog/product/widget-sku">Widget</a>`;
    expect(findProductPageInHtml(html, BASE)).toBe(`${BASE}/catalog/product/widget-sku`);
  });

  it('finds /shop/ URL (requires 10+ char suffix)', () => {
    const html = `<a href="/shop/premium-coffee-beans">Coffee</a>`;
    expect(findProductPageInHtml(html, BASE)).toBe(`${BASE}/shop/premium-coffee-beans`);
  });

  it('does not match /shop/ URL with short suffix (< 10 chars)', () => {
    // Pattern requires {10,} after /shop/ — "short" is only 5 chars
    const html = `<a href="/shop/short">Item</a>`;
    expect(findProductPageInHtml(html, BASE)).toBeNull();
  });

  it('does not match absolute hrefs (patterns only capture relative paths)', () => {
    // The regex patterns require href="/products/..." — they capture the path after href="
    // An absolute href like href="https://..." doesn't start with /products/ so it won't match
    const html = `<a href="https://cdn.example.com/products/widget">Widget</a>`;
    expect(findProductPageInHtml(html, BASE)).toBeNull();
  });

  it('skips Liquid template placeholders', () => {
    const html = `<a href="/products/{{ product.handle }}">Item</a>`;
    expect(findProductPageInHtml(html, BASE)).toBeNull();
  });

  it('skips Liquid placeholder and finds the next real URL', () => {
    const html = `
      <a href="/products/{{ product.handle }}">Template</a>
      <a href="/products/real-product-name">Real Product</a>
    `;
    expect(findProductPageInHtml(html, BASE)).toBe(`${BASE}/products/real-product-name`);
  });

  it('returns null when no product URLs found', () => {
    const html = `<a href="/about">About</a><a href="/contact">Contact</a>`;
    expect(findProductPageInHtml(html, BASE)).toBeNull();
  });
});
