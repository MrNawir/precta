<!--
╔══════════════════════════════════════════════════════════════════════════════╗
║                         SYNC IMPACT REPORT                                   ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Version Change: 0.0.0 (template) → 1.0.0                                     ║
║ Bump Rationale: MAJOR - Initial constitution ratification                    ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Added Principles (9 Articles):                                               ║
║   • Article I   - Type Safety & Data Validation                              ║
║   • Article II  - Test-Driven Development & Quality Assurance                ║
║   • Article III - Security, Privacy & Compliance                             ║
║   • Article IV  - Kenyan Market Focus & Inclusion                            ║
║   • Article V   - Clean Architecture & Separation of Concerns                ║
║   • Article VI  - API-First Design & Contract Discipline                     ║
║   • Article VII - Performance & Reliability                                  ║
║   • Article VIII- Accessibility, UX & Inclusion                              ║
║   • Article IX  - Discipline, Documentation & RTFM Culture                   ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Added Sections:                                                              ║
║   • Preamble                                                                 ║
║   • Appendix: Principles Summary                                             ║
║   • Governance (Amendment Log)                                               ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Templates Status:                                                            ║
║   ✅ .specify/templates/plan-template.md      - Compatible (Constitution     ║
║      Check section aligns with new principles)                               ║
║   ✅ .specify/templates/spec-template.md      - Compatible (user stories,    ║
║      requirements, success criteria align)                                   ║
║   ✅ .specify/templates/tasks-template.md     - Compatible (TDD phases,      ║
║      testing requirements align with Article II)                             ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Follow-up TODOs: None                                                        ║
╚══════════════════════════════════════════════════════════════════════════════╝
-->

# Precta Constitution

**Adopted:** 2025-12-09  
**Version:** 1.0.0

## Preamble

We — the developers of Precta — commit to building a healthcare platform for Kenya with
uncompromising standards: for safety, reliability, privacy, performance, accessibility,
maintainability, and inclusivity. These principles are immutable: they guide all design,
specification, planning, and implementation decisions. Major deviations MUST be documented,
justified, and versioned.

---

## Core Principles

### Article I — Type Safety & Data Validation

1. Use **TypeScript in strict mode** across all code (backend, frontend, shared code).
2. Enforce **runtime validation** of all external inputs and outputs (requests, DB results,
   external API responses), using robust schema libraries (e.g. Zod, TypeBox, or equivalent).
3. **Ban any use of `any`, unchecked casts, or implicit JSON → object assumptions.** All types
   MUST be explicit, well-defined, versioned, and shared where appropriate
   (frontend ↔ backend ↔ DB ↔ API).
4. Keep a **single source of truth for types/schemas** when models are shared across layers.
   Avoid duplication or drift of type definitions.

### Article II — Test-Driven Development & Quality Assurance

1. All business logic, utilities, and core functionality MUST be developed under **Test-Driven
   Development (TDD):** write unit tests *before* writing implementation.
2. Public API routes, integrations, and user-facing behaviors MUST have **automated integration
   tests** covering normal flows, error conditions, and edge cases.
3. Establish and enforce a **test coverage threshold** (90–95% for critical modules) before
   merging any feature into main.
4. Upon any change to schema, API contract, or data model — run **regression tests** to catch
   unintended effects.

### Article III — Security, Privacy & Compliance

1. Treat all patient and health data as **protected health information (PHI)**; adopt
   best-practice security and privacy architecture.
2. **Encrypt all sensitive data at rest** (e.g. use AES-256 or managed-DB encryption) and
   enforce **TLS/HTTPS** for all in-transit data.
3. Implement **role-based access control (RBAC)**, least-privilege principle, and secure
   authentication (MFA for admin/sensitive roles).
4. Maintain **tamper-proof audit logs** of all access and modifications to PHI — including
   who, when, what changed.
5. Enforce **data minimization**: collect only what is strictly necessary; support
   anonymization or pseudonymization for analytics or shared data.
6. Establish regular **security audits, vulnerability scanning, patching cycles**, and
   incident-response procedures.

### Article IV — Kenyan Market Focus & Inclusion

1. Provide **first-class integration with local payment infrastructure** (e.g. M-Pesa), with
   secure, reliable payment flows (C2B, B2C, STK-push, callbacks, etc.).
2. Support **localization/internationalization (i18n)** — at minimum English + Swahili — for
   UI, error messages, notifications, and communications.
3. Optimize for **low-bandwidth and intermittent connectivity**: minimize payload sizes;
   support offline-capable features; design for unreliable networks.
4. Design with **accessibility for low-end hardware and non-tech-savvy users** in mind:
   responsive, lightweight UI/UX; minimal dependencies; efficient data usage.

### Article V — Clean Architecture & Separation of Concerns

1. Adopt a **layered architecture**: presentation (UI/API) → application/business logic →
   data persistence → external integrations. **Business logic MUST NOT live inside HTTP
   routes/controllers.**
2. Use **dependency injection (DI)** (or equivalent) to decouple modules, enable mocking for
   tests, and support swapping implementations (e.g. payment provider, DB, cache).
