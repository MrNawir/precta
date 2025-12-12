/**
 * T080: Consultations Routes
 * Video consultation endpoints
 */

import { Elysia, t } from 'elysia';
import { consultationService } from '../../services/consultation.service';
import { hmsClient } from '../../lib/hms';
import { authMiddleware } from '../../middleware/auth';

export const consultationsRoutes = new Elysia({ prefix: '/consultations' })
  .use(authMiddleware)

  // Get consultation session (join)
  .get(
    '/:id/session',
    async ({ params, user, set }) => {
      if (!user) {
        set.status = 401;
        return { success: false, error: 'Authentication required' };
      }

      try {
        const session = await consultationService.getSession(params.id, user.id);

        if (!session) {
          set.status = 404;
          return { success: false, error: 'Consultation not found' };
        }

        // Generate fresh token for user
        const role = user.id === session.doctorId ? 'host' : 'guest';
        const token = await hmsClient.generateAuthToken(session.roomId, user.id, role);

        return {
          success: true,
          data: {
            ...session,
            token: token.token,
            role,
          },
        };
      } catch (error) {
        console.error('[Consultations] Get session error:', error);
        set.status = 400;
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get session',
        };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ['consultations'],
        summary: 'Get consultation session for joining',
      },
    }
  )

  // Start consultation (doctor only)
  .post(
    '/:id/start',
    async ({ params, user, set }) => {
      if (!user) {
        set.status = 401;
        return { success: false, error: 'Authentication required' };
      }

      if (user.role !== 'doctor' && user.role !== 'admin') {
        set.status = 403;
        return { success: false, error: 'Only doctors can start consultations' };
      }

      try {
        const session = await consultationService.startSession(params.id);

        if (!session) {
          set.status = 400;
          return { success: false, error: 'Failed to start consultation' };
        }

        // Generate token for doctor
        const token = await hmsClient.generateAuthToken(session.roomId, user.id, 'host');

        return {
          success: true,
          data: {
            ...session,
            token: token.token,
          },
        };
      } catch (error) {
        console.error('[Consultations] Start error:', error);
        set.status = 400;
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to start consultation',
        };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ['consultations'],
        summary: 'Start consultation session (doctor only)',
      },
    }
  )

  // End consultation
  .post(
    '/:id/end',
    async ({ params, user, set }) => {
      if (!user) {
        set.status = 401;
        return { success: false, error: 'Authentication required' };
      }

      try {
        await consultationService.endSession(params.id, user.id);
        return { success: true, message: 'Consultation ended' };
      } catch (error) {
        console.error('[Consultations] End error:', error);
        set.status = 400;
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to end consultation',
        };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ['consultations'],
        summary: 'End consultation session',
      },
    }
  )

  // Get consultation notes
  .get(
    '/:id/notes',
    async ({ params, user, set }) => {
      if (!user) {
        set.status = 401;
        return { success: false, error: 'Authentication required' };
      }

      try {
        const notes = await consultationService.getNotes(params.id, user.id);
        return { success: true, data: notes };
      } catch (error) {
        console.error('[Consultations] Get notes error:', error);
        set.status = 400;
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get notes',
        };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ['consultations'],
        summary: 'Get consultation notes',
      },
    }
  )

  // Add/Update consultation notes (doctor only)
  .post(
    '/:id/notes',
    async ({ params, body, user, set }) => {
      if (!user) {
        set.status = 401;
        return { success: false, error: 'Authentication required' };
      }

      if (user.role !== 'doctor' && user.role !== 'admin') {
        set.status = 403;
        return { success: false, error: 'Only doctors can add notes' };
      }

      try {
        const notes = await consultationService.addNotes(params.id, user.id, {
          diagnosis: body.diagnosis,
          symptoms: body.symptoms,
          prescription: body.prescription,
          followUpDate: body.followUpDate ? new Date(body.followUpDate) : undefined,
          notes: body.notes,
        });

        return { success: true, data: notes };
      } catch (error) {
        console.error('[Consultations] Add notes error:', error);
        set.status = 400;
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to add notes',
        };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        diagnosis: t.Optional(t.String()),
        symptoms: t.Optional(t.Array(t.String())),
        prescription: t.Optional(t.String()),
        followUpDate: t.Optional(t.String()),
        notes: t.Optional(t.String()),
      }),
      detail: {
        tags: ['consultations'],
        summary: 'Add or update consultation notes (doctor only)',
      },
    }
  )

  // Get patient consultation history
  .get(
    '/history',
    async ({ user, query, set }) => {
      if (!user) {
        set.status = 401;
        return { success: false, error: 'Authentication required' };
      }

      try {
        const result = await consultationService.getPatientHistory(user.id, {
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
        console.error('[Consultations] History error:', error);
        set.status = 400;
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get history',
        };
      }
    },
    {
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
      }),
      detail: {
        tags: ['consultations'],
        summary: 'Get patient consultation history',
      },
    }
  );
