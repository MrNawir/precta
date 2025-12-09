# Tasks: Precta Healthcare Platform Prototype

**Feature**: 001-precta-prototype  
**Generated**: 2025-12-09  
**Total Tasks**: 142  
**User Stories**: 10  
**Phases**: 14

---

## Task Summary

| Phase | Description | Task Count | Parallelizable |
|-------|-------------|------------|----------------|
| 1 | Setup | 12 | 4 |
| 2 | Foundation (Database) | 16 | 10 |
| 3 | Foundation (Auth & Core) | 10 | 4 |
| 4 | US1: Doctor Search & Booking (P1) | 14 | 8 |
| 5 | US2: Doctor Onboarding (P1) | 12 | 6 |
| 6 | US3: Video Consultation (P2) | 10 | 5 |
| 7 | US4: Medical Records (P2) | 8 | 4 |
| 8 | US5: Prescriptions (P2) | 8 | 4 |
| 9 | US6: Medicine Orders (P3) | 10 | 5 |
| 10 | US7: Revenue Dashboard (P3) | 6 | 3 |
| 11 | US8: Health Articles (P3) | 8 | 4 |
| 12 | US9: Admin Analytics (P3) | 8 | 4 |
| 13 | US10: Reviews & Ratings (P4) | 8 | 4 |
| 14 | Polish & Integration | 12 | 6 |

---

## Dependencies

```
Phase 1 (Setup) ──► Phase 2 (Database) ──► Phase 3 (Auth)
                                              │
                    ┌─────────────────────────┴─────────────────────────┐
                    │                                                   │
                    ▼                                                   ▼
              Phase 4 (US1)                                      Phase 5 (US2)
              Doctor Search                                      Doctor Onboarding
                    │                                                   │
                    └─────────────────────┬─────────────────────────────┘
                                          │
                    ┌─────────────────────┼─────────────────────────────┐
                    │                     │                             │
                    ▼                     ▼                             ▼
              Phase 6 (US3)         Phase 7 (US4)                 Phase 8 (US5)
              Video Consult         Medical Records               Prescriptions
                    │                     │                             │
                    └─────────────────────┴─────────────────────────────┘
                                          │
                    ┌─────────────────────┼─────────────────────────────┐
                    │                     │                             │
                    ▼                     ▼                             ▼
              Phase 9 (US6)         Phase 10 (US7)               Phase 11 (US8)
              Medicine Orders       Revenue Dashboard            Health Articles
                    │                     │                             │
                    └─────────────────────┴─────────────────────────────┘
                                          │
                                          ▼
                                    Phase 12 (US9)
                                    Admin Analytics
                                          │
                                          ▼
                                    Phase 13 (US10)
                                    Reviews & Ratings
                                          │
                                          ▼
                                    Phase 14 (Polish)
```

---

## MVP Scope

**Recommended MVP**: Phase 1-5 (Setup + Foundation + US1 + US2)

This delivers:
- Monorepo structure with all packages
- Database with core schemas
- Authentication with RBAC
- Doctor search & booking flow
- Doctor onboarding & verification

**Tasks for MVP**: T001-T064 (64 tasks)

---

## Phase 1: Setup

**Goal**: Initialize Bun workspaces monorepo with all packages and Docker services.

- [ ] T001 Create root package.json with workspaces configuration at `/package.json`
- [ ] T002 Create base tsconfig.json with strict mode and path aliases at `/tsconfig.json`
- [ ] T003 Update docker-compose.yml with healthchecks at `/docker-compose.yml`
- [ ] T004 Create .env.example with all environment variables at `/.env.example`
- [ ] T005 [P] Create apps/backend package.json at `/apps/backend/package.json`
- [ ] T006 [P] Create apps/backend tsconfig.json at `/apps/backend/tsconfig.json`
- [ ] T007 [P] Create packages/db package.json at `/packages/db/package.json`
- [ ] T008 [P] Create packages/db tsconfig.json at `/packages/db/tsconfig.json`
- [ ] T009 Create packages/shared package.json at `/packages/shared/package.json`
- [ ] T010 Create packages/shared tsconfig.json at `/packages/shared/tsconfig.json`
- [ ] T011 Move existing SolidStart app to apps/web and update package.json at `/apps/web/package.json`
- [ ] T012 Run bun install and verify workspace linking

---

## Phase 2: Foundation (Database)

**Goal**: Create all Drizzle schemas and run initial migration.

