/**
 * T088: Records Routes
 * Medical records API endpoints
 */

import { Elysia, t } from 'elysia';
import { recordService, type RecordType } from '../../services/record.service';
import { authMiddleware } from '../../middleware/auth';

export const recordsRoutes = new Elysia({ prefix: '/records' })
  .use(authMiddleware)

  // Upload a medical record
  .post(
    '/',
    async ({ body, user, set }) => {
      if (!user) {
        set.status = 401;
        return { success: false, error: 'Authentication required' };
      }

      try {
        const file = body.file;
        const fileName = body.fileName || 'document';

        const record = await recordService.uploadRecord(
          file as unknown as File,
          fileName,
          {
            patientId: user.id,
            type: body.type as RecordType,
            title: body.title,
            description: body.description,
            recordDate: body.recordDate ? new Date(body.recordDate) : undefined,
          }
        );

        return { success: true, data: record };
      } catch (error) {
        console.error('[Records] Upload error:', error);
        set.status = 400;
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Upload failed',
        };
      }
    },
    {
      body: t.Object({
        file: t.File(),
        fileName: t.Optional(t.String()),
        type: t.String(),
        title: t.String(),
        description: t.Optional(t.String()),
        recordDate: t.Optional(t.String()),
      }),
      detail: {
        tags: ['records'],
        summary: 'Upload a medical record',
      },
    }
  )

  // Get my records
  .get(
    '/my',
    async ({ user, query, set }) => {
      if (!user) {
        set.status = 401;
        return { success: false, error: 'Authentication required' };
      }

      try {
        const result = await recordService.getPatientRecords(user.id, {
          type: query.type as RecordType | undefined,
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
      } catch (error) {
        console.error('[Records] Get error:', error);
        set.status = 400;
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get records',
        };
      }
    },
    {
      query: t.Object({
        type: t.Optional(t.String()),
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
      }),
      detail: {
        tags: ['records'],
        summary: 'Get my medical records',
      },
    }
  )

  // Get a specific record
  .get(
    '/:id',
    async ({ params, user, set }) => {
      if (!user) {
        set.status = 401;
        return { success: false, error: 'Authentication required' };
      }

      try {
        const record = await recordService.getRecord(params.id, user.id);

        if (!record) {
          set.status = 404;
          return { success: false, error: 'Record not found' };
        }

        return { success: true, data: record };
      } catch (error) {
        console.error('[Records] Get error:', error);
        set.status = error instanceof Error && error.message === 'Access denied' ? 403 : 400;
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get record',
        };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ['records'],
        summary: 'Get a specific record',
      },
    }
  )

  // Delete a record
  .delete(
    '/:id',
    async ({ params, user, set }) => {
      if (!user) {
        set.status = 401;
        return { success: false, error: 'Authentication required' };
      }

      try {
        await recordService.deleteRecord(params.id, user.id);
        return { success: true, message: 'Record deleted' };
      } catch (error) {
        console.error('[Records] Delete error:', error);
        set.status = 400;
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Delete failed',
        };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ['records'],
        summary: 'Delete a record',
      },
    }
  )

  // Share record with doctor
  .post(
    '/:id/share',
    async ({ params, body, user, set }) => {
      if (!user) {
        set.status = 401;
        return { success: false, error: 'Authentication required' };
      }

      try {
        await recordService.shareRecord(params.id, user.id, body.doctorId);
        return { success: true, message: 'Record shared' };
      } catch (error) {
        console.error('[Records] Share error:', error);
        set.status = 400;
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Share failed',
        };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        doctorId: t.String(),
      }),
      detail: {
        tags: ['records'],
        summary: 'Share record with a doctor',
      },
    }
  )

  // Revoke record access
  .post(
    '/:id/revoke',
    async ({ params, body, user, set }) => {
      if (!user) {
        set.status = 401;
        return { success: false, error: 'Authentication required' };
      }

      try {
        await recordService.revokeRecordAccess(params.id, user.id, body.doctorId);
        return { success: true, message: 'Access revoked' };
      } catch (error) {
        console.error('[Records] Revoke error:', error);
        set.status = 400;
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Revoke failed',
        };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        doctorId: t.String(),
      }),
      detail: {
        tags: ['records'],
        summary: 'Revoke doctor access to record',
      },
    }
  )

  // Get patient records (doctor access)
  .get(
    '/patient/:patientId',
    async ({ params, user, set }) => {
      if (!user) {
        set.status = 401;
        return { success: false, error: 'Authentication required' };
      }

      if (user.role !== 'doctor' && user.role !== 'admin') {
        set.status = 403;
        return { success: false, error: 'Doctor access required' };
      }

      try {
        const records = await recordService.getDoctorAccessibleRecords(
          user.id,
          params.patientId
        );

        return { success: true, data: records };
      } catch (error) {
        console.error('[Records] Get patient records error:', error);
        set.status = 400;
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get records',
        };
      }
    },
    {
      params: t.Object({
        patientId: t.String(),
      }),
      detail: {
        tags: ['records'],
        summary: 'Get patient records (doctor access)',
      },
    }
  );
