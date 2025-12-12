/**
 * T129: Admin Moderation Routes
 * Content moderation for reviews, doctor verifications, and reports
 */

import { Elysia, t } from 'elysia';
import { reviewService } from '../../../services/review.service';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../../../lib/db';
import { doctors, reviews } from '@precta/db';

const adminModerationRoutes = new Elysia({ prefix: '/admin/moderation' })
  /**
   * GET /admin/moderation - Get all pending moderation items
   */
  .get('/', async ({ query }) => {
    try {
      // TODO: Add admin auth check
      const type = query.type;
      const page = query.page ? parseInt(query.page) : 1;
      const limit = query.limit ? parseInt(query.limit) : 20;
      const offset = (page - 1) * limit;

      const items: any[] = [];

      // Fetch pending reviews
      if (!type || type === 'review') {
        const pendingReviews = await reviewService.getPendingReviews({ page, limit });
        for (const review of pendingReviews.data) {
          items.push({
            id: review.id,
            type: 'review' as const,
            title: `Review for Doctor`,
            content: review.content,
            submittedBy: review.patient?.name || 'Anonymous',
            submittedAt: review.createdAt.toISOString(),
            status: review.status,
            metadata: {
              rating: review.rating,
              doctorId: review.doctorId,
            },
          });
        }
      }

      // Fetch pending doctor verifications
      if (!type || type === 'doctor') {
        const pendingDoctors = await db
          .select()
          .from(doctors)
          .where(eq(doctors.verificationStatus, 'pending'))
          .orderBy(desc(doctors.createdAt))
          .limit(limit)
          .offset(offset);

        for (const doctor of pendingDoctors) {
          items.push({
            id: doctor.id,
            type: 'doctor' as const,
            title: 'Doctor Verification Request',
            content: `${doctor.firstName} ${doctor.lastName} - ${doctor.specialties?.[0] || 'General Practice'}`,
            submittedBy: doctor.email || 'N/A',
            submittedAt: doctor.createdAt.toISOString(),
            status: 'pending',
            metadata: {
              specialties: doctor.specialties,
              licenseNumber: doctor.licenseNumber,
            },
          });
        }
      }

      // Sort by date
      items.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

      return {
        success: true,
        data: items.slice(0, limit),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch moderation items',
      };
    }
  }, {
    query: t.Object({
      type: t.Optional(t.Union([t.Literal('review'), t.Literal('doctor'), t.Literal('report')])),
      page: t.Optional(t.String()),
      limit: t.Optional(t.String()),
    }),
  })

  /**
   * POST /admin/moderation/:id/approve - Approve an item
   */
  .post('/:id/approve', async ({ params, query, set }) => {
    try {
      // TODO: Add admin auth check
      const type = query.type || 'review';

      if (type === 'review') {
        const review = await reviewService.moderate(params.id, 'approved');
        return {
          success: true,
          data: review,
          message: 'Review approved',
        };
      }

      if (type === 'doctor') {
        await db
          .update(doctors)
          .set({
            verificationStatus: 'verified',
            updatedAt: new Date(),
          })
          .where(eq(doctors.id, params.id));

        return {
          success: true,
          message: 'Doctor verified',
        };
      }

      set.status = 400;
      return {
        success: false,
        error: 'Invalid moderation type',
      };
    } catch (error: any) {
      set.status = 400;
      return {
        success: false,
        error: error.message || 'Failed to approve item',
      };
    }
  }, {
    params: t.Object({
      id: t.String(),
    }),
    query: t.Object({
      type: t.Optional(t.Union([t.Literal('review'), t.Literal('doctor'), t.Literal('report')])),
    }),
  })

  /**
   * POST /admin/moderation/:id/reject - Reject an item
   */
  .post('/:id/reject', async ({ params, query, body, set }) => {
    try {
      // TODO: Add admin auth check
      const type = query.type || 'review';

      if (type === 'review') {
        const review = await reviewService.moderate(params.id, 'rejected', body?.reason);
        return {
          success: true,
          data: review,
          message: 'Review rejected',
        };
      }

      if (type === 'doctor') {
        await db
          .update(doctors)
          .set({
            verificationStatus: 'rejected',
            updatedAt: new Date(),
          })
          .where(eq(doctors.id, params.id));

        return {
          success: true,
          message: 'Doctor verification rejected',
        };
      }

      set.status = 400;
      return {
        success: false,
        error: 'Invalid moderation type',
      };
    } catch (error: any) {
      set.status = 400;
      return {
        success: false,
        error: error.message || 'Failed to reject item',
      };
    }
  }, {
    params: t.Object({
      id: t.String(),
    }),
    query: t.Object({
      type: t.Optional(t.Union([t.Literal('review'), t.Literal('doctor'), t.Literal('report')])),
    }),
    body: t.Optional(t.Object({
      reason: t.Optional(t.String()),
    })),
  })

  /**
   * GET /admin/moderation/stats - Get moderation queue stats
   */
  .get('/stats', async () => {
    try {
      // TODO: Add admin auth check
      
      // Count pending reviews
      const pendingReviews = await reviewService.getPendingReviews({ limit: 1 });
      
      // Count pending doctors
      const pendingDoctors = await db
        .select()
        .from(doctors)
        .where(eq(doctors.verificationStatus, 'pending'));

      return {
        success: true,
        data: {
          reviews: pendingReviews.total,
          doctors: pendingDoctors.length,
          reports: 0, // TODO: Implement reports
          total: pendingReviews.total + pendingDoctors.length,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch stats',
      };
    }
  });

export default adminModerationRoutes;
