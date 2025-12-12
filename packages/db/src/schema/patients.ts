/**
 * Patient schema - Extended profile for patients
 * T014: Create patient schema
 */

import { pgTable, varchar, date, text, timestamp, pgEnum, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { clinics } from './clinics';

// Gender enum
export const genderEnum = pgEnum('gender', ['male', 'female', 'other', 'prefer_not_to_say']);

// Language enum
export const languageEnum = pgEnum('language', ['en', 'sw']);

// Patients table
export const patients = pgTable('patients', {
  id: varchar('id', { length: 36 }).primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  dateOfBirth: date('date_of_birth'),
  gender: genderEnum('gender'),
  bloodType: varchar('blood_type', { length: 5 }),
  allergies: text('allergies').array(),
  preferredLanguage: languageEnum('preferred_language').default('en'),
  emergencyContactName: varchar('emergency_contact_name', { length: 200 }),
  emergencyContactPhone: varchar('emergency_contact_phone', { length: 20 }),
  clinicId: varchar('clinic_id', { length: 36 }).references(() => clinics.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('patients_clinic_id_idx').on(table.clinicId),
  index('patients_name_idx').on(table.firstName, table.lastName),
]);

// Type exports
export type Patient = typeof patients.$inferSelect;
export type NewPatient = typeof patients.$inferInsert;
