import { describe, it, expect } from 'vitest';
import { validateUrl, normalizeUrlForCache, gradeColor, scoreColor } from '@/lib/utils';

describe('validateUrl', () => {
  it('rejects empty input', () => {
    expect(validateUrl('')).toEqual({ valid: false, error: 'Please enter a URL' });
    expect(validateUrl('   ')).toEqual({ valid: false, error: 'Please enter a URL' });
  });

  it('accepts valid URLs with protocol', () => {
    expect(validateUrl('https://example.com')).toEqual({ valid: true });
    expect(validateUrl('http://shop.example.com/products')).toEqual({ valid: true });
  });

  it('auto-prepends https when no protocol', () => {
    expect(validateUrl('example.com')).toEqual({ valid: true });
    expect(validateUrl('shop.example.com')).toEqual({ valid: true });
  });

  it('rejects non-http protocols', () => {
    expect(validateUrl('ftp://example.com').valid).toBe(false);
  });

  it('rejects domains without TLD', () => {
    expect(validateUrl('https://localhost').valid).toBe(false);
    expect(validateUrl('just-a-word').valid).toBe(false);
  });

  it('blocks SSRF addresses', () => {
    expect(validateUrl('http://127.0.0.1').valid).toBe(false);
    expect(validateUrl('http://10.0.0.1').valid).toBe(false);
    expect(validateUrl('http://192.168.1.1').valid).toBe(false);
    expect(validateUrl('http://169.254.0.1').valid).toBe(false);
    expect(validateUrl('http://172.16.0.1').valid).toBe(false);
  });

  it('rejects completely invalid URLs', () => {
    expect(validateUrl('not a url at all!!!').valid).toBe(false);
  });
});

describe('normalizeUrlForCache', () => {
  it('strips trailing slashes', () => {
    expect(normalizeUrlForCache('https://example.com/')).toBe('https://example.com');
    expect(normalizeUrlForCache('https://example.com/path/')).toBe('https://example.com/path');
  });

  it('lowercases hostname', () => {
    expect(normalizeUrlForCache('https://EXAMPLE.COM/Path')).toBe('https://example.com/Path');
  });

  it('auto-prepends https', () => {
    expect(normalizeUrlForCache('example.com')).toBe('https://example.com');
  });
});

describe('gradeColor', () => {
  it('returns correct color per grade', () => {
    expect(gradeColor('A')).toBe('var(--success)');
    expect(gradeColor('C')).toBe('var(--warning)');
    expect(gradeColor('F')).toBe('var(--danger)');
    expect(gradeColor('X')).toBe('var(--text-muted)');
  });
});

describe('scoreColor', () => {
  it('returns green for high scores', () => {
    expect(scoreColor(80)).toBe('var(--success)');
    expect(scoreColor(100)).toBe('var(--success)');
  });

  it('returns yellow for medium scores', () => {
    expect(scoreColor(40)).toBe('var(--warning)');
    expect(scoreColor(79)).toBe('var(--warning)');
  });

  it('returns red for low scores', () => {
    expect(scoreColor(0)).toBe('var(--danger)');
    expect(scoreColor(39)).toBe('var(--danger)');
  });
});
