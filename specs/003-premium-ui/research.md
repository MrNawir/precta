# Premium UI Research Notes

Documentation of design decisions, library choices, and implementation rationale.

## DaisyUI 5 Migration

### Key Changes from v4

1. **New `@plugin` Syntax**
   - Themes now defined with `@plugin "daisyui/theme"` instead of CSS variables in `:root`
   - Allows per-theme customization inline

2. **OKLCH Color Format**
   - DaisyUI 5 recommends OKLCH for P3 gamut support
   - Perceptually uniform lightness for better accessibility
   - Format: `oklch(lightness% chroma hue)`

3. **Effect Variables**
   - New `--depth` and `--noise` CSS variables
   - Control component shadows and textures globally

4. **New Component Variants**
   - `btn-soft` - Subtle background variant
   - `btn-dash` - Dashed border variant
   - `xl` size modifier available

### Documentation References

- DaisyUI 5 Themes: https://daisyui.com/docs/themes/
- DaisyUI 5 Release Notes: https://daisyui.com/docs/v5/
- OKLCH Color Picker: https://oklch.com/

## Tailwind CSS v4 Notes

### Breaking Changes

1. **Gradient Classes**
   - `bg-gradient-to-*` renamed to `bg-linear-to-*`

2. **Border Radius**
   - `rounded-4xl` now available (was custom before)

3. **`@theme` Directive**
   - Replaces `theme.extend` in config
   - CSS-native approach

### Documentation References

- Tailwind v4 Docs: https://tailwindcss.com/docs
- Migration Guide: https://tailwindcss.com/docs/upgrade-guide

## Color Selection Rationale

### Primary: Deep Teal-Blue (oklch(45% 0.12 195))

**Why this color?**
- Medical credibility: Blue/teal associated with healthcare trust
- Professional appeal: Deep tones suggest established institution
- P3 gamut: Rich color on modern displays

### Secondary: Vibrant Teal (oklch(55% 0.14 175))

**Why this color?**
- Complementary to primary without clashing
- Warmer hue for approachable feel
- Good contrast for secondary CTAs

### Accent: Coral-Orange (oklch(70% 0.18 45))

**Why this color?**
- High contrast against blue palette
- Draws attention to key CTAs
- Warm, inviting for action buttons

## Animation Decisions

### 150ms Interaction Timing

**Source:** FR-003 requirement (interactions <200ms)

**Rationale:**
- Research shows 100-200ms feels "instant" to users
- 150ms provides smooth feel without sluggishness
- Allows for slight spring overshoot

### GPU-Accelerated Properties Only

**Properties used:**
- `transform` (translate, scale, rotate)
- `opacity`

**Avoided:**
- `width`, `height` (triggers layout)
- `margin`, `padding` (triggers layout)
- `box-shadow` animation (except on hover)

### Reduced Motion Support

**Implementation:**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
```

**Source:** WCAG 2.1 SC 2.3.3

## Glassmorphism Parameters

### Blur: 16px

**Why 16px?**
- Optimal balance of frosted effect and readability
- Less blur (8px) looks unfinished
- More blur (24px) impacts performance

### Opacity: 0.7

**Why 70%?**
- Enough transparency to see background context
- Enough opacity for foreground contrast
- Works on both light and dark backgrounds

### References

- CSS Tricks Guide: https://css-tricks.com/glassmorphism-css/

## Accessibility Decisions

### No Emojis (FR-002)

**Rationale:**
- Screen readers announce emoji names verbosely
- Inconsistent rendering across devices
- Less professional appearance for investor-facing UI
- Lucide icons are consistent, scalable, accessible

### Focus Ring Styling

**Implementation:**
```css
focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
```

**Why focus-visible not focus?**
- Only shows on keyboard navigation
- Doesn't show on mouse clicks (cleaner UX)
- Better browser support now

### Touch Target Sizes

**Minimum: 44x44px**

**Source:** WCAG 2.5.5 Target Size (Level AAA)

**Implementation:**
- Control buttons: `w-14 h-14` (56px)
- End call button: `w-16 h-16` (64px)

## Performance Decisions

### Font Loading Strategy

```css
@import url('...&display=swap');
```

**Why `display=swap`?**
- Shows fallback font immediately
- Swaps to custom font when loaded
- Prevents invisible text (FOIT)
- Better CLS scores

### Image Lazy Loading

```html
<img loading="lazy" />
```

**Applied to:**
- Feature grid card images
- Below-fold content
- Non-critical images

### Bundle Size Considerations

**Target:** <50KB diff for this feature

**Strategies:**
- Tree-shakeable Lucide icons
- CSS-only animations (no JS animation libraries)
- Shared theme tokens (no duplication)

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2024-12-15 | Use OKLCH colors | P3 gamut support, perceptual uniformity |
| 2024-12-15 | 150ms animation timing | Feels instant per research, meets FR-003 |
| 2024-12-15 | Lucide over Heroicons | Better tree-shaking, solid-js support |
| 2024-12-15 | No Storybook | Keep bundle small, README docs sufficient |
| 2024-12-15 | prefers-reduced-motion via CSS | Lower maintenance than JS detection |
