/**
 * Performance Budget Configuration
 * 
 * Defines Lighthouse and Core Web Vitals thresholds for Precta.
 * These budgets enforce the performance goals from plan.md:
 * - Landing TTFI ≤2.5s
 * - Interaction latency ≤150ms
 * - CLS <0.05
 * - Lighthouse ≥90
 * 
 * Usage:
 * - Import in Playwright tests for performance assertions
 * - Can be used with Lighthouse CI for automated audits
 * 
 * References:
 * - Core Web Vitals: https://web.dev/vitals/
 * - Lighthouse Scoring: https://developer.chrome.com/docs/lighthouse/performance/performance-scoring/
 * 
 * @module tests/e2e/perf.config
 */

// =============================================================================
// CORE WEB VITALS THRESHOLDS
// =============================================================================

/**
 * Core Web Vitals thresholds per Google's recommendations.
 * "Good" thresholds that pages should meet.
 * 
 * Reference: https://web.dev/vitals/
 */
export const CORE_WEB_VITALS = {
  /**
   * Largest Contentful Paint (LCP)
   * Measures loading performance - when largest content element renders.
   * Good: ≤2.5s, Needs Improvement: ≤4.0s, Poor: >4.0s
   */
  LCP: {
    good: 2500,        // 2.5 seconds (matches TTFI goal)
    needsImprovement: 4000,
    unit: 'ms',
  },

  /**
   * First Input Delay (FID)
   * Measures interactivity - time from first interaction to response.
   * Good: ≤100ms, Needs Improvement: ≤300ms, Poor: >300ms
   */
  FID: {
    good: 100,
    needsImprovement: 300,
    unit: 'ms',
  },

  /**
   * Cumulative Layout Shift (CLS)
   * Measures visual stability - how much content shifts during load.
   * Good: ≤0.1, Needs Improvement: ≤0.25, Poor: >0.25
   * 
   * Note: Our budget is stricter at 0.05 per plan.md
   */
  CLS: {
    good: 0.05,        // Stricter than Google's 0.1 recommendation
    needsImprovement: 0.1,
    unit: 'score',
  },

  /**
   * Interaction to Next Paint (INP)
   * Measures responsiveness - latency of all interactions.
   * Good: ≤200ms, Needs Improvement: ≤500ms, Poor: >500ms
   */
  INP: {
    good: 150,         // Stricter per plan.md (150ms latency goal)
    needsImprovement: 200,
    unit: 'ms',
  },

  /**
   * Time to First Byte (TTFB)
   * Measures server response time.
   * Good: ≤800ms, Needs Improvement: ≤1800ms, Poor: >1800ms
   */
  TTFB: {
    good: 800,
    needsImprovement: 1800,
    unit: 'ms',
  },
} as const;

// =============================================================================
// LIGHTHOUSE SCORE THRESHOLDS
// =============================================================================

/**
 * Minimum Lighthouse scores for each category.
 * Scores are 0-100, we require ≥90 for performance per plan.md.
 */
export const LIGHTHOUSE_THRESHOLDS = {
  /** Performance score - our primary metric */
  performance: 90,
  /** Accessibility score - WCAG AA compliance */
  accessibility: 95,
  /** Best practices score */
  bestPractices: 90,
  /** SEO score */
  seo: 90,
} as const;

// =============================================================================
// BUNDLE SIZE BUDGETS
// =============================================================================

/**
 * JavaScript bundle size limits.
 * Keeping bundles small for fast initial load on 4G.
 * 
 * Per plan.md: bundle diff should be <50KB for this feature.
 */
export const BUNDLE_BUDGETS = {
  /** Main bundle (critical path) */
  main: {
    maxSize: 150 * 1024,    // 150KB compressed
    warnSize: 120 * 1024,   // Warn at 120KB
  },
  /** Vendor bundle (dependencies) */
  vendor: {
    maxSize: 200 * 1024,    // 200KB compressed
    warnSize: 180 * 1024,
  },
  /** Total initial JS */
  totalInitial: {
    maxSize: 350 * 1024,    // 350KB total initial JS
    warnSize: 300 * 1024,
  },
  /** Feature diff budget (for this PR) */
  featureDiff: {
    maxSize: 50 * 1024,     // 50KB per plan.md constraint
    warnSize: 40 * 1024,
  },
} as const;

// =============================================================================
// PAGE-SPECIFIC BUDGETS
// =============================================================================

/**
 * Per-page performance budgets.
 * Some pages have stricter requirements than others.
 */
