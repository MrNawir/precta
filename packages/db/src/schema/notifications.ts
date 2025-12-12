/**
 * Notification schema - User notifications
 * T027: Create notification schema
 */

import { pgTable, varchar, text, jsonb, timestamp, pgEnum, index } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { users } from './users';

// Notification type enum
export const notificationTypeEnum = pgEnum('notification_type', [
  'appointment_confirmed',
  'appointment_reminder',
  'appointment_cancelled',
  'prescription_ready',
  'order_status',
  'verification_status',
  'payment_received',
  'general',
]);

// Notification channel enum
export const notificationChannelEnum = pgEnum('notification_channel', ['push', 'email', 'sms']);

// Notification status enum
export const notificationStatusEnum = pgEnum('notification_status', ['pending', 'sent', 'read', 'failed']);

// Notifications table
export const notifications = pgTable('notifications', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => createId()),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: notificationTypeEnum('type').notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  body: text('body').notNull(),
  data: jsonb('data').$type<Record<string, unknown>>(),
  channel: notificationChannelEnum('channel').notNull().default('push'),
  status: notificationStatusEnum('status').notNull().default('pending'),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  readAt: timestamp('read_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('notifications_user_id_idx').on(table.userId),
  index('notifications_status_idx').on(table.status),
  index('notifications_created_at_idx').on(table.createdAt),
  index('notifications_user_status_idx').on(table.userId, table.status),
]);

// Type exports
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