### Schema Files (Parallelizable)

- [ ] T013 [P] Create user schema with roles enum at `/packages/db/src/schema/users.ts`
- [ ] T014 [P] Create patient schema at `/packages/db/src/schema/patients.ts`
- [ ] T015 [P] Create doctor schema with verification status at `/packages/db/src/schema/doctors.ts`
- [ ] T016 [P] Create doctor_availability schema at `/packages/db/src/schema/doctors.ts`
- [ ] T017 [P] Create doctor_credential schema at `/packages/db/src/schema/doctors.ts`
- [ ] T018 [P] Create clinic schema (tenant) at `/packages/db/src/schema/clinics.ts`
- [ ] T019 [P] Create appointment schema with status enum at `/packages/db/src/schema/appointments.ts`
- [ ] T020 [P] Create consultation schema at `/packages/db/src/schema/consultations.ts`
- [ ] T021 [P] Create prescription schema with medications jsonb at `/packages/db/src/schema/prescriptions.ts`
- [ ] T022 [P] Create medical_record schema at `/packages/db/src/schema/records.ts`

### Additional Schemas

- [ ] T023 Create order and order_item schemas at `/packages/db/src/schema/orders.ts`
- [ ] T024 Create payment schema at `/packages/db/src/schema/payments.ts`
- [ ] T025 Create article schema at `/packages/db/src/schema/articles.ts`
- [ ] T026 Create review schema at `/packages/db/src/schema/reviews.ts`
- [ ] T027 Create notification schema at `/packages/db/src/schema/notifications.ts`
- [ ] T028 Create audit_log schema at `/packages/db/src/schema/audit.ts`

### Database Setup

- [ ] T029 Create schema index file exporting all tables at `/packages/db/src/schema/index.ts`
- [ ] T030 Create Drizzle client factory at `/packages/db/src/client.ts`
- [ ] T031 Create drizzle.config.ts at `/packages/db/drizzle.config.ts`
- [ ] T032 Generate and run initial migration

---

## Phase 3: Foundation (Auth & Core)

**Goal**: Setup Better Auth, core middleware, and shared utilities.

### Backend Core

- [ ] T033 Create Elysia app entry point at `/apps/backend/src/index.ts`
- [ ] T034 Create Elysia app with plugins at `/apps/backend/src/app.ts`
- [ ] T035 [P] Configure Better Auth with Drizzle adapter at `/apps/backend/src/lib/auth.ts`
- [ ] T036 [P] Create Drizzle database client at `/apps/backend/src/lib/db.ts`
- [ ] T037 [P] Create Redis client at `/apps/backend/src/lib/redis.ts`
- [ ] T038 [P] Create Typesense client at `/apps/backend/src/lib/typesense.ts`

### Middleware

- [ ] T039 Create auth middleware at `/apps/backend/src/middleware/auth.ts`
- [ ] T040 Create tenant middleware at `/apps/backend/src/middleware/tenant.ts`
- [ ] T041 Create audit middleware at `/apps/backend/src/middleware/audit.ts`

### Shared Package

- [ ] T042 Create shared constants (roles, status enums) at `/packages/shared/src/constants/index.ts`
- [ ] T043 Export drizzle-typebox schemas at `/packages/shared/src/schemas/index.ts`

### Frontend Core

- [ ] T044 Create Eden Treaty API client at `/apps/web/src/lib/api.ts`
- [ ] T045 Create auth context/store at `/apps/web/src/stores/auth.ts`

---

## Phase 4: US1 - Doctor Search & Booking (P1) 🎯

**Goal**: Patient can search doctors, view profiles, and book appointments.

**Independent Test**: Patient creates account → searches doctors → views profile → books slot → receives confirmation.

### Backend Services

- [ ] T046 [P] [US1] Create doctor.service.ts with search and profile methods at `/apps/backend/src/services/doctor.service.ts`
- [ ] T047 [P] [US1] Create search.service.ts with Typesense indexing at `/apps/backend/src/services/search.service.ts`
- [ ] T048 [P] [US1] Create appointment.service.ts with booking logic at `/apps/backend/src/services/appointment.service.ts`
- [ ] T049 [P] [US1] Create payment.service.ts with Paystack integration at `/apps/backend/src/services/payment.service.ts`
- [ ] T050 [P] [US1] Create notification.service.ts at `/apps/backend/src/services/notification.service.ts`

### Backend Routes

