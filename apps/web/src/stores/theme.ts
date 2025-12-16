/**
 * Precta Theme Store
 * 
 * SolidJS reactive store for theme state management.
 * Handles persistence (FR-007), system preference sync, and reduced motion.
 * 
 * Architecture:
 * - Uses SolidJS createSignal for reactivity
 * - Persists to localStorage for cross-session consistency
 * - Respects prefers-reduced-motion (WCAG accessibility)
 * - Auto-syncs with system color scheme when no explicit preference
 * 
 * Usage:
 * ```tsx
 * import { theme, setTheme, toggleTheme, prefersReducedMotion } from '~/stores/theme';
 * 
 * // Read current theme
 * <div data-theme={theme()}>...</div>
 * 
 * // Toggle theme
 * <button onClick={toggleTheme}>Switch Theme</button>
 * 
 * // Check motion preference
 * {!prefersReducedMotion() && <AnimatedComponent />}
 * ```
 * 
 * References:
 * - SolidJS Stores: https://www.solidjs.com/docs/latest/api#createstore
 * - DaisyUI Themes: https://daisyui.com/docs/themes/
 * 
 * @module stores/theme
 */

import { createSignal, createEffect, onCleanup } from 'solid-js';
import type { ThemeName } from '@precta/shared';
import { DEFAULT_THEME, REDUCED_MOTION_QUERY } from '@precta/shared';
import {
  applyTheme,
  loadThemePreference,
  saveThemePreference,
  getSystemPreferredTheme,
  prefersReducedMotion as checkReducedMotion,
} from '~/lib/theme';

// =============================================================================
// THEME STATE
// =============================================================================

/**
 * Initialize theme from localStorage or system preference.
 * Priority: localStorage > system preference > default (light)
 */
function getInitialTheme(): ThemeName {
  // Server-side: return default
  if (typeof window === 'undefined') return DEFAULT_THEME;
  
  // Check localStorage first (user's explicit choice)
  const savedTheme = loadThemePreference();
  if (savedTheme) return savedTheme;
  
  // Fall back to system preference
  return getSystemPreferredTheme();
}

/**
 * Reactive signal for current theme.
 * Updates trigger re-renders in consuming components.
 */
const [theme, setThemeSignal] = createSignal<ThemeName>(getInitialTheme());

/**
 * Reactive signal for reduced motion preference.
 * True when user has requested reduced motion in system settings.
 */
const [reducedMotion, setReducedMotion] = createSignal<boolean>(
  typeof window !== 'undefined' ? checkReducedMotion() : false
);

/**
 * Track whether user has explicitly chosen a theme.
 * When false, theme follows system preference.
 */
const [isExplicitTheme, setIsExplicitTheme] = createSignal<boolean>(
  typeof window !== 'undefined' ? loadThemePreference() !== null : false
);

// =============================================================================
// THEME ACTIONS
// =============================================================================

/**
 * Sets the theme and optionally persists to localStorage.
 * 
 * @param newTheme - Theme to apply
 * @param persist - Whether to save to localStorage (default: true)
 */
export function setTheme(newTheme: ThemeName, persist = true): void {
  setThemeSignal(newTheme);
  applyTheme(newTheme);
  
  if (persist) {
    saveThemePreference(newTheme);
    setIsExplicitTheme(true);
  }
}

/**
 * Toggles between light and dark themes.
 * Persists the choice to localStorage.
 */
export function toggleTheme(): void {
  const current = theme();
  const newTheme: ThemeName = current === 'precta-light' ? 'precta-dark' : 'precta-light';
  setTheme(newTheme, true);
}

/**
 * Resets theme to follow system preference.
 * Clears localStorage and syncs with OS setting.
 */
export function useSystemTheme(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('precta-theme-preference');
  }
  setIsExplicitTheme(false);
  
  const systemTheme = getSystemPreferredTheme();
  setThemeSignal(systemTheme);
  applyTheme(systemTheme);
}

// =============================================================================
// INITIALIZATION & SIDE EFFECTS
// =============================================================================

/**
 * Initialize theme on client-side mount.
 * Call this in app.tsx or root layout.
 */
export function initializeTheme(): void {
  if (typeof window === 'undefined') return;
  
  // Apply initial theme to DOM
  const initialTheme = theme();
  applyTheme(initialTheme);
  
  // Set up system preference listener (only if not explicit)
  const handleSystemChange = (e: MediaQueryListEvent) => {
    if (!isExplicitTheme()) {
      const newTheme: ThemeName = e.matches ? 'precta-dark' : 'precta-light';
      setThemeSignal(newTheme);
      applyTheme(newTheme);
    }
  };
  
  const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  darkModeQuery.addEventListener('change', handleSystemChange);
  
  // Set up reduced motion listener
  const handleMotionChange = (e: MediaQueryListEvent) => {
    setReducedMotion(e.matches);
  };
  
  const motionQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  motionQuery.addEventListener('change', handleMotionChange);
  
  // Initial reduced motion check
  setReducedMotion(checkReducedMotion());
}

/**
 * SolidJS effect to keep DOM in sync with theme signal.
 * Automatically runs when theme() changes.
 */
export function createThemeEffect(): void {
  createEffect(() => {
    const currentTheme = theme();
    applyTheme(currentTheme);
  });
}

// =============================================================================
// EXPORTS
// =============================================================================

/**
 * Current theme (reactive getter).
 * Use in JSX: `<div data-theme={theme()}>...</div>`
 */
export { theme };

/**
 * Reduced motion preference (reactive getter).
 * Use to conditionally render animations: `{!prefersReducedMotion() && <Anim />}`
 */
export { reducedMotion as prefersReducedMotion };

/**
 * Whether user has explicitly chosen a theme (reactive getter).
 * Useful for showing "Using system default" UI state.
 */
export { isExplicitTheme };

// Re-export types for convenience
export type { ThemeName };
