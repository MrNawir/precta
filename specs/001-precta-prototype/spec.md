# Feature Specification: Precta Healthcare Platform Prototype

**Feature Branch**: `001-precta-prototype`  
**Created**: 2025-12-09  
**Status**: Draft  
**Input**: Build Precta Prototype — comprehensive Kenya-focused healthcare platform for patients, doctors & admin

## Feature Summary

Precta aims to deliver a unified healthcare platform tailored for Kenya: patients can search and book
doctors, manage medical records, order medicines, consume wellness content, and consult online;
doctors manage their profile, schedule, write prescriptions, and monitor earnings; administrators
oversee platform health, verify doctors, moderate content, and reconcile payments.

The prototype will implement core workflows for patient, doctor and admin features, plus essential
technical foundations (multi-tenant support, payments, storage, notifications).

## Goals & Why

- Provide accessible, reliable healthcare services for Kenyan users — both patients and clinicians
- Enable real-time booking and online consultation to reduce friction for remote/underserved users
- Offer a unified record of medical history (prescriptions, labs, consultations) for continuity of care
- Support local Kenyan payment methods (M-Pesa/Paystack) to ensure seamless payments
- Lay down a scalable, secure, multi-tenant architecture so clinics, hospitals or individual
  practitioners can join Precta without compromising data segregation or privacy

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Doctor Search & Booking (Priority: P1) 🎯 MVP

A patient searches for doctors by specialty, location, ratings, and availability, then books an
available appointment slot. This is the core value proposition — connecting patients with doctors.

**Why this priority**: This is the foundational patient journey. Without search and booking, there is
no platform. Every other feature builds on this capability.

**Independent Test**: Can be fully tested by a patient creating an account, searching for a doctor,
viewing profile, selecting an available slot, and receiving a booking confirmation.

**Acceptance Scenarios**:

1. **Given** a patient is logged in, **When** they search for "General Practitioner" in "Nairobi",
   **Then** they see a list of matching doctors with ratings, availability indicators, and consultation types
2. **Given** a patient views a doctor profile, **When** they click "Book Appointment",
   **Then** they see a calendar with available slots (in-person and/or video)
3. **Given** a patient selects a slot and confirms, **When** payment succeeds,
   **Then** they receive a confirmation notification and the slot is marked unavailable
4. **Given** a slot is booked, **When** another patient tries to book the same slot,
   **Then** the system prevents double-booking and shows "Slot unavailable"

---

### User Story 2 - Doctor Onboarding & Verification (Priority: P1) 🎯 MVP

A doctor registers on the platform, submits credentials for verification, and once approved by admin,
becomes discoverable to patients in search results.

**Why this priority**: Without verified doctors on the platform, patients have no one to book.
This is a supply-side dependency for P1 Story 1.

**Independent Test**: Can be tested by a doctor completing registration, uploading credentials,
admin reviewing and approving, and verifying the doctor appears in search results.

**Acceptance Scenarios**:

1. **Given** a doctor visits the registration page, **When** they complete profile info and submit credentials,
   **Then** their account is created with status "Pending Verification"
2. **Given** an admin views pending verifications, **When** they review and approve a doctor,
   **Then** the doctor's status changes to "Verified" and they appear in patient searches
3. **Given** an admin rejects a doctor, **When** rejection is submitted with reason,
   **Then** the doctor receives notification with rejection reason and can resubmit
4. **Given** a doctor is not yet verified, **When** patients search,
   **Then** the unverified doctor does NOT appear in search results

---

### User Story 3 - Video Consultation (Priority: P2)

A patient and doctor conduct a video consultation for a booked appointment. After the session,
a consultation record is created with notes and timestamp.

**Why this priority**: Video consultations are a key differentiator for remote healthcare access
but depend on booking (P1) being functional first.

**Independent Test**: Can be tested by a patient with a confirmed booking joining a video call,
doctor joining, conducting consultation, and verifying the consultation record is saved.

**Acceptance Scenarios**:

1. **Given** a patient has a confirmed video appointment, **When** the appointment time arrives,
   **Then** they see a "Join Call" button that connects to the video session
