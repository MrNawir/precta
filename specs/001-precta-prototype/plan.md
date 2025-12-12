# Implementation Plan: Precta Healthcare Platform Prototype

**Branch**: `001-precta-prototype` | **Date**: 2025-12-09 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-precta-prototype/spec.md`

---

## Summary

Build a comprehensive Kenya-focused healthcare platform enabling patients to search/book doctors,
conduct video consultations, manage medical records, and order medicines. Doctors manage profiles,
availability, prescriptions, and revenue. Admins verify doctors, moderate content, and view analytics.

**Technical Approach**: Bun workspaces monorepo with shared packages for end-to-end type safety.
Docker Compose for local development services (PostgreSQL, Redis, Typesense).

---

## Technical Context

| Aspect | Value |
|--------|-------|
| **Runtime** | Bun 1.1+ |
| **Language** | TypeScript 5.x (strict mode) |
| **Backend Framework** | Elysia 1.x |
| **Frontend Framework** | SolidJS 1.9+ with SolidStart |
| **Database** | PostgreSQL 16 (via Docker) |
| **ORM** | Drizzle ORM with drizzle-typebox |
| **Auth** | Better Auth with Drizzle adapter |
| **Cache** | Redis 7 (Bun native client) |
| **Search** | Typesense 27.x |
| **Real-time** | Elysia WebSocket (Bun native WS) |
| **Video** | 100ms SDK |
| **Payments** | Paystack (M-Pesa, card) |
| **Styling** | TailwindCSS 4.x + DaisyUI 5.x |
| **API Client** | Eden Treaty (@elysiajs/eden) |
| **Testing** | Bun test (unit), Playwright (e2e) |
| **Container** | Docker Compose for services |
| **Project Type** | Web application (monorepo) |

### Performance Goals

- API response time: ≤300ms p95 (per Constitution Article VII)
- Search latency: ≤500ms for typical queries
- Video connect time: ≤5 seconds
- Mobile-first, works on 3G connections

### Constraints

- Offline-capable PWA features for low connectivity
- M-Pesa payment support mandatory
- HIPAA-adjacent security for PHI
- Multi-tenant data isolation

---

## Constitution Check

*GATE: Verified against Precta Constitution v1.0.0 — All checks PASSED ✅*

| Article | Requirement | Implementation Approach | Status |
|---------|-------------|------------------------|--------|
| **I** - Type Safety | TypeScript strict, no `any`, runtime validation | TS strict mode, Drizzle-TypeBox for DB→API types, Elysia validation | ✅ |
| **II** - TDD | Tests before implementation, 90%+ coverage | Bun test for unit, Playwright for e2e, CI coverage gates | ✅ |
| **III** - Security | PHI protection, encryption, RBAC, audit logs | Better Auth RBAC, PostgreSQL encryption, audit_logs table | ✅ |
| **IV** - Kenya Focus | M-Pesa, i18n, low-bandwidth | Paystack integration, i18n scaffolding, PWA, optimized payloads | ✅ |
| **V** - Clean Architecture | Layered, DI, no business logic in routes | Service layer pattern, Elysia plugin DI, pure domain functions | ✅ |
| **VI** - API-First | OpenAPI spec, versioned endpoints | Elysia Swagger plugin auto-gen, `/api/v1/` prefix | ✅ |
| **VII** - Performance | ≤300ms response, caching, indexing | Redis caching, Drizzle query optimization, DB indexes | ✅ |
| **VIII** - Accessibility | Mobile-first, WCAG, PWA | SolidStart PWA, TailwindCSS responsive, DaisyUI a11y components | ✅ |
| **IX** - Documentation | RTFM, reviews, up-to-date docs | JSDoc, OpenAPI auto-gen, spec-driven development process | ✅ |

---

## Project Structure

### Monorepo Layout (Bun Workspaces)

```text
precta/                              # Repository root
├── package.json                     # workspaces: ["apps/*", "packages/*"]
├── bun.lock                         # Single lockfile
├── tsconfig.json                    # Base TypeScript config
├── docker-compose.yml               # PostgreSQL, Redis, Typesense
├── .env.example                     # Environment template
│
├── apps/
│   ├── backend/                     # Elysia API server
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts             # Entry point
│   │       ├── app.ts               # Elysia app + export type App
│   │       ├── routes/
│   │       │   ├── v1/              # Versioned API routes
│   │       │   │   ├── index.ts
│   │       │   │   ├── auth.ts
│   │       │   │   ├── doctors.ts
│   │       │   │   ├── appointments.ts
│   │       │   │   ├── consultations.ts
│   │       │   │   ├── records.ts
│   │       │   │   ├── orders.ts
│   │       │   │   ├── articles.ts
│   │       │   │   ├── reviews.ts
│   │       │   │   └── admin/
│   │       │   │       ├── verification.ts
│   │       │   │       ├── analytics.ts
│   │       │   │       └── moderation.ts
│   │       ├── services/            # Business logic (NO routes here)
│   │       │   ├── auth.service.ts
│   │       │   ├── doctor.service.ts
│   │       │   ├── appointment.service.ts
│   │       │   ├── consultation.service.ts
│   │       │   ├── record.service.ts
│   │       │   ├── order.service.ts
│   │       │   ├── payment.service.ts
│   │       │   ├── search.service.ts
│   │       │   └── notification.service.ts
│   │       ├── lib/                 # Clients, utilities
│   │       │   ├── auth.ts          # Better Auth instance
│   │       │   ├── db.ts            # Drizzle client
│   │       │   ├── redis.ts         # Bun Redis
│   │       │   ├── typesense.ts     # Search client
│   │       │   ├── paystack.ts      # Payment client
│   │       │   ├── storage.ts       # File storage
│   │       │   └── hms.ts           # 100ms video
│   │       └── middleware/
│   │           ├── auth.ts
│   │           ├── tenant.ts
│   │           └── audit.ts
│   │
│   └── web/                         # SolidStart frontend (existing)
│       ├── package.json
│       └── src/
│           ├── routes/              # File-based routing
│           ├── components/          # UI components
│           ├── lib/
│           │   └── api.ts           # Eden Treaty client
│           └── stores/              # SolidJS stores
│
├── packages/
│   ├── db/                          # Drizzle schema + migrations
│   │   ├── package.json
│   │   ├── drizzle.config.ts
│   │   └── src/
│   │       ├── index.ts             # Export all
│   │       ├── client.ts            # Drizzle client factory
│   │       ├── schema/              # Table definitions
│   │       │   ├── index.ts
│   │       │   ├── users.ts
│   │       │   ├── doctors.ts
│   │       │   ├── patients.ts
│   │       │   ├── clinics.ts
│   │       │   ├── appointments.ts
│   │       │   ├── consultations.ts
│   │       │   ├── prescriptions.ts
│   │       │   ├── records.ts
│   │       │   ├── orders.ts
│   │       │   ├── payments.ts
│   │       │   ├── articles.ts
│   │       │   ├── reviews.ts
│   │       │   ├── notifications.ts
│   │       │   └── audit.ts
│   │       └── migrations/
│   │
│   └── shared/                      # Shared types, constants
│       ├── package.json
│       └── src/
│           ├── index.ts
│           ├── types/               # Domain types
│           ├── schemas/             # drizzle-typebox exports
│           ├── constants/           # Enums, roles, status
│           └── utils/               # Shared utilities
│
└── specs/                           # Feature specifications
    └── 001-precta-prototype/
        ├── spec.md
        ├── plan.md                  # This file
        ├── research.md
        ├── data-model.md
        ├── quickstart.md
        └── contracts/
            └── openapi.yaml
