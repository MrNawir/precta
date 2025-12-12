/**
 * Medical Record schema - Patient-uploaded documents
 * T022: Create medical_record schema
 */

import { pgTable, varchar, text, integer, jsonb, timestamp, pgEnum, index } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { patients } from './patients';

// Medical record type enum
export const medicalRecordTypeEnum = pgEnum('medical_record_type', [
  'prescription',
  'lab_result',
  'imaging',
  'consultation_note',
  'other',
]);

// Medical records table
export const medicalRecords = pgTable('medical_records', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => createId()),
  patientId: varchar('patient_id', { length: 36 }).notNull().references(() => patients.id, { onDelete: 'cascade' }),
  type: medicalRecordTypeEnum('type').notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  fileUrl: varchar('file_url', { length: 500 }).notNull(),
  fileSizeBytes: integer('file_size_bytes'),
  mimeType: varchar('mime_type', { length: 100 }),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('medical_records_patient_id_idx').on(table.patientId),
  index('medical_records_type_idx').on(table.type),
  index('medical_records_uploaded_at_idx').on(table.uploadedAt),
]);

// Type exports
export type MedicalRecord = typeof medicalRecords.$inferSelect;
export type NewMedicalRecord = typeof medicalRecords.$inferInsert;
