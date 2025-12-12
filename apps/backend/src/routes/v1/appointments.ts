/**
 * T053: Appointments Routes
 * Appointment booking, listing, and management endpoints
 */

import { Elysia, t } from 'elysia';
import { appointmentService } from '../../services/appointment.service';
import { authMiddleware, requireAuth } from '../../middleware/auth';

export const appointmentsRoutes = new Elysia({ prefix: '/appointments' })
  .use(authMiddleware)

  // Book appointment
  .post(
    '/',
    async ({ body, user, set }) => {
      if (!user) {
        set.status = 401;
        return { success: false, error: 'Authentication required' };
      }

      try {
        const appointment = await appointmentService.book({
          patientId: user.id,
          doctorId: body.doctorId,
          scheduledAt: new Date(body.scheduledAt),
          consultationType: body.consultationType,
          notes: body.notes,
          clinicId: body.clinicId,
        });

        return {
          success: true,
          data: appointment,
        };
      } catch (error) {
        console.error('[Appointments] Booking error:', error);
        set.status = 400;
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Booking failed',
        };
      }
    },
    {
      body: t.Object({
        doctorId: t.String(),
        scheduledAt: t.String(), // ISO date string
        consultationType: t.Union([t.Literal('in_person'), t.Literal('video')]),
        notes: t.Optional(t.String()),
        clinicId: t.Optional(t.String()),
      }),
      detail: {
        tags: ['appointments'],
        summary: 'Book a new appointment',
      },
    }
  )

  // Get my appointments (patient)
  .get(
    '/my',
    async ({ user, query, set }) => {
      if (!user) {
        set.status = 401;
        return { success: false, error: 'Authentication required' };
      }

      const result = await appointmentService.getByPatient(user.id, {
        status: query.status as any,
        upcoming: query.upcoming === 'true',
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
          hasMore: result.total > (parseInt(query.page || '1', 10) * parseInt(query.limit || '20', 10)),
        },
      };
    },
    {
      query: t.Object({
        status: t.Optional(t.String()),
        upcoming: t.Optional(t.String()),
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
      }),
      detail: {
        tags: ['appointments'],
        summary: 'Get my appointments as a patient',
      },
    }
  )

  // Get appointments for doctor
  .get(
    '/doctor',
    async ({ user, query, set }) => {
      if (!user) {
        set.status = 401;
        return { success: false, error: 'Authentication required' };
      }

      if (user.role !== 'doctor' && user.role !== 'admin') {
        set.status = 403;
        return { success: false, error: 'Access denied' };
      }

      const result = await appointmentService.getByDoctor(user.id, {
        date: query.date ? new Date(query.date) : undefined,
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
        date: t.Optional(t.String()),
        status: t.Optional(t.String()),
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
      }),
      detail: {
        tags: ['appointments'],
        summary: 'Get appointments as a doctor',
      },
    }
  )

  // Get appointment by ID
  .get(
    '/:id',
    async ({ params, user, set }) => {
      if (!user) {
        set.status = 401;
        return { success: false, error: 'Authentication required' };
      }

      const appointment = await appointmentService.getById(params.id);

      if (!appointment) {
        set.status = 404;
        return { success: false, error: 'Appointment not found' };
      }

      // Check access
      if (
        appointment.patientId !== user.id &&
        appointment.doctorId !== user.id &&
        user.role !== 'admin'
      ) {
        set.status = 403;
        return { success: false, error: 'Access denied' };
      }

      return { success: true, data: appointment };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ['appointments'],
        summary: 'Get appointment by ID',
      },
    }
  )

  // Cancel appointment
  .post(
    '/:id/cancel',
    async ({ params, body, user, set }) => {
      if (!user) {
        set.status = 401;
        return { success: false, error: 'Authentication required' };
      }

      const appointment = await appointmentService.getById(params.id);

      if (!appointment) {
        set.status = 404;
        return { success: false, error: 'Appointment not found' };
      }

      // Check access
      if (
        appointment.patientId !== user.id &&
        appointment.doctorId !== user.id &&
        user.role !== 'admin'
      ) {
        set.status = 403;
        return { success: false, error: 'Access denied' };
      }

      try {
        const updated = await appointmentService.cancel(
          params.id,
          user.id,
          body?.reason
        );

        return { success: true, data: updated };
      } catch (error) {
        set.status = 400;
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Cancellation failed',
        };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Optional(t.Object({
        reason: t.Optional(t.String()),
      })),
      detail: {
        tags: ['appointments'],
        summary: 'Cancel an appointment',
      },
    }
  )

  // Start appointment (doctor only)
  .post(
    '/:id/start',
    async ({ params, user, set }) => {
      if (!user) {
        set.status = 401;
        return { success: false, error: 'Authentication required' };
      }

      const appointment = await appointmentService.getById(params.id);

      if (!appointment) {
        set.status = 404;
        return { success: false, error: 'Appointment not found' };
      }

      if (appointment.doctorId !== user.id && user.role !== 'admin') {
        set.status = 403;
        return { success: false, error: 'Only the doctor can start the appointment' };
      }

      const updated = await appointmentService.start(params.id);
      return { success: true, data: updated };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ['appointments'],
        summary: 'Start an appointment (doctor only)',
      },
    }
  )

  // Complete appointment (doctor only)
  .post(
    '/:id/complete',
    async ({ params, user, set }) => {
      if (!user) {
        set.status = 401;
        return { success: false, error: 'Authentication required' };
      }

      const appointment = await appointmentService.getById(params.id);

      if (!appointment) {
        set.status = 404;
        return { success: false, error: 'Appointment not found' };
      }

      if (appointment.doctorId !== user.id && user.role !== 'admin') {
        set.status = 403;
        return { success: false, error: 'Only the doctor can complete the appointment' };
      }

      const updated = await appointmentService.complete(params.id);
      return { success: true, data: updated };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ['appointments'],
        summary: 'Complete an appointment (doctor only)',
      },
    }
  );