export const PAGE_BUDGETS = {
  /** Landing page - investor-facing, must be fast */
  landing: {
    route: '/',
    ttfi: 2500,           // Time to First Interactive ≤2.5s
    lcp: 2500,            // LCP ≤2.5s
    cls: 0.05,            // Very stable layout
    fcp: 1800,            // First Contentful Paint
  },
  /** Consultation call - real-time, low latency critical */
  consultation: {
    route: '/consultations/:id/call',
    ttfi: 3000,           // Slightly more lenient (video setup)
    lcp: 3000,
    cls: 0.1,             // Some acceptable shift during video load
    fcp: 2000,
  },
  /** Doctor listing - data-heavy but should still be fast */
  doctors: {
    route: '/doctors',
    ttfi: 3000,
    lcp: 3000,
    cls: 0.1,
    fcp: 2000,
  },
} as const;

// =============================================================================
// NETWORK SIMULATION PROFILES
// =============================================================================

/**
 * Network conditions for testing.
 * Primary target: mid-tier Android Chrome on 4G (per plan.md).
 */
export const NETWORK_PROFILES = {
  /** Fast 4G - typical urban Kenya */
  fast4G: {
    downloadThroughput: 4 * 1024 * 1024 / 8,  // 4 Mbps
    uploadThroughput: 1 * 1024 * 1024 / 8,    // 1 Mbps
    latency: 50,                               // 50ms RTT
  },
  /** Slow 4G - suburban/rural */
  slow4G: {
    downloadThroughput: 1.5 * 1024 * 1024 / 8,  // 1.5 Mbps
    uploadThroughput: 0.5 * 1024 * 1024 / 8,    // 0.5 Mbps
    latency: 150,                               // 150ms RTT
  },
  /** 3G - fallback testing */
  regular3G: {
    downloadThroughput: 0.75 * 1024 * 1024 / 8, // 750 Kbps
    uploadThroughput: 0.25 * 1024 * 1024 / 8,   // 250 Kbps
    latency: 300,                               // 300ms RTT
  },
} as const;

// =============================================================================
// DEVICE PROFILES
// =============================================================================

/**
 * Target device specifications.
 * Mid-tier Android is primary target per plan.md.
 */
export const DEVICE_PROFILES = {
  /** Mid-tier Android - primary target */
  midTierAndroid: {
    name: 'Moto G Power',
    cpuSlowdownMultiplier: 4,  // Simulate slower CPU
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2.625,
  },
  /** Desktop - secondary target (investors) */
  desktop: {
    name: 'Desktop Chrome',
    cpuSlowdownMultiplier: 1,
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  },
} as const;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Checks if a metric value meets the "good" threshold.
 * 
 * @param metric - Metric name from CORE_WEB_VITALS
 * @param value - Measured value
 * @returns true if value is within "good" threshold
 */
export function isMetricGood(
  metric: keyof typeof CORE_WEB_VITALS,
  value: number
): boolean {
  const threshold = CORE_WEB_VITALS[metric];
  // CLS is a score where lower is better, others are milliseconds
  return value <= threshold.good;
}

/**
 * Formats a metric value with its unit for display.
 * 
 * @param metric - Metric name
 * @param value - Measured value
 * @returns Formatted string like "2500ms" or "0.05"
 */
export function formatMetric(
  metric: keyof typeof CORE_WEB_VITALS,
  value: number
): string {
  const { unit } = CORE_WEB_VITALS[metric];
  if (unit === 'ms') {
    return `${value}ms`;
  }
  return value.toFixed(3);
}

/**
 * Creates a Lighthouse configuration object for programmatic runs.
 * 
 * @param device - Device profile to use
 * @param network - Network profile to use
 * @returns Lighthouse config object
 */
export function createLighthouseConfig(
  device: keyof typeof DEVICE_PROFILES = 'midTierAndroid',
  network: keyof typeof NETWORK_PROFILES = 'fast4G'
) {
  const deviceProfile = DEVICE_PROFILES[device];
  const networkProfile = NETWORK_PROFILES[network];
  
  return {
    extends: 'lighthouse:default',
    settings: {
      formFactor: device === 'desktop' ? 'desktop' : 'mobile',
      screenEmulation: {
        mobile: device !== 'desktop',
        width: deviceProfile.viewport.width,
        height: deviceProfile.viewport.height,
        deviceScaleFactor: deviceProfile.deviceScaleFactor,
      },
      throttling: {
        cpuSlowdownMultiplier: deviceProfile.cpuSlowdownMultiplier,
        ...networkProfile,
      },
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    },
  };
}
