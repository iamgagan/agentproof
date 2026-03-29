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

export function categoryLabel(key: string, vertical?: string): string {
  // Vertical-specific overrides for "Product Data Quality" and "Merchant Center Signals"
  if (vertical && vertical !== 'ecommerce') {
    const verticalLabels: Record<string, Record<string, string>> = {
      saas: {
        productQuality: 'Service & Feature Data',
        merchantSignals: 'Trust & Authority Signals',
      },
      local_business: {
        productQuality: 'Business Listing Quality',
        merchantSignals: 'Local SEO Signals',
      },
      travel: {
        productQuality: 'Listing & Booking Data',
        merchantSignals: 'Travel Platform Signals',
      },
      healthcare: {
        productQuality: 'Provider & Service Data',
        merchantSignals: 'Healthcare Trust Signals',
      },
      real_estate: {
        productQuality: 'Property Listing Quality',
        merchantSignals: 'Listing Platform Signals',
      },
      b2b_services: {
        productQuality: 'Service Offering Data',
        merchantSignals: 'Authority & Trust Signals',
      },
      general: {
        productQuality: 'Content Data Quality',
        merchantSignals: 'Trust & Authority Signals',
      },
    };
    const override = verticalLabels[vertical]?.[key];
    if (override) return override;
  }

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

export function categoryDescription(key: string, vertical?: string): string {
  if (vertical && vertical !== 'ecommerce') {
    const verticalDesc: Record<string, Record<string, string>> = {
      saas: {
        structuredData: 'JSON-LD SoftwareApplication schema, Organization markup',
        productQuality: 'Feature descriptions, pricing tiers, integration docs',
        merchantSignals: 'Case studies, testimonials, canonical URLs, sitemap',
      },
      local_business: {
        structuredData: 'JSON-LD LocalBusiness schema, opening hours, geo coordinates',
        productQuality: 'Business description, photos, services, hours of operation',
        merchantSignals: 'Google Business Profile signals, NAP consistency, reviews',
      },
      travel: {
        structuredData: 'JSON-LD Hotel/LodgingBusiness schema, offers, ratings',
        productQuality: 'Room/tour descriptions, photos, amenities, pricing',
        merchantSignals: 'Booking signals, availability, review aggregation',
      },
      healthcare: {
        structuredData: 'JSON-LD MedicalOrganization schema, physician markup',
        productQuality: 'Provider profiles, service descriptions, credentials',
        merchantSignals: 'Patient reviews, insurance info, appointment availability',
      },
      real_estate: {
        structuredData: 'JSON-LD RealEstateListing schema, property markup',
        productQuality: 'Property details, photos, floor plans, neighborhood info',
        merchantSignals: 'MLS data, agent info, listing freshness, virtual tours',
      },
      b2b_services: {
        structuredData: 'JSON-LD ProfessionalService schema, Organization markup',
        productQuality: 'Service descriptions, case studies, team credentials',
        merchantSignals: 'Industry authority signals, testimonials, certifications',
      },
      general: {
        productQuality: 'Content descriptions, images, alt text, structured info',
        merchantSignals: 'Trust signals, sitemap, canonical URLs, reviews',
      },
    };
    const override = verticalDesc[vertical]?.[key];
    if (override) return override;
  }

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
