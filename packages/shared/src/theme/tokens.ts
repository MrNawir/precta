/**
 * Precta Premium Theme Tokens
 * 
 * Centralized type definitions for the design system.
 * These tokens map to CSS custom properties defined in app.css.
 * 
 * Usage:
 * - Import types for type-safe theme access
 * - Use with DaisyUI 5 theming (@plugin "daisyui/theme")
 * 
 * References:
 * - DaisyUI 5 Theme Docs: https://daisyui.com/docs/themes/
 * - OKLCH Color Space: https://oklch.com/
 * 
 * @module @precta/shared/theme/tokens
 */

// =============================================================================
// THEME NAMES
// =============================================================================

/**
 * Available theme identifiers.
 * These correspond to the theme names in app.css @plugin definitions.
 */
export type ThemeName = 'precta-light' | 'precta-dark';

/**
 * Default theme (light mode for investor-facing UI).
 * Rationale: Light mode conveys professionalism and trustworthiness.
 */
export const DEFAULT_THEME: ThemeName = 'precta-light';

// =============================================================================
// COLOR TOKENS
// =============================================================================

/**
 * Semantic color token names available in the theme.
 * Maps to DaisyUI 5 color CSS variables (--color-*).
 */
export type SemanticColor =
  | 'primary'
  | 'primary-content'
  | 'secondary'
  | 'secondary-content'
  | 'accent'
  | 'accent-content'
  | 'neutral'
  | 'neutral-content'
  | 'base-100'
  | 'base-200'
  | 'base-300'
  | 'base-content'
  | 'info'
  | 'info-content'
  | 'success'
  | 'success-content'
  | 'warning'
  | 'warning-content'
  | 'error'
  | 'error-content';

/**
 * Color token definition with OKLCH values.
 * OKLCH format: oklch(lightness% chroma hue)
 * 
 * Why OKLCH?
 * - Perceptually uniform lightness (better for accessibility)
 * - Wider P3 color gamut support
 * - Better contrast ratio calculations
 */
export interface ColorToken {
  /** CSS variable name without -- prefix */
  name: SemanticColor;
  /** OKLCH value as used in CSS */
  oklch: string;
  /** Human-readable description for documentation */
  description: string;
  /** WCAG contrast requirements this color should meet */
  contrastRole?: 'background' | 'foreground' | 'decorative';
}

/**
 * Light theme color palette.
 * Primary colors chosen for medical credibility and investor trust.
 */
export const LIGHT_THEME_COLORS: Record<SemanticColor, string> = {
  // Base surfaces
  'base-100': 'oklch(100% 0 0)',           // Pure white
  'base-200': 'oklch(97% 0.005 250)',      // Slight cool gray
  'base-300': 'oklch(93% 0.01 250)',       // Border gray
  'base-content': 'oklch(15% 0.02 260)',   // Near-black text
  
  // Primary - Deep Teal-Blue (medical trust)
  'primary': 'oklch(45% 0.12 195)',
  'primary-content': 'oklch(98% 0.01 195)',
  
  // Secondary - Vibrant Teal
  'secondary': 'oklch(55% 0.14 175)',
  'secondary-content': 'oklch(98% 0.01 175)',
  
  // Accent - Coral-Orange (CTAs)
  'accent': 'oklch(70% 0.18 45)',
  'accent-content': 'oklch(98% 0.01 45)',
  
  // Neutral - Slate
  'neutral': 'oklch(25% 0.02 260)',
  'neutral-content': 'oklch(98% 0.01 260)',
  
  // Semantic
  'info': 'oklch(60% 0.18 250)',
  'info-content': 'oklch(98% 0.01 250)',
  'success': 'oklch(65% 0.2 155)',
  'success-content': 'oklch(98% 0.01 155)',
  'warning': 'oklch(80% 0.16 85)',
  'warning-content': 'oklch(20% 0.05 85)',
  'error': 'oklch(60% 0.22 25)',
  'error-content': 'oklch(98% 0.01 25)',
};

/**
 * Dark theme color palette.
 * Adjusted for visibility on dark backgrounds while maintaining brand.
 */
export const DARK_THEME_COLORS: Record<SemanticColor, string> = {
  // Base surfaces
  'base-100': 'oklch(18% 0.02 260)',       // Deep slate
  'base-200': 'oklch(22% 0.02 260)',       // Elevated
  'base-300': 'oklch(28% 0.02 260)',       // Border
  'base-content': 'oklch(95% 0.01 260)',   // Light text
  
  // Primary - Lighter for dark bg
  'primary': 'oklch(55% 0.14 195)',
  'primary-content': 'oklch(98% 0.01 195)',
  
  // Secondary
  'secondary': 'oklch(60% 0.14 175)',
  'secondary-content': 'oklch(98% 0.01 175)',
  
  // Accent
  'accent': 'oklch(75% 0.16 45)',
  'accent-content': 'oklch(15% 0.05 45)',
  
  // Neutral
  'neutral': 'oklch(35% 0.02 260)',
  'neutral-content': 'oklch(95% 0.01 260)',
  
  // Semantic
  'info': 'oklch(65% 0.16 250)',
  'info-content': 'oklch(98% 0.01 250)',
  'success': 'oklch(70% 0.18 155)',
  'success-content': 'oklch(98% 0.01 155)',
  'warning': 'oklch(80% 0.14 85)',
  'warning-content': 'oklch(20% 0.05 85)',
  'error': 'oklch(65% 0.20 25)',
  'error-content': 'oklch(98% 0.01 25)',
};