2. **Given** both patient and doctor join the call, **When** they interact,
   **Then** video/audio streams work with acceptable quality
3. **Given** the consultation ends, **When** doctor clicks "End Consultation",
   **Then** a consultation record is created with timestamp, duration, and doctor can add notes
4. **Given** connectivity is poor, **When** video quality degrades,
   **Then** system gracefully handles reconnection or notifies users

---

### User Story 4 - Medical Records Management (Priority: P2)

A patient uploads, stores, and retrieves their medical documents (prescriptions, lab results).
Documents are securely stored and only accessible to the patient (and doctors they authorize).

**Why this priority**: Centralizing health records provides continuity of care and is essential
for informed consultations, but the platform can function without it initially.

**Independent Test**: Can be tested by a patient uploading a document, viewing it in their records,
and verifying only they (and authorized doctors) can access it.

**Acceptance Scenarios**:

1. **Given** a patient is logged in, **When** they navigate to "My Records" and upload a PDF/image,
   **Then** the document is stored and appears in their records list
2. **Given** a patient has uploaded records, **When** they view record details,
   **Then** they can see document preview, upload date, and document type
3. **Given** a doctor is in consultation with a patient, **When** they view patient history,
   **Then** they can see documents the patient has shared/uploaded
4. **Given** a user tries to access another patient's records, **When** access is attempted,
   **Then** the system denies access and logs the attempt

---

### User Story 5 - Prescription Writing & Delivery (Priority: P2)

A doctor writes a digital prescription for a patient after consultation. The prescription is linked
to the patient's record and can optionally trigger a medicine order.

**Why this priority**: Digital prescriptions enhance the consultation value and enable the medicine
ordering flow, but depend on consultations being functional.

**Independent Test**: Can be tested by a doctor completing a consultation, writing a prescription,
patient receiving it, and verifying it appears in patient's records.

**Acceptance Scenarios**:

1. **Given** a doctor has completed a consultation, **When** they click "Write Prescription",
   **Then** they see a form to add medications, dosages, instructions
2. **Given** a prescription is submitted, **When** saved,
   **Then** it's linked to the patient and consultation record, and patient is notified
3. **Given** a patient views a prescription, **When** they click "Order Medicines",
   **Then** medicines are added to cart for ordering (linking to medicine ordering flow)

---

### User Story 6 - Medicine Ordering & Payment (Priority: P3)

A patient orders medicines (from prescription or manually), pays via Paystack (M-Pesa/card),
and tracks order status.

**Why this priority**: Medicine ordering adds significant value but is a separate commerce flow
that can be added after core consultation features work.

**Independent Test**: Can be tested by a patient adding medicines to cart, completing payment,
and seeing order status update through stages.

**Acceptance Scenarios**:

1. **Given** a patient has a prescription, **When** they click "Order Medicines",
   **Then** they see medicines pre-filled with option to add more
2. **Given** a patient confirms order, **When** they proceed to payment,
   **Then** Paystack payment modal appears with M-Pesa and card options
3. **Given** payment succeeds, **When** confirmation is received,
   **Then** order status shows "Placed" and patient receives confirmation notification
4. **Given** an order is placed, **When** patient checks order status,
   **Then** they see current status (Placed → Processing → Dispatched → Delivered)

---

### User Story 7 - Doctor Revenue Dashboard (Priority: P3)

A doctor views their earnings, pending payouts, and payout history. They can request payouts
of accumulated earnings.

**Why this priority**: Revenue tracking is important for doctor retention but the platform
functions without it initially.

**Independent Test**: Can be tested by a doctor viewing dashboard after completing paid
consultations, seeing accurate totals, and verifying payout history.

**Acceptance Scenarios**:

1. **Given** a doctor has completed consultations, **When** they view revenue dashboard,
   **Then** they see total earnings, pending amount, and paid amount
2. **Given** earnings are available, **When** doctor views transaction history,
   **Then** they see list of consultations with amounts and dates
3. **Given** doctor has pending balance above threshold, **When** they request payout,
   **Then** payout is initiated and shows in pending payouts

---

### User Story 8 - Health Articles & Content (Priority: P3)

