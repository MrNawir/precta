/**
 * Consultation schema - Completed consultation records
 * T020: Create consultation schema
 */

import { pgTable, varchar, text, integer, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { appointments } from './appointments';

// Consultations table
export const consultations = pgTable('consultations', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => createId()),
  appointmentId: varchar('appointment_id', { length: 36 }).notNull().unique().references(() => appointments.id),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
  endedAt: timestamp('ended_at', { withTimezone: true }),
  durationSeconds: integer('duration_seconds'),
  doctorNotes: text('doctor_notes'),
  diagnosis: text('diagnosis'),
  followUpRecommended: boolean('follow_up_recommended').notNull().default(false),
  followUpNotes: text('follow_up_notes'),
  recordingUrl: varchar('recording_url', { length: 500 }),
  roomId: varchar('room_id', { length: 100 }), // 100ms room ID
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('consultations_appointment_id_idx').on(table.appointmentId),
  index('consultations_started_at_idx').on(table.startedAt),
]);

// Type exports
export type Consultation = typeof consultations.$inferSelect;
export type NewConsultation = typeof consultations.$inferInsert;
