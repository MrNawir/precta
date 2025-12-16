# Implementation Plan: Premium UI & DaisyUI Elevation

**Branch**: `003-premium-ui` | **Date**: 2025-12-13 | **Spec**: [/specs/003-premium-ui/spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-premium-ui/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Upgrade the Solid Start frontend (apps/web) to deliver an investor-ready, 2026-grade UX using DaisyUI. Focus areas:

1. **Landing page**: new hero, trust animations, micro-interactions, light-mode default.
2. **Consultation call shell**: professional video chrome + controls aligned with backend audit cues.
3. **Centralized theming**: DaisyUI tokens, documented component variants, persistence hooks.

No backend changes, but frontend must respect audit/auth flows from `/apps/backend/src/middleware/audit.ts`.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.9 (strict) / SolidJS 1.9.x / Bun 1.1 runtime  
**Primary Dependencies**: Solid Start, DaisyUI 5.5+, Tailwind CSS v4 plugin, Lucide-solid, @precta/shared  
**Storage**: N/A (frontend-only, localStorage for preferences)  
**Testing**: Bun test (unit), Playwright 1.52 (e2e + accessibility)  
**Target Platform**: Solid Start SSR/SPA served via CDN, tuned for mid-tier Android Chrome on 4G  
**Project Type**: Monorepo (apps/web, apps/backend, packages/*) focusing on frontend  
**Performance Goals**: Landing TTFI ≤2.5s, interaction latency ≤150ms, CLS <0.05, Lighthouse ≥90  
**Constraints**: WCAG AA, respect `prefers-reduced-motion`, default light theme, no backend schema updates  
**Scale/Scope**: Landing hero/trust grid, feature cards, consultation call UI, DaisyUI theme config, documentation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

1. **Article I – Type Safety**: Maintain strict TS, share prop types via `@precta/shared` where reused.
2. **Article II – TDD**: Add/refresh unit tests for theme helpers before code; Playwright specs for landing & call flows.
3. **Article III – Security/Privacy**: Consultation UI must expose audit cues without logging PHI.
4. **Article VII – Performance**: Use CSS transforms, lazy-load heavy assets, keep bundle diff under 50KB.
5. **Article VIII – Accessibility**: Provide keyboard focus states, screen-reader labels, Swahili-ready copy, reduced-motion fallback.
6. **Article IX – Documentation**: Reference DaisyUI docs, update quickstart + README sections.

✅ No gate violations anticipated. Proceed with research/design.

## Project Structure

### Documentation (this feature)

```text
specs/003-premium-ui/
├── plan.md
├── research.md          # Phase 0 (theme + motion decisions)
├── data-model.md        # Phase 1 (ThemeToken, ComponentVariant, UserPreference)
├── quickstart.md        # Phase 1 (local preview + testing guide)
├── contracts/           # Phase 1 (UI/API contracts if needed)
└── tasks.md             # Phase 2 (/speckit.tasks output)
```

### Source Code (repository root)

```text
apps/
├── backend/
│   └── src/middleware/audit.ts     # Reference-only (ensures UI cues match audit logging)
└── web/
    ├── src/
    │   ├── routes/
    │   │   ├── index.tsx           # Landing hero + trust grid overhaul
    │   │   └── consultations/[id]/call.tsx  # Consultation shell redesign
    │   ├── components/
    │   │   ├── ui/                 # Buttons, cards, inputs (new DaisyUI variants)
    │   │   └── layout/             # Hero, feature grid, testimonial blocks
    │   ├── stores/
    │   │   └── theme.ts            # Light-mode persistence + reduced-motion context
    │   ├── lib/
    │   │   └── theme.ts            # Token helpers, animation timing constants
    │   ├── styles/
    │   │   └── tailwind.css        # DaisyUI plugin config + custom utilities
    │   └── tests/
    │       ├── unit/               # Bun tests for helpers
    │       └── e2e/                # Playwright specs (landing/call)
    ├── public/                     # Optimized SVG logos/trust icons
    └── tailwind.config.ts          # DaisyUI theme definitions

packages/
├── shared/                         # Optional shared tokens/types
└── db/                             # Reference for audit-related copy
```

**Structure Decision**: All work occurs in `apps/web`; shared semantic tokens may move to `packages/shared` if reused across apps. Backend inspected for parity but untouched.

## Complexity Tracking

None. Revisit if scope changes.

## Phase 0 – Research

1. Study DaisyUI theme docs + Solid Start styling for best practices.
2. Resolve branding voice/tonality question for investor messaging.
3. Document animation timing, performance budgets, testing approach.

Deliverable: `research.md` with decision/rationale/alternatives.

## Phase 1 – Design & Contracts

1. **Data Model**: Map ThemeToken, ComponentVariant, and UserPreference entities (fields, validation, lifecycle) in `data-model.md`.
2. **Contracts**: Document any UI/API touchpoints (e.g., `/api/auth/session`, `/api/auth/sign-in/email`) and confirm no new endpoints required; describe front-end preference persistence contract.
3. **Quickstart**: Provide a reproducible guide for designers/engineers to preview the premium UI (install deps, run dev server, toggle theme, run tests).
4. **Agent Context**: Run `.specify/scripts/bash/update-agent-context.sh windsurf` to keep Cascade context aware of new technologies/tokens.

Deliverables: `data-model.md`, `contracts/*.md`, `quickstart.md`, updated agent context.
