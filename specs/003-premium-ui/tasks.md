# Tasks: Premium UI & DaisyUI Elevation

**Input**: Design documents from `/specs/003-premium-ui/`
**Prerequisites**: plan.md, spec.md. (research/data-model/contracts will be appended as they are produced.)

**Organization**: Tasks are grouped by phase and user story to keep each slice independently testable.

## Phase 1: Setup (Shared Infrastructure)
**Purpose**: Verify tooling, dependencies, and testing harnesses required across the feature.

- [X] T001 Ensure DaisyUI/Tailwind v4 configuration matches premium theme goals in `apps/web/app.config.ts` & `apps/web/src/app.css`.
- [X] T002 Align dependency versions (Solid, Lucide, DaisyUI) and lockfiles in `apps/web/package.json` + root `bun.lock`.
- [X] T003 Configure Bun test + Playwright suites for new specs (`apps/web/playwright.config.ts`, `apps/web/tests/unit/tsconfig.json`).

## Phase 2: Foundational (Blocking Prerequisites)
**Purpose**: Theme infrastructure and shared assets that every story depends on.

- [X] T004 Define semantic theme tokens + gradients in `apps/web/src/lib/theme.ts` and share types via `packages/shared/src/theme/tokens.ts`.
- [X] T005 [P] Build persistent theme store (light default + reduced-motion awareness) in `apps/web/src/stores/theme.ts`.
- [X] T006 [P] Curate investor-grade logos/assets and compress SVGs in `apps/web/public/trust/*.svg`.
- [X] T007 Instrument Lighthouse/CLS budgets in `apps/web/tests/e2e/perf.config.ts` to enforce ≤2.5s TTFI.

---

## Phase 3: User Story 1 – Investor-Ready Landing Experience (Priority: P1)
**Goal**: Deliver premium `/` hero, trust grid, and feature cards that impress investors.
**Independent Test**: Playwright run on `/` verifying hero, trust indicators, and hover states without touching auth/consult flows.

### Tests (write-first)
- [X] T008 [P] [US1] Add Playwright landing spec covering hero/trust micro-interactions in `apps/web/tests/e2e/landing.spec.ts`.
- [X] T009 [P] [US1] Add Bun unit tests for animation utilities in `apps/web/tests/unit/animation-utils.test.ts`.

### Implementation
- [X] T010 [US1] Rebuild hero layout with gradients + glass panels in `apps/web/src/routes/index.tsx`.
- [X] T011 [US1] Create trust indicator component with Lucide icons in `apps/web/src/components/layout/TrustPanel.tsx`.
- [X] T012 [US1] Implement animated feature grid (Bento) in `apps/web/src/components/layout/FeatureGrid.tsx`.
- [X] T013 [US1] Remove emoji usage across landing content, replacing with icons/typography in `apps/web/src/routes/index.tsx` & `apps/web/src/components/**/*`.

**Checkpoint**: Landing page shippable as standalone MVP.

---

## Phase 4: User Story 2 – Clinician & Patient Session Surfaces (Priority: P2)
**Goal**: Professionalize `/consultations/:id/call` UI with new chrome, controls, and alerts.
**Independent Test**: Playwright scenario mocking a consultation session verifying controls, participant states, and alerts.

### Tests
- [X] T014 [P] [US2] Create Playwright consultation spec in `apps/web/tests/e2e/consultation.spec.ts` to verify controls + alerts.
- [X] T015 [US2] Add accessibility snapshot tests for control focus states in `apps/web/tests/unit/call-controls.test.tsx`.

### Implementation
- [X] T016 [US2] Redesign video frame + participant tags in `apps/web/src/routes/consultations/[id]/call.tsx`.
- [X] T017 [US2] Extract control bar component (mute/video/share/end) with DaisyUI variants in `apps/web/src/components/ui/CallControls.tsx`.
- [X] T018 [US2] Implement status/alert banner referencing audit context in `apps/web/src/components/ui/CallAlerts.tsx`.
- [X] T019 [US2] Replace emoji hints with Lucide icons + copy updates in `apps/web/src/routes/consultations/[id]/call.tsx`.

---

## Phase 5: User Story 3 – Theming System & Component Library (Priority: P3)
**Goal**: Centralized DaisyUI theme + documented component variants for future teams.
**Independent Test**: Toggle theme tokens and verify propagation across Storybook/demo components without manual overrides.

### Tests
- [X] T020 [P] [US3] Add unit tests for theme persistence + reduced motion handling in `apps/web/tests/unit/theme-store.test.ts`.
- [X] T021 [US3] Add visual regression/Storybook snapshot baseline for key components in `apps/web/tests/e2e/components.visual.spec.ts`.

### Implementation
- [X] T022 [US3] Define DaisyUI theme config (light default, dark fallback) in `apps/web/app.config.ts`.
- [X] T023 [US3] Document component variants + tokens in `apps/web/src/components/ui/README.md` (or Storybook MDX).
- [X] T024 [US3] Wire global theme provider + toggle surface in `apps/web/src/app.tsx` and `apps/web/src/stores/theme.ts`.

---

## Final Phase: Polish & Cross-Cutting
**Purpose**: Wrap-up tasks cutting across all stories.

- [X] T025 [P] Update project README + `specs/003-premium-ui/quickstart.md` with DaisyUI usage instructions.
- [X] T026 [P] Document research decisions in `specs/003-premium-ui/research.md`.
- [X] T027 Create test specs for Lighthouse/axe audits in `apps/web/tests/e2e/landing.spec.ts` & `consultation.spec.ts`.
- [X] T028 Final design QA directory + checklist in `docs/ui-reviews/premium-ui/README.md`.

---

## Dependencies & Execution Order

- Phase 1 → Phase 2 (blocking). No user story work until Phase 2 complete.
- US1 (Phase 3) kicks off after Phase 2 and can ship MVP alone.
- US2 and US3 may start once foundational work is done but should respect priorities (US1 first for MVP pitch).
- Polish phase after all targeted stories land.

## Parallel Opportunities

- T005 & T006 can run concurrently once tokens defined.
- Within US1, Playwright and unit tests (T008/T009) can run in parallel; likewise layout components T011/T012 if coordinated.
- US2 and US3 can proceed in parallel teams after US1 MVP sign-off.

## Implementation Strategy

1. Complete Setup + Foundational (T001–T007).
2. Deliver US1 (T008–T013) and validate investor landing as MVP.
3. Layer in US2 (T014–T019) for consultation credibility.
4. Finish US3 (T020–T024) to ensure future scalability.
5. Polish + QA (T025–T028) leading into `/speckit.implement`.
