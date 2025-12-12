/**
 * Prescription schema - Digital prescriptions
 * T021: Create prescription schema with medications jsonb
 */

import { pgTable, varchar, text, date, jsonb, timestamp, index } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { consultations } from './consultations';
import { patients } from './patients';
import { doctors } from './doctors';

// Medication type for JSONB
interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

// Prescriptions table
export const prescriptions = pgTable('prescriptions', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => createId()),
  consultationId: varchar('consultation_id', { length: 36 }).references(() => consultations.id),
  patientId: varchar('patient_id', { length: 36 }).notNull().references(() => patients.id),
  doctorId: varchar('doctor_id', { length: 36 }).notNull().references(() => doctors.id),
  medications: jsonb('medications').$type<Medication[]>().notNull(),
  instructions: text('instructions'),
  validUntil: date('valid_until'),
  issuedAt: timestamp('issued_at', { withTimezone: true }).notNull().defaultNow(),
  pdfUrl: varchar('pdf_url', { length: 500 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('prescriptions_patient_id_idx').on(table.patientId),
  index('prescriptions_doctor_id_idx').on(table.doctorId),
  index('prescriptions_consultation_id_idx').on(table.consultationId),
  index('prescriptions_issued_at_idx').on(table.issuedAt),
]);

// Type exports
export type Prescription = typeof prescriptions.$inferSelect;
export type NewPrescription = typeof prescriptions.$inferInsert;
