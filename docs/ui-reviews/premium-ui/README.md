# Premium UI - Design QA Screenshots

This directory contains design QA screenshots for the Premium UI feature.

## Screenshot Checklist

### Landing Page (US1)

- [ ] `landing-hero-desktop.png` - Hero section on desktop (1920x1080)
- [ ] `landing-hero-mobile.png` - Hero section on mobile (375x667)
- [ ] `landing-trust-panel.png` - Trust indicators row
- [ ] `landing-feature-grid.png` - Bento grid cards
- [ ] `landing-hover-states.gif` - Card hover animations

### Consultation Call (US2)

- [ ] `call-controls-default.png` - Control bar default state
- [ ] `call-controls-muted.png` - Muted/video-off states
- [ ] `call-participant-tags.png` - Doctor/Patient labels
- [ ] `call-alerts.png` - Status alert examples

### Theme Variants (US3)

- [ ] `theme-light.png` - Light theme overview
- [ ] `theme-dark.png` - Dark theme overview
- [ ] `theme-toggle.gif` - Theme transition animation

### Accessibility

- [ ] `a11y-focus-states.png` - Focus ring visibility
- [ ] `a11y-reduced-motion.png` - Static state with reduced motion

## How to Capture

```bash
# Using Playwright
bunx playwright test --update-snapshots

# Manual: Open browser dev tools
# - Set viewport size
# - Press Cmd+Shift+P → "Capture screenshot"
```

## Lighthouse Scores

| Page | Performance | Accessibility | Best Practices | SEO |
|------|-------------|---------------|----------------|-----|
| Landing `/` | - | - | - | - |
| Call `/consultations/:id/call` | - | - | - | - |

*Run `bunx lighthouse <url>` to capture scores*

## axe Accessibility Report

*Run Playwright accessibility tests to generate report*

```bash
bunx playwright test components.visual.spec.ts
```
