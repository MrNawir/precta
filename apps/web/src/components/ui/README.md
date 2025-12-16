# Precta UI Component Library

Premium UI components built with SolidJS, DaisyUI 5, and Tailwind CSS v4.

## Overview

This component library provides investor-grade UI elements for the Precta healthcare platform. All components follow:

- **WCAG AA Accessibility** - Proper ARIA labels, keyboard navigation, focus states
- **DaisyUI 5 Integration** - Semantic color tokens, consistent variants
- **Responsive Design** - Mobile-first, works across all viewports
- **Reduced Motion Support** - Respects `prefers-reduced-motion`
- **No Emojis** - Lucide icons throughout (FR-002)

## Theme Configuration

### DaisyUI 5 Setup

Themes are defined in `app.css` using the DaisyUI 5 `@plugin` syntax:

```css
@plugin "daisyui/theme" {
  name: "precta-light";
  default: true;
  color-scheme: light;
  
  --color-primary: oklch(45% 0.12 195);
  --color-secondary: oklch(55% 0.14 175);
  /* ... */
}
```

### Available Themes

| Theme | Description | Default |
|-------|-------------|---------|
| `precta-light` | Light mode for professional appeal | ✅ |
| `precta-dark` | Dark mode for reduced eye strain | - |

### Color Tokens (OKLCH)

| Token | Light Value | Usage |
|-------|-------------|-------|
| `primary` | Deep teal-blue | CTAs, links, emphasis |
| `secondary` | Vibrant teal | Supporting elements |
| `accent` | Coral-orange | Attention, highlights |
| `neutral` | Slate | Text, backgrounds |
| `info` | Blue | Informational alerts |
| `success` | Green | Positive feedback |
| `warning` | Amber | Caution states |
| `error` | Red | Error states, end call |

## Components

### Layout Components

#### `TrustPanel`
Trust indicator badges for landing page hero section.

```tsx
import TrustPanel from '~/components/layout/TrustPanel';

// Full version
<TrustPanel />

// Compact version for footer
import { TrustPanelCompact } from '~/components/layout/TrustPanel';
<TrustPanelCompact />
```

**Features:**
- Animated entrance (with reduced-motion fallback)
- Lucide icons (Shield, Lock, CheckCircle, Award)
- Hover states with primary color highlight
- ARIA labels for accessibility

#### `FeatureGrid`
Bento-style grid for service/feature cards.

```tsx
import FeatureGrid, { type FeatureItem } from '~/components/layout/FeatureGrid';

const items: FeatureItem[] = [
  {
    id: 'consult',
    title: 'Video Consultation',
    description: 'Connect in 60 seconds',
    icon: Video,
    href: '/consult',
    image: '/images/consult.jpg',
    span: 'col-span-12 md:col-span-6',
    gradient: 'from-primary/90 to-primary/70',
  },
];

<FeatureGrid items={items} />
```

**Features:**
- 12-column responsive grid
- Image lazy loading
- Hover lift animation (150ms)
- Gradient overlays
- Glassmorphic icon containers

### UI Components

#### `CallControls`
Control bar for video consultations.

```tsx
import CallControls from '~/components/ui/CallControls';

<CallControls
  isAudioMuted={false}
  isVideoOff={false}
  onToggleAudio={() => toggleAudio()}
  onToggleVideo={() => toggleVideo()}
  onEndCall={() => endCall()}
  onScreenShare={() => shareScreen()}  // Optional
  onMoreOptions={() => openMenu()}      // Optional
/>
```

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isAudioMuted` | `boolean` | ✅ | Current mute state |
| `isVideoOff` | `boolean` | ✅ | Current video state |
| `onToggleAudio` | `() => void` | ✅ | Audio toggle handler |
| `onToggleVideo` | `() => void` | ✅ | Video toggle handler |
| `onEndCall` | `() => void` | ✅ | End call handler |
| `onScreenShare` | `() => void` | - | Screen share handler |
| `onMoreOptions` | `() => void` | - | More options handler |

**Accessibility:**
- `role="toolbar"` on container
- `aria-label` on all buttons
- `aria-pressed` for toggle states
- Focus ring with `ring-offset-neutral`

#### `CallAlerts`
Status and alert banners for consultations.

```tsx
import CallAlerts, { type CallAlert } from '~/components/ui/CallAlerts';

const alerts: CallAlert[] = [
  {
    id: '1',
    type: 'warning',
    message: 'Your microphone is muted',
    icon: 'mic-off',
    dismissible: true,
  },
];

<CallAlerts 
  alerts={alerts} 
  onDismiss={(id) => removeAlert(id)}
  position="top"