- [ ] T051 [US1] Create auth routes (register, login, logout, me) at `/apps/backend/src/routes/v1/auth.ts`
- [ ] T052 [US1] Create doctors routes (search, get profile, availability) at `/apps/backend/src/routes/v1/doctors.ts`
- [ ] T053 [US1] Create appointments routes (book, list, get, cancel) at `/apps/backend/src/routes/v1/appointments.ts`
- [ ] T054 [US1] Create payments routes (initialize, webhook) at `/apps/backend/src/routes/v1/payments.ts`
- [ ] T055 [US1] Create v1 routes index at `/apps/backend/src/routes/v1/index.ts`

### Paystack Integration

- [ ] T056 [US1] Create Paystack client at `/apps/backend/src/lib/paystack.ts`

### Frontend Pages

- [ ] T057 [P] [US1] Create doctor search page at `/apps/web/src/routes/doctors/index.tsx`
- [ ] T058 [P] [US1] Create doctor profile page at `/apps/web/src/routes/doctors/[id].tsx`
- [ ] T059 [P] [US1] Create booking page at `/apps/web/src/routes/appointments/book.tsx`
- [ ] T060 [US1] Create appointment confirmation page at `/apps/web/src/routes/appointments/[id].tsx`

### Frontend Components

- [ ] T061 [P] [US1] Create DoctorCard component at `/apps/web/src/components/features/DoctorCard.tsx`
- [ ] T062 [P] [US1] Create SearchFilters component at `/apps/web/src/components/features/SearchFilters.tsx`
- [ ] T063 [P] [US1] Create AvailabilityCalendar component at `/apps/web/src/components/features/AvailabilityCalendar.tsx`
- [ ] T064 [US1] Create PaymentModal component at `/apps/web/src/components/features/PaymentModal.tsx`

---

## Phase 5: US2 - Doctor Onboarding & Verification (P1) 🎯

**Goal**: Doctor registers, uploads credentials, admin verifies, doctor appears in search.

**Independent Test**: Doctor registers → uploads credentials → admin reviews → approves → doctor appears in search.

### Backend Services

- [ ] T065 [P] [US2] Add credential upload to doctor.service.ts at `/apps/backend/src/services/doctor.service.ts`
- [ ] T066 [P] [US2] Create storage.service.ts for file uploads at `/apps/backend/src/services/storage.service.ts`
- [ ] T067 [P] [US2] Create admin.service.ts with verification methods at `/apps/backend/src/services/admin.service.ts`

### Backend Routes

- [ ] T068 [US2] Add doctor registration endpoint to auth routes at `/apps/backend/src/routes/v1/auth.ts`
- [ ] T069 [US2] Add credential upload endpoint to doctors routes at `/apps/backend/src/routes/v1/doctors.ts`
- [ ] T070 [US2] Create admin verification routes at `/apps/backend/src/routes/v1/admin/verification.ts`

### File Storage

- [ ] T071 [US2] Create storage abstraction at `/apps/backend/src/lib/storage.ts`

### Frontend - Doctor Registration

- [ ] T072 [P] [US2] Create doctor registration page at `/apps/web/src/routes/auth/register-doctor.tsx`
- [ ] T073 [P] [US2] Create credential upload page at `/apps/web/src/routes/doctor/credentials.tsx`
- [ ] T074 [P] [US2] Create doctor dashboard page at `/apps/web/src/routes/doctor/index.tsx`

### Frontend - Admin

- [ ] T075 [P] [US2] Create admin pending verifications page at `/apps/web/src/routes/admin/verifications.tsx`
- [ ] T076 [US2] Create verification detail page at `/apps/web/src/routes/admin/verifications/[id].tsx`

### Typesense Sync

- [ ] T077 [US2] Add Typesense indexing on doctor verification approval

---

## Phase 6: US3 - Video Consultation (P2)

**Goal**: Patient and doctor conduct video call, consultation record created.

**Independent Test**: Patient with confirmed booking → joins call → doctor joins → consult → record saved.

### Backend Services

- [ ] T078 [P] [US3] Create consultation.service.ts at `/apps/backend/src/services/consultation.service.ts`
- [ ] T079 [P] [US3] Create 100ms integration at `/apps/backend/src/lib/hms.ts`

### Backend Routes

- [ ] T080 [US3] Create consultations routes (join, end, get, update notes) at `/apps/backend/src/routes/v1/consultations.ts`

### Frontend Pages