```

### Documentation (this feature)

```text
specs/001-precta-prototype/
├── spec.md              # Feature specification ✅
├── plan.md              # This implementation plan ✅
├── research.md          # Technical decisions ✅
├── data-model.md        # Database schema ✅
├── quickstart.md        # Developer setup guide ✅
├── contracts/           # API contracts
│   └── openapi.yaml     # OpenAPI 3.1 spec ✅
└── checklists/
    └── requirements.md  # Quality checklist ✅
```

---

## Type Safety Flow

```text
┌─────────────────┐   drizzle-typebox   ┌─────────────────┐   OpenAPI    ┌──────────────┐
│ Drizzle Schema  │ ──────────────────► │ Elysia TypeBox  │ ───────────► │ Documentation│
│ (packages/db)   │                     │ Validation      │              └──────────────┘
└─────────────────┘                     └────────┬────────┘
                                                 │
                                        Eden     │
                                        Treaty   ▼
                                        ┌─────────────────┐
                                        │ Frontend Types  │
                                        │ (apps/web)      │
                                        └─────────────────┘
```

**Key Pattern**: Export `App` type from backend for Eden Treaty:
```typescript
// apps/backend/src/app.ts
export const app = new Elysia()
  .use(v1Routes)
  // ...
export type App = typeof app
```

---

## Implementation Milestones

| Phase | ID | Milestone | Deliverable | Priority |
|-------|-----|-----------|-------------|----------|
| **Foundation** | M0 | Monorepo Setup | Root package.json, workspaces, base tsconfig | 🔴 Critical |
| | M1 | Package Scaffolding | apps/backend, apps/web restructure, packages/db, packages/shared | 🔴 Critical |
| | M2 | Docker Services | PostgreSQL, Redis, Typesense running | 🔴 Critical |
| | M3 | Database Schema | All Drizzle tables, migrations, indexes | 🔴 Critical |
| | M4 | Auth Foundation | Better Auth, RBAC, session management | 🔴 Critical |
| **P1 MVP** | M5 | Doctor Search | Search API, Typesense indexing, search UI | 🎯 P1 |
| | M6 | Doctor Profiles | Profile CRUD, verification status | 🎯 P1 |
| | M7 | Appointment Booking | Availability, slots, booking flow, payments | 🎯 P1 |
| | M8 | Doctor Onboarding | Registration, credential upload, admin verification | 🎯 P1 |
| **P2 Features** | M9 | Video Consultation | 100ms integration, consultation records | P2 |
| | M10 | Medical Records | File upload, document storage, access control | P2 |
| | M11 | Prescriptions | Prescription writing, patient notification | P2 |
| **P3 Features** | M12 | Medicine Orders | Order flow, Paystack payment, status tracking | P3 |
| | M13 | Revenue Dashboard | Doctor earnings, payout tracking | P3 |
| | M14 | Health Articles | CMS, article management, search | P3 |
| | M15 | Admin Analytics | Dashboard metrics, moderation tools | P3 |
| **P4 & Polish** | M16 | Reviews & Ratings | Review submission, display, moderation | P4 |
| | M17 | Testing & Polish | E2E tests, performance optimization, docs | Final |

---

## Workspace Dependencies

```text
apps/backend
├── @precta/db          (workspace:*)
└── @precta/shared      (workspace:*)

