/**
 * T136: Reviews Routes
 * Doctor reviews and ratings API
 */

import { Elysia, t } from 'elysia';
import { reviewService } from '../../services/review.service';

const reviewRoutes = new Elysia({ prefix: '/reviews' })
  /**
   * POST /reviews - Create a new review
   */
  .post('/', async ({ body, set }) => {
    try {
      // TODO: Get patientId from auth context
      const review = await reviewService.create({
        appointmentId: body.appointmentId,
        patientId: body.patientId || 'anonymous', // TODO: Get from auth
        rating: body.rating,
        title: body.title,
        content: body.content,
        isAnonymous: body.isAnonymous,
      });

      set.status = 201;
      return {
        success: true,
        data: review,
      };
    } catch (error: any) {
      set.status = 400;
      return {
        success: false,
        error: error.message || 'Failed to create review',
      };
    }
  }, {
    body: t.Object({
      appointmentId: t.String(),
      patientId: t.Optional(t.String()),
      rating: t.Number({ minimum: 1, maximum: 5 }),
      title: t.Optional(t.String()),
      content: t.String({ minLength: 10 }),
      isAnonymous: t.Optional(t.Boolean()),
    }),
  })

  /**
   * GET /reviews/doctor/:doctorId - Get reviews for a doctor
   */
  .get('/doctor/:doctorId', async ({ params, query }) => {
    try {
      const result = await reviewService.getByDoctorId(params.doctorId, {
        page: query.page ? parseInt(query.page) : 1,
        limit: query.limit ? parseInt(query.limit) : 10,
      });

      return {
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch reviews',
      };
    }
  }, {
    params: t.Object({
      doctorId: t.String(),
    }),
    query: t.Object({
      page: t.Optional(t.String()),
      limit: t.Optional(t.String()),
    }),
  })

  /**
   * GET /reviews/doctor/:doctorId/summary - Get rating summary
   */
  .get('/doctor/:doctorId/summary', async ({ params }) => {
    try {
      const summary = await reviewService.getDoctorRatingSummary(params.doctorId);

      return {
        success: true,
        data: summary,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch summary',
      };
    }
  }, {
    params: t.Object({
      doctorId: t.String(),
    }),
  })

  /**
   * GET /reviews/pending - Get pending reviews for moderation (admin only)
   */
  .get('/pending', async ({ query }) => {
    try {
      // TODO: Add admin auth check
      const result = await reviewService.getPendingReviews({
        page: query.page ? parseInt(query.page) : 1,
        limit: query.limit ? parseInt(query.limit) : 20,
      });

      return {
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch pending reviews',
      };
    }
  }, {
    query: t.Object({
      page: t.Optional(t.String()),
      limit: t.Optional(t.String()),
    }),
  })

  /**
   * POST /reviews/:id/moderate - Moderate a review (admin only)
   */
  .post('/:id/moderate', async ({ params, body, set }) => {
    try {
      // TODO: Add admin auth check
      const review = await reviewService.moderate(
        params.id,
        body.status,
        body.reason
      );

      return {
        success: true,
        data: review,
      };
    } catch (error: any) {
      set.status = 400;
      return {
        success: false,
        error: error.message || 'Failed to moderate review',
      };
    }
  }, {
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      status: t.Union([t.Literal('approved'), t.Literal('rejected')]),
      reason: t.Optional(t.String()),
    }),
  })

  /**
   * DELETE /reviews/:id - Delete a review (admin only)
   */
  .delete('/:id', async ({ params, set }) => {
    try {
      // TODO: Add admin auth check
      const deleted = await reviewService.delete(params.id);

      if (!deleted) {
        set.status = 404;
        return {
          success: false,
          error: 'Review not found',
        };
      }

      return {
        success: true,
        message: 'Review deleted',
      };
    } catch (error: any) {
      set.status = 400;
      return {
        success: false,
        error: error.message || 'Failed to delete review',
      };
    }
  }, {
    params: t.Object({
      id: t.String(),
    }),
  });

export default reviewRoutes;
