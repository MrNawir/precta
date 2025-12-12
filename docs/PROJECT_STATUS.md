# Precta Project Status & LLM Context Guide

> **Last Updated**: December 2024  
> **Version**: 1.0.0 (Prototype)  
> **Status**: ~98% Complete

This document provides comprehensive context for AI assistants/LLMs working on the Precta codebase. It covers architecture, implementation status, patterns, and guidance for future development.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack Deep Dive](#tech-stack-deep-dive)
3. [Project Structure](#project-structure)
4. [Implementation Status](#implementation-status)
5. [What's Implemented](#whats-implemented)
6. [What's NOT Implemented](#whats-not-implemented)
7. [Key Patterns & Conventions](#key-patterns--conventions)
8. [Database Schema](#database-schema)
9. [API Architecture](#api-architecture)
10. [Frontend Architecture](#frontend-architecture)
11. [Authentication Flow](#authentication-flow)
12. [Payment Integration](#payment-integration)
13. [Known Issues & Tech Debt](#known-issues--tech-debt)
14. [Future Roadmap](#future-roadmap)
15. [Development Guidelines](#development-guidelines)
16. [Testing Strategy](#testing-strategy)
17. [Deployment](#deployment)

---

## 🏥 Project Overview

### What is Precta?

**Precta** is a telemedicine platform for Kenya (similar to Practo in India). It connects patients with doctors for:

- **In-person appointments** at clinics
- **Video consultations** from anywhere
- **M-Pesa payments** (Kenya's dominant mobile money)
- **Digital prescriptions** and medical records
- **Health articles** and wellness content

### Target Market

- **Primary**: Kenya (Nairobi, Mombasa, Kisumu, etc.)
- **Languages**: English (primary), Swahili (planned)
- **Payment Focus**: M-Pesa via Paystack gateway
- **Connectivity**: Optimized for low-bandwidth connections

### User Roles

1. **Patients** - Book appointments, attend consultations, view records
2. **Doctors** - Manage profile, availability, conduct consultations, prescribe
3. **Admins** - Moderate content, view analytics, manage platform

---

## 🛠 Tech Stack Deep Dive

### Runtime & Backend

| Component | Technology | Version | Notes |
|-----------|-----------|---------|-------|
| **Runtime** | Bun | 1.0+ | Fast JS runtime, replaces Node.js |
| **API Framework** | Elysia | 1.0+ | TypeScript-first, OpenAPI built-in |
| **Database** | PostgreSQL | 14+ | Primary data store |
| **ORM** | Drizzle | Latest | Type-safe, SQL-like queries |
| **Auth** | Better Auth | Latest | Session-based, social logins |
| **Search** | Typesense | 0.25+ | Fast full-text search (planned) |
| **Cache** | Redis | 7+ | Caching layer (planned) |

### Frontend

| Component | Technology | Version | Notes |
|-----------|-----------|---------|-------|
| **Framework** | SolidJS | 1.8+ | Reactive, fine-grained updates |
| **Meta-framework** | SolidStart | 1.0+ | SSR, file-based routing |
| **Styling** | TailwindCSS | 4.0+ | Utility-first CSS |
| **Components** | DaisyUI | 4.0+ | Tailwind component library |
| **State** | SolidJS signals | Built-in | Reactive primitives |

### Integrations

| Service | Provider | Purpose | Status |
|---------|----------|---------|--------|
| **Payments** | Paystack | M-Pesa, Cards | Scaffolded |
| **Video** | 100ms | Video consultations | Scaffolded |
| **Search** | Typesense | Doctor search | Planned |
| **Email** | (TBD) | Notifications | Planned |
| **SMS** | Africa's Talking | OTP, reminders | Planned |

### Why These Choices?

- **Bun**: 3-4x faster than Node.js, native TypeScript
- **Elysia**: End-to-end type safety with Eden Treaty
- **SolidJS**: Better performance than React, simpler mental model
- **Drizzle**: Type-safe without codegen (unlike Prisma)
- **Paystack**: Best M-Pesa integration for developers
- **DaisyUI**: Beautiful components without custom CSS

---

## 📁 Project Structure

```
precta/
├── apps/
│   ├── backend/                    # Elysia API server
│   │   ├── src/
│   │   │   ├── routes/             # API endpoints
│   │   │   │   ├── v1/             # Versioned API
│   │   │   │   │   ├── admin/      # Admin endpoints
│   │   │   │   │   ├── articles.ts
│   │   │   │   │   ├── reviews.ts
│   │   │   │   │   └── ...
│   │   │   │   ├── auth.ts
│   │   │   │   ├── doctors.ts
│   │   │   │   └── appointments.ts
│   │   │   ├── services/           # Business logic
│   │   │   │   ├── doctor.service.ts
│   │   │   │   ├── appointment.service.ts
│   │   │   │   ├── payment.service.ts
│   │   │   │   ├── analytics.service.ts
│   │   │   │   └── ...
│   │   │   ├── lib/                # Utilities
│   │   │   │   ├── db.ts           # Database connection
│   │   │   │   └── auth.ts         # Auth utilities
│   │   │   └── app.ts              # Main Elysia app
│   │   └── package.json
│   │
│   └── web/                        # SolidStart frontend
│       ├── src/
│       │   ├── routes/             # File-based routing
│       │   │   ├── index.tsx       # Homepage
│       │   │   ├── auth.tsx        # Auth page
│       │   │   ├── doctors/        # Doctor pages
│       │   │   │   ├── index.tsx   # Search page
│       │   │   │   └── [id].tsx    # Profile page
│       │   │   ├── consultations/  # Consultation pages
│       │   │   ├── articles/       # Article pages
│       │   │   ├── admin/          # Admin pages
│       │   │   └── doctor/         # Doctor dashboard
│       │   ├── components/
│       │   │   ├── features/       # Feature components
│       │   │   │   ├── DoctorCard.tsx
│       │   │   │   ├── ReviewList.tsx
│       │   │   │   ├── StarRating.tsx
│       │   │   │   └── ...
│       │   │   └── ui/             # UI primitives
│       │   └── lib/                # Frontend utilities
│       ├── public/
│       │   └── sw.js               # Service worker
│       ├── tests/
│       │   └── e2e/                # Playwright tests
│       ├── app.config.ts           # SolidStart config
│       └── package.json
│
├── packages/
│   ├── db/                         # Drizzle schema
│   │   ├── src/
│   │   │   ├── schema/             # Table definitions
│   │   │   │   ├── users.ts
│   │   │   │   ├── doctors.ts
│   │   │   │   ├── appointments.ts
│   │   │   │   └── ...
│   │   │   ├── index.ts            # Schema exports
│   │   │   └── migrate.ts          # Migration runner
│   │   ├── drizzle/                # Generated migrations
│   │   └── drizzle.config.ts
│   │
│   └── shared/                     # Shared types
│       └── src/
│           └── types.ts
│
├── specs/                          # Feature specifications
│   └── 001-precta-prototype/
│       ├── spec.md                 # Feature spec
│       ├── plan.md                 # Implementation plan
│       ├── tasks.md                # Task breakdown
│       └── data-model.md           # Entity definitions
│
├── docs/
│   ├── api-examples.md             # API usage examples
│   └── PROJECT_STATUS.md           # This file
│
├── .windsurf/workflows/            # AI workflows (speckit)
├── README.md
└── package.json                    # Monorepo root
```

---

## ✅ Implementation Status

### Task Completion

| Phase | Description | Tasks | Status |
|-------|-------------|-------|--------|
| Phase 1 | Project Setup | 12 | ✅ Complete |
| Phase 2 | Database Schema | 20 | ✅ Complete |
| Phase 3 | Auth System | 13 | ✅ Complete |
| Phase 4 | Doctor Search (US1) | 19 | ✅ Complete |
| Phase 5 | Doctor Onboarding (US2) | 13 | ✅ Complete |
| Phase 6 | Video Consultations (US3) | 9 | ✅ Complete |
| Phase 7 | Medical Records (US4) | 8 | ✅ Complete |
| Phase 8 | Prescriptions (US5) | 8 | ✅ Complete |
| Phase 9 | Medicine Orders (US6) | 10 | ✅ Complete |
| Phase 10 | Revenue Dashboard (US7) | 6 | ✅ Complete |
| Phase 11 | Health Articles (US8) | 8 | ✅ Complete |
| Phase 12 | Admin Analytics (US9) | 8 | ✅ Complete |
| Phase 13 | Reviews & Ratings (US10) | 8 | ✅ Complete |
| Phase 14 | Polish & Testing | 12 | 🟡 9/12 Done |

**Total: ~151/154 tasks (~98%)**

### Remaining Tasks

1. **T147**: Redis caching for doctor search
2. **T148**: Database query optimization/indexes
3. **T149**: Response time monitoring

These are performance optimization tasks that can be deferred to production readiness phase.

---

## ✨ What's Implemented

### Backend Services

| Service | File | Features |
|---------|------|----------|
| `doctor.service.ts` | `/apps/backend/src/services/` | Search, profiles, availability |
| `appointment.service.ts` | - | Booking, status management |
| `consultation.service.ts` | - | Video session management |
| `payment.service.ts` | - | Paystack integration scaffold |
| `prescription.service.ts` | - | Create, list, verify prescriptions |
| `record.service.ts` | - | Medical records CRUD |
| `revenue.service.ts` | - | Doctor earnings, payouts |
| `article.service.ts` | - | Health articles CMS |
| `analytics.service.ts` | - | Platform metrics |
| `review.service.ts` | - | Ratings, moderation |

### API Routes

| Route | Methods | Description |
|-------|---------|-------------|
| `/api/v1/doctors` | GET | Search doctors |
| `/api/v1/doctors/:id` | GET | Doctor profile |
| `/api/v1/doctors/:id/availability` | GET | Availability |
| `/api/v1/appointments` | GET, POST | Appointments |
| `/api/v1/consultations` | GET, POST | Video calls |
| `/api/v1/payments` | POST | Payment initiation |
| `/api/v1/prescriptions` | GET, POST | Prescriptions |
| `/api/v1/records` | GET, POST | Medical records |
| `/api/v1/reviews` | GET, POST | Doctor reviews |
| `/api/v1/articles` | GET, POST | Health articles |
| `/api/v1/admin/analytics` | GET | Platform stats |
| `/api/v1/admin/moderation` | GET, POST | Content moderation |

### Frontend Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Homepage | Landing page with CTA |
| `/auth` | Auth | Login/register |
| `/doctors` | DoctorSearch | Search with filters |
| `/doctors/[id]` | DoctorProfile | Profile + booking + reviews |
| `/consultations` | ConsultationList | User consultations |
| `/consultations/[id]/call` | VideoCall | Video call UI |
| `/consult` | ConsultWaitingRoom | Pre-call check |
| `/records` | MedicalRecords | Patient records |
| `/prescriptions` | Prescriptions | Prescription list |
| `/articles` | ArticleList | Health articles |
| `/articles/[slug]` | ArticleDetail | Article reader |
| `/doctor/onboarding` | DoctorOnboarding | Doctor signup |
| `/doctor/dashboard` | DoctorDashboard | Doctor home |
| `/doctor/revenue` | RevenueDashboard | Earnings |
| `/admin` | AdminDashboard | Admin home |
| `/admin/moderation` | ModerationPage | Content review |
| `/admin/articles/editor` | ArticleEditor | CMS editor |

### Reusable Components

```
/apps/web/src/components/features/
├── DoctorCard.tsx          # Doctor search result card
├── SearchFilters.tsx       # Specialty/location filters
├── AvailabilityCalendar.tsx # Booking calendar
├── AppointmentCard.tsx     # Appointment display
├── VideoControls.tsx       # Call mute/camera controls
├── PrescriptionCard.tsx    # Prescription display
├── MedicalRecordCard.tsx   # Record display
├── ArticleCard.tsx         # Article preview card
├── MarkdownEditor.tsx      # Rich text editor
├── ReviewForm.tsx          # Submit review
├── ReviewList.tsx          # Display reviews
├── StarRating.tsx          # 5-star rating input
├── MetricCard.tsx          # Analytics card
├── AnalyticsChart.tsx      # Line/bar/donut charts
├── ModerationQueue.tsx     # Admin review queue
├── TransactionHistory.tsx  # Payment history
├── PayoutRequestModal.tsx  # Doctor payout
└── EarningsSummary.tsx     # Revenue stats
```

---

## ❌ What's NOT Implemented

### Critical for Production

| Feature | Status | Notes |
|---------|--------|-------|
| **Real Paystack Integration** | Scaffolded | Needs API keys, webhook handlers |
| **100ms Video Integration** | Scaffolded | Needs API keys, room management |
| **Typesense Search** | Planned | Currently using basic SQL queries |
| **Redis Caching** | Planned | T147 remaining |
| **Email Notifications** | Planned | No provider selected |
| **SMS/OTP** | Planned | Africa's Talking recommended |
| **File Upload** | Planned | Need S3/Cloudflare R2 setup |
| **Rate Limiting** | Planned | Elysia has plugins for this |
| **Audit Logging** | Schema exists | Service not implemented |
| **Multi-language** | Planned | Swahili translation needed |

### Nice to Have

- **Push Notifications** (service worker ready)
- **Real-time Chat** (WebSocket scaffold exists)
- **Clinic Management** (schema exists)
- **Medicine Ordering** (partial implementation)
- **Insurance Integration**
- **Lab Results Integration**

### Security Gaps

- [ ] RBAC middleware needs refinement
- [ ] API rate limiting not implemented
- [ ] Input sanitization review needed
- [ ] CSRF protection for forms
- [ ] PHI encryption at rest (HIPAA-like compliance)

---

## 🎨 Key Patterns & Conventions

### Backend Patterns

```typescript
// Service pattern - business logic in services, not routes
// File: /apps/backend/src/services/doctor.service.ts

export const doctorService = {
  async search(filters: SearchFilters) {
    // Business logic here
    return db.query.doctors.findMany({
      where: and(...conditions),
      with: { availability: true },
    });
  },

  async getById(id: string) {
    return db.query.doctors.findFirst({
      where: eq(doctors.id, id),
    });
  },
};
```

```typescript
// Route pattern - thin routes, delegate to services
// File: /apps/backend/src/routes/v1/doctors.ts

const doctorRoutes = new Elysia({ prefix: '/doctors' })
  .get('/', async ({ query }) => {
    const result = await doctorService.search(query);
    return { success: true, data: result };
  }, {
    query: t.Object({
      specialty: t.Optional(t.String()),
      // ... validation
    }),
  });
```

### Frontend Patterns

```typescript
// Component pattern - SolidJS with TypeScript
// File: /apps/web/src/components/features/DoctorCard.tsx

interface DoctorCardProps {
  doctor: Doctor;
  onBook?: () => void;
}

export default function DoctorCard(props: DoctorCardProps) {
  return (
    <div class="card bg-base-100 shadow-lg">
      {/* Content */}
    </div>
  );
}
```

```typescript
// Data fetching pattern - createResource
export default function DoctorPage() {
  const params = useParams();
  
  const [doctor] = createResource(
    () => params.id,
    async (id) => {
      const res = await fetch(`${API_URL}/api/v1/doctors/${id}`);
      return res.json();
    }
  );

  return (
    <Show when={doctor()} fallback={<Loading />}>
      {/* Content */}
    </Show>
  );
}
```

### Naming Conventions

- **Files**: `kebab-case.ts` for utilities, `PascalCase.tsx` for components
- **Components**: PascalCase (`DoctorCard`, `ReviewList`)
- **Services**: camelCase with `.service.ts` suffix
- **Routes**: kebab-case folders, `index.tsx` or `[param].tsx`
- **Types**: PascalCase interfaces, `type` for unions
- **API responses**: `{ success: boolean, data?: T, error?: string }`

### UI Conventions

- **Use DaisyUI classes**: `btn`, `card`, `badge`, `alert`, etc.
- **Responsive**: Mobile-first with `sm:`, `md:`, `lg:` breakpoints
- **Loading states**: `loading loading-spinner` DaisyUI component
- **Empty states**: Friendly message + CTA button
- **Error handling**: `alert alert-error` with retry option

---

## 🗄 Database Schema

### Core Entities

```
users
├── id (CUID)
├── email (unique)
├── name
├── role (patient|doctor|admin)
├── emailVerified
└── timestamps

patients (extends users)
├── id (CUID)
├── userId (FK → users)
├── dateOfBirth
├── gender
├── bloodType
├── allergies (JSON)
├── county
└── phone

doctors (extends users)
├── id (CUID)
├── userId (FK → users)
├── firstName, lastName
├── specialties (array)
├── languages (array)
├── qualifications (JSON)
├── licenseNumber
├── consultationFee
├── consultationModes (array)
├── averageRating
├── totalReviews
├── verificationStatus
└── timestamps

availability
├── doctorId (FK)
├── dayOfWeek (0-6)
├── startTime, endTime
├── consultationMode
└── isActive

appointments
├── id (CUID)
├── patientId, doctorId (FK)
├── scheduledAt
├── consultationMode
├── status (scheduled|confirmed|completed|cancelled)
├── reason
├── paymentStatus
└── timestamps

consultations
├── id (CUID)
├── appointmentId (FK)
├── startedAt, endedAt
├── duration
├── roomId (100ms)
├── status
└── notes

prescriptions
├── id (CUID)
├── consultationId (FK)
├── patientId, doctorId (FK)
├── medications (JSON array)
├── diagnosis
├── notes
├── validUntil
└── status

medical_records
├── id (CUID)
├── patientId (FK)
├── consultationId (FK, optional)
├── type (lab|imaging|prescription|note)
├── title, description
├── fileUrl
├── metadata (JSON)
└── timestamps

reviews
├── id (CUID)
├── appointmentId (FK)
├── doctorId, patientId (FK)
├── rating (1-5)
├── title, content
├── isAnonymous
├── status (pending|approved|rejected)
└── timestamps

payments
├── id (CUID)
├── appointmentId (FK)
├── amount, currency
├── paymentMethod
├── provider (paystack)
├── providerReference
├── status
└── timestamps

articles
├── id (CUID)
├── title, slug (unique)
├── excerpt, content
├── coverImage
├── category
├── tags (array)
├── authorId (FK)
├── status (draft|published)
├── viewCount
└── timestamps
```

### Relations Diagram

```
users ──┬── patients ──┬── appointments ──── consultations
        │              │         │                 │
        │              │         ├── payments      ├── prescriptions
        │              │         │                 │
        │              │         └── reviews       └── medical_records
        │              │
        └── doctors ───┴── availability
                       │
                       └── articles (admin)
```

---

## 🔌 API Architecture

### Request Flow

```
Client Request
     │
     ▼
┌─────────────┐
│   Elysia    │ ← CORS, Rate Limiting (planned)
│   Router    │
└─────────────┘
     │
     ▼
┌─────────────┐
│  Validation │ ← TypeBox schemas (t.Object)
│  (TypeBox)  │
└─────────────┘
     │
     ▼
┌─────────────┐
│   Route     │ ← Thin controller layer
│   Handler   │
└─────────────┘
     │
     ▼
┌─────────────┐
│   Service   │ ← Business logic
│   Layer     │
└─────────────┘
     │
     ▼
┌─────────────┐
│   Drizzle   │ ← Type-safe queries
│   ORM       │
└─────────────┘
     │
     ▼
┌─────────────┐
│ PostgreSQL  │
└─────────────┘
```

### Response Format

```typescript
// Success
{
  "success": true,
  "data": { ... },
  "pagination": { "page": 1, "limit": 10, "total": 100 }  // for lists
}

// Error
{
  "success": false,
  "error": "Human readable message",
  "code": "ERROR_CODE"  // optional
}
```

### Authentication

- **Method**: Session-based with cookies
- **Library**: Better Auth
- **Session Storage**: Database (sessions table)
- **Token**: HTTP-only secure cookie

```typescript
// Checking auth in routes
const authRoutes = new Elysia()
  .derive(async ({ cookie }) => {
    const session = await validateSession(cookie.session);
    return { user: session?.user };
  })
  .guard({ beforeHandle: ({ user }) => !user && error(401) })
  .get('/protected', ({ user }) => user);
```

---

## 🖥 Frontend Architecture

### Routing

SolidStart uses file-based routing:

```
/routes/
├── index.tsx           → /
├── auth.tsx            → /auth
├── doctors/
│   ├── index.tsx       → /doctors
│   └── [id].tsx        → /doctors/:id
└── (protected)/
    └── dashboard.tsx   → /dashboard (with layout)
```

### State Management

```typescript
// Local state - createSignal
const [count, setCount] = createSignal(0);

// Derived state - createMemo
const doubled = createMemo(() => count() * 2);

// Async data - createResource
const [data] = createResource(fetchData);

// Global state - context (for complex apps)
const ThemeContext = createContext<ThemeStore>();
```

### Data Fetching

```typescript
// Server-side (route data)
export function routeData() {
  return createServerData$(async () => {
    return await db.query.doctors.findMany();
  });
}

// Client-side (createResource)
const [doctors] = createResource(async () => {
  const res = await fetch(`${API_URL}/api/v1/doctors`);
  return res.json();
});
```

---

## 🔐 Authentication Flow

### Login Flow

```
1. User submits email/password
2. POST /api/v1/auth/login
3. Better Auth validates credentials
4. Session created in database
5. Session cookie set (HTTP-only)
6. Redirect to dashboard

Cookie: session=<encrypted_session_id>; HttpOnly; Secure; SameSite=Lax
```

### Protected Routes

```typescript
// Frontend - check auth status
const [user] = createResource(async () => {
  const res = await fetch(`${API_URL}/api/v1/auth/me`, { credentials: 'include' });
  if (!res.ok) return null;
  return res.json();
});

// Redirect if not authenticated
createEffect(() => {
  if (user() === null) navigate('/auth');
});
```

### Social Login (Planned)

- Google OAuth
- Apple Sign-In
- Phone number (OTP)

---

## 💳 Payment Integration

### Paystack Flow

```
1. Patient selects appointment
2. Frontend calls POST /api/v1/payments/initiate
3. Backend creates Paystack transaction
4. Returns authorization_url
5. Patient redirected to Paystack
6. Patient pays (card or M-Pesa)
7. Paystack redirects to callback URL
8. Backend webhook receives payment confirmation
9. Appointment status updated to 'confirmed'
```

### M-Pesa via Paystack

```typescript
// Initiate M-Pesa payment
const response = await paystack.transaction.initialize({
  email: patient.email,
  amount: 250000,  // 2500 KES in kobo
  currency: 'KES',
  channels: ['mobile_money'],  // Forces M-Pesa
  mobile_money: {
    phone: patient.phone,
    provider: 'mpesa',
  },
});
```

### Webhook Handling

```typescript
// POST /api/v1/payments/webhook
app.post('/webhook', async ({ body, headers }) => {
  // Verify Paystack signature
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET)
    .update(JSON.stringify(body))
    .digest('hex');
  
  if (hash !== headers['x-paystack-signature']) {
    return error(401);
  }

  // Handle event
  if (body.event === 'charge.success') {
    await updatePaymentStatus(body.data.reference, 'completed');
  }
});
```

---

## ⚠️ Known Issues & Tech Debt

### TypeScript Errors

```typescript
// 1. Schema field mismatches in services
// File: /apps/backend/src/services/*.ts
// Issue: Some fields don't match Drizzle schema
// Fix: Align service types with actual schema

// 2. Tailwind v4 class warnings
// File: Various .tsx files
// Issue: bg-gradient-to-t → bg-linear-to-t
// Fix: Update to Tailwind v4 class names
```

### Missing Implementations

1. **Auth middleware** - RBAC checks are TODO comments
2. **File uploads** - No S3/storage integration
3. **Search** - Basic SQL, not Typesense
4. **Caching** - No Redis integration
5. **Rate limiting** - Not implemented

### Performance Considerations

- [ ] Add database indexes for common queries
- [ ] Implement query result caching
- [ ] Add response compression
- [ ] Optimize image loading (lazy load, WebP)
- [ ] Bundle size analysis

---

## 🚀 Future Roadmap

### Phase 1: Production Ready (Next)

1. Integrate real Paystack with test keys
2. Set up 100ms video SDK
3. Add Typesense search
4. Implement Redis caching
5. Add proper error tracking (Sentry)
6. Set up CI/CD pipeline

### Phase 2: Launch Features

1. Email notifications (transactional)
2. SMS/OTP verification
3. Push notifications
4. Doctor payout automation
5. Admin reporting dashboard

### Phase 3: Growth Features

1. Multi-language (Swahili)
2. Mobile app (Capacitor or React Native)
3. Clinic management
4. Lab integration
5. Insurance integration
6. AI symptom checker

### Phase 4: Scale

1. Multi-region deployment
2. Advanced analytics
3. ML-based doctor recommendations
4. Telemedicine for rural areas
5. Corporate health packages

---

## 📝 Development Guidelines

### Setting Up Development

```bash
# 1. Clone repository
git clone <repo-url>
cd precta

# 2. Install dependencies
bun install

# 3. Set up environment
cp apps/backend/.env.example apps/backend/.env
cp apps/web/.env.example apps/web/.env

# 4. Set up database
cd packages/db
bun run generate
bun run migrate

# 5. Start development servers
# Terminal 1
cd apps/backend && bun run dev

# Terminal 2
cd apps/web && bun run dev
```

### Adding a New Feature

1. **Define schema** in `/packages/db/src/schema/`
2. **Run migration** `bun run generate && bun run migrate`
3. **Create service** in `/apps/backend/src/services/`
4. **Create routes** in `/apps/backend/src/routes/v1/`
5. **Create frontend** pages and components
6. **Write tests** in `/apps/web/tests/e2e/`

### Code Review Checklist

- [ ] TypeScript strict mode passes
- [ ] No `any` types
- [ ] API validates all inputs
- [ ] Errors are handled gracefully
- [ ] Loading and empty states exist
- [ ] Mobile responsive
- [ ] Accessible (keyboard, screen readers)

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
// Service tests
describe('doctorService', () => {
  it('should search doctors by specialty', async () => {
    const results = await doctorService.search({ specialty: 'cardiology' });
    expect(results).toBeDefined();
  });
});
```

### E2E Tests (Playwright)

```bash
cd apps/web
bun run test:e2e
```

Test files:
- `booking.spec.ts` - Patient booking flow
- `onboarding.spec.ts` - Doctor registration
- `consultation.spec.ts` - Video call flow

### Test Coverage Goals

- **Critical paths**: 90%+ coverage
- **Services**: 80%+ coverage
- **Components**: 70%+ coverage

---

## 🌐 Deployment

### Environment Variables

```bash
# Backend
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
PAYSTACK_SECRET_KEY=...
CORS_ORIGIN=https://precta.co.ke

# Frontend
VITE_API_URL=https://api.precta.co.ke
```

### Recommended Stack

- **Backend**: Fly.io or Railway
- **Database**: Neon or Supabase (PostgreSQL)
- **Frontend**: Vercel or Netlify
- **Redis**: Upstash
- **Search**: Typesense Cloud

### Docker (Optional)

```dockerfile
# Backend
FROM oven/bun:1
WORKDIR /app
COPY . .
RUN bun install
CMD ["bun", "run", "start"]
```

---

## 📚 Resources

### Documentation Links

- [Elysia Docs](https://elysiajs.com)
- [SolidJS Docs](https://www.solidjs.com/docs)
- [SolidStart Docs](https://start.solidjs.com)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [Better Auth Docs](https://www.better-auth.com)
- [DaisyUI Components](https://daisyui.com/components)
- [Paystack API](https://paystack.com/docs/api)
- [100ms Video SDK](https://www.100ms.live/docs)

### Key Files to Read

1. `/specs/001-precta-prototype/spec.md` - Feature specification
2. `/specs/001-precta-prototype/plan.md` - Technical plan
3. `/specs/001-precta-prototype/data-model.md` - Entity definitions
4. `/docs/api-examples.md` - API usage examples
5. `/README.md` - Quick start guide

---

## 🤖 LLM Context Tips

When working with this codebase:

1. **Check the schema first** - `/packages/db/src/schema/` defines all data types
2. **Services contain business logic** - Routes are thin
3. **Use DaisyUI classes** - Don't write custom CSS
4. **SolidJS ≠ React** - No `useState`, use `createSignal`
5. **Bun, not Node** - Use `bun` commands
6. **TypeScript strict** - No `any` types allowed
7. **API response format** - `{ success, data, error }`
8. **File routing** - `/routes/doctors/[id].tsx` → `/doctors/:id`

### Common Tasks

```bash
# Add new database table
# 1. Edit /packages/db/src/schema/
# 2. cd packages/db && bun run generate
# 3. bun run migrate

# Add new API endpoint
# 1. Create service in /apps/backend/src/services/
# 2. Create route in /apps/backend/src/routes/v1/

# Add new page
# 1. Create file in /apps/web/src/routes/
# 2. Export default function component

# Run tests
cd apps/web && bun run test:e2e
```

---

*This document should be updated as the project evolves. Last comprehensive update: December 2024.*
