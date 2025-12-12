/**
 * Doctor schema - Extended profile, availability, and credentials
 * T015: Create doctor schema with verification status
 * T016: Create doctor_availability schema
 * T017: Create doctor_credential schema
 */

import { pgTable, varchar, text, integer, decimal, boolean, timestamp, time, date, jsonb, pgEnum, index } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { users } from './users';
import { clinics } from './clinics';

// Verification status enum
export const verificationStatusEnum = pgEnum('verification_status', ['pending', 'verified', 'rejected']);

// Consultation mode enum
export const consultationModeEnum = pgEnum('consultation_mode', ['in_person', 'video']);

// Credential type enum
export const credentialTypeEnum = pgEnum('credential_type', ['license', 'degree', 'certification', 'id']);

// Doctors table
export const doctors = pgTable('doctors', {
  id: varchar('id', { length: 36 }).primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  bio: text('bio'),
  profileImageUrl: varchar('profile_image_url', { length: 500 }),
  specialties: text('specialties').array().notNull(),
  languages: text('languages').array().default(['en']),
  qualifications: jsonb('qualifications').$type<{
    type: 'degree' | 'certification' | 'specialization';
    name: string;
    institution: string;
    year: number;
  }[]>(),
  licenseNumber: varchar('license_number', { length: 100 }),
  yearsOfExperience: integer('years_of_experience'),
  consultationFee: decimal('consultation_fee', { precision: 10, scale: 2 }).notNull(),
  consultationDurationMinutes: integer('consultation_duration_minutes').notNull().default(30),
  consultationModes: text('consultation_modes').array().default(['in_person']),
  verificationStatus: verificationStatusEnum('verification_status').notNull().default('pending'),
  verificationNotes: text('verification_notes'),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  verifiedBy: varchar('verified_by', { length: 36 }).references(() => users.id),
  clinicId: varchar('clinic_id', { length: 36 }).references(() => clinics.id),
  averageRating: decimal('average_rating', { precision: 2, scale: 1 }).default('0'),
  totalReviews: integer('total_reviews').notNull().default(0),
  totalConsultations: integer('total_consultations').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('doctors_clinic_id_idx').on(table.clinicId),
  index('doctors_verification_status_idx').on(table.verificationStatus),
  index('doctors_average_rating_idx').on(table.averageRating),
]);

// Doctor availability table
export const doctorAvailability = pgTable('doctor_availability', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => createId()),
  doctorId: varchar('doctor_id', { length: 36 }).notNull().references(() => doctors.id, { onDelete: 'cascade' }),
  dayOfWeek: integer('day_of_week').notNull(), // 0-6 (Sunday-Saturday)
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
  consultationMode: consultationModeEnum('consultation_mode').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('doctor_availability_doctor_id_idx').on(table.doctorId),
  index('doctor_availability_day_idx').on(table.doctorId, table.dayOfWeek),
]);

// Doctor credentials table
export const doctorCredentials = pgTable('doctor_credentials', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => createId()),
  doctorId: varchar('doctor_id', { length: 36 }).notNull().references(() => doctors.id, { onDelete: 'cascade' }),
  type: credentialTypeEnum('type').notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  fileUrl: varchar('file_url', { length: 500 }).notNull(),
  issuedBy: varchar('issued_by', { length: 200 }),
  issuedAt: date('issued_at'),
  expiresAt: date('expires_at'),
  verificationStatus: verificationStatusEnum('verification_status').notNull().default('pending'),
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('doctor_credentials_doctor_id_idx').on(table.doctorId),
  index('doctor_credentials_type_idx').on(table.type),
]);

// Type exports
export type Doctor = typeof doctors.$inferSelect;
export type NewDoctor = typeof doctors.$inferInsert;
export type DoctorAvailability = typeof doctorAvailability.$inferSelect;
export type NewDoctorAvailability = typeof doctorAvailability.$inferInsert;
export type DoctorCredential = typeof doctorCredentials.$inferSelect;
export type NewDoctorCredential = typeof doctorCredentials.$inferInsert;
