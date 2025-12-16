# Premium UI Quickstart Guide

Quick reference for working with Precta's premium DaisyUI 5 theming system.

## Setup

The premium UI is already configured. No additional setup required.

### Key Files

| File | Purpose |
|------|---------|
| `apps/web/src/app.css` | DaisyUI 5 theme definitions (OKLCH colors) |
| `apps/web/src/lib/theme.ts` | Theme utility functions |
| `apps/web/src/stores/theme.ts` | Reactive theme state |
| `packages/shared/src/theme/tokens.ts` | TypeScript token definitions |
| `apps/web/src/components/ui/README.md` | Component documentation |

## Using the Theme

### Apply Theme to Root

The theme is applied via `data-theme` attribute:

```html
<html data-theme="precta-light">
```

### Available Themes

- `precta-light` - Default, professional light theme
- `precta-dark` - Dark mode for reduced eye strain

### Toggle Theme

```tsx
import { toggleTheme, theme } from '~/stores/theme';

// Get current theme
const current = theme(); // 'precta-light' | 'precta-dark'

// Toggle between light/dark
toggleTheme();
```

## Using Colors

### In Tailwind Classes

```html
<!-- Primary button -->
<button class="btn btn-primary">Submit</button>

<!-- Text colors -->
<p class="text-base-content">Normal text</p>
<p class="text-primary">Primary colored</p>

<!-- Backgrounds -->
<div class="bg-base-100">White surface</div>
<div class="bg-base-200">Slightly gray</div>
```

### Semantic Colors

| Class | Usage |
|-------|-------|
| `btn-primary` | Main CTAs |
| `btn-secondary` | Secondary actions |
| `btn-accent` | Highlights |
| `alert-info` | Information |
| `alert-success` | Success states |
| `alert-warning` | Warnings |
| `alert-error` | Errors |

## Using Components

### Trust Panel (Landing)

```tsx
import TrustPanel from '~/components/layout/TrustPanel';

<TrustPanel />
```

### Feature Grid (Bento)

```tsx
import FeatureGrid from '~/components/layout/FeatureGrid';

<FeatureGrid items={[
  { id: '1', title: 'Feature', ... }
]} />
```

### Call Controls (Video)

```tsx
import CallControls from '~/components/ui/CallControls';

<CallControls
  isAudioMuted={false}
  isVideoOff={false}
  onToggleAudio={() => {}}
  onToggleVideo={() => {}}
  onEndCall={() => {}}
/>
```

### Alerts

```tsx
import CallAlerts from '~/components/ui/CallAlerts';

<CallAlerts alerts={[
  { id: '1', type: 'warning', message: 'Mic muted' }
]} />
```

## Utility Classes

### Glass Effect

```html
<div class="glass-panel">
  Frosted glass background
</div>
```

### Gradients

```html
<div class="gradient-primary">Gradient background</div>
<span class="text-gradient">Gradient text</span>
<section class="gradient-hero">Hero section</section>
```

### Animations

```html
<div class="animate-fade-in-up">Fades in from below</div>
<div class="hover-lift">Lifts on hover</div>
```

## Accessibility

### Reduced Motion

All animations respect `prefers-reduced-motion`:

```tsx
import { prefersReducedMotion } from '~/stores/theme';

if (!prefersReducedMotion()) {
  // Run animation
}
```

### Icons Not Emojis

Always use Lucide icons:

```tsx
import { Shield } from 'lucide-solid';

// ✅ Good
<Shield class="w-5 h-5" />

// ❌ Bad
<span>🛡️</span>
```

## Running Tests

```bash
# Unit tests
bun test

# E2E tests
bunx playwright test

# Specific test files
bun test theme-store
bunx playwright test landing.spec.ts
```

## Performance Budgets

| Metric | Target |
|--------|--------|
| TTFI | ≤2.5s |
| CLS | <0.05 |
| Lighthouse | ≥90 |
| Bundle diff | <50KB |

## References

- [Component README](../../apps/web/src/components/ui/README.md)
- [DaisyUI 5 Docs](https://daisyui.com/docs/)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Spec](./spec.md)
- [Plan](./plan.md)
