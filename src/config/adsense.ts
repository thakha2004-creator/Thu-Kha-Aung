/**
 * Google AdSense Configuration
 *
 * Safe fallback dummy values are provided by default so the application
 * runs and builds cleanly without requiring actual AdSense credentials.
 */

// Default dummy fallback values (safe for building and local dev)
export const DUMMY_FALLBACKS = {
  publisherId: 'ca-pub-0000000000000000',
  topBannerSlot: '1000000001',
  sidebarSlot: '2000000002',
  inContentSlot: '3000000003',
  footerSlot: '4000000004',
};

// Safe helper to read environment variable with fallback
function getEnv(key: string, fallback: string): string {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      const val = (import.meta as any).env[key];
      if (val && typeof val === 'string' && val.trim().length > 0) {
        return val.trim();
      }
    }
  } catch {
    // ignore
  }
  return fallback;
}

export interface AdSenseConfig {
  publisherId: string;
  enabled: boolean;
  adUnits: {
    topBanner: string;
    sidebar: string;
    inContent: string;
    footerBanner: string;
  };
}

export const ADSENSE_CONFIG: AdSenseConfig = {
  // Uses environment variable if provided, otherwise safe dummy fallback
  publisherId: getEnv('VITE_ADSENSE_PUB_ID', DUMMY_FALLBACKS.publisherId),

  // Master switch
  enabled: true,

  // Ad unit slot IDs with safe dummy fallbacks
  adUnits: {
    topBanner: getEnv('VITE_ADSENSE_TOP_BANNER_SLOT', DUMMY_FALLBACKS.topBannerSlot),
    sidebar: getEnv('VITE_ADSENSE_SIDEBAR_SLOT', DUMMY_FALLBACKS.sidebarSlot),
    inContent: getEnv('VITE_ADSENSE_IN_CONTENT_SLOT', DUMMY_FALLBACKS.inContentSlot),
    footerBanner: getEnv('VITE_ADSENSE_FOOTER_SLOT', DUMMY_FALLBACKS.footerSlot),
  },
};

/**
 * Returns true ONLY if a real, valid AdSense Publisher ID is configured
 * (i.e. not the placeholder or dummy fallback values).
 */
export function isAdSenseActive(): boolean {
  if (!ADSENSE_CONFIG.enabled) return false;
  const pubId = ADSENSE_CONFIG.publisherId;
  if (!pubId) return false;

  // Check against known dummy/placeholder patterns
  if (
    pubId === 'ca-pub-0000000000000000' ||
    pubId === 'ca-pub-XXXXXXXXXXXXXXXX' ||
    pubId.includes('XXXX') ||
    pubId.includes('0000000000000000') ||
    pubId.length < 10
  ) {
    return false;
  }

  // Must start with ca-pub-
  return pubId.startsWith('ca-pub-');
}
