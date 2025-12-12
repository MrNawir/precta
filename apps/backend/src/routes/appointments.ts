/**
 * Appointment Routes
 * T061-T070: Appointment booking and management
 */

import { Elysia, t } from 'elysia';
import { createDbClient } from '@precta/db';
import { appointments, doctors, patients, payments } from '@precta/db';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

const db = createDbClient(process.env.DATABASE_URL!);

export const appointmentRoutes = new Elysia({ prefix: '/appointments' })
  // Get available slots for a doctor on a date
  .get(
    '/slots/:doctorId',
    async ({ params, query, set }) => {
      const { date } = query;
      
      // Get doctor info
      const doctor = await db
        .select()
        .from(doctors)
        .where(eq(doctors.id, params.doctorId))
        .limit(1);

      if (!doctor[0]) {
        set.status = 404;
        return { error: 'Doctor not found' };
      }

      // Get existing appointments for the date
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const existingAppointments = await db
        .select()
        .from(appointments)
        .where(
          and(
            eq(appointments.doctorId, params.doctorId),
            gte(appointments.scheduledAt, startOfDay),
            lte(appointments.scheduledAt, endOfDay)
          )
        );

      // TODO: Generate available slots based on doctor availability and existing appointments

      return {
        data: {
          doctorId: params.doctorId,
          date,
          bookedSlots: existingAppointments.map((a) => a.scheduledAt),
          // availableSlots will be calculated based on availability
        },
      };
    },
    {
      params: t.Object({
        doctorId: t.String(),
      }),
      query: t.Object({
        date: t.String({ format: 'date' }),
      }),
      detail: {
        tags: ['appointments'],
        summary: 'Get available slots',
        description: 'Get available appointment slots for a doctor on a specific date',
      },
    }
  )

  // Create appointment
  .post(
    '/',
    async ({ body, set }) => {
      const { patientId, doctorId, scheduledAt, consultationType, notes } = body;

      // Verify patient exists
      const patient = await db
        .select()
        .from(patients)
        .where(eq(patients.id, patientId))
        .limit(1);

      if (!patient[0]) {
        set.status = 404;
        return { error: 'Patient not found' };
      }

      // Verify doctor exists and is verified
      const doctor = await db
        .select()
        .from(doctors)
        .where(
          and(
            eq(doctors.id, doctorId),
            eq(doctors.verificationStatus, 'verified')
          )
        )
        .limit(1);

      if (!doctor[0]) {
        set.status = 404;
        return { error: 'Doctor not found or not verified' };
      }

      // Check slot availability
      const existingAppointment = await db
        .select()
        .from(appointments)
        .where(
          and(
            eq(appointments.doctorId, doctorId),
            eq(appointments.scheduledAt, new Date(scheduledAt))
          )
        )
        .limit(1);

      if (existingAppointment[0]) {
        set.status = 409;
        return { error: 'Slot already booked' };
      }

      // Create appointment
      const [newAppointment] = await db
        .insert(appointments)
        .values({
          patientId,
          doctorId,
          clinicId: doctor[0].clinicId,
          scheduledAt: new Date(scheduledAt),
          durationMinutes: doctor[0].consultationDurationMinutes,
          consultationType,
          status: 'pending_payment',
          notes,
        })
        .returning();

      return {
        data: newAppointment,
        message: 'Appointment created. Please proceed to payment.',
      };
    },
    {
      body: t.Object({
        patientId: t.String(),
        doctorId: t.String(),
        scheduledAt: t.String({ format: 'date-time' }),
        consultationType: t.Union([t.Literal('in_person'), t.Literal('video')]),
        notes: t.Optional(t.String()),
      }),
      detail: {
        tags: ['appointments'],
        summary: 'Create appointment',
        description: 'Book a new appointment with a doctor',
      },
    }
  )

  // Get user appointments
  .get(
    '/my',
    async ({ query }) => {
      const { userId, status, page = 1, limit = 10 } = query;
      const offset = (page - 1) * limit;

      const conditions = [eq(appointments.patientId, userId)];
      
      if (status) {
        conditions.push(eq(appointments.status, status));
      }

      const userAppointments = await db
        .select()
        .from(appointments)
        .where(and(...conditions))
        .orderBy(desc(appointments.scheduledAt))
        .limit(limit)
        .offset(offset);

      return {
        data: userAppointments,
        pagination: {
          page,
          limit,
          hasMore: userAppointments.length === limit,
        },
      };
    },
    {
      query: t.Object({
        userId: t.String(),
        status: t.Optional(
          t.Union([
            t.Literal('pending_payment'),
            t.Literal('confirmed'),
            t.Literal('in_progress'),
            t.Literal('completed'),
            t.Literal('cancelled'),
            t.Literal('no_show'),
          ])
        ),
        page: t.Optional(t.Number({ default: 1 })),
        limit: t.Optional(t.Number({ default: 10 })),
      }),
      detail: {
        tags: ['appointments'],
        summary: 'Get my appointments',
        description: 'Get appointments for the current user',
      },
    }
  )

  // Cancel appointment
  .delete(
    '/:id',
    async ({ params, body, set }) => {
      const { userId, reason } = body;

      const appointment = await db
        .select()
        .from(appointments)
        .where(eq(appointments.id, params.id))
        .limit(1);

      if (!appointment[0]) {
        set.status = 404;
        return { error: 'Appointment not found' };
      }

      // Check if cancellation is allowed (e.g., not too close to scheduled time)
      const now = new Date();
      const scheduledAt = new Date(appointment[0].scheduledAt);
      const hoursUntil = (scheduledAt.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursUntil < 2) {
        set.status = 400;
        return { error: 'Cannot cancel appointment less than 2 hours before scheduled time' };
      }

      // Update appointment status
      const [updated] = await db
        .update(appointments)
        .set({
          status: 'cancelled',
          cancellationReason: reason,
          cancelledAt: new Date(),
          cancelledBy: userId,
          updatedAt: new Date(),
        })
        .where(eq(appointments.id, params.id))
        .returning();

      return {
        data: updated,
        message: 'Appointment cancelled successfully',
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        userId: t.String(),
        reason: t.Optional(t.String()),
      }),
      detail: {
        tags: ['appointments'],
        summary: 'Cancel appointment',
        description: 'Cancel an existing appointment',
      },
    }
  );
