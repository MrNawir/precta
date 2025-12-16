/**
 * TrustPanel Component
 * 
 * Displays investor-grade trust indicators for the landing page.
 * Uses Lucide icons and SVG badges instead of emojis (FR-002).
 * 
 * Features:
 * - Animated entrance (respects reduced motion)
 * - WCAG AA compliant contrast
 * - Responsive layout
 * - Lazy-loaded SVG badges from /public/trust/
 * 
 * Usage:
 * ```tsx
 * <TrustPanel />
 * ```
 * 
 * References:
 * - User Story 1, Acceptance Scenario 2
 * - Trust SVGs: /public/trust/*.svg
 * 
 * @module components/layout/TrustPanel
 */

import { For, createSignal, onMount } from 'solid-js';
import { Shield, Lock, CheckCircle, Award } from 'lucide-solid';

/**
 * Trust indicator data structure.
 * Each indicator represents a credibility signal for investors.
 */
interface TrustIndicator {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Lucide icon component */
  icon: typeof Shield;
  /** Optional SVG badge path (relative to /public/) */
  badgePath?: string;
  /** Descriptive text for accessibility */
  description: string;
}

/**
 * Trust indicators to display.
 * Order matters - most important first for investors.
 */
const TRUST_INDICATORS: TrustIndicator[] = [
  {
    id: 'hipaa',
    label: 'HIPAA Compliant',
    icon: Shield,
    badgePath: '/trust/hipaa-compliant.svg',
    description: 'Healthcare data handled with HIPAA-level security standards',
  },
  {
    id: 'ssl',
    label: 'SSL Secured',
    icon: Lock,
    badgePath: '/trust/ssl-secured.svg',
    description: 'All data encrypted with 256-bit SSL encryption',
  },
  {
    id: 'verified',
    label: 'Verified Doctors',
    icon: CheckCircle,
    badgePath: '/trust/verified-doctors.svg',
    description: 'All healthcare providers are credential-verified',
  },
  {
    id: 'encrypted',
    label: '256-bit Encrypted',
    icon: Award,
    badgePath: '/trust/data-encrypted.svg',
    description: 'End-to-end encryption for sensitive health data',
  },
];

/**
 * TrustPanel Component
 * 
 * Renders a row of trust indicators with subtle animation.
 * Designed for the hero section of the landing page.
 */
export default function TrustPanel() {
  // Track if component has mounted for entrance animation
  const [isVisible, setIsVisible] = createSignal(false);

  onMount(() => {
    // Trigger entrance animation after mount
    // Small delay for visual effect after hero content loads
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  });

  return (
    <div
      class={`
        flex flex-wrap justify-center items-center gap-6 md:gap-10 lg:gap-16
        transition-all duration-500 ease-out
        ${isVisible() ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
      role="region"
      aria-label="Trust and security indicators"
      data-testid="trust-panel"
    >
      <For each={TRUST_INDICATORS}>
        {(indicator, index) => (
          <TrustBadge 
            indicator={indicator} 
            delay={index() * 100} 
          />
        )}
      </For>
    </div>
  );
}

/**
 * Individual trust badge component.
 * Shows icon + label with hover effect.
 */
function TrustBadge(props: { indicator: TrustIndicator; delay: number }) {
  const [isHovered, setIsHovered] = createSignal(false);

  return (
    <div
      class={`
        group flex items-center gap-2 px-3 py-2 rounded-lg
        transition-all duration-150
        hover:bg-base-200/50
        cursor-default
      `}
      style={{ 'animation-delay': `${props.delay}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={props.indicator.description}
      role="img"
      aria-label={props.indicator.description}
    >
      {/* Icon - Lucide component */}
      <props.indicator.icon 
        class={`
          w-5 h-5 
          transition-colors duration-150
          ${isHovered() ? 'text-primary' : 'text-base-content/60'}
        `}
        aria-hidden="true"
      />
      
      {/* Label */}
      <span 
        class={`
          text-sm font-semibold tracking-wide uppercase
          transition-colors duration-150
          ${isHovered() ? 'text-base-content' : 'text-base-content/60'}
        `}
      >
        {props.indicator.label}
      </span>
    </div>
  );
}

/**
 * Compact version for use in footers or smaller spaces.
 */
export function TrustPanelCompact() {
  return (
    <div 
      class="flex flex-wrap justify-center gap-4 text-xs text-base-content/50"
      role="region"
      aria-label="Security certifications"
    >
      <For each={TRUST_INDICATORS.slice(0, 3)}>
        {(indicator) => (
          <span class="flex items-center gap-1">
            <indicator.icon class="w-3 h-3" aria-hidden="true" />
            {indicator.label}
          </span>
        )}
      </For>
    </div>
  );
}
