# Research & Technical Decisions: Precta Prototype

**Feature**: 001-precta-prototype  
**Date**: 2025-12-09  
**Status**: Complete

---

## Overview

This document captures all technical research and decisions made during the planning phase.
Each decision follows the format: Decision → Rationale → Alternatives Considered.

---

## 1. Monorepo Strategy

### Decision
Use **Bun workspaces** exclusively (no Yarn, pnpm, Turborepo, Nx).

### Rationale
- Native Bun support with glob patterns for workspaces
- Single `bun.lock` lockfile for deterministic installs
- `workspace:*` protocol for internal package linking
- 28x faster than npm, 12x faster than Yarn (per Bun docs)
- Sufficient for our scope (2 apps + 2 packages)
- Simpler setup with less configuration overhead

### Alternatives Considered
| Alternative | Why Rejected |
|-------------|--------------|
| Turborepo | Adds build orchestration complexity we don't need yet |
| Nx | Enterprise-grade, overkill for prototype |
| pnpm workspaces | Bun is already our runtime, prefer single tool |
| Lerna | Largely obsolete, unnecessary publish workflow |

### Sources
- [Bun Workspaces Docs](https://bun.com/docs/pm/workspaces)
- [Bun Workspace Guide](https://bun.com/docs/guides/install/workspaces)

---

## 2. Backend Framework

### Decision
Use **Elysia** as the backend framework.

### Rationale
- Bun-first design, takes advantage of Bun's speed
- End-to-end type safety via **Eden Treaty** (no codegen needed)
- TypeBox integration for runtime validation
- Native WebSocket support (Bun WS)
- OpenAPI/Swagger auto-generation via plugin
- Lightweight (~2KB for Eden client)

### Key Integration Pattern
```typescript
// Export App type for Eden Treaty
export const app = new Elysia()
  .use(swagger())
  .use(v1Routes)
export type App = typeof app

// Frontend usage
import { treaty } from '@elysiajs/eden'
import type { App } from 'backend/src/app'
const api = treaty<App>('http://localhost:3001')
```

### Alternatives Considered
| Alternative | Why Rejected |
|-------------|--------------|
| Hono | Good, but Elysia has better Bun optimization and Eden |
| Express | Node.js focused, not Bun-optimized |
| Fastify | Node.js ecosystem, not Bun-native |
| tRPC | Requires separate setup, Elysia has native alternative |

### Sources
- [ElysiaJS Quick Start](https://elysiajs.com/quick-start)
- [Eden Treaty Overview](https://elysiajs.com/eden/overview)

---

## 3. Database & ORM

### Decision
Use **PostgreSQL 16** with **Drizzle ORM** and **drizzle-typebox**.

### Rationale
- PostgreSQL: Robust, HIPAA-friendly, excellent for healthcare data
- Drizzle: TypeScript-first, lightweight, no runtime overhead
- drizzle-typebox: Converts Drizzle schema to TypeBox for Elysia validation
- Single source of truth: DB schema → API validation → OpenAPI → Frontend types

### Type Flow Pattern
```typescript
// packages/db/src/schema/users.ts
import { pgTable, varchar, timestamp } from 'drizzle-orm/pg-core'
export const user = pgTable('user', {
  id: varchar('id').primaryKey(),
  email: varchar('email').notNull().unique(),
  // ...
})

// apps/backend - Convert to Elysia validation
import { createInsertSchema } from 'drizzle-typebox'
import { user } from '@precta/db'
const createUserSchema = createInsertSchema(user)
```

### Important: TypeBox Version Pinning
Pin `@sinclair/typebox` in root `package.json` overrides to avoid version mismatch:
```json
{
  "overrides": {
    "@sinclair/typebox": "0.32.4"
  }
}
```

### Alternatives Considered
| Alternative | Why Rejected |
|-------------|--------------|
| Prisma | Heavier, requires codegen, not as TypeScript-native |
| TypeORM | Decorator-based, less type-safe |
| Kysely | Good but lacks schema-to-validation conversion |
| Raw SQL | No type safety, error-prone |

### Sources
- [Drizzle + PostgreSQL Setup](https://orm.drizzle.team/docs/get-started-postgresql)
- [Elysia + Drizzle Integration](https://elysiajs.com/integrations/drizzle)

---

## 4. Authentication

### Decision
Use **Better Auth** with Drizzle adapter.

### Rationale
- **Lucia Auth is deprecated** (sunset March 2025)
- Better Auth has official Elysia integration
- Drizzle adapter for database sessions
- Supports email/password + OAuth providers
- RBAC support for Patient/Doctor/Admin roles
- MFA support for admin roles (Constitution Art. III)

### Integration Pattern
```typescript
// apps/backend/src/lib/auth.ts
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '@precta/db'

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg' }),
  emailAndPassword: { enabled: true },
})

// Mount in Elysia
app.mount(auth.handler)
```

### Alternatives Considered
| Alternative | Why Rejected |
|-------------|--------------|
| Lucia Auth | Deprecated March 2025 |
| Auth.js/NextAuth | React-focused, not Elysia-native |
| Custom JWT | Reinventing the wheel, security risk |
| Clerk/Auth0 | External dependency, cost, vendor lock-in |

### Sources
- [Lucia Deprecation Notice](https://github.com/lucia-auth/lucia/discussions/1707)
- [Better Auth Installation](https://www.better-auth.com/docs/installation)
- [Better Auth + Elysia](https://www.better-auth.com/docs/integrations/elysia)

---

## 5. Caching

### Decision
Use **Bun's native Redis client** (no ioredis).

### Rationale
- Bun has built-in Redis support: `import { redis } from "bun"`
- Zero external dependencies
- Reads `REDIS_URL` from environment automatically
- Full Redis command support
- Promise-based API

### Usage Pattern
```typescript
import { redis, RedisClient } from 'bun'

// Default client (uses REDIS_URL env)
await redis.set('key', 'value')
const value = await redis.get('key')

// Custom client
const client = new RedisClient('redis://localhost:6379')
```

### Alternatives Considered
| Alternative | Why Rejected |
|-------------|--------------|
| ioredis | External dependency when Bun has native support |
| node-redis | Node.js focused, not Bun-native |
| Upstash | Good for serverless, unnecessary for our Docker setup |

### Sources
- [Bun Redis Docs](https://bun.com/docs/runtime/redis)

---

## 6. Search

### Decision
Use **Typesense** for full-text search.

### Rationale
- Open-source, self-hostable (Docker)
- Typo-tolerant search out of the box
- Fast (single-digit millisecond response times)
- Simple REST API with TypeScript client
- Good for doctor search with facets (specialty, location, rating)

### Indexing Strategy
- Index doctors when: created, verified, profile updated
- Index articles when: published, updated
- Sync on database changes via service layer

### Alternatives Considered
| Alternative | Why Rejected |
|-------------|--------------|
| PostgreSQL full-text | Good for simple cases, Typesense better for UX |
| Elasticsearch | Heavier, more complex to operate |
| Meilisearch | Similar to Typesense, slightly less mature |
| Algolia | Hosted/paid, vendor lock-in |

### Sources
- [Typesense Install Guide](https://typesense.org/docs/guide/install-typesense.html)
- [typesense-js Client](https://github.com/typesense/typesense-js)

---

## 7. Video Consultations

### Decision
Use **100ms SDK** for video calls.

### Rationale
- Designed for healthcare/telemedicine use cases
- Low-latency, works on mobile and low-bandwidth
- Recording support for consultation records
- Server-side room management API
- Reasonable pricing for prototype/MVP

### Integration Points
- Create room when appointment booked (video type)
- Generate tokens for patient and doctor at call time
- Store recording URL in consultation record after call ends

### Alternatives Considered
| Alternative | Why Rejected |
|-------------|--------------|
| Twilio Video | More expensive, more complex |
| Daily.co | Similar to 100ms, less healthcare focus |
| Jitsi | Open source but harder to integrate reliably |
| WebRTC direct | Complex, no recording, need to build everything |

---

## 8. Payments

### Decision
Use **Paystack** for payments.

### Rationale
- Strong presence in African markets (Kenya, Nigeria, etc.)
- M-Pesa integration (critical for Kenya per Constitution Art. IV)
- Card payments (Visa, Mastercard)
- Well-documented API
- Sandbox for testing

### Payment Flows
1. **Appointment booking**: Patient pays consultation fee
2. **Medicine orders**: Patient pays for medicines
3. **Doctor payouts**: B2C transfers to doctors (future)

### Alternatives Considered
| Alternative | Why Rejected |
|-------------|--------------|
| Stripe | Limited M-Pesa support |
| Flutterwave | Good alternative, Paystack more established in Kenya |
| Direct M-Pesa | Would need separate card processor |

---

## 9. Frontend Architecture

### Decision
Keep **SolidJS + SolidStart** (already scaffolded), add **Eden Treaty** for API calls.

### Rationale
- SolidStart already in repo with TailwindCSS + DaisyUI
- Fine-grained reactivity, no virtual DOM overhead
- File-based routing similar to Next.js
- PWA support for offline capability (Constitution Art. VIII)
- Eden Treaty provides type-safe API client without codegen

### Key Patterns
- Use SolidJS stores for client state
- Use Eden Treaty for server state (API calls)
- File-based routing under `src/routes/`
- Component library in `src/components/`

---

## 10. Multi-Tenancy

### Decision
Use **soft multi-tenancy** with `tenant_id` (clinic_id) columns.

### Rationale
- Simpler than database-per-tenant
- Sufficient for prototype data isolation
- Easy to query with middleware that adds tenant filter
- Can upgrade to stricter isolation later if needed

### Implementation
- Add `clinic_id` to relevant tables (doctors, appointments, etc.)
- Tenant middleware extracts clinic from session/token
- All queries filtered by tenant automatically
- Admin users can see across tenants

### Alternatives Considered
| Alternative | Why Rejected |
|-------------|--------------|
| Database per tenant | Overkill for prototype, complex provisioning |
| Schema per tenant | PostgreSQL complexity, migration challenges |
| No multi-tenancy | Needed per spec (clinic/hospital support) |

---

## Summary of Key Technical Choices

| Category | Choice | Key Benefit |
|----------|--------|-------------|
| Runtime | Bun | Speed, native TypeScript |
| Monorepo | Bun workspaces | Simplicity, single tool |
| Backend | Elysia | Bun-native, Eden Treaty e2e types |
| ORM | Drizzle + drizzle-typebox | DB→API type safety |
| Auth | Better Auth | Elysia + Drizzle adapters, not deprecated |
| Cache | Bun native Redis | Zero dependencies |
| Search | Typesense | Fast, typo-tolerant, self-hosted |
| Video | 100ms | Healthcare-focused, low-latency |
| Payments | Paystack | M-Pesa support for Kenya |
| Frontend | SolidJS + Eden | Fine-grained reactivity, type-safe API |
| Multi-tenant | Soft (tenant_id) | Simple, sufficient for prototype |

---

## Open Items

All items resolved. No NEEDS CLARIFICATION markers remain.
