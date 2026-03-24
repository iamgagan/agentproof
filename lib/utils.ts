// lib/utils.ts

export function validateUrl(input: string): { valid: boolean; error?: string } {
  const trimmed = input.trim();
  if (!trimmed) return { valid: false, error: 'Please enter a URL' };

  let url = trimmed;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'URL must use http or https' };
    }
    if (!parsed.hostname.includes('.')) {
      return { valid: false, error: 'Please enter a valid domain' };
    }
    // Block private/loopback/link-local addresses to prevent SSRF
    const BLOCKED_HOSTS = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|::1|0\.0\.0\.0|\[::1\])/i;
    if (BLOCKED_HOSTS.test(parsed.hostname)) {
      return { valid: false, error: 'Please enter a public internet address' };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'Please enter a valid URL' };
  }
}

export function normalizeUrlForCache(input: string): string {
  let url = input.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  const parsed = new URL(url);
  return `${parsed.protocol}//${parsed.hostname.toLowerCase()}${parsed.pathname.replace(/\/+$/, '')}`;
}

export function gradeColor(grade: string): string {
  switch (grade) {
    case 'A': return 'var(--success)';
    case 'B': return '#86EFAC';
    case 'C': return 'var(--warning)';
    case 'D': return '#FB923C';
    case 'F': return 'var(--danger)';
    default:  return 'var(--text-muted)';
  }
}

export function scoreColor(score: number): string {
  if (score >= 80) return 'var(--success)';
  if (score >= 40) return 'var(--warning)';
  return 'var(--danger)';
}

export function categoryLabel(key: string): string {
  const labels: Record<string, string> = {
    structuredData:    'Schema & Structured Data',
    productQuality:    'Product Data Quality',
    protocolReadiness: 'Protocol Readiness',
    merchantSignals:   'Merchant Center Signals',
    aiDiscoverability: 'AI Discoverability',
  };
  return labels[key] ?? key;
}

export function categoryIcon(key: string): string {
  const icons: Record<string, string> = {
    structuredData:    '{ }',
    productQuality:    '◈',
    protocolReadiness: '⬡',
    merchantSignals:   '◎',
    aiDiscoverability: '◉',
  };
  return icons[key] ?? '○';
}

export function categoryDescription(key: string): string {
  const desc: Record<string, string> = {
    structuredData:    'JSON-LD Product schema, breadcrumbs, ratings markup',
    productQuality:    'Descriptions, images, alt text, specs, FAQs',
    protocolReadiness: 'UCP, ACP, MCP endpoint availability',
    merchantSignals:   'Return policy, shipping info, sitemap, canonical URLs',
    aiDiscoverability: 'robots.txt crawler access, server-side rendering',
  };
  return desc[key] ?? '';
}

export function formatScanTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}
