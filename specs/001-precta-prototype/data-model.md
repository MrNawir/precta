# Data Model: Precta Healthcare Platform

**Feature**: 001-precta-prototype  
**Date**: 2025-12-09  
**ORM**: Drizzle ORM with PostgreSQL

---

## Entity Relationship Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Clinic    │────<│   Doctor    │────<│Appointment  │
│  (Tenant)   │     │             │     │             │
└─────────────┘     └──────┬──────┘     └──────┬──────┘
                          │                    │
                          │              ┌─────┴─────┐
                          │              │           │
                    ┌─────┴─────┐  ┌─────┴─────┐ ┌───┴───┐
                    │  Review   │  │Consultation│ │Payment│
                    └───────────┘  └─────┬─────┘ └───────┘
                                         │
                                   ┌─────┴─────┐
                                   │Prescription│
                                   └───────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Patient   │────<│MedicalRecord│     │   Article   │
│             │     │ (Document)  │     │             │
└──────┬──────┘     └─────────────┘     └─────────────┘
       │
       │            ┌─────────────┐
       └───────────<│   Order     │
                    └──────┬──────┘
                           │
                    ┌──────┴──────┐
                    │ OrderItem   │
                    └─────────────┘
```

---

## Core Entities

### 1. User (Base)

All users share a common base table with role differentiation.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `varchar(36)` | PK, CUID2 | Unique identifier |
| `email` | `varchar(255)` | UNIQUE, NOT NULL | Email address |
| `phone` | `varchar(20)` | UNIQUE | Phone number (optional) |
| `password_hash` | `varchar(255)` | NOT NULL | Hashed password |
| `role` | `enum` | NOT NULL | 'patient', 'doctor', 'admin' |
| `status` | `enum` | NOT NULL, DEFAULT 'pending' | 'pending', 'active', 'suspended' |
| `email_verified` | `boolean` | DEFAULT false | Email verification status |
| `phone_verified` | `boolean` | DEFAULT false | Phone verification status |
| `created_at` | `timestamp` | DEFAULT NOW() | Creation timestamp |
| `updated_at` | `timestamp` | DEFAULT NOW() | Last update timestamp |

**Indexes**: `email`, `phone`, `role`, `status`

---

### 2. Patient

Extended profile for patients.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `varchar(36)` | PK, FK→user.id | Links to user |
| `first_name` | `varchar(100)` | NOT NULL | First name |
| `last_name` | `varchar(100)` | NOT NULL | Last name |
| `date_of_birth` | `date` | | Date of birth |
| `gender` | `enum` | | 'male', 'female', 'other', 'prefer_not_to_say' |
| `blood_type` | `varchar(5)` | | Blood type (A+, B-, etc.) |
| `allergies` | `text[]` | | Known allergies |
| `preferred_language` | `varchar(10)` | DEFAULT 'en' | 'en', 'sw' |
| `emergency_contact_name` | `varchar(200)` | | Emergency contact |
| `emergency_contact_phone` | `varchar(20)` | | Emergency phone |
| `clinic_id` | `varchar(36)` | FK→clinic.id | Associated clinic (tenant) |

**Indexes**: `clinic_id`, `(first_name, last_name)`

---

### 3. Doctor

Extended profile for healthcare providers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `varchar(36)` | PK, FK→user.id | Links to user |
| `first_name` | `varchar(100)` | NOT NULL | First name |
| `last_name` | `varchar(100)` | NOT NULL | Last name |
| `bio` | `text` | | Professional bio |
| `profile_image_url` | `varchar(500)` | | Profile photo URL |
| `specialties` | `text[]` | NOT NULL | Medical specialties |
| `languages` | `text[]` | DEFAULT ['en'] | Languages spoken |
| `qualifications` | `jsonb` | | Degrees, certifications |
| `license_number` | `varchar(100)` | | Medical license number |
| `years_of_experience` | `integer` | | Years practicing |
| `consultation_fee` | `decimal(10,2)` | NOT NULL | Fee per consultation |
| `consultation_duration_minutes` | `integer` | DEFAULT 30 | Slot duration |
| `consultation_modes` | `text[]` | DEFAULT ['in_person'] | 'in_person', 'video' |
| `verification_status` | `enum` | DEFAULT 'pending' | 'pending', 'verified', 'rejected' |
| `verification_notes` | `text` | | Admin notes on verification |
| `verified_at` | `timestamp` | | When verified |
| `verified_by` | `varchar(36)` | FK→user.id | Admin who verified |
| `clinic_id` | `varchar(36)` | FK→clinic.id | Associated clinic |
| `average_rating` | `decimal(2,1)` | DEFAULT 0 | Computed average (1-5) |
| `total_reviews` | `integer` | DEFAULT 0 | Review count |
| `total_consultations` | `integer` | DEFAULT 0 | Consultation count |

**Indexes**: `clinic_id`, `verification_status`, `specialties` (GIN), `average_rating`

---

### 4. Clinic (Tenant)

Organization/clinic entity for multi-tenancy.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `varchar(36)` | PK, CUID2 | Unique identifier |
| `name` | `varchar(200)` | NOT NULL | Clinic/hospital name |
| `slug` | `varchar(100)` | UNIQUE | URL-friendly identifier |
| `description` | `text` | | About the clinic |
| `logo_url` | `varchar(500)` | | Logo image URL |
| `address` | `text` | | Physical address |
| `city` | `varchar(100)` | | City |
| `region` | `varchar(100)` | | Region/county |
| `phone` | `varchar(20)` | | Contact phone |
| `email` | `varchar(255)` | | Contact email |
| `website` | `varchar(500)` | | Website URL |
| `operating_hours` | `jsonb` | | Hours by day |
| `settings` | `jsonb` | | Clinic-specific settings |
| `status` | `enum` | DEFAULT 'active' | 'active', 'suspended' |
| `created_at` | `timestamp` | DEFAULT NOW() | Creation timestamp |

**Indexes**: `slug`, `city`, `region`, `status`

---

### 5. DoctorAvailability

Doctor's available time slots.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `varchar(36)` | PK | Unique identifier |
| `doctor_id` | `varchar(36)` | FK→doctor.id, NOT NULL | Doctor reference |
| `day_of_week` | `integer` | NOT NULL | 0-6 (Sunday-Saturday) |
| `start_time` | `time` | NOT NULL | Slot start time |
| `end_time` | `time` | NOT NULL | Slot end time |
| `consultation_mode` | `enum` | NOT NULL | 'in_person', 'video' |
| `is_active` | `boolean` | DEFAULT true | Whether slot is active |

**Indexes**: `doctor_id`, `(doctor_id, day_of_week)`

---

### 6. DoctorCredential

Uploaded credentials for verification.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `varchar(36)` | PK | Unique identifier |
| `doctor_id` | `varchar(36)` | FK→doctor.id, NOT NULL | Doctor reference |
| `type` | `enum` | NOT NULL | 'license', 'degree', 'certification', 'id' |
| `name` | `varchar(200)` | NOT NULL | Document name |
| `file_url` | `varchar(500)` | NOT NULL | Storage URL |
| `issued_by` | `varchar(200)` | | Issuing authority |
| `issued_at` | `date` | | Issue date |
| `expires_at` | `date` | | Expiry date |
| `verification_status` | `enum` | DEFAULT 'pending' | 'pending', 'verified', 'rejected' |
| `uploaded_at` | `timestamp` | DEFAULT NOW() | Upload timestamp |

**Indexes**: `doctor_id`, `type`

---

### 7. Appointment

Booking records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `varchar(36)` | PK | Unique identifier |
| `patient_id` | `varchar(36)` | FK→patient.id, NOT NULL | Patient reference |
| `doctor_id` | `varchar(36)` | FK→doctor.id, NOT NULL | Doctor reference |
| `clinic_id` | `varchar(36)` | FK→clinic.id | Clinic reference |
| `scheduled_at` | `timestamp` | NOT NULL | Appointment datetime |
| `duration_minutes` | `integer` | NOT NULL | Duration in minutes |
| `consultation_type` | `enum` | NOT NULL | 'in_person', 'video' |
| `status` | `enum` | DEFAULT 'pending_payment' | See status enum |
| `cancellation_reason` | `text` | | If cancelled |
| `cancelled_at` | `timestamp` | | When cancelled |
| `cancelled_by` | `varchar(36)` | FK→user.id | Who cancelled |
| `notes` | `text` | | Patient notes |
| `payment_id` | `varchar(36)` | FK→payment.id | Payment reference |
| `created_at` | `timestamp` | DEFAULT NOW() | Booking timestamp |

**Status Enum**: `pending_payment`, `confirmed`, `in_progress`, `completed`, `cancelled`, `no_show`

**Indexes**: `patient_id`, `doctor_id`, `clinic_id`, `scheduled_at`, `status`, `(doctor_id, scheduled_at)`

**Unique Constraint**: `(doctor_id, scheduled_at)` — prevents double-booking

---

### 8. Consultation

Completed consultation records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `varchar(36)` | PK | Unique identifier |
| `appointment_id` | `varchar(36)` | FK→appointment.id, UNIQUE | Linked appointment |
| `started_at` | `timestamp` | NOT NULL | Call start time |
| `ended_at` | `timestamp` | | Call end time |
| `duration_seconds` | `integer` | | Actual duration |
| `doctor_notes` | `text` | | Doctor's clinical notes |
| `diagnosis` | `text` | | Diagnosis summary |
| `follow_up_recommended` | `boolean` | DEFAULT false | Follow-up needed |
| `follow_up_notes` | `text` | | Follow-up instructions |
| `recording_url` | `varchar(500)` | | Video recording URL |
| `room_id` | `varchar(100)` | | 100ms room ID |

**Indexes**: `appointment_id`, `started_at`

---

### 9. Prescription

Digital prescriptions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `varchar(36)` | PK | Unique identifier |
| `consultation_id` | `varchar(36)` | FK→consultation.id | Linked consultation |
| `patient_id` | `varchar(36)` | FK→patient.id, NOT NULL | Patient reference |
| `doctor_id` | `varchar(36)` | FK→doctor.id, NOT NULL | Doctor reference |
| `medications` | `jsonb` | NOT NULL | Array of medications |
| `instructions` | `text` | | General instructions |
| `valid_until` | `date` | | Prescription validity |
| `issued_at` | `timestamp` | DEFAULT NOW() | Issue timestamp |
| `pdf_url` | `varchar(500)` | | Generated PDF URL |

**Medications JSONB Structure**:
```json
[
  {
    "name": "Paracetamol",
    "dosage": "500mg",
    "frequency": "3 times daily",
    "duration": "5 days",
    "instructions": "Take after meals"
  }
]
```

**Indexes**: `patient_id`, `doctor_id`, `consultation_id`, `issued_at`

---

### 10. MedicalRecord

Patient-uploaded documents.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `varchar(36)` | PK | Unique identifier |
| `patient_id` | `varchar(36)` | FK→patient.id, NOT NULL | Patient reference |
| `type` | `enum` | NOT NULL | Document type |
| `name` | `varchar(200)` | NOT NULL | Document name |
| `description` | `text` | | Description |
| `file_url` | `varchar(500)` | NOT NULL | Storage URL |
| `file_size_bytes` | `integer` | | File size |
| `mime_type` | `varchar(100)` | | MIME type |
| `uploaded_at` | `timestamp` | DEFAULT NOW() | Upload timestamp |
| `metadata` | `jsonb` | | Additional metadata |

**Type Enum**: `prescription`, `lab_result`, `imaging`, `consultation_note`, `other`

**Indexes**: `patient_id`, `type`, `uploaded_at`

---

### 11. Order

Medicine orders.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `varchar(36)` | PK | Unique identifier |
| `patient_id` | `varchar(36)` | FK→patient.id, NOT NULL | Patient reference |
| `prescription_id` | `varchar(36)` | FK→prescription.id | Linked prescription |
| `status` | `enum` | DEFAULT 'pending_payment' | Order status |
| `subtotal` | `decimal(10,2)` | NOT NULL | Items total |
| `delivery_fee` | `decimal(10,2)` | DEFAULT 0 | Delivery charge |
| `total_amount` | `decimal(10,2)` | NOT NULL | Grand total |
| `delivery_address` | `text` | | Delivery address |
| `delivery_notes` | `text` | | Delivery instructions |
| `payment_id` | `varchar(36)` | FK→payment.id | Payment reference |
| `created_at` | `timestamp` | DEFAULT NOW() | Order timestamp |
| `updated_at` | `timestamp` | DEFAULT NOW() | Last update |

**Status Enum**: `pending_payment`, `placed`, `processing`, `dispatched`, `delivered`, `cancelled`

**Indexes**: `patient_id`, `status`, `created_at`

---

### 12. OrderItem

Individual items in an order.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `varchar(36)` | PK | Unique identifier |
| `order_id` | `varchar(36)` | FK→order.id, NOT NULL | Order reference |
| `name` | `varchar(200)` | NOT NULL | Medicine name |
| `quantity` | `integer` | NOT NULL | Quantity |
| `unit_price` | `decimal(10,2)` | NOT NULL | Price per unit |
| `total_price` | `decimal(10,2)` | NOT NULL | Line total |

**Indexes**: `order_id`

---

### 13. Payment

Payment records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `varchar(36)` | PK | Unique identifier |
| `user_id` | `varchar(36)` | FK→user.id, NOT NULL | Payer reference |
| `type` | `enum` | NOT NULL | 'appointment', 'order' |
| `amount` | `decimal(10,2)` | NOT NULL | Payment amount |
| `currency` | `varchar(3)` | DEFAULT 'KES' | Currency code |
| `method` | `enum` | NOT NULL | 'mpesa', 'card' |
| `status` | `enum` | DEFAULT 'pending' | Payment status |
| `provider` | `varchar(50)` | DEFAULT 'paystack' | Payment provider |
| `provider_reference` | `varchar(200)` | | Paystack reference |
| `provider_response` | `jsonb` | | Raw provider response |
| `paid_at` | `timestamp` | | Payment completion time |
| `created_at` | `timestamp` | DEFAULT NOW() | Creation timestamp |

**Status Enum**: `pending`, `completed`, `failed`, `refunded`

**Indexes**: `user_id`, `status`, `provider_reference`, `type`

---

### 14. Article

Health content articles.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `varchar(36)` | PK | Unique identifier |
| `title` | `varchar(300)` | NOT NULL | Article title |
| `slug` | `varchar(300)` | UNIQUE | URL slug |
| `excerpt` | `text` | | Short summary |
| `body` | `text` | NOT NULL | Full content (Markdown) |
| `category` | `enum` | NOT NULL | Content category |
| `tags` | `text[]` | | Tags for search |
| `featured_image_url` | `varchar(500)` | | Hero image |
| `author_id` | `varchar(36)` | FK→user.id | Author reference |
| `status` | `enum` | DEFAULT 'draft' | 'draft', 'published', 'archived' |
| `published_at` | `timestamp` | | Publication timestamp |
| `view_count` | `integer` | DEFAULT 0 | View counter |
| `created_at` | `timestamp` | DEFAULT NOW() | Creation timestamp |
| `updated_at` | `timestamp` | DEFAULT NOW() | Last update |

**Category Enum**: `wellness`, `prevention`, `disease`, `nutrition`, `mental_health`, `fitness`, `news`

**Indexes**: `slug`, `category`, `status`, `published_at`, `tags` (GIN)

---

### 15. Review

Doctor reviews from patients.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `varchar(36)` | PK | Unique identifier |
| `patient_id` | `varchar(36)` | FK→patient.id, NOT NULL | Reviewer |
| `doctor_id` | `varchar(36)` | FK→doctor.id, NOT NULL | Reviewed doctor |
| `consultation_id` | `varchar(36)` | FK→consultation.id | Related consultation |
| `rating` | `integer` | NOT NULL, CHECK 1-5 | Star rating |
| `comment` | `text` | | Review text |
| `moderation_status` | `enum` | DEFAULT 'pending' | 'pending', 'approved', 'rejected' |
| `moderated_at` | `timestamp` | | Moderation timestamp |
| `moderated_by` | `varchar(36)` | FK→user.id | Moderator |
| `created_at` | `timestamp` | DEFAULT NOW() | Creation timestamp |

**Indexes**: `doctor_id`, `patient_id`, `rating`, `moderation_status`

**Unique Constraint**: `(patient_id, consultation_id)` — one review per consultation

---

### 16. Notification

User notifications.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `varchar(36)` | PK | Unique identifier |
| `user_id` | `varchar(36)` | FK→user.id, NOT NULL | Recipient |
| `type` | `enum` | NOT NULL | Notification type |
| `title` | `varchar(200)` | NOT NULL | Notification title |
| `body` | `text` | NOT NULL | Notification content |
| `data` | `jsonb` | | Additional data/links |
| `channel` | `enum` | DEFAULT 'push' | 'push', 'email', 'sms' |
| `status` | `enum` | DEFAULT 'pending' | 'pending', 'sent', 'read', 'failed' |
| `sent_at` | `timestamp` | | When sent |
| `read_at` | `timestamp` | | When read |
| `created_at` | `timestamp` | DEFAULT NOW() | Creation timestamp |

**Type Enum**: `appointment_confirmed`, `appointment_reminder`, `appointment_cancelled`, 
`prescription_ready`, `order_status`, `verification_status`, `payment_received`, `general`

**Indexes**: `user_id`, `status`, `created_at`, `(user_id, status)`

---

### 17. AuditLog

Security audit trail (Constitution Art. III).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `varchar(36)` | PK | Unique identifier |
| `user_id` | `varchar(36)` | FK→user.id | Actor (null for system) |
| `action` | `varchar(100)` | NOT NULL | Action performed |
| `resource_type` | `varchar(100)` | NOT NULL | Entity type affected |
| `resource_id` | `varchar(36)` | | Entity ID affected |
| `details` | `jsonb` | | Action details |
| `ip_address` | `varchar(45)` | | Client IP |
| `user_agent` | `text` | | Client user agent |
| `created_at` | `timestamp` | DEFAULT NOW() | Timestamp |

**Indexes**: `user_id`, `action`, `resource_type`, `created_at`, `(resource_type, resource_id)`

---

## Session Tables (Better Auth)

Better Auth will create these automatically:

- `session` — Active user sessions
- `account` — OAuth accounts (if used)
- `verification` — Email/phone verification tokens

---

## Drizzle Schema Location

All schemas defined in: `packages/db/src/schema/`

```
packages/db/src/schema/
├── index.ts          # Export all tables
├── users.ts          # user table
├── patients.ts       # patient table
├── doctors.ts        # doctor, doctor_availability, doctor_credential tables
├── clinics.ts        # clinic table
├── appointments.ts   # appointment, consultation tables
├── prescriptions.ts  # prescription table
├── records.ts        # medical_record table
├── orders.ts         # order, order_item tables
├── payments.ts       # payment table
├── articles.ts       # article table
├── reviews.ts        # review table
├── notifications.ts  # notification table
└── audit.ts          # audit_log table
```

---

## Migration Strategy

1. Use Drizzle Kit for migrations: `drizzle-kit generate`
2. Migrations stored in: `packages/db/src/migrations/`
3. Run migrations: `drizzle-kit migrate`
4. Push for dev: `drizzle-kit push` (direct schema sync)
