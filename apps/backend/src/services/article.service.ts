/**
 * T119: Article Service
 * Health articles management
 */

import { eq, and, desc, sql, ilike, or } from 'drizzle-orm';
import { db } from '../lib/db';
import { articles, users } from '@precta/db';
import { createId } from '@paralleldrive/cuid2';

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  category: string;
  tags: string[];
  authorId: string;
  author?: {
    name: string;
    image: string | null;
  };
  status: 'draft' | 'published' | 'archived';
  publishedAt: Date | null;
  readTime: number;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateArticleInput {
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  category: string;
  tags?: string[];
  authorId: string;
  status?: 'draft' | 'published';
}

export interface UpdateArticleInput {
  title?: string;
  content?: string;
  excerpt?: string;
  coverImage?: string;
  category?: string;
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
}

class ArticleService {
  /**
   * Create a new article
   */
  async create(input: CreateArticleInput): Promise<Article> {
    const articleId = createId();
    const slug = this.generateSlug(input.title);
    const readTime = this.calculateReadTime(input.content);
    const excerpt = input.excerpt || this.generateExcerpt(input.content);

    await db.insert(articles).values({
      id: articleId,
      slug,
      title: input.title,
      excerpt,
      content: input.content,
      coverImage: input.coverImage || null,
      category: input.category,
      tags: input.tags || [],
      authorId: input.authorId,
      status: input.status || 'draft',
      publishedAt: input.status === 'published' ? new Date() : null,
      readTime,
      viewCount: 0,
    });

    return this.getById(articleId) as Promise<Article>;
  }

  /**
   * Update an article
   */
  async update(articleId: string, input: UpdateArticleInput): Promise<Article> {
    const updates: Partial<typeof articles.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (input.title) {
      updates.title = input.title;
      updates.slug = this.generateSlug(input.title);
    }
    if (input.content) {
      updates.content = input.content;
      updates.readTime = this.calculateReadTime(input.content);
    }
    if (input.excerpt) updates.excerpt = input.excerpt;
    if (input.coverImage) updates.coverImage = input.coverImage;
    if (input.category) updates.category = input.category;
    if (input.tags) updates.tags = input.tags;
    if (input.status) {
      updates.status = input.status;
      if (input.status === 'published') {
        // Set publishedAt if not already set
        const [existing] = await db
          .select({ publishedAt: articles.publishedAt })
          .from(articles)
          .where(eq(articles.id, articleId));
        if (!existing?.publishedAt) {
          updates.publishedAt = new Date();
        }
      }
    }

    await db.update(articles).set(updates).where(eq(articles.id, articleId));

    return this.getById(articleId) as Promise<Article>;
  }

  /**
   * Get article by ID
   */
  async getById(articleId: string): Promise<Article | null> {
    const [result] = await db
      .select({
        article: articles,
        author: {
          name: users.name,
          image: users.image,
        },
      })
      .from(articles)
      .leftJoin(users, eq(articles.authorId, users.id))
      .where(eq(articles.id, articleId))
      .limit(1);

    if (!result) return null;

    return this.mapToArticle(result.article, result.author);
  }

  /**
   * Get article by slug
   */
  async getBySlug(slug: string): Promise<Article | null> {
    const [result] = await db
      .select({
        article: articles,
        author: {
          name: users.name,
          image: users.image,
        },
      })
      .from(articles)
      .leftJoin(users, eq(articles.authorId, users.id))
      .where(eq(articles.slug, slug))
      .limit(1);

    if (!result) return null;

    // Increment view count
    await db
      .update(articles)
      .set({ viewCount: sql`${articles.viewCount} + 1` })
      .where(eq(articles.id, result.article.id));

    return this.mapToArticle(result.article, result.author);
  }

