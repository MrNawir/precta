/**
 * Review schema - Doctor reviews from patients
 * T026: Create review schema
 */

import { pgTable, varchar, text, integer, timestamp, pgEnum, index, unique } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { patients } from './patients';
import { doctors } from './doctors';
import { consultations } from './consultations';
import { users } from './users';

// Moderation status enum
export const moderationStatusEnum = pgEnum('moderation_status', ['pending', 'approved', 'rejected']);

// Reviews table
export const reviews = pgTable('reviews', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => createId()),
  patientId: varchar('patient_id', { length: 36 }).notNull().references(() => patients.id),
  doctorId: varchar('doctor_id', { length: 36 }).notNull().references(() => doctors.id),
  consultationId: varchar('consultation_id', { length: 36 }).references(() => consultations.id),
  rating: integer('rating').notNull(), // 1-5
  comment: text('comment'),
  moderationStatus: moderationStatusEnum('moderation_status').notNull().default('pending'),
  moderatedAt: timestamp('moderated_at', { withTimezone: true }),
  moderatedBy: varchar('moderated_by', { length: 36 }).references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('reviews_doctor_id_idx').on(table.doctorId),
  index('reviews_patient_id_idx').on(table.patientId),
  index('reviews_rating_idx').on(table.rating),
  index('reviews_moderation_status_idx').on(table.moderationStatus),
  // One review per consultation
  unique('reviews_patient_consultation_unique').on(table.patientId, table.consultationId),
]);

// Type exports
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
