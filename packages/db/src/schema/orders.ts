/**
 * Order schema - Medicine orders and order items
 * T023: Create order and order_item schemas
 */

import { pgTable, varchar, text, decimal, integer, timestamp, pgEnum, index } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { patients } from './patients';
import { prescriptions } from './prescriptions';
import { payments } from './payments';

// Order status enum
export const orderStatusEnum = pgEnum('order_status', [
  'pending_payment',
  'placed',
  'processing',
  'dispatched',
  'delivered',
  'cancelled',
]);

// Orders table
export const orders = pgTable('orders', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => createId()),
  patientId: varchar('patient_id', { length: 36 }).notNull().references(() => patients.id),
  prescriptionId: varchar('prescription_id', { length: 36 }).references(() => prescriptions.id),
  status: orderStatusEnum('status').notNull().default('pending_payment'),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  deliveryFee: decimal('delivery_fee', { precision: 10, scale: 2 }).notNull().default('0'),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  deliveryAddress: text('delivery_address'),
  deliveryNotes: text('delivery_notes'),
  paymentId: varchar('payment_id', { length: 36 }).references(() => payments.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('orders_patient_id_idx').on(table.patientId),
  index('orders_status_idx').on(table.status),
  index('orders_created_at_idx').on(table.createdAt),
]);

// Order items table
export const orderItems = pgTable('order_items', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => createId()),
  orderId: varchar('order_id', { length: 36 }).notNull().references(() => orders.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 200 }).notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
}, (table) => [
  index('order_items_order_id_idx').on(table.orderId),
]);

// Type exports
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
