// tests/unit/product-discovery.test.ts
import { describe, it, expect } from 'vitest';
import { findProductPageInHtml } from '@/lib/scanner/index';

const BASE = 'https://www.example.com';

describe('findProductPageInHtml', () => {
  it('finds a real product URL', () => {
    const html = `<a href="/products/red-widget">Red Widget</a>`;
    expect(findProductPageInHtml(html, BASE)).toBe(`${BASE}/products/red-widget`);
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

  it('resolves relative product URLs against base', () => {
    const html = `<a href="/products/blue-widget">Widget</a>`;
    expect(findProductPageInHtml(html, BASE)).toBe(`${BASE}/products/blue-widget`);
  });
});