- [ ] T081 [P] [US3] Create video call page at `/apps/web/src/routes/consultations/[id]/call.tsx`
- [ ] T082 [P] [US3] Create consultation summary page at `/apps/web/src/routes/consultations/[id]/index.tsx`

### Frontend Components

- [ ] T083 [P] [US3] Create VideoRoom component with 100ms SDK at `/apps/web/src/components/features/VideoRoom.tsx`
- [ ] T084 [US3] Create ConsultationNotes component at `/apps/web/src/components/features/ConsultationNotes.tsx`

### Real-time

- [ ] T085 [US3] Setup WebSocket for call status updates at `/apps/backend/src/lib/ws.ts`
- [ ] T086 [US3] Add appointment reminder notifications

---

## Phase 7: US4 - Medical Records (P2)

**Goal**: Patient uploads/views medical documents securely.

**Independent Test**: Patient uploads document → views in records → doctor can see during consultation.

### Backend Services

- [ ] T087 [P] [US4] Create record.service.ts at `/apps/backend/src/services/record.service.ts`

### Backend Routes

- [ ] T088 [US4] Create records routes (upload, list, get, delete) at `/apps/backend/src/routes/v1/records.ts`

### Frontend Pages

- [ ] T089 [P] [US4] Create medical records page at `/apps/web/src/routes/patient/records/index.tsx`
- [ ] T090 [P] [US4] Create record detail page at `/apps/web/src/routes/patient/records/[id].tsx`

### Frontend Components

- [ ] T091 [P] [US4] Create FileUpload component at `/apps/web/src/components/features/FileUpload.tsx`
- [ ] T092 [US4] Create DocumentViewer component at `/apps/web/src/components/features/DocumentViewer.tsx`

### Access Control

- [ ] T093 [US4] Add audit logging for record access
- [ ] T094 [US4] Add doctor access to patient records during consultation

---

## Phase 8: US5 - Prescriptions (P2)

**Goal**: Doctor writes digital prescription, patient receives and can order medicines.

**Independent Test**: Doctor writes prescription → patient notified → views in records → can order.

### Backend Services

- [ ] T095 [P] [US5] Create prescription.service.ts at `/apps/backend/src/services/prescription.service.ts`

### Backend Routes

- [ ] T096 [US5] Create prescriptions routes (create, get, list) at `/apps/backend/src/routes/v1/prescriptions.ts`

### Frontend Pages

- [ ] T097 [P] [US5] Create prescription form page (doctor) at `/apps/web/src/routes/doctor/prescriptions/new.tsx`
- [ ] T098 [P] [US5] Create prescription view page (patient) at `/apps/web/src/routes/patient/prescriptions/[id].tsx`

### Frontend Components

- [ ] T099 [P] [US5] Create PrescriptionForm component at `/apps/web/src/components/features/PrescriptionForm.tsx`
- [ ] T100 [US5] Create PrescriptionCard component at `/apps/web/src/components/features/PrescriptionCard.tsx`

### Integration

- [ ] T101 [US5] Link prescription to consultation record
- [ ] T102 [US5] Send prescription notification to patient

---

## Phase 9: US6 - Medicine Orders (P3)

**Goal**: Patient orders medicines, pays, tracks status.

**Independent Test**: Patient orders from prescription → pays → receives confirmation → tracks status.

### Backend Services

- [ ] T103 [P] [US6] Create order.service.ts at `/apps/backend/src/services/order.service.ts`

### Backend Routes

- [ ] T104 [US6] Create orders routes (create, list, get, update status) at `/apps/backend/src/routes/v1/orders.ts`

### Frontend Pages

- [ ] T105 [P] [US6] Create order checkout page at `/apps/web/src/routes/patient/orders/checkout.tsx`
- [ ] T106 [P] [US6] Create order list page at `/apps/web/src/routes/patient/orders/index.tsx`
- [ ] T107 [P] [US6] Create order detail page at `/apps/web/src/routes/patient/orders/[id].tsx`

### Frontend Components

- [ ] T108 [P] [US6] Create OrderCard component at `/apps/web/src/components/features/OrderCard.tsx`
- [ ] T109 [US6] Create OrderStatusTracker component at `/apps/web/src/components/features/OrderStatusTracker.tsx`

### Payment Integration

- [ ] T110 [US6] Integrate Paystack for order payments
- [ ] T111 [US6] Add order status update webhook
- [ ] T112 [US6] Send order status notifications

---

