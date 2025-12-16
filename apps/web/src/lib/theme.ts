/**
 * Precta Theme Utilities
 * 
 * Runtime helpers for theme management, animation timing, and accessibility.
 * Works with DaisyUI 5 theme system defined in app.css.
 * 
 * Architecture:
 * - Token types: @precta/shared/theme/tokens
 * - CSS definitions: app.css (@plugin "daisyui/theme")
 * - State management: stores/theme.ts
 * 
 * References:
 * - DaisyUI 5 Themes: https://daisyui.com/docs/themes/
 * - WCAG Motion Guidelines: https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions
 * 
 * @module lib/theme
 */

import {
  type ThemeName,
  type AnimationDuration,
  type AnimationEasing,
  DEFAULT_THEME,
  ANIMATION_DURATION,
  ANIMATION_EASING,
  THEME_STORAGE_KEY,
  REDUCED_MOTION_QUERY,
  GLASS_TOKENS,
} from '@precta/shared';

// =============================================================================
// THEME DETECTION & APPLICATION
// =============================================================================

/**
 * Gets the current active theme from the document.
 * Reads the data-theme attribute set on the root element.
 * 
 * @returns Current theme name or default if not set
 */
export function getCurrentTheme(): ThemeName {
  if (typeof document === 'undefined') return DEFAULT_THEME;
  
  const theme = document.documentElement.getAttribute('data-theme');
  return (theme as ThemeName) || DEFAULT_THEME;
}

/**
 * Applies a theme to the document.
 * Sets the data-theme attribute which DaisyUI uses for theming.
 * 
 * @param theme - Theme name to apply
 */
export function applyTheme(theme: ThemeName): void {
  if (typeof document === 'undefined') return;
  
  document.documentElement.setAttribute('data-theme', theme);
  
  // Update color-scheme for browser UI (scrollbars, form controls)
  const colorScheme = theme.includes('dark') ? 'dark' : 'light';
  document.documentElement.style.colorScheme = colorScheme;
}

/**
 * Detects user's system color scheme preference.
 * 
 * @returns 'dark' if user prefers dark mode, 'light' otherwise
 */
export function getSystemColorScheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

/**
 * Gets the appropriate theme based on system preference.
 * Used when user hasn't explicitly chosen a theme.
 * 
 * @returns Theme name matching system preference
 */
export function getSystemPreferredTheme(): ThemeName {
  return getSystemColorScheme() === 'dark' ? 'precta-dark' : 'precta-light';
}

// =============================================================================
// REDUCED MOTION SUPPORT (WCAG)
// =============================================================================

/**
 * Checks if user has requested reduced motion.
 * Used to disable animations for accessibility (Edge Case in spec).
 * 
 * Reference: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
 * 
 * @returns true if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/**
 * Subscribes to reduced motion preference changes.
 * Useful for runtime updates when user changes system settings.
 * 
 * @param callback - Function called when preference changes
 * @returns Cleanup function to remove listener
 */
export function onReducedMotionChange(
  callback: (prefersReduced: boolean) => void
): () => void {
  if (typeof window === 'undefined') return () => {};
  
  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  
  const handler = (event: MediaQueryListEvent) => {
    callback(event.matches);
  };
  
  mediaQuery.addEventListener('change', handler);
  
  return () => mediaQuery.removeEventListener('change', handler);
}

// =============================================================================
// ANIMATION UTILITIES
// =============================================================================

/**
 * Gets animation duration in milliseconds.
 * Returns 0 if user prefers reduced motion.
 * 
 * @param duration - Duration key from ANIMATION_DURATION
 * @returns Duration in ms, or 0 if reduced motion
 */
export function getAnimationDuration(duration: AnimationDuration): number {
  if (prefersReducedMotion()) return 0;
  return ANIMATION_DURATION[duration];
}

/**
 * Gets CSS easing function string.
 * 
 * @param easing - Easing key from ANIMATION_EASING
 * @returns CSS cubic-bezier or keyword
 */
