/**
 * T052: Doctors Routes
 * Doctor search, profile, and availability endpoints
 */

import { Elysia, t } from 'elysia';
import { doctorService } from '../../services/doctor.service';
import { searchService } from '../../services/search.service';

export const doctorsRoutes = new Elysia({ prefix: '/doctors' })
  // Search doctors
  .get(
    '/',
    async ({ query }) => {
      const result = await doctorService.search({
        query: query.q,
        specialty: query.specialty,
        city: query.city,
        consultationMode: query.mode as 'in_person' | 'video' | undefined,
        minRating: query.minRating ? parseFloat(query.minRating) : undefined,
        maxFee: query.maxFee ? parseFloat(query.maxFee) : undefined,
        language: query.language,
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 20,
        sortBy: query.sortBy as 'rating' | 'experience' | 'fee' | 'reviews' | undefined,
        sortOrder: query.sortOrder as 'asc' | 'desc' | undefined,
      });

      return {
        success: true,
        data: result.data,
        pagination: result.pagination,
      };
    },
    {
      query: t.Object({
        q: t.Optional(t.String()),
        specialty: t.Optional(t.String()),
        city: t.Optional(t.String()),
        mode: t.Optional(t.String()),
        minRating: t.Optional(t.String()),
        maxFee: t.Optional(t.String()),
        language: t.Optional(t.String()),
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        sortBy: t.Optional(t.String()),
        sortOrder: t.Optional(t.String()),
      }),
      detail: {
        tags: ['doctors'],
        summary: 'Search doctors with filters',
      },
    }
  )

  // Get search suggestions (autocomplete)
  .get(
    '/suggestions',
    async ({ query }) => {
      const suggestions = await searchService.getSuggestions(query.q || '', 'doctors');
      return { success: true, data: suggestions };
    },
    {
      query: t.Object({
        q: t.Optional(t.String()),
      }),
      detail: {
        tags: ['doctors'],
        summary: 'Get search suggestions',
      },
    }
  )

  // Get specialties list
  .get(
    '/specialties',
    async () => {
      // Common specialties in Kenya
      const specialties = [
        { id: 'general_practice', name: 'General Practice', icon: '🩺' },
        { id: 'pediatrics', name: 'Pediatrics', icon: '👶' },
        { id: 'gynecology', name: 'Gynecology & Obstetrics', icon: '👩‍⚕️' },
        { id: 'cardiology', name: 'Cardiology', icon: '❤️' },
        { id: 'dermatology', name: 'Dermatology', icon: '🧴' },
        { id: 'orthopedics', name: 'Orthopedics', icon: '🦴' },
        { id: 'psychiatry', name: 'Psychiatry & Mental Health', icon: '🧠' },
        { id: 'dentistry', name: 'Dentistry', icon: '🦷' },
        { id: 'ophthalmology', name: 'Ophthalmology', icon: '👁️' },
        { id: 'ent', name: 'ENT (Ear, Nose, Throat)', icon: '👂' },
        { id: 'gastroenterology', name: 'Gastroenterology', icon: '🫃' },
        { id: 'neurology', name: 'Neurology', icon: '🧬' },
        { id: 'urology', name: 'Urology', icon: '🫀' },
        { id: 'oncology', name: 'Oncology', icon: '🎗️' },
        { id: 'endocrinology', name: 'Endocrinology', icon: '⚗️' },
        { id: 'pulmonology', name: 'Pulmonology', icon: '🫁' },
        { id: 'rheumatology', name: 'Rheumatology', icon: '💪' },
        { id: 'nephrology', name: 'Nephrology', icon: '🫘' },
        { id: 'physiotherapy', name: 'Physiotherapy', icon: '🏃' },
        { id: 'nutrition', name: 'Nutrition & Dietetics', icon: '🥗' },
      ];

      return { success: true, data: specialties };
    },
    {
      detail: {
        tags: ['doctors'],
        summary: 'Get list of medical specialties',
      },
    }
  )

  // Get doctor by ID
  .get(
    '/:id',
    async ({ params, set }) => {
      const doctor = await doctorService.getById(params.id);

      if (!doctor) {
        set.status = 404;
        return { success: false, error: 'Doctor not found' };
      }

      return { success: true, data: doctor };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ['doctors'],
        summary: 'Get doctor profile by ID',
      },
    }
  )

  // Get doctor availability
  .get(
    '/:id/availability',
    async ({ params, set }) => {
      const availability = await doctorService.getAvailability(params.id);

      return { success: true, data: availability };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ['doctors'],
        summary: 'Get doctor weekly availability schedule',
      },
    }
  )

  // Get available time slots for a specific date
  .get(
    '/:id/slots',
    async ({ params, query, set }) => {
      if (!query.date) {
        set.status = 400;
        return { success: false, error: 'Date is required' };
      }

      const date = new Date(query.date);
      if (isNaN(date.getTime())) {
        set.status = 400;
        return { success: false, error: 'Invalid date format' };
      }

      const slots = await doctorService.getAvailableSlots(params.id, date);

      return {
        success: true,
        data: {
          date: query.date,
          slots,
        },
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      query: t.Object({
        date: t.Optional(t.String()),
      }),
      detail: {
        tags: ['doctors'],
        summary: 'Get available time slots for a specific date',
      },
    }
  )

  // Get doctor reviews (placeholder)
  .get(
    '/:id/reviews',
    async ({ params, query }) => {
      // TODO: Implement review service
      return {
        success: true,
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          hasMore: false,
        },
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
      }),
      detail: {
        tags: ['doctors'],
        summary: 'Get doctor reviews',
      },
    }
  );