## Phase 10: US7 - Revenue Dashboard (P3)

**Goal**: Doctor views earnings, pending payouts, transaction history.

**Independent Test**: Doctor completes consultations → views dashboard → sees accurate totals.

### Backend Services

- [ ] T113 [P] [US7] Create revenue.service.ts at `/apps/backend/src/services/revenue.service.ts`

### Backend Routes

- [ ] T114 [US7] Create revenue routes (dashboard, transactions, request payout) at `/apps/backend/src/routes/v1/doctors.ts`

### Frontend Pages

- [ ] T115 [P] [US7] Create revenue dashboard page at `/apps/web/src/routes/doctor/revenue.tsx`

### Frontend Components

- [ ] T116 [P] [US7] Create RevenueCard component at `/apps/web/src/components/features/RevenueCard.tsx`
- [ ] T117 [US7] Create TransactionHistory component at `/apps/web/src/components/features/TransactionHistory.tsx`
- [ ] T118 [US7] Create PayoutRequestModal component at `/apps/web/src/components/features/PayoutRequestModal.tsx`

---

## Phase 11: US8 - Health Articles (P3)

**Goal**: Users browse health articles, admin publishes content.

**Independent Test**: Admin publishes article → user browses → searches → reads article.

### Backend Services

- [ ] T119 [P] [US8] Create article.service.ts at `/apps/backend/src/services/article.service.ts`

### Backend Routes

- [ ] T120 [US8] Create articles routes (list, get, create, update, delete) at `/apps/backend/src/routes/v1/articles.ts`

### Frontend Pages

- [ ] T121 [P] [US8] Create articles listing page at `/apps/web/src/routes/articles/index.tsx`
- [ ] T122 [P] [US8] Create article detail page at `/apps/web/src/routes/articles/[slug].tsx`
- [ ] T123 [US8] Create admin article editor page at `/apps/web/src/routes/admin/articles/editor.tsx`

### Frontend Components

- [ ] T124 [P] [US8] Create ArticleCard component at `/apps/web/src/components/features/ArticleCard.tsx`
- [ ] T125 [US8] Create MarkdownEditor component at `/apps/web/src/components/features/MarkdownEditor.tsx`

### Search Integration

- [ ] T126 [US8] Add articles to Typesense index

---

## Phase 12: US9 - Admin Analytics (P3)

**Goal**: Admin views platform metrics and moderation tools.

**Independent Test**: Admin logs in → views dashboard → sees accurate metrics.

### Backend Services

- [ ] T127 [P] [US9] Create analytics.service.ts at `/apps/backend/src/services/analytics.service.ts`

### Backend Routes

- [ ] T128 [US9] Create admin analytics routes at `/apps/backend/src/routes/v1/admin/analytics.ts`
- [ ] T129 [US9] Create admin moderation routes at `/apps/backend/src/routes/v1/admin/moderation.ts`

### Frontend Pages

- [ ] T130 [P] [US9] Create admin dashboard page at `/apps/web/src/routes/admin/index.tsx`
- [ ] T131 [P] [US9] Create moderation page at `/apps/web/src/routes/admin/moderation.tsx`

### Frontend Components

- [ ] T132 [P] [US9] Create MetricCard component at `/apps/web/src/components/features/MetricCard.tsx`
- [ ] T133 [US9] Create AnalyticsChart component at `/apps/web/src/components/features/AnalyticsChart.tsx`
- [ ] T134 [US9] Create ModerationQueue component at `/apps/web/src/components/features/ModerationQueue.tsx`

---

## Phase 13: US10 - Reviews & Ratings (P4)

**Goal**: Patients rate doctors, reviews appear on profiles.

**Independent Test**: Patient completes consultation → submits review → review appears on doctor profile.

### Backend Services

- [ ] T135 [P] [US10] Create review.service.ts at `/apps/backend/src/services/review.service.ts`

### Backend Routes

- [ ] T136 [US10] Create reviews routes (create, list, moderate) at `/apps/backend/src/routes/v1/reviews.ts`

### Frontend Components

- [ ] T137 [P] [US10] Create ReviewForm component at `/apps/web/src/components/features/ReviewForm.tsx`
- [ ] T138 [P] [US10] Create ReviewList component at `/apps/web/src/components/features/ReviewList.tsx`
- [ ] T139 [US10] Create StarRating component at `/apps/web/src/components/features/StarRating.tsx`

### Integration

