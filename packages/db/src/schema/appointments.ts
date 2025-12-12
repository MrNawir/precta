/**
 * Appointment schema - Booking records
 * T019: Create appointment schema with status enum
 */

import { pgTable, varchar, text, integer, timestamp, pgEnum, index, unique } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { patients } from './patients';
import { doctors } from './doctors';
import { clinics } from './clinics';
import { users } from './users';
import { payments } from './payments';

// Appointment status enum
export const appointmentStatusEnum = pgEnum('appointment_status', [
  'pending_payment',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'no_show',
]);

// Consultation type enum (shared with doctors)
export const consultationTypeEnum = pgEnum('consultation_type', ['in_person', 'video']);

// Appointments table
export const appointments = pgTable('appointments', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => createId()),
  patientId: varchar('patient_id', { length: 36 }).notNull().references(() => patients.id),
  doctorId: varchar('doctor_id', { length: 36 }).notNull().references(() => doctors.id),
  clinicId: varchar('clinic_id', { length: 36 }).references(() => clinics.id),
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }).notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  consultationType: consultationTypeEnum('consultation_type').notNull(),
  status: appointmentStatusEnum('status').notNull().default('pending_payment'),
  cancellationReason: text('cancellation_reason'),
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
  cancelledBy: varchar('cancelled_by', { length: 36 }).references(() => users.id),
  notes: text('notes'),
  paymentId: varchar('payment_id', { length: 36 }).references(() => payments.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('appointments_patient_id_idx').on(table.patientId),
  index('appointments_doctor_id_idx').on(table.doctorId),
  index('appointments_clinic_id_idx').on(table.clinicId),
  index('appointments_scheduled_at_idx').on(table.scheduledAt),
  index('appointments_status_idx').on(table.status),
  index('appointments_doctor_scheduled_idx').on(table.doctorId, table.scheduledAt),
  // Prevent double booking
  unique('appointments_doctor_time_unique').on(table.doctorId, table.scheduledAt),
]);

// Type exports
export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;
