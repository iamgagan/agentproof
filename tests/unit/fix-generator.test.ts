import { describe, it, expect } from 'vitest';
import { generateFix } from '@/lib/scanner/fix-generator';

describe('generateFix', () => {
  it('returns a fix for missing Product schema on Shopify', () => {
    const fix = generateFix('structuredData_no_json_ld_product_schema_found', 'shopify', {});
    expect(fix).not.toBeNull();
    expect(fix!.code).toContain('@type');
    expect(fix!.code).toContain('Product');
    expect(fix!.language).toBe('json');
    expect(fix!.instruction).toContain('theme');
  });

  it('returns a fix for missing price currency', () => {
    const fix = generateFix('productQuality_incomplete_pricing_data_in_structured_schema', 'shopify', {});
    expect(fix).not.toBeNull();
    expect(fix!.code).toContain('priceCurrency');
    expect(fix!.code).toContain('USD');
  });

  it('returns null for unknown issue id', () => {
    expect(generateFix('unknown_issue_id', 'shopify', {})).toBeNull();
  });

  it('adapts robots.txt fix to the detected bot names', () => {
    const fix = generateFix('aiDiscoverability_gptbot_is_blocked_by_robots_txt', 'shopify', {});
    expect(fix).not.toBeNull();
    expect(fix!.code).toContain('GPTBot');
    expect(fix!.language).toBe('text');
  });
});