// =============================================================================
// SPACING & SIZING TOKENS
// =============================================================================

/**
 * Border radius tokens for consistent curved corners.
 * Using rem for scalability with user font preferences.
 */
export const RADIUS_TOKENS = {
  /** Checkboxes, toggles, small interactive elements */
  selector: '0.75rem',
  /** Inputs, buttons, form fields */
  field: '0.75rem',
  /** Cards, modals, larger containers */
  box: '1.25rem',
  /** Fully rounded (pills, avatars) */
  full: '9999px',
} as const;

export type RadiusToken = keyof typeof RADIUS_TOKENS;

// =============================================================================
// ANIMATION TOKENS
// =============================================================================

/**
 * Animation timing constants.
 * All interactions under 200ms per FR-003 requirement.
 * 
 * Rationale:
 * - Fast: Immediate feedback (buttons, toggles)
 * - Normal: Noticeable but snappy (cards, panels)
 * - Slow: Deliberate transitions (modals, page changes)
 */
export const ANIMATION_DURATION = {
  /** Instant feedback: 100ms */
  fast: 100,
  /** Standard interactions: 150ms (spec requirement) */
  normal: 150,
  /** Deliberate transitions: 300ms */
  slow: 300,
  /** Entry animations: 500ms */
  enter: 500,
} as const;

export type AnimationDuration = keyof typeof ANIMATION_DURATION;

/**
 * Easing functions for different animation types.
 * Uses CSS cubic-bezier for GPU-accelerated animations.
 */
export const ANIMATION_EASING = {
  /** Linear: constant speed */
  linear: 'linear',
  /** Ease out: fast start, gentle end (most interactions) */
  easeOut: 'cubic-bezier(0.33, 1, 0.68, 1)',
  /** Ease in-out: gentle start and end */
  easeInOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
  /** Spring: bouncy feel for playful interactions */
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

export type AnimationEasing = keyof typeof ANIMATION_EASING;

// =============================================================================
// EFFECT TOKENS
// =============================================================================

/**
 * DaisyUI 5 effect variables.
 * These control component appearance globally or per-theme.
 * 
 * Reference: https://daisyui.com/docs/v5/ (Effect CSS variables)
 */
export const EFFECT_TOKENS = {
  /** Depth effect: 0 = flat, 1 = subtle shadows */
  depth: 1,
  /** Noise effect: 0 = clean, 1 = textured grain */
  noise: 0,
} as const;

// =============================================================================
// GLASSMORPHISM TOKENS
// =============================================================================

/**
 * Glassmorphism (frosted glass) effect parameters.
 * Used for elevated surfaces like search bars, cards, modals.
 * 
 * Reference: https://css-tricks.com/glassmorphism-css/
 */
export const GLASS_TOKENS = {
  /** Backdrop blur radius in pixels */
  blur: 16,
  /** Background opacity (0-1) */
  opacity: 0.7,
  /** Border opacity for subtle definition */
  borderOpacity: 0.5,
} as const;

// =============================================================================
// USER PREFERENCE TYPES
// =============================================================================

/**
 * User theme preferences stored in localStorage.
 * Used by theme store for persistence across sessions (FR-007).
 */
export interface UserThemePreference {
  /** Selected theme name */
  theme: ThemeName;
  /** Whether user has explicitly chosen (vs system default) */
  isExplicit: boolean;
  /** Timestamp of last change for sync purposes */
  updatedAt: number;
}

/**
 * localStorage key for theme preferences.
 */
export const THEME_STORAGE_KEY = 'precta-theme-preference';

/**
 * Reduced motion preference detection.
 * Respects prefers-reduced-motion media query (Edge Case).
 */
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

// =============================================================================
// COMPONENT VARIANT TYPES
// =============================================================================

/**
 * DaisyUI 5 button variants.
 * Reference: https://daisyui.com/components/button/
 */
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'neutral'
  | 'ghost'
  | 'link'
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'outline'
  | 'soft'   // New in DaisyUI 5
  | 'dash';  // New in DaisyUI 5

/**
 * DaisyUI 5 size modifiers.
 * Now includes xl size (new in DaisyUI 5).
 */
export type SizeModifier = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
