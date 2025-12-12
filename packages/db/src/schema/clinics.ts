/**
 * Clinic schema - Multi-tenant organization
 * T018: Create clinic schema (tenant)
 */

import { pgTable, varchar, text, jsonb, timestamp, pgEnum, index } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

// Clinic status enum
export const clinicStatusEnum = pgEnum('clinic_status', ['active', 'suspended']);

// Clinics table
export const clinics = pgTable('clinics', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => createId()),
  name: varchar('name', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 100 }).unique(),
  description: text('description'),
  logoUrl: varchar('logo_url', { length: 500 }),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  region: varchar('region', { length: 100 }),
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 255 }),
  website: varchar('website', { length: 500 }),
  operatingHours: jsonb('operating_hours').$type<{
    [day: string]: {
      open: string;
      close: string;
      closed?: boolean;
    };
  }>(),
  settings: jsonb('settings').$type<{
    allowOnlineBooking: boolean;
    appointmentBuffer: number;
    maxAdvanceBookingDays: number;
    cancellationPolicy?: string;
  }>(),
  status: clinicStatusEnum('status').notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('clinics_slug_idx').on(table.slug),
  index('clinics_city_idx').on(table.city),
  index('clinics_region_idx').on(table.region),
  index('clinics_status_idx').on(table.status),
]);

// Type exports
export type Clinic = typeof clinics.$inferSelect;
export type NewClinic = typeof clinics.$inferInsert;
