/**
 * T070: Admin Verification Routes
 * Admin endpoints for doctor verification
 */

import { Elysia, t } from 'elysia';
import { adminService } from '../../../services/admin.service';
import { authMiddleware, requireRole } from '../../../middleware/auth';

export const adminVerificationRoutes = new Elysia({ prefix: '/admin/verifications' })
  .use(authMiddleware)

  // Get pending verifications
  .get(
    '/',
    async ({ user, query, set }) => {
      if (!user || user.role !== 'admin') {
        set.status = 403;
        return { success: false, error: 'Admin access required' };
      }

      const result = await adminService.getPendingVerifications({
        status: query.status as any,
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 20,
      });

      return {
        success: true,
        data: result.data,
        pagination: {
          page: query.page ? parseInt(query.page, 10) : 1,
          limit: query.limit ? parseInt(query.limit, 10) : 20,
          total: result.total,
        },
      };
    },
    {
      query: t.Object({
        status: t.Optional(t.String()),
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
      }),
      detail: {
        tags: ['admin'],
        summary: 'Get pending verification requests',
      },
    }
  )

  // Get single verification
  .get(
    '/:id',
    async ({ user, params, set }) => {
      if (!user || user.role !== 'admin') {
        set.status = 403;
        return { success: false, error: 'Admin access required' };
      }

      const request = await adminService.getVerificationRequest(params.id);

      if (!request) {
        set.status = 404;
        return { success: false, error: 'Verification request not found' };
      }

      return { success: true, data: request };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ['admin'],
        summary: 'Get verification request details',
      },
    }
  )

  // Approve verification
  .post(
    '/:id/approve',
    async ({ user, params, body, set }) => {
      if (!user || user.role !== 'admin') {
        set.status = 403;
        return { success: false, error: 'Admin access required' };
      }

      const success = await adminService.processVerification({
        doctorId: params.id,
        status: 'verified',
        notes: body?.notes,
        reviewedBy: user.id,
      });

      if (!success) {
        set.status = 400;
        return { success: false, error: 'Approval failed' };
      }

      return { success: true, message: 'Doctor verified successfully' };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Optional(t.Object({
        notes: t.Optional(t.String()),
      })),
      detail: {
        tags: ['admin'],
        summary: 'Approve doctor verification',
      },
    }
  )

  // Reject verification
  .post(
    '/:id/reject',
    async ({ user, params, body, set }) => {
      if (!user || user.role !== 'admin') {
        set.status = 403;
        return { success: false, error: 'Admin access required' };
      }

      const success = await adminService.processVerification({
        doctorId: params.id,
        status: 'rejected',
        notes: body?.reason,
        reviewedBy: user.id,
      });

      if (!success) {
        set.status = 400;
        return { success: false, error: 'Rejection failed' };
      }

      return { success: true, message: 'Doctor verification rejected' };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Optional(t.Object({
        reason: t.Optional(t.String()),
      })),
      detail: {
        tags: ['admin'],
        summary: 'Reject doctor verification',
      },
    }
  )

  // Mark as under review
  .post(
    '/:id/review',
    async ({ user, params, set }) => {
      if (!user || user.role !== 'admin') {
        set.status = 403;
        return { success: false, error: 'Admin access required' };
      }

      const success = await adminService.markUnderReview(params.id);

      if (!success) {
        set.status = 400;
        return { success: false, error: 'Update failed' };
      }

      return { success: true, message: 'Marked as under review' };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ['admin'],
        summary: 'Mark verification as under review',
      },
    }
  )

  // Get admin stats
  .get(
    '/stats',
    async ({ user, set }) => {
      if (!user || user.role !== 'admin') {
        set.status = 403;
        return { success: false, error: 'Admin access required' };
      }

      const stats = await adminService.getStats();
      return { success: true, data: stats };
    },
    {
      detail: {
        tags: ['admin'],
        summary: 'Get admin dashboard statistics',
      },
    }
  );
