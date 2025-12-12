/**
 * T120: Articles Routes
 * CRUD operations for health articles
 */

import { Elysia, t } from 'elysia';
import { articleService } from '../../services/article.service';

const articleRoutes = new Elysia({ prefix: '/articles' })
  /**
   * GET /articles - List articles with filtering
   */
  .get('/', async ({ query }) => {
    try {
      const result = await articleService.list({
        category: query.category as any,
        status: (query.status as any) || 'published',
        search: query.search,
        page: query.page ? parseInt(query.page) : 1,
        limit: query.limit ? parseInt(query.limit) : 10,
      });

      return {
        success: true,
        data: result.data,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit),
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch articles',
      };
    }
  }, {
    query: t.Object({
      category: t.Optional(t.String()),
      status: t.Optional(t.String()),
      search: t.Optional(t.String()),
      page: t.Optional(t.String()),
      limit: t.Optional(t.String()),
    }),
  })

  /**
   * GET /articles/:slugOrId - Get single article
   */
  .get('/:slugOrId', async ({ params }) => {
    try {
      const article = await articleService.getBySlug(params.slugOrId);
      
      if (!article) {
        return {
          success: false,
          error: 'Article not found',
        };
      }

      // Increment view count
      await articleService.incrementViewCount(article.id);

      return {
        success: true,
        data: article,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch article',
      };
    }
  }, {
    params: t.Object({
      slugOrId: t.String(),
    }),
  })

  /**
   * POST /articles - Create new article (admin only)
   */
  .post('/', async ({ body, set }) => {
    try {
      // TODO: Add admin auth check
      const article = await articleService.create({
        ...body,
        authorId: 'admin', // TODO: Get from auth context
      });

      set.status = 201;
      return {
        success: true,
        data: article,
      };
    } catch (error: any) {
      set.status = 400;
      return {
        success: false,
        error: error.message || 'Failed to create article',
      };
    }
  }, {
    body: t.Object({
      title: t.String({ minLength: 1 }),
      slug: t.Optional(t.String()),
      excerpt: t.String({ minLength: 1 }),
      content: t.String({ minLength: 1 }),
      coverImage: t.Optional(t.String()),
      category: t.Union([
        t.Literal('wellness'),
        t.Literal('prevention'),
        t.Literal('disease'),
        t.Literal('nutrition'),
        t.Literal('mental_health'),
        t.Literal('fitness'),
        t.Literal('news'),
      ]),
      tags: t.Optional(t.Array(t.String())),
      status: t.Optional(t.Union([
        t.Literal('draft'),
        t.Literal('published'),
        t.Literal('archived'),
      ])),
      readTime: t.Optional(t.Number()),
    }),
  })

  /**
   * PUT /articles/:id - Update article (admin only)
   */
  .put('/:id', async ({ params, body, set }) => {
    try {
      // TODO: Add admin auth check
      const article = await articleService.update(params.id, body);

      if (!article) {
        set.status = 404;
        return {
          success: false,
          error: 'Article not found',
        };
      }

      return {
        success: true,
        data: article,
      };
    } catch (error: any) {
      set.status = 400;
      return {
        success: false,
        error: error.message || 'Failed to update article',
      };
    }
  }, {
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      title: t.Optional(t.String()),
      slug: t.Optional(t.String()),
      excerpt: t.Optional(t.String()),
      content: t.Optional(t.String()),
      coverImage: t.Optional(t.String()),
      category: t.Optional(t.Union([
        t.Literal('wellness'),
        t.Literal('prevention'),
        t.Literal('disease'),
        t.Literal('nutrition'),
        t.Literal('mental_health'),
        t.Literal('fitness'),
        t.Literal('news'),
      ])),
      tags: t.Optional(t.Array(t.String())),
      status: t.Optional(t.Union([
        t.Literal('draft'),
        t.Literal('published'),
        t.Literal('archived'),
      ])),
      readTime: t.Optional(t.Number()),
    }),
  })

  /**
   * DELETE /articles/:id - Delete article (admin only)
   */
  .delete('/:id', async ({ params, set }) => {
    try {
      // TODO: Add admin auth check
      const deleted = await articleService.delete(params.id);

      if (!deleted) {
        set.status = 404;
        return {
          success: false,
          error: 'Article not found',
        };
      }

      return {
        success: true,
        message: 'Article deleted',
      };
    } catch (error: any) {
      set.status = 400;
      return {
        success: false,
        error: error.message || 'Failed to delete article',
      };
    }
  }, {
    params: t.Object({
      id: t.String(),
    }),
  })

  /**
   * GET /articles/categories/list - Get article categories with counts
   */
  .get('/categories/list', async () => {
    try {
      const categories = [
        { value: 'wellness', label: 'Wellness', icon: '🌿' },
        { value: 'prevention', label: 'Prevention', icon: '🛡️' },
        { value: 'disease', label: 'Disease', icon: '🏥' },
        { value: 'nutrition', label: 'Nutrition', icon: '🥗' },
        { value: 'mental_health', label: 'Mental Health', icon: '🧠' },
        { value: 'fitness', label: 'Fitness', icon: '💪' },
        { value: 'news', label: 'Health News', icon: '📰' },
      ];

      return {
        success: true,
        data: categories,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  });

export default articleRoutes;
