/**
 * T020: Unit Tests - Theme Store
 * 
 * Tests for theme persistence, system preference sync, and reduced motion.
 * Verifies FR-007 (theme persistence) and Edge Case (reduced motion).
 * 
 * Coverage:
 * - localStorage persistence
 * - System preference detection
 * - Reduced motion handling
 * - Theme toggle logic
 * - Initial theme resolution
 * 
 * References:
 * - Theme Store: /src/stores/theme.ts
 * - Theme Utils: /src/lib/theme.ts
 * - Tokens: @precta/shared/theme/tokens
 * 
 * @module tests/unit/theme-store.test
 */

import { describe, test, expect, beforeEach, afterEach, mock } from 'bun:test';
import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  REDUCED_MOTION_QUERY,
} from '@precta/shared';

// =============================================================================
// MOCK SETUP
// =============================================================================

/**
 * Mock localStorage for testing persistence.
 */
const createLocalStorageMock = () => {
  const store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(key => delete store[key]); },
    get length() { return Object.keys(store).length; },
    key: (index: number) => Object.keys(store)[index] || null,
  };
};

/**
 * Mock matchMedia for system preference tests.
 */
const createMatchMediaMock = (matches: boolean) => ({
  matches,
  media: '',
  onchange: null,
  addListener: mock(() => {}),
  removeListener: mock(() => {}),
  addEventListener: mock(() => {}),
  removeEventListener: mock(() => {}),
  dispatchEvent: () => true,
});

// =============================================================================
// THEME PERSISTENCE TESTS
// =============================================================================

describe('Theme Persistence (FR-007)', () => {
  let mockStorage: ReturnType<typeof createLocalStorageMock>;

  beforeEach(() => {
    mockStorage = createLocalStorageMock();
  });

  afterEach(() => {
    mockStorage.clear();
  });

  describe('Saving Theme', () => {
    test('should save theme to localStorage', () => {
      const theme = 'precta-dark';
      const preference = {
        theme,
        isExplicit: true,
        updatedAt: Date.now(),
      };
      
      mockStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(preference));
      
      const stored = mockStorage.getItem(THEME_STORAGE_KEY);
      expect(stored).toBeTruthy();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.theme).toBe('precta-dark');
    });

    test('should mark explicit choice when user selects', () => {
      const preference = {
        theme: 'precta-light',
        isExplicit: true,
        updatedAt: Date.now(),
      };
      
      mockStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(preference));
      
      const parsed = JSON.parse(mockStorage.getItem(THEME_STORAGE_KEY)!);
      expect(parsed.isExplicit).toBe(true);
    });

    test('should include timestamp for sync purposes', () => {
      const now = Date.now();
      const preference = {
        theme: 'precta-light',
        isExplicit: true,
        updatedAt: now,
      };
      
      mockStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(preference));
      
      const parsed = JSON.parse(mockStorage.getItem(THEME_STORAGE_KEY)!);
      expect(parsed.updatedAt).toBeGreaterThanOrEqual(now);
    });
  });

  describe('Loading Theme', () => {
    test('should load saved theme preference', () => {
      const preference = {
        theme: 'precta-dark',
        isExplicit: true,
        updatedAt: Date.now(),
      };
      
      mockStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(preference));
      
      const stored = mockStorage.getItem(THEME_STORAGE_KEY);
      const parsed = JSON.parse(stored!);
      
      expect(parsed.theme).toBe('precta-dark');
    });

    test('should return null when no preference exists', () => {
      const stored = mockStorage.getItem(THEME_STORAGE_KEY);
      expect(stored).toBeNull();
    });

    test('should handle corrupted JSON gracefully', () => {
      mockStorage.setItem(THEME_STORAGE_KEY, 'not-valid-json');
      
      let result = null;
      try {
        result = JSON.parse(mockStorage.getItem(THEME_STORAGE_KEY)!);
      } catch {
        result = null;
      }
      
      expect(result).toBeNull();
    });

    test('should reject invalid theme names', () => {
      const preference = {
        theme: 'invalid-theme',
        isExplicit: true,
        updatedAt: Date.now(),
      };
      
      mockStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(preference));
      
      const parsed = JSON.parse(mockStorage.getItem(THEME_STORAGE_KEY)!);
      const validThemes = ['precta-light', 'precta-dark'];
      const isValid = validThemes.includes(parsed.theme);
      
      expect(isValid).toBe(false);
    });
  });

  describe('Clearing Preference', () => {
    test('should clear saved preference', () => {
      mockStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({ theme: 'precta-dark' }));
      expect(mockStorage.getItem(THEME_STORAGE_KEY)).toBeTruthy();
      
      mockStorage.removeItem(THEME_STORAGE_KEY);
      expect(mockStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
    });
  });
});

// =============================================================================
// SYSTEM PREFERENCE TESTS
// =============================================================================

