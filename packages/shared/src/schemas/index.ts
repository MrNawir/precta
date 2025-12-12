/**
 * Shared validation schemas using TypeBox
 * These will be extended with drizzle-typebox generated schemas
 */

import { Type, type Static } from '@sinclair/typebox';

// Email validation
export const EmailSchema = Type.String({
  format: 'email',
  minLength: 5,
  maxLength: 255,
});

// Phone validation (Kenyan format)
export const PhoneSchema = Type.String({
  pattern: '^\\+254[0-9]{9}$',
  minLength: 13,
  maxLength: 13,
});

// Optional phone that can be in local format
export const PhoneInputSchema = Type.String({
  pattern: '^(\\+254|0)?[0-9]{9}$',
  minLength: 9,
  maxLength: 13,
});

// Password validation
export const PasswordSchema = Type.String({
  minLength: 8,
  maxLength: 128,
});

// CUID2 ID validation
export const IdSchema = Type.String({
  minLength: 24,
  maxLength: 24,
});

// Pagination schemas
export const PaginationSchema = Type.Object({
  page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100, default: 20 })),
  sortBy: Type.Optional(Type.String()),
  sortOrder: Type.Optional(Type.Union([Type.Literal('asc'), Type.Literal('desc')])),
});

export type PaginationInput = Static<typeof PaginationSchema>;

// Search query schema
export const SearchQuerySchema = Type.Object({
  q: Type.Optional(Type.String({ minLength: 1, maxLength: 200 })),
  ...PaginationSchema.properties,
});

export type SearchQueryInput = Static<typeof SearchQuerySchema>;

// User registration schema
export const UserRegistrationSchema = Type.Object({
  email: EmailSchema,
  password: PasswordSchema,
  phone: Type.Optional(PhoneInputSchema),
  role: Type.Union([
    Type.Literal('patient'),
    Type.Literal('doctor'),
  ]),
});

export type UserRegistrationInput = Static<typeof UserRegistrationSchema>;

// Login schema
export const LoginSchema = Type.Object({
  email: EmailSchema,
  password: PasswordSchema,
});

export type LoginInput = Static<typeof LoginSchema>;

// Patient profile schema
export const PatientProfileSchema = Type.Object({
  firstName: Type.String({ minLength: 1, maxLength: 100 }),
  lastName: Type.String({ minLength: 1, maxLength: 100 }),
  dateOfBirth: Type.Optional(Type.String({ format: 'date' })),
  gender: Type.Optional(Type.Union([
    Type.Literal('male'),
    Type.Literal('female'),
    Type.Literal('other'),
    Type.Literal('prefer_not_to_say'),
  ])),
  bloodType: Type.Optional(Type.String({ maxLength: 5 })),
  allergies: Type.Optional(Type.Array(Type.String())),
  preferredLanguage: Type.Optional(Type.Union([
    Type.Literal('en'),
    Type.Literal('sw'),
  ])),
  emergencyContactName: Type.Optional(Type.String({ maxLength: 200 })),
  emergencyContactPhone: Type.Optional(PhoneInputSchema),
});

export type PatientProfileInput = Static<typeof PatientProfileSchema>;

// Doctor profile schema
export const DoctorProfileSchema = Type.Object({
  firstName: Type.String({ minLength: 1, maxLength: 100 }),
  lastName: Type.String({ minLength: 1, maxLength: 100 }),
  bio: Type.Optional(Type.String({ maxLength: 2000 })),
  specialties: Type.Array(Type.String(), { minItems: 1 }),
  languages: Type.Optional(Type.Array(Type.String())),
  licenseNumber: Type.Optional(Type.String({ maxLength: 100 })),
  yearsOfExperience: Type.Optional(Type.Number({ minimum: 0, maximum: 70 })),
  consultationFee: Type.Number({ minimum: 0 }),
  consultationDurationMinutes: Type.Optional(Type.Number({ minimum: 15, maximum: 120 })),
  consultationModes: Type.Optional(Type.Array(Type.Union([
    Type.Literal('in_person'),
    Type.Literal('video'),
  ]))),
});

export type DoctorProfileInput = Static<typeof DoctorProfileSchema>;

// Appointment booking schema
export const BookAppointmentSchema = Type.Object({
  doctorId: IdSchema,
  scheduledAt: Type.String({ format: 'date-time' }),
  consultationType: Type.Union([
    Type.Literal('in_person'),
    Type.Literal('video'),
  ]),
  notes: Type.Optional(Type.String({ maxLength: 1000 })),
});

export type BookAppointmentInput = Static<typeof BookAppointmentSchema>;

// Review schema
export const ReviewSchema = Type.Object({
  doctorId: IdSchema,
  consultationId: Type.Optional(IdSchema),
  rating: Type.Number({ minimum: 1, maximum: 5 }),
  comment: Type.Optional(Type.String({ maxLength: 2000 })),
});

export type ReviewInput = Static<typeof ReviewSchema>;

// Medication schema
export const MedicationSchema = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 200 }),
  dosage: Type.String({ minLength: 1, maxLength: 100 }),
  frequency: Type.String({ minLength: 1, maxLength: 100 }),
  duration: Type.String({ minLength: 1, maxLength: 100 }),
  instructions: Type.Optional(Type.String({ maxLength: 500 })),
});

export type MedicationInput = Static<typeof MedicationSchema>;

// Prescription schema
export const PrescriptionSchema = Type.Object({
  patientId: IdSchema,
  consultationId: Type.Optional(IdSchema),
  medications: Type.Array(MedicationSchema, { minItems: 1 }),
  instructions: Type.Optional(Type.String({ maxLength: 2000 })),
  validUntil: Type.Optional(Type.String({ format: 'date' })),
});

export type PrescriptionInput = Static<typeof PrescriptionSchema>;