3. Isolate **side-effects** (I/O, DB writes, external calls, logging) to dedicated
   modules/services; keep core domain and business logic as pure functions when possible.
4. Maintain clear boundaries between layers and modules; document responsibilities and
   dependencies to avoid creeping coupling or "spaghetti" layering.

### Article VI — API-First Design & Contract Discipline

1. Define all APIs first via **specifications (e.g. OpenAPI or equivalent)** before
   implementing endpoints. Use spec as ground truth.
2. Maintain **versioned endpoints** (e.g. `/api/v1/...`, `/api/v2/...`) with a clear
   deprecation and migration path for clients.
3. Standardize **error responses and error handling**: all errors MUST follow a consistent,
   documented structure (e.g. `{ code, message, details?, traceId? }`).
4. Document authentication/authorization flows, data models, validation rules, expected
   behaviors, rate limits, and error codes. Documentation MUST stay in sync with implementation.

### Article VII — Performance & Reliability ("Performance Obsession")

1. Define and uphold **response time budgets** (e.g. typical API responses ≤ 200–300 ms);
   monitor and enforce via profiling and instrumentation.
2. Optimize database interactions: avoid N+1 problems; use prepared statements or ORM
   optimizations; ensure proper indexing; batch or cache where appropriate.
3. Implement a **caching & load-handling strategy** (e.g. caching layer, CDN for static
   assets, rate limiting, load balancing) to ensure scalability and responsiveness under load.
4. Build for **resilience, redundancy, and reliability**: regular backups, disaster-recovery
   plans, failover mechanisms, monitoring, alerting — aim for high availability.

### Article VIII — Accessibility, UX & Inclusion for All Users

1. Design UI/UX as **mobile-first and lightweight**, optimized for low-end devices and
   constrained network conditions.
2. Follow **web accessibility standards** (e.g. WCAG): ensure readable fonts, color contrast,
   support for screen readers, keyboard navigation, etc.
3. Provide **offline-capable or Progressive Web App (PWA)** features where feasible: local
   caching, offline work with sync-on-connect, smooth behavior under intermittent connectivity.
4. Localize UI/UX culturally and linguistically: use appropriate language, date/time formats,
   flows intuitive for Kenyan context and non-technical users.

### Article IX — Discipline, Documentation & "RTFM" Culture

1. Treat documentation — official specs, data models, architecture diagrams, security policies,
   style guides — as first-class artifacts. They MUST be maintained, versioned, and kept
   up-to-date.
2. Enforce **code reviews, architecture reviews, and security reviews** for major changes.
   No significant change SHOULD bypass review.
3. Prioritize learning and understanding: **read official documentation**, standards,
   compliance guides, external API docs before implementing. No shortcuts or "winging it."
4. When deviations from the constitution are unavoidable (e.g. due to external constraints),
   document the **justification, scope, risk assessment, and mitigation plan**.
5. Maintain an **amendment log** for the constitution: record what changed, when, why, and
   who approved. Use semantic versioning for constitutional changes.

---

## Appendix: Principles Summary

| Icon | Principle | Core Mandate |
|------|-----------|--------------|
| 🧪 | Type Safety & Validation | No runtime surprises |
| ✅ | TDD & Testing Discipline | Tests before code; full coverage for critical paths |
| 🔐 | Security & Privacy by Default | Treat PHI with utmost care |
| 🌍 | Kenyan-First Design | Inclusive, local, efficient, payment-ready |
| 🏗️ | Clean Architecture | Clear separation, DI, modularity |
| 📄 | API-First & Contract-Driven | Spec-first, versioned, consistent |
| ⚡ | Performance, Reliability & Scalability | Fast, resilient, production-grade |
| ♿ | Accessibility & UX for Everyone | Mobile-first, offline-capable, inclusive |
| 📚 | Documentation & Discipline | RTFM, reviews, explicit deviations only |

---

## Governance

1. This constitution **supersedes all other practices**. When in conflict, the constitution wins.
2. **Amendment Procedure**:
   - Proposed changes MUST be documented with rationale
   - Changes require review and explicit approval
   - All amendments MUST include a migration plan for affected code/processes
3. **Versioning Policy**:
   - MAJOR: Backward-incompatible governance/principle removals or redefinitions
   - MINOR: New principle/section added or materially expanded guidance
   - PATCH: Clarifications, wording, typo fixes, non-semantic refinements
4. **Compliance Review**: All PRs/reviews MUST verify compliance with these principles.
   Complexity MUST be justified against Article V (Clean Architecture).
5. **Runtime Guidance**: Use project README and documentation for day-to-day development guidance.

### Amendment Log

| Version | Date | Change Summary | Approved By |
|---------|------|----------------|-------------|
| 1.0.0 | 2025-12-09 | Initial ratification | Ibrahim |

---

**Version**: 1.0.0 | **Ratified**: 2025-12-09 | **Last Amended**: 2025-12-09

*May this constitution guide Precta's development now and always.*
