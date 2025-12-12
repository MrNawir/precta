/**
 * T096: Prescriptions Routes
 * Prescription management API endpoints
 */

import { Elysia, t } from 'elysia';
import { prescriptionService } from '../../services/prescription.service';
import { authMiddleware } from '../../middleware/auth';

export const prescriptionsRoutes = new Elysia({ prefix: '/prescriptions' })
  .use(authMiddleware)

  // Create prescription (doctor only)
  .post(
    '/',
    async ({ body, user, set }) => {
      if (!user) {
        set.status = 401;
        return { success: false, error: 'Authentication required' };
      }

      if (user.role !== 'doctor' && user.role !== 'admin') {
        set.status = 403;
        return { success: false, error: 'Only doctors can create prescriptions' };
      }

      try {
        const prescription = await prescriptionService.create({
          appointmentId: body.appointmentId,
          doctorId: user.id,
          patientId: body.patientId,
          medications: body.medications,
          diagnosis: body.diagnosis,
          notes: body.notes,
          validDays: body.validDays,
        });

        return { success: true, data: prescription };
      } catch (error) {
        console.error('[Prescriptions] Create error:', error);
        set.status = 400;
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create prescription',
        };
      }
    },
    {
      body: t.Object({
        appointmentId: t.String(),
        patientId: t.String(),
        medications: t.Array(t.Object({
          name: t.String(),
          dosage: t.String(),
          frequency: t.String(),
          duration: t.String(),
          instructions: t.Optional(t.String()),
          quantity: t.Optional(t.Number()),
        })),
        diagnosis: t.String(),
        notes: t.Optional(t.String()),
        validDays: t.Optional(t.Number()),
      }),
      detail: {
        tags: ['prescriptions'],
        summary: 'Create a prescription (doctor only)',
      },
    }
  )

  // Get my prescriptions (patient)
  .get(
    '/my',
    async ({ user, query, set }) => {
      if (!user) {
        set.status = 401;
        return { success: false, error: 'Authentication required' };
      }

      try {
        const result = await prescriptionService.getPatientPrescriptions(user.id, {
          status: query.status as 'active' | 'expired' | 'fulfilled' | undefined,
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
        console.error('[Prescriptions] Get error:', error);
        set.status = 400;
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get prescriptions',
        };
      }
    },
    {
      query: t.Object({
        status: t.Optional(t.String()),
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
      }),
      detail: {
        tags: ['prescriptions'],
        summary: 'Get my prescriptions (patient)',
      },
    }
  )

  // Get prescriptions I created (doctor)
  .get(
    '/doctor',
    async ({ user, query, set }) => {
      if (!user) {
        set.status = 401;
        return { success: false, error: 'Authentication required' };
      }

      if (user.role !== 'doctor' && user.role !== 'admin') {
        set.status = 403;
        return { success: false, error: 'Doctor access required' };
      }

      try {
        const result = await prescriptionService.getDoctorPrescriptions(user.id, {
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
        console.error('[Prescriptions] Get doctor prescriptions error:', error);
        set.status = 400;
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get prescriptions',
        };
      }
    },
    {
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
      }),
      detail: {
        tags: ['prescriptions'],
        summary: 'Get prescriptions I created (doctor)',
      },
    }
  )

  // Get prescription by ID
  .get(
    '/:id',
    async ({ params, user, set }) => {
      if (!user) {
        set.status = 401;
        return { success: false, error: 'Authentication required' };
      }

      try {
        const prescription = await prescriptionService.getById(params.id, user.id);

        if (!prescription) {
          set.status = 404;
          return { success: false, error: 'Prescription not found' };
        }

        return { success: true, data: prescription };
      } catch (error) {
        console.error('[Prescriptions] Get error:', error);
        set.status = error instanceof Error && error.message === 'Access denied' ? 403 : 400;
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get prescription',
        };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ['prescriptions'],
        summary: 'Get prescription by ID',
      },
    }
  )

  // Get prescription for appointment
  .get(
    '/appointment/:appointmentId',
    async ({ params, user, set }) => {
      if (!user) {
        set.status = 401;
        return { success: false, error: 'Authentication required' };
      }

      try {
        const prescription = await prescriptionService.getByAppointment(params.appointmentId);

        if (!prescription) {
          set.status = 404;
          return { success: false, error: 'Prescription not found' };
        }

        // Check access
        if (prescription.patientId !== user.id && prescription.doctorId !== user.id) {
          set.status = 403;
          return { success: false, error: 'Access denied' };
        }

        return { success: true, data: prescription };
      } catch (error) {
        console.error('[Prescriptions] Get by appointment error:', error);
        set.status = 400;
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get prescription',
        };
      }
    },
    {
      params: t.Object({
        appointmentId: t.String(),
      }),
      detail: {
        tags: ['prescriptions'],
        summary: 'Get prescription for an appointment',
      },
    }
  )

  // Mark prescription as fulfilled
  .post(
    '/:id/fulfill',
    async ({ params, user, set }) => {
      if (!user) {
        set.status = 401;
        return { success: false, error: 'Authentication required' };
      }

      try {
        await prescriptionService.markFulfilled(params.id);
        return { success: true, message: 'Prescription marked as fulfilled' };
      } catch (error) {
        console.error('[Prescriptions] Fulfill error:', error);
        set.status = 400;
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update prescription',
        };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ['prescriptions'],
        summary: 'Mark prescription as fulfilled',
      },
    }
  );