Patients browse health and wellness articles for education. Admin/content managers publish
and manage articles with categories and search.

**Why this priority**: Content adds engagement and SEO value but is not critical for the
core healthcare transaction flows.

**Independent Test**: Can be tested by viewing article listings, reading an article,
searching for health topics, and admin publishing new content.

**Acceptance Scenarios**:

1. **Given** a user visits the platform, **When** they navigate to "Health Articles",
   **Then** they see categorized article listings (Wellness, Prevention, etc.)
2. **Given** a user searches "diabetes prevention", **When** results load,
   **Then** relevant articles appear ranked by relevance
3. **Given** an admin publishes an article, **When** saved and published,
   **Then** article appears in listings and is searchable

---

### User Story 9 - Admin Analytics Dashboard (Priority: P3)

An admin views platform metrics: user counts, appointment volumes, revenue, growth trends.
This enables data-driven platform management.

**Why this priority**: Analytics are important for business decisions but the platform
operates without them initially.

**Independent Test**: Can be tested by admin viewing dashboard and verifying metrics
match actual platform data.

**Acceptance Scenarios**:

1. **Given** an admin logs in, **When** they view analytics dashboard,
   **Then** they see key metrics: total patients, doctors, appointments, revenue
2. **Given** bookings have occurred, **When** viewing booking metrics,
   **Then** they see trends over time (daily/weekly/monthly)
3. **Given** payments processed, **When** viewing financial metrics,
   **Then** they see revenue totals matching actual transactions

---

### User Story 10 - Reviews & Ratings (Priority: P4)

Patients rate and review doctors after consultations. Reviews are visible on doctor profiles
and influence search rankings.

**Why this priority**: Social proof enhances trust but the platform functions without it.

**Independent Test**: Can be tested by patient submitting a review after consultation
and verifying it appears on doctor profile.

**Acceptance Scenarios**:

1. **Given** a consultation is completed, **When** patient visits doctor profile,
   **Then** they can submit a rating (1-5 stars) and written review
2. **Given** reviews exist, **When** viewing doctor profile,
   **Then** average rating and recent reviews are displayed
3. **Given** an inappropriate review, **When** admin moderates,
   **Then** review can be hidden or removed

---

### Edge Cases

- **Concurrent booking**: Two patients try to book the same slot simultaneously — system MUST prevent
  double-booking via optimistic locking or slot reservation
- **Payment failure**: Payment fails after slot selected — slot MUST be released, patient notified
- **Video call disconnection**: User loses connection mid-call — system MUST attempt reconnection,
  preserve partial consultation record
- **Large file upload**: Patient uploads very large document — system MUST validate size limits,
  provide progress feedback, handle timeout gracefully
- **Doctor unavailability**: Doctor marks emergency unavailable — booked patients MUST be notified,
  offered rebooking or refund
- **Multi-tenant data leak**: Request for Patient A's data from Clinic B — system MUST enforce
  tenant isolation, deny cross-tenant access

---

## Requirements *(mandatory)*

### Functional Requirements

#### Authentication & User Management

- **FR-001**: System MUST support user registration with email/phone and password
- **FR-002**: System MUST support role-based accounts: Patient, Doctor, Admin
- **FR-003**: System MUST enforce email/phone verification before account activation
- **FR-004**: System MUST support password reset via email/SMS
- **FR-005**: System MUST support session management with secure token-based auth

#### Doctor Search & Discovery

- **FR-010**: System MUST provide search for doctors with filters: specialty, location, rating, availability
- **FR-011**: System MUST display doctor profiles with: credentials, specialties, languages, consultation modes,
  ratings, reviews, availability calendar
- **FR-012**: System MUST support full-text search across doctor names, specialties, locations
- **FR-013**: System MUST only show verified doctors in search results

#### Appointment Booking

- **FR-020**: System MUST display real-time available appointment slots
- **FR-021**: System MUST support booking with: date/time, consultation type (in-person/video), clinic selection
- **FR-022**: System MUST prevent double-booking of slots
- **FR-023**: System MUST send booking confirmation via notification (email/SMS/push)
- **FR-024**: System MUST support appointment cancellation with configurable refund policy
- **FR-025**: System MUST send appointment reminders before scheduled time