/>
```

**Alert Types:**
- `info` - Informational (blue)
- `warning` - Caution (amber)
- `error` - Critical (red, assertive)
- `success` - Positive (green)

**Additional Components:**
```tsx
import { 
  ConnectionStatus,
  EncryptionBadge,
  CallTimer,
  RoleBadge 
} from '~/components/ui/CallAlerts';

<ConnectionStatus isConnected={true} quality="good" />
<EncryptionBadge />
<CallTimer seconds={125} />
<RoleBadge role="doctor" />
```

#### `ThemeToggle`
Theme switcher button.

```tsx
import ThemeToggle from '~/components/ui/ThemeToggle';

<ThemeToggle />
```

## Utility Classes

### Premium Gradients

```html
<!-- Primary gradient -->
<div class="gradient-primary">...</div>

<!-- Hero background with radial accents -->
<section class="gradient-hero">...</section>

<!-- Gradient text -->
<span class="text-gradient">Elevated</span>
```

### Glassmorphism

```html
<!-- Frosted glass panel -->
<div class="glass-panel">
  Content with blur background
</div>
```

### Animations

```html
<!-- Fade in from bottom -->
<div class="animate-fade-in-up">...</div>

<!-- Simple fade in -->
<div class="animate-fade-in">...</div>

<!-- Hover lift effect -->
<div class="hover-lift">Card content</div>

<!-- Hover scale effect -->
<button class="hover-scale">Click me</button>
```

**Note:** All animations respect `prefers-reduced-motion: reduce`.

## Design Tokens

Import from shared package for type-safe access:

```tsx
import {
  DEFAULT_THEME,
  ANIMATION_DURATION,
  ANIMATION_EASING,
  GLASS_TOKENS,
  THEME_STORAGE_KEY,
} from '@precta/shared';

// Animation timing (per FR-003: <200ms)
ANIMATION_DURATION.fast    // 100ms
ANIMATION_DURATION.normal  // 150ms
ANIMATION_DURATION.slow    // 300ms

// Easing functions
ANIMATION_EASING.easeOut  // cubic-bezier(0.33, 1, 0.68, 1)
ANIMATION_EASING.spring   // cubic-bezier(0.34, 1.56, 0.64, 1)

// Glass effect values
GLASS_TOKENS.blur          // 16px
GLASS_TOKENS.opacity       // 0.7
GLASS_TOKENS.borderOpacity // 0.5
```

## Theme Store

Reactive theme state management:

```tsx
import { 
  theme, 
  setTheme, 
  toggleTheme, 
  prefersReducedMotion 
} from '~/stores/theme';

// Read current theme
const currentTheme = theme(); // 'precta-light' | 'precta-dark'

// Set theme (persists to localStorage)
setTheme('precta-dark');

// Toggle between light/dark
toggleTheme();

// Check reduced motion preference
if (!prefersReducedMotion()) {
  // Run animation
}
```

## Best Practices

### 1. Always Use Semantic Colors
```tsx
// ✅ Good - uses DaisyUI semantic class
<button class="btn btn-primary">Submit</button>

// ❌ Bad - hardcoded color
<button class="bg-[#0F6674]">Submit</button>
```

### 2. Include ARIA Labels
```tsx
// ✅ Good - accessible
<button aria-label="Toggle microphone" aria-pressed={isMuted}>
  <MicOff />
</button>

// ❌ Bad - icon-only without label
<button><MicOff /></button>
```

### 3. Use Lucide Icons, Not Emojis
```tsx
// ✅ Good - Lucide icon
import { Shield } from 'lucide-solid';
<Shield class="w-5 h-5" />

// ❌ Bad - emoji
<span>🛡️</span>
```

### 4. Respect Reduced Motion
```tsx
// ✅ Good - checks preference
const duration = prefersReducedMotion() ? 0 : 150;

// ❌ Bad - forces animation
const duration = 150;
```

### 5. Keep Animations Under 200ms
```tsx
// ✅ Good - per FR-003
transition: transform 150ms ease-out;

// ❌ Bad - too slow for interactions
transition: transform 500ms ease-out;
```

## File Structure

```
src/components/
├── layout/
│   ├── TrustPanel.tsx      # Trust indicators
│   └── FeatureGrid.tsx     # Bento grid
├── ui/
│   ├── CallControls.tsx    # Video call controls
│   ├── CallAlerts.tsx      # Status alerts
│   ├── ThemeToggle.tsx     # Theme switcher
│   └── README.md           # This file
└── ...
```

## References

- [DaisyUI 5 Components](https://daisyui.com/components/)
- [DaisyUI 5 Themes](https://daisyui.com/docs/themes/)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/icons/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
