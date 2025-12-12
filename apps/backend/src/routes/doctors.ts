/**
 * Doctor Routes
 * T041-T050: Doctor profile management and search
 */

import { Elysia, t } from 'elysia';
import { createDbClient } from '@precta/db';
import { doctors, doctorAvailability, reviews } from '@precta/db';
import { eq, ilike, and, gte, desc, sql } from 'drizzle-orm';

const db = createDbClient(process.env.DATABASE_URL!);

export const doctorRoutes = new Elysia({ prefix: '/doctors' })
  // Search doctors
  .get(
    '/',
    async ({ query }) => {
      const { specialty, city, search, page = 1, limit = 10 } = query;
      const offset = (page - 1) * limit;

      // Build query conditions
      const conditions = [eq(doctors.verificationStatus, 'verified')];

      if (specialty) {
        conditions.push(sql`${specialty} = ANY(${doctors.specialties})`);
      }

      // TODO: Add city filter when clinic join is implemented

      if (search) {
        conditions.push(
          sql`(${doctors.firstName} ILIKE ${'%' + search + '%'} OR ${doctors.lastName} ILIKE ${'%' + search + '%'})`
        );
      }

      const results = await db
        .select()
        .from(doctors)
        .where(and(...conditions))
        .orderBy(desc(doctors.averageRating))
        .limit(limit)
        .offset(offset);

      return {
        data: results,
        pagination: {
          page,
          limit,
          hasMore: results.length === limit,
        },
      };
    },
    {
      query: t.Object({
        specialty: t.Optional(t.String()),
        city: t.Optional(t.String()),
        search: t.Optional(t.String()),
        page: t.Optional(t.Number({ default: 1 })),
        limit: t.Optional(t.Number({ default: 10 })),
      }),
      detail: {
        tags: ['doctors'],
        summary: 'Search doctors',
        description: 'Search for verified doctors with optional filters',
      },
    }
  )

  // Get doctor by ID
  .get(
    '/:id',
    async ({ params, set }) => {
      const doctor = await db
        .select()
        .from(doctors)
        .where(eq(doctors.id, params.id))
        .limit(1);

      if (!doctor[0]) {
        set.status = 404;
        return { error: 'Doctor not found' };
      }

      return { data: doctor[0] };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ['doctors'],
        summary: 'Get doctor profile',
        description: 'Get a doctor profile by ID',
      },
    }
  )

  // Get doctor availability
  .get(
    '/:id/availability',
    async ({ params }) => {
      const availability = await db
        .select()
        .from(doctorAvailability)
        .where(
          and(
            eq(doctorAvailability.doctorId, params.id),
            eq(doctorAvailability.isActive, true)
          )
        )
        .orderBy(doctorAvailability.dayOfWeek);

      return { data: availability };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ['doctors'],
        summary: 'Get doctor availability',
        description: 'Get weekly availability slots for a doctor',
      },
    }
  )

  // Get doctor reviews
  .get(
    '/:id/reviews',
    async ({ params, query }) => {
      const { page = 1, limit = 10 } = query;
      const offset = (page - 1) * limit;

      const doctorReviews = await db
        .select()
        .from(reviews)
        .where(
          and(
            eq(reviews.doctorId, params.id),
            eq(reviews.moderationStatus, 'approved')
          )
        )
        .orderBy(desc(reviews.createdAt))
        .limit(limit)
        .offset(offset);

      return {
        data: doctorReviews,
        pagination: {
          page,
          limit,
          hasMore: doctorReviews.length === limit,
        },
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      query: t.Object({
        page: t.Optional(t.Number({ default: 1 })),
        limit: t.Optional(t.Number({ default: 10 })),
      }),
      detail: {
        tags: ['doctors'],
        summary: 'Get doctor reviews',
        description: 'Get approved reviews for a doctor',
      },
    }
  );