  /**
   * List published articles
   */
  async list(options?: {
    category?: string;
    tag?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Article[]; total: number }> {
    const page = options?.page || 1;
    const limit = Math.min(options?.limit || 12, 50);
    const offset = (page - 1) * limit;

    const conditions = [eq(articles.status, 'published')];

    if (options?.category) {
      conditions.push(eq(articles.category, options.category));
    }
    if (options?.search) {
      conditions.push(or(
        ilike(articles.title, `%${options.search}%`),
        ilike(articles.excerpt, `%${options.search}%`)
      )!);
    }

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(articles)
      .where(and(...conditions));

    const total = Number(countResult[0]?.count || 0);

    const results = await db
      .select({
        article: articles,
        author: {
          name: users.name,
          image: users.image,
        },
      })
      .from(articles)
      .leftJoin(users, eq(articles.authorId, users.id))
      .where(and(...conditions))
      .orderBy(desc(articles.publishedAt))
      .limit(limit)
      .offset(offset);

    return {
      data: results.map(r => this.mapToArticle(r.article, r.author)),
      total,
    };
  }

  /**
   * List all articles for admin
   */
  async listAll(options?: {
    status?: 'draft' | 'published' | 'archived';
    page?: number;
    limit?: number;
  }): Promise<{ data: Article[]; total: number }> {
    const page = options?.page || 1;
    const limit = Math.min(options?.limit || 20, 50);
    const offset = (page - 1) * limit;

    const conditions = [];
    if (options?.status) {
      conditions.push(eq(articles.status, options.status));
    }

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(articles)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = Number(countResult[0]?.count || 0);

    const results = await db
      .select({
        article: articles,
        author: {
          name: users.name,
          image: users.image,
        },
      })
      .from(articles)
      .leftJoin(users, eq(articles.authorId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(articles.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      data: results.map(r => this.mapToArticle(r.article, r.author)),
      total,
    };
  }

  /**
   * Delete article
   */
  async delete(articleId: string): Promise<boolean> {
    await db.delete(articles).where(eq(articles.id, articleId));
    return true;
  }

  /**
   * Get popular articles
   */
  async getPopular(limit: number = 5): Promise<Article[]> {
    const results = await db
      .select({
        article: articles,
        author: {
          name: users.name,
          image: users.image,
        },
      })
      .from(articles)
      .leftJoin(users, eq(articles.authorId, users.id))
      .where(eq(articles.status, 'published'))
      .orderBy(desc(articles.viewCount))
      .limit(limit);

    return results.map(r => this.mapToArticle(r.article, r.author));
  }

  /**
   * Get categories with counts
   */
  async getCategories(): Promise<{ category: string; count: number }[]> {
    const results = await db
      .select({
        category: articles.category,
        count: sql<number>`count(*)`,
      })
      .from(articles)
      .where(eq(articles.status, 'published'))
      .groupBy(articles.category);

    return results.map(r => ({
      category: r.category,
      count: Number(r.count),
    }));
  }

  /**
   * Generate URL-friendly slug
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 100) + '-' + createId().substring(0, 8);
  }

  /**
   * Calculate read time in minutes
   */
  private calculateReadTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  }

  /**
   * Generate excerpt from content
   */
  private generateExcerpt(content: string, maxLength: number = 160): string {
    // Strip markdown
    const text = content
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/`[^`]+`/g, '')
      .replace(/\n+/g, ' ')
      .trim();

    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  /**
   * Map database article to Article type
   */
  private mapToArticle(
    article: typeof articles.$inferSelect,
    author: { name: string | null; image: string | null } | null
  ): Article {
    return {
      id: article.id,
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      coverImage: article.coverImage,
      category: article.category,
      tags: article.tags as string[],
      authorId: article.authorId,
      author: author ? {
        name: author.name || 'Unknown',
        image: author.image,
      } : undefined,
      status: article.status as 'draft' | 'published' | 'archived',
      publishedAt: article.publishedAt,
      readTime: article.readTime,
      viewCount: article.viewCount,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
    };
  }
}

export const articleService = new ArticleService();
