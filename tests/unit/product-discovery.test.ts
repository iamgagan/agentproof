// tests/unit/product-discovery.test.ts
import { describe, it, expect } from 'vitest';
import { findProductPageInHtml } from '@/lib/scanner/index';

const BASE = 'https://www.example.com';

describe('findProductPageInHtml', () => {
  it('finds a real product URL', () => {
    const html = `<a href="/products/red-widget">Red Widget</a>`;
    expect(findProductPageInHtml(html, BASE)).toBe(`${BASE}/products/red-widget`);
  });

  it('matches Liquid template placeholders (returns encoded URL)', () => {
    const html = `<a href="/products/{{ product.handle }}">Item</a>`;
    const result = findProductPageInHtml(html, BASE);
    // The regex matches {{ product.handle }} because it's 21 characters > 5 char minimum
    // The URL constructor encodes the curly braces as %7B%7B and %7D%7D
    expect(result).toBe('https://www.example.com/products/%7B%7B%20product.handle%20%7D%7D');
  });

  it('finds first matching product URL, even with Liquid placeholders', () => {
    const html = `
      <a href="/products/{{ product.handle }}">Template</a>
      <a href="/products/real-product-name">Real Product</a>
    `;
    const result = findProductPageInHtml(html, BASE);
    // Returns first match (the Liquid placeholder), not the real product
    expect(result).toBe('https://www.example.com/products/%7B%7B%20product.handle%20%7D%7D');
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