#### Video Consultations

- **FR-030**: System MUST provide secure video calling for booked video appointments
- **FR-031**: System MUST support both patient and doctor joining calls
- **FR-032**: System MUST create consultation record after call ends with timestamp and duration
- **FR-033**: System MUST allow doctor to add consultation notes post-call
- **FR-034**: System MUST handle connectivity issues gracefully (reconnection attempts)

#### Medical Records

- **FR-040**: System MUST allow patients to upload documents (PDF, images) to their record
- **FR-041**: System MUST store documents securely with encryption at rest
- **FR-042**: System MUST enforce access control — only patient and authorized doctors can view
- **FR-043**: System MUST categorize documents: prescriptions, lab results, imaging, consultation notes
- **FR-044**: System MUST maintain audit log of document access

#### Prescriptions

- **FR-050**: System MUST allow doctors to write digital prescriptions linked to consultations
- **FR-051**: System MUST include: medication name, dosage, frequency, duration, instructions
- **FR-052**: System MUST notify patient when prescription is issued
- **FR-053**: System MUST allow prescription to trigger medicine order flow

#### Medicine Ordering

- **FR-060**: System MUST allow patients to order medicines from prescriptions or manually
- **FR-061**: System MUST integrate payment via Paystack (M-Pesa STK-push, card payments)
- **FR-062**: System MUST track order status: Placed → Processing → Dispatched → Delivered
- **FR-063**: System MUST send order status update notifications
- **FR-064**: For prototype: delivery tracking will be simulated (status updates without real courier integration)

#### Content & Articles

- **FR-070**: System MUST support publishing health articles with categories
- **FR-071**: System MUST support full-text search across articles
- **FR-072**: System MUST allow admin to moderate/edit/remove articles

#### Reviews & Ratings

- **FR-080**: System MUST allow patients to rate doctors (1-5 stars) after consultation
- **FR-081**: System MUST allow written review submission
- **FR-082**: System MUST display average rating and reviews on doctor profile
- **FR-083**: System MUST allow admin to moderate inappropriate reviews

#### Doctor Management

- **FR-090**: System MUST allow doctors to create/edit profiles: bio, credentials, specialties, languages
- **FR-091**: System MUST allow doctors to manage availability: working hours, time-off, slot durations
- **FR-092**: System MUST allow doctors to set consultation modes: in-person, video, both
- **FR-093**: System MUST show doctors their upcoming appointments
- **FR-094**: System MUST provide revenue dashboard: earnings, pending payouts, payout history

#### Admin Functions

- **FR-100**: System MUST provide admin workflow to review and verify doctor credentials
- **FR-101**: System MUST allow admin to approve/reject doctor applications with reason
- **FR-102**: System MUST provide analytics dashboard: user counts, appointments, revenue, trends
- **FR-103**: System MUST allow admin to moderate content: articles, reviews, doctor profiles
- **FR-104**: System MUST provide payment reconciliation view

#### Multi-Tenancy

- **FR-110**: System MUST support multiple clinics/hospitals as tenants
- **FR-111**: System MUST associate doctors and patients with clinics
- **FR-112**: System MUST enforce data segregation between tenants
- **FR-113**: For prototype: soft-isolation via tenant identifier is acceptable

#### Notifications

- **FR-120**: System MUST support real-time notifications for: bookings, reminders, order updates, prescriptions
- **FR-121**: System MUST support multiple channels: push, SMS, email (based on user preference)
- **FR-122**: System MUST allow users to configure notification preferences

### Non-Functional Requirements

- **NFR-001**: Payment integration MUST support M-Pesa and card via Paystack — secure, reliable
- **NFR-002**: File storage MUST be encrypted at rest with access control per user/tenant
- **NFR-003**: Video calls MUST work on mobile and low-bandwidth connections (graceful degradation)
- **NFR-004**: Multi-tenancy MUST ensure no cross-tenant data leaks
- **NFR-005**: Search MUST return results within 500ms for typical queries
- **NFR-006**: Platform MUST be mobile-first, responsive, accessible
- **NFR-007**: Platform MUST be optimized for low-bandwidth and intermittent connectivity
- **NFR-008**: API responses MUST complete within 300ms for typical operations (per Constitution Art. VII)

