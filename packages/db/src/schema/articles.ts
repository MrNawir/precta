/**
 * Article schema - Health content articles
 * T025: Create article schema
 */

import { pgTable, varchar, text, integer, timestamp, pgEnum, index } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { users } from './users';

// Article status enum
export const articleStatusEnum = pgEnum('article_status', ['draft', 'published', 'archived']);

// Article category enum
export const articleCategoryEnum = pgEnum('article_category', [
  'wellness',
  'prevention',
  'disease',
  'nutrition',
  'mental_health',
  'fitness',
  'news',
]);

// Articles table
export const articles = pgTable('articles', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => createId()),
  title: varchar('title', { length: 300 }).notNull(),
  slug: varchar('slug', { length: 300 }).unique(),
  excerpt: text('excerpt'),
  body: text('body').notNull(),
  category: articleCategoryEnum('category').notNull(),
  tags: text('tags').array(),
  featuredImageUrl: varchar('featured_image_url', { length: 500 }),
  authorId: varchar('author_id', { length: 36 }).references(() => users.id),
  status: articleStatusEnum('status').notNull().default('draft'),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  viewCount: integer('view_count').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('articles_slug_idx').on(table.slug),
  index('articles_category_idx').on(table.category),
  index('articles_status_idx').on(table.status),
  index('articles_published_at_idx').on(table.publishedAt),
]);

// Type exports
export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
