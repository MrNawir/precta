/**
 * Payment schema - Payment records
 * T024: Create payment schema
 */

import { pgTable, varchar, decimal, jsonb, timestamp, pgEnum, index } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { users } from './users';

// Payment type enum
export const paymentTypeEnum = pgEnum('payment_type', ['appointment', 'order']);

// Payment method enum
export const paymentMethodEnum = pgEnum('payment_method', ['mpesa', 'card']);

// Payment status enum
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'completed', 'failed', 'refunded']);

// Payments table
export const payments = pgTable('payments', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => createId()),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id),
  type: paymentTypeEnum('type').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('KES'),
  method: paymentMethodEnum('method').notNull(),
  status: paymentStatusEnum('status').notNull().default('pending'),
  provider: varchar('provider', { length: 50 }).notNull().default('paystack'),
  providerReference: varchar('provider_reference', { length: 200 }),
  providerResponse: jsonb('provider_response').$type<Record<string, unknown>>(),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('payments_user_id_idx').on(table.userId),
  index('payments_status_idx').on(table.status),
  index('payments_provider_reference_idx').on(table.providerReference),
  index('payments_type_idx').on(table.type),
]);

// Type exports
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