### Key Entities

- **User**: Base entity for all users — id, email, phone, password_hash, role, status, created_at
- **Patient**: Extends User — date_of_birth, gender, medical_history_summary, preferred_language
- **Doctor**: Extends User — bio, credentials[], specialties[], languages[], consultation_modes[],
  verification_status, clinic_id, hourly_rate
- **Clinic/Tenant**: Organization entity — name, location, contact_info, tenant_id, settings
- **Appointment**: Booking record — patient_id, doctor_id, clinic_id, slot_datetime, type, status, payment_id
- **Consultation**: Record of completed consultation — appointment_id, start_time, end_time, notes, recording_url?
- **Prescription**: Digital prescription — consultation_id, patient_id, doctor_id, medications[], instructions, issued_at
- **MedicalRecord/Document**: Uploaded document — patient_id, document_type, file_url, uploaded_at, metadata
- **Order**: Medicine order — patient_id, prescription_id?, items[], total_amount, payment_status, delivery_status
- **Payment**: Payment record — user_id, order_id?, appointment_id?, amount, method, status, provider_ref
- **Article**: Health content — title, body, category, author_id, status, published_at
- **Review**: Doctor review — patient_id, doctor_id, rating, comment, created_at, moderation_status
- **Notification**: Notification record — user_id, type, title, body, channel, status, sent_at

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Patient can complete full flow (search → book → consult → view record) in under 10 minutes
- **SC-002**: Doctor onboarding to first appearing in search takes under 24 hours (with admin approval)
- **SC-003**: Payment via Paystack completes successfully in 95%+ of attempts (sandbox testing)
- **SC-004**: Video consultation connects within 5 seconds of both parties joining
- **SC-005**: Search returns results within 500ms for 95% of queries
- **SC-006**: All three core roles (patient, doctor, admin) can complete their primary flows without errors
- **SC-007**: Zero cross-tenant data access in security testing
- **SC-008**: Document uploads complete successfully for files up to 10MB
- **SC-009**: Mobile users can complete booking flow on 3G connection
- **SC-010**: Admin can view accurate analytics reflecting actual platform data

---

## Assumptions

- Patient identity verification (government ID) is NOT required for prototype — rely on user-provided data
- Medicine ordering uses simulated pharmacy — no real pharmacy network integration for prototype
- Paystack sandbox/test mode is sufficient for payment integration validation
- Video consultation is doctor-initiated for scheduled appointments; ad-hoc messaging/chat is out of scope
- Three user roles for prototype: Patient, Doctor, Admin (clinic-admin is same as platform-admin initially)
- Multi-tenant isolation uses soft-isolation via tenant_id columns — strict database-level isolation for production
- English is the primary language; i18n scaffolding for Swahili is deferred to post-prototype
- M-Pesa STK-push simulation in Paystack sandbox is acceptable for prototype

---

## Out of Scope (Prototype)

- Advanced clinic-group billing & payout splits among multiple practitioners
- Real delivery logistics integration (courier, GPS tracking) — simulate status for prototype
- Highly scalable infrastructure (sharding, global CDN, advanced load-balancing) — single-region prototype
- Machine learning-based content moderation or flagging — admin manual moderation only
- Full multi-language (i18n) implementation — English only, scaffolding for later
- Real-time chat/messaging between patient and doctor
- Appointment rescheduling flows (cancel and rebook for prototype)
- Insurance/NHIF integration

---

## Review & Acceptance Checklist

- [x] Feature directory created under `specs/` with correct naming
- [x] Spec contains Feature Summary, Goals, User Stories, Functional & Non-Functional Requirements
- [x] Spec contains Acceptance Criteria, Assumptions, Out-of-Scope, Success Criteria
- [x] No ambiguous or "magic" requirements — everything defined or flagged
- [x] Spec consistent with project constitution (privacy, security, quality, Kenyan market focus)
- [ ] Spec reviewed by product, engineering and compliance stakeholders