apps/web
├── @precta/shared      (workspace:*)
└── type-only: apps/backend (for Eden Treaty App type)

packages/db
├── drizzle-orm
├── drizzle-typebox
└── postgres

packages/shared
└── (minimal dependencies)
```

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://precta:precta_dev_password@localhost:5432/precta

# Redis
REDIS_URL=redis://localhost:6379

# Auth
BETTER_AUTH_SECRET=generate-32-char-secret-minimum
BETTER_AUTH_URL=http://localhost:3001

# Typesense
TYPESENSE_HOST=localhost
TYPESENSE_PORT=8108
TYPESENSE_API_KEY=precta_dev_api_key

# Paystack (sandbox)
PAYSTACK_SECRET_KEY=sk_test_xxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxx

# 100ms Video
HMS_ACCESS_KEY=your_access_key
HMS_SECRET=your_secret

# URLs
VITE_API_URL=http://localhost:3001
VITE_APP_URL=http://localhost:3000

# Storage
STORAGE_PATH=./uploads
MAX_FILE_SIZE_MB=10
```

---

## Complexity Tracking

> No Constitution violations. Architecture follows all 9 principles.

| Decision | Rationale | Alternative Considered |
|----------|-----------|------------------------|
| Bun workspaces only | Simpler than Turborepo/Nx, native Bun support, sufficient for scope | Turborepo adds unneeded complexity |
| Eden Treaty | Native Elysia integration, no codegen, type inference | tRPC requires separate setup |
| drizzle-typebox | Single source of truth DB→API, reduces type drift | Manual TypeBox schemas duplicate effort |
| Better Auth | Lucia deprecated Mar 2025, Better Auth has Elysia+Drizzle adapters | Lucia would require migration soon |
| Soft multi-tenancy | tenant_id column approach for prototype, simpler | DB-per-tenant overkill for prototype |

---

## Next Steps

1. **Run `/speckit.tasks`** to generate detailed task breakdown
2. **Initialize monorepo** following quickstart.md
3. **Start Docker services**: `docker compose up -d`
4. **Implement foundation** (M0-M4)
5. **Build P1 MVP** (M5-M8)

---

## Generated Artifacts

| File | Status | Description |
|------|--------|-------------|
| `spec.md` | ✅ Created | Feature specification |
| `plan.md` | ✅ Created | This implementation plan |
| `research.md` | ✅ Created | Technical decisions |
| `data-model.md` | ✅ Created | Database schema |
| `quickstart.md` | ✅ Created | Developer setup guide |
| `contracts/openapi.yaml` | ✅ Created | API specification |
| `checklists/requirements.md` | ✅ Created | Quality checklist |