export function getAnimationEasing(easing: AnimationEasing): string {
  return ANIMATION_EASING[easing];
}

/**
 * Creates a CSS transition string with motion preference awareness.
 * 
 * @param properties - CSS properties to transition
 * @param duration - Duration key
 * @param easing - Easing key
 * @returns CSS transition value, or 'none' if reduced motion
 * 
 * @example
 * ```ts
 * // Returns "transform 150ms cubic-bezier(0.34, 1.56, 0.64, 1)"
 * // Or "none" if user prefers reduced motion
 * createTransition(['transform'], 'normal', 'spring')
 * ```
 */
export function createTransition(
  properties: string[],
  duration: AnimationDuration = 'normal',
  easing: AnimationEasing = 'easeOut'
): string {
  if (prefersReducedMotion()) return 'none';
  
  const durationMs = ANIMATION_DURATION[duration];
  const easingValue = ANIMATION_EASING[easing];
  
  return properties
    .map((prop) => `${prop} ${durationMs}ms ${easingValue}`)
    .join(', ');
}

// =============================================================================
// GLASSMORPHISM UTILITIES
// =============================================================================

/**
 * Generates inline styles for glassmorphism effect.
 * Useful when DaisyUI classes aren't sufficient.
 * 
 * @param options - Override default glass parameters
 * @returns CSS properties object for inline styles
 */
export function createGlassStyles(options?: {
  blur?: number;
  opacity?: number;
  borderOpacity?: number;
}): Record<string, string> {
  const blur = options?.blur ?? GLASS_TOKENS.blur;
  const opacity = options?.opacity ?? GLASS_TOKENS.opacity;
  const borderOpacity = options?.borderOpacity ?? GLASS_TOKENS.borderOpacity;
  
  return {
    background: `oklch(100% 0 0 / ${opacity})`,
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    border: `1px solid oklch(100% 0 0 / ${borderOpacity})`,
  };
}

// =============================================================================
// THEME PERSISTENCE (localStorage)
// =============================================================================

/**
 * Saves theme preference to localStorage.
 * Called when user explicitly selects a theme.
 * 
 * @param theme - Theme to save
 */
export function saveThemePreference(theme: ThemeName): void {
  if (typeof localStorage === 'undefined') return;
  
  const preference = {
    theme,
    isExplicit: true,
    updatedAt: Date.now(),
  };
  
  localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(preference));
}

/**
 * Loads theme preference from localStorage.
 * Returns null if no preference saved or invalid data.
 * 
 * @returns Saved theme name or null
 */
export function loadThemePreference(): ThemeName | null {
  if (typeof localStorage === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (!stored) return null;
    
    const preference = JSON.parse(stored);
    
    // Validate the theme name
    if (preference.theme === 'precta-light' || preference.theme === 'precta-dark') {
      return preference.theme;
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Clears saved theme preference.
 * Useful for "use system default" functionality.
 */
export function clearThemePreference(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(THEME_STORAGE_KEY);
}

// =============================================================================
// CSS VARIABLE HELPERS
// =============================================================================

/**
 * Gets a CSS custom property value from the document.
 * Useful for reading computed theme values at runtime.
 * 
 * @param property - CSS variable name (with or without --)
 * @returns Computed value or empty string
 */
export function getCSSVariable(property: string): string {
  if (typeof document === 'undefined') return '';
  
  const varName = property.startsWith('--') ? property : `--${property}`;
  return getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
}

/**
 * Sets a CSS custom property on the document.
 * Use sparingly - prefer theme tokens where possible.
 * 
 * @param property - CSS variable name (with or without --)
 * @param value - Value to set
 */
export function setCSSVariable(property: string, value: string): void {
  if (typeof document === 'undefined') return;
  
  const varName = property.startsWith('--') ? property : `--${property}`;
  document.documentElement.style.setProperty(varName, value);
}