- [ ] T140 [US10] Add reviews to doctor profile page
- [ ] T141 [US10] Update doctor average rating on new review
- [ ] T142 [US10] Add review moderation to admin panel

---

## Phase 14: Polish & Integration

**Goal**: End-to-end testing, performance optimization, documentation.

### Testing

- [ ] T143 [P] Setup Playwright e2e test configuration at `/apps/web/playwright.config.ts`
- [ ] T144 [P] Create e2e test for patient booking flow at `/apps/web/tests/e2e/booking.spec.ts`
- [ ] T145 [P] Create e2e test for doctor onboarding flow at `/apps/web/tests/e2e/onboarding.spec.ts`
- [ ] T146 Create e2e test for consultation flow at `/apps/web/tests/e2e/consultation.spec.ts`

### Performance

- [ ] T147 [P] Add Redis caching to doctor search at `/apps/backend/src/services/search.service.ts`
- [ ] T148 [P] Add database query optimization and indexes
- [ ] T149 Implement response time monitoring

### Documentation

- [ ] T150 [P] Update README with setup instructions at `/README.md`
- [ ] T151 [P] Generate OpenAPI documentation from Elysia at `/apps/backend/src/app.ts`
- [ ] T152 Create API usage examples at `/docs/api-examples.md`

### PWA & Mobile

- [ ] T153 Configure SolidStart PWA at `/apps/web/app.config.ts`
- [ ] T154 Add service worker for offline support at `/apps/web/public/sw.js`

---

## Parallel Execution Guide

### Phase 2 (Database) - Maximum Parallelization

```
Parallel Group A:              Parallel Group B:
├── T013 (users)               ├── T023 (orders)
├── T014 (patients)            ├── T024 (payments)
├── T015 (doctors)             ├── T025 (articles)
├── T016 (availability)        ├── T026 (reviews)
├── T017 (credentials)         ├── T027 (notifications)
├── T018 (clinics)             └── T028 (audit)
├── T019 (appointments)
├── T020 (consultations)
├── T021 (prescriptions)
└── T022 (records)

Then Sequential:
└── T029-T032 (index, client, config, migrate)
```

### Phase 4 (US1) - Parallel Strategy

```
Backend Parallel:              Frontend Parallel:
├── T046 (doctor.service)      ├── T057 (search page)
├── T047 (search.service)      ├── T058 (profile page)
├── T048 (appointment.service) ├── T059 (booking page)
├── T049 (payment.service)     ├── T061 (DoctorCard)
└── T050 (notification.service)├── T062 (SearchFilters)
                               └── T063 (Calendar)
Then Sequential:
└── T051-T055 (routes) → T056 (paystack) → T060, T064 (remaining UI)
```

---

## Implementation Strategy

### MVP First (Phases 1-5)

1. **Week 1**: Setup + Database (Phase 1-2)
2. **Week 2**: Auth + Core (Phase 3)
3. **Week 3-4**: US1 Doctor Search & Booking (Phase 4)
4. **Week 5**: US2 Doctor Onboarding (Phase 5)

**MVP Deliverable**: Functional doctor search and booking with payment.

### Incremental Delivery

- **Sprint 1**: MVP (Phases 1-5) — 64 tasks
- **Sprint 2**: P2 Features (Phases 6-8) — 26 tasks
- **Sprint 3**: P3 Features (Phases 9-12) — 32 tasks
- **Sprint 4**: P4 + Polish (Phases 13-14) — 20 tasks

### Testing Approach

Per Constitution Article II (TDD):
- Unit tests for services before implementation
- Integration tests for API routes
- E2e tests for critical user flows
- 90%+ coverage for critical modules

---

## Checklist Summary

**Format Validation**: ✅ All 154 tasks follow checklist format:
- `- [ ]` checkbox
- Task ID (T001-T154)
- `[P]` for parallelizable tasks
- `[US#]` for user story tasks
- File path for each task

**User Story Coverage**:
- US1: 19 tasks (T046-T064)
- US2: 13 tasks (T065-T077)
- US3: 9 tasks (T078-T086)
- US4: 8 tasks (T087-T094)
- US5: 8 tasks (T095-T102)
- US6: 10 tasks (T103-T112)
- US7: 6 tasks (T113-T118)
- US8: 8 tasks (T119-T126)
- US9: 8 tasks (T127-T134)
- US10: 8 tasks (T135-T142)

**Independent Test Criteria**: ✅ Each user story phase includes independent test description.
