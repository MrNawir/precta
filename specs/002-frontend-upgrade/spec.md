# Feature Specification: Frontend Upgrade (Next Level UI)

## 1. Overview
The goal of this feature is to overhaul the existing frontend of the Precta platform to achieve a "2026 ready" premium aesthetic. This involves removing unprofessional elements ("goofy emojis"), implementing a sophisticated design system, and enhancing user interaction with modern UI patterns (glassmorphism, micro-animations, rich gradients).

## 2. Goals
- **Eliminate "Goofy" Elements**: Remove all unprofessional emojis from the UI (e.g., 😕, 😂, 😊, 🚀, ✨ used in non-content contexts).
- **Premium Aesthetic**: Implement a high-end, trustworthy medical design language.
- **Enhanced Interactivity**: Add smooth transitions, micro-interactions, and responsive feedback.
- **Modern Layouts**: Utilize Bento grids, asymmetric layouts, and deep hierarchy.

## 3. Design Requirements

### 3.1. Visual Language
- **Typography**: Verify `Inter` usage, ensure proper weights (light/regular/medium/semibold) for hierarchy.
- **Color Palette**: Refine `Healthcare Blue` and `Teal` to be deeper, richer. Avoid neon/clashing tones.
- **Glassmorphism**: Enhanced usage of blur and transparency for cards and overlays.
- **Gradients**: Subtle, multi-stop gradients for backgrounds and text highlights.

### 3.2. Components
- **Buttons**: Remove default DaisyUI looks if generic. Add custom gradient borders or glow effects.
- **Cards**: "Glass" effect by default. Hover states with lift and shadow diffusion.
- **Inputs**: Clean, floating label or minimal border designs.

## 4. Specific Changes

### 4.1. Global Removal
- scan entire `apps/web` for emojis in text nodes and replace with Lucide icons or suitable SVGs.

### 4.2. Landing Page (`apps/web/src/routes/index.tsx`)
- Revamp Hero section.
- "Trust" indicators with logos/icons instead of emojis.
- Animated feature grid.

### 4.3. Consultation Call (`apps/web/src/routes/consultations/[id]/call.tsx`)
- Professional video frame.
- Clean controls overlay (no emojis).

## 5. Non-Goals
- Changing backend logic.
- altering database schema.