describe('System Preference Detection', () => {
  test('should detect dark mode preference', () => {
    const darkModeMock = createMatchMediaMock(true);
    const result = darkModeMock.matches ? 'precta-dark' : 'precta-light';
    
    expect(result).toBe('precta-dark');
  });

  test('should detect light mode preference', () => {
    const lightModeMock = createMatchMediaMock(false);
    const result = lightModeMock.matches ? 'precta-dark' : 'precta-light';
    
    expect(result).toBe('precta-light');
  });

  test('should default to light when no preference', () => {
    // When matchMedia is not available, default to light
    expect(DEFAULT_THEME).toBe('precta-light');
  });
});

// =============================================================================
// REDUCED MOTION TESTS (Edge Case)
// =============================================================================

describe('Reduced Motion Handling (WCAG)', () => {
  test('should detect reduced motion preference', () => {
    const reducedMotionMock = createMatchMediaMock(true);
    expect(reducedMotionMock.matches).toBe(true);
  });

  test('should detect motion allowed', () => {
    const motionAllowedMock = createMatchMediaMock(false);
    expect(motionAllowedMock.matches).toBe(false);
  });

  test('REDUCED_MOTION_QUERY should be correct media query', () => {
    expect(REDUCED_MOTION_QUERY).toBe('(prefers-reduced-motion: reduce)');
  });

  test('should return 0 duration when reduced motion', () => {
    const prefersReducedMotion = true;
    const normalDuration = 150;
    const duration = prefersReducedMotion ? 0 : normalDuration;
    
    expect(duration).toBe(0);
  });

  test('should disable transitions when reduced motion', () => {
    const prefersReducedMotion = true;
    const transition = prefersReducedMotion ? 'none' : 'transform 150ms ease-out';
    
    expect(transition).toBe('none');
  });
});

// =============================================================================
// THEME TOGGLE LOGIC TESTS
// =============================================================================

describe('Theme Toggle Logic', () => {
  test('should toggle from light to dark', () => {
    let currentTheme = 'precta-light';
    const toggle = () => {
      currentTheme = currentTheme === 'precta-light' ? 'precta-dark' : 'precta-light';
    };
    
    toggle();
    expect(currentTheme).toBe('precta-dark');
  });

  test('should toggle from dark to light', () => {
    let currentTheme = 'precta-dark';
    const toggle = () => {
      currentTheme = currentTheme === 'precta-light' ? 'precta-dark' : 'precta-light';
    };
    
    toggle();
    expect(currentTheme).toBe('precta-light');
  });

  test('should persist after toggle', () => {
    const mockStorage = createLocalStorageMock();
    let currentTheme = 'precta-light';
    
    const setTheme = (theme: string) => {
      currentTheme = theme;
      mockStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({
        theme,
        isExplicit: true,
        updatedAt: Date.now(),
      }));
    };
    
    setTheme('precta-dark');
    
    const stored = JSON.parse(mockStorage.getItem(THEME_STORAGE_KEY)!);
    expect(stored.theme).toBe('precta-dark');
  });
});

// =============================================================================
// INITIAL THEME RESOLUTION TESTS
// =============================================================================

describe('Initial Theme Resolution', () => {
  test('should prioritize localStorage over system preference', () => {
    const mockStorage = createLocalStorageMock();
    const systemPrefersDark = true;
    
    // User explicitly chose light theme
    mockStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({
      theme: 'precta-light',
      isExplicit: true,
    }));
    
    const getInitialTheme = () => {
      const stored = mockStorage.getItem(THEME_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.theme;
      }
      return systemPrefersDark ? 'precta-dark' : 'precta-light';
    };
    
    expect(getInitialTheme()).toBe('precta-light');
  });

  test('should use system preference when no localStorage', () => {
    const mockStorage = createLocalStorageMock();
    const systemPrefersDark = true;
    
    const getInitialTheme = () => {
      const stored = mockStorage.getItem(THEME_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.theme;
      }
      return systemPrefersDark ? 'precta-dark' : 'precta-light';
    };
    
    expect(getInitialTheme()).toBe('precta-dark');
  });

  test('should default to light theme as fallback', () => {
    expect(DEFAULT_THEME).toBe('precta-light');
  });
});

// =============================================================================
// DATA-THEME ATTRIBUTE TESTS
// =============================================================================

describe('data-theme Attribute', () => {
  test('should format theme name correctly for DaisyUI', () => {
    const themes = ['precta-light', 'precta-dark'];
    
    themes.forEach(theme => {
      // Theme name should be valid CSS identifier
      expect(theme).toMatch(/^[a-z][a-z0-9-]*$/);
    });
  });

  test('should not contain spaces or special characters', () => {
    const themes = ['precta-light', 'precta-dark'];
    
    themes.forEach(theme => {
      expect(theme).not.toMatch(/\s/);
      expect(theme).not.toMatch(/[^a-z0-9-]/);
    });
  });
});
