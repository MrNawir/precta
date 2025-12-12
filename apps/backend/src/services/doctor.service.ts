/**
 * T046: Doctor Service
 * Business logic for doctor profiles, search, and availability
 */

import { eq, and, ilike, gte, lte, sql, desc, asc, or } from 'drizzle-orm';
import { db } from '../lib/db';
import { doctors, doctorAvailability, users, clinics } from '@precta/db';
import { cache, CACHE_KEYS, CACHE_TTL } from '../lib/redis';
import { index, search } from '../lib/typesense';

export interface DoctorSearchParams {
  query?: string;
  specialty?: string;
  city?: string;
  consultationMode?: 'in_person' | 'video';
  minRating?: number;
  maxFee?: number;
  language?: string;
  page?: number;
  limit?: number;
  sortBy?: 'rating' | 'experience' | 'fee' | 'reviews';
  sortOrder?: 'asc' | 'desc';
}

export interface DoctorProfile {
  id: string;
  firstName: string;
  lastName: string;
  bio: string | null;
  profileImageUrl: string | null;
  specialties: string[];
  languages: string[];
  qualifications: unknown;
  licenseNumber: string | null;
  yearsOfExperience: number | null;
  consultationFee: string;
  consultationDurationMinutes: number;
  consultationModes: string[];
  verificationStatus: string;
  averageRating: string;
  totalReviews: number;
  totalConsultations: number;
  clinicId: string | null;
  clinicName?: string;
  city?: string;
}

export interface AvailabilitySlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  consultationMode: string;
  isActive: boolean;
}

class DoctorService {
  /**
   * Search doctors with filters
   */
  async search(params: DoctorSearchParams): Promise<{
    data: DoctorProfile[];
    pagination: { page: number; limit: number; total: number; hasMore: boolean };
  }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 20, 50);
    const offset = (page - 1) * limit;

    // Try Typesense first for text search
    if (params.query && params.query.length > 2) {
      try {
        const results = await search.doctors({
          query: params.query,
          specialty: params.specialty,
          city: params.city,
          consultationMode: params.consultationMode,
          minRating: params.minRating,
          maxFee: params.maxFee,
          page,
          perPage: limit,
        });

        const doctorIds = results.hits?.map((hit: { document: { id: string } }) => hit.document.id) || [];
        
        if (doctorIds.length > 0) {
          const doctorData = await this.getByIds(doctorIds);
          return {
            data: doctorData,
            pagination: {
              page,
              limit,
              total: results.found || 0,
              hasMore: (results.found || 0) > page * limit,
            },
          };
        }
      } catch (error) {
        console.warn('[DoctorService] Typesense search failed, falling back to DB:', error);
      }
    }

    // Fallback to database search
    return this.searchDatabase(params);
  }

  /**
   * Database search fallback
   */
  private async searchDatabase(params: DoctorSearchParams): Promise<{
    data: DoctorProfile[];
    pagination: { page: number; limit: number; total: number; hasMore: boolean };
  }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 20, 50);
    const offset = (page - 1) * limit;

    // Build conditions
    const conditions = [eq(doctors.verificationStatus, 'verified')];

    if (params.specialty) {
      conditions.push(sql`${doctors.specialties} @> ARRAY[${params.specialty}]::text[]`);
    }

    if (params.consultationMode) {
      conditions.push(sql`${doctors.consultationModes} @> ARRAY[${params.consultationMode}]::text[]`);
    }

    if (params.minRating) {
      conditions.push(gte(doctors.averageRating, params.minRating.toString()));
    }

    if (params.maxFee) {
      conditions.push(lte(doctors.consultationFee, params.maxFee.toString()));
    }

    if (params.query) {
      const searchPattern = `%${params.query}%`;
      conditions.push(
        or(
          ilike(doctors.firstName, searchPattern),
          ilike(doctors.lastName, searchPattern),
          ilike(doctors.bio, searchPattern)
        )!
      );
    }

    // Build order by
    let orderBy;
    const order = params.sortOrder === 'asc' ? asc : desc;
    
    switch (params.sortBy) {
      case 'experience':
        orderBy = order(doctors.yearsOfExperience);
        break;
      case 'fee':
        orderBy = params.sortOrder === 'asc' 
          ? asc(doctors.consultationFee)
          : desc(doctors.consultationFee);
        break;
      case 'reviews':
        orderBy = order(doctors.totalReviews);
        break;
      case 'rating':
      default:
        orderBy = desc(doctors.averageRating);
    }

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(doctors)
      .where(and(...conditions));

    const total = Number(countResult[0]?.count || 0);

    // Get doctors with clinic info
    const result = await db
      .select({
        doctor: doctors,
        clinic: clinics,
      })
      .from(doctors)
      .leftJoin(clinics, eq(doctors.clinicId, clinics.id))
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    const data: DoctorProfile[] = result.map(({ doctor, clinic }) => ({
      id: doctor.id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      bio: doctor.bio,
      profileImageUrl: doctor.profileImageUrl,
      specialties: doctor.specialties || [],
      languages: doctor.languages || ['en'],
      qualifications: doctor.qualifications,
      licenseNumber: doctor.licenseNumber,
      yearsOfExperience: doctor.yearsOfExperience,
      consultationFee: doctor.consultationFee,
      consultationDurationMinutes: doctor.consultationDurationMinutes,
      consultationModes: doctor.consultationModes || ['in_person'],
      verificationStatus: doctor.verificationStatus,
      averageRating: doctor.averageRating,
      totalReviews: doctor.totalReviews,
      totalConsultations: doctor.totalConsultations,
      clinicId: doctor.clinicId,
      clinicName: clinic?.name || undefined,
      city: clinic?.city || undefined,
    }));

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        hasMore: total > page * limit,
      },
    };
  }

  /**
   * Get doctor by ID
   */
  async getById(id: string): Promise<DoctorProfile | null> {
    // Check cache first
    const cached = await cache.get<DoctorProfile>(CACHE_KEYS.doctor(id));
    if (cached) return cached;

    const result = await db
      .select({
        doctor: doctors,
        clinic: clinics,
      })
      .from(doctors)
      .leftJoin(clinics, eq(doctors.clinicId, clinics.id))
      .where(eq(doctors.id, id))
      .limit(1);

    if (!result.length) return null;

    const { doctor, clinic } = result[0];
    const profile: DoctorProfile = {
      id: doctor.id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      bio: doctor.bio,
      profileImageUrl: doctor.profileImageUrl,
      specialties: doctor.specialties || [],
      languages: doctor.languages || ['en'],
      qualifications: doctor.qualifications,
      licenseNumber: doctor.licenseNumber,
      yearsOfExperience: doctor.yearsOfExperience,
      consultationFee: doctor.consultationFee,
      consultationDurationMinutes: doctor.consultationDurationMinutes,
      consultationModes: doctor.consultationModes || ['in_person'],
      verificationStatus: doctor.verificationStatus,
      averageRating: doctor.averageRating,
      totalReviews: doctor.totalReviews,
      totalConsultations: doctor.totalConsultations,
      clinicId: doctor.clinicId,
      clinicName: clinic?.name || undefined,
      city: clinic?.city || undefined,
    };

    // Cache for 5 minutes
    await cache.set(CACHE_KEYS.doctor(id), profile, CACHE_TTL.MEDIUM);

    return profile;
  }

  /**
   * Get multiple doctors by IDs
   */
  async getByIds(ids: string[]): Promise<DoctorProfile[]> {
    if (!ids.length) return [];

    const result = await db
      .select({
        doctor: doctors,
        clinic: clinics,
      })
      .from(doctors)
      .leftJoin(clinics, eq(doctors.clinicId, clinics.id))
      .where(sql`${doctors.id} = ANY(${ids})`);

    // Sort by original order
    const idOrder = new Map(ids.map((id, i) => [id, i]));
    
    return result
      .map(({ doctor, clinic }) => ({
        id: doctor.id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        bio: doctor.bio,
        profileImageUrl: doctor.profileImageUrl,
        specialties: doctor.specialties || [],
        languages: doctor.languages || ['en'],
        qualifications: doctor.qualifications,
        licenseNumber: doctor.licenseNumber,
        yearsOfExperience: doctor.yearsOfExperience,
        consultationFee: doctor.consultationFee,
        consultationDurationMinutes: doctor.consultationDurationMinutes,
        consultationModes: doctor.consultationModes || ['in_person'],
        verificationStatus: doctor.verificationStatus,
        averageRating: doctor.averageRating,
        totalReviews: doctor.totalReviews,
        totalConsultations: doctor.totalConsultations,
        clinicId: doctor.clinicId,
        clinicName: clinic?.name || undefined,
        city: clinic?.city || undefined,
      }))
      .sort((a, b) => (idOrder.get(a.id) || 0) - (idOrder.get(b.id) || 0));
  }

  /**
   * Get doctor availability
   */
  async getAvailability(doctorId: string): Promise<AvailabilitySlot[]> {
    const result = await db
      .select()
      .from(doctorAvailability)
      .where(and(
        eq(doctorAvailability.doctorId, doctorId),
        eq(doctorAvailability.isActive, true)
      ))
      .orderBy(asc(doctorAvailability.dayOfWeek), asc(doctorAvailability.startTime));

    return result.map((slot) => ({
      id: slot.id,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      consultationMode: slot.consultationMode,
      isActive: slot.isActive,
    }));
  }

  /**
   * Get available time slots for a specific date
   */
  async getAvailableSlots(doctorId: string, date: Date): Promise<string[]> {
    const cacheKey = CACHE_KEYS.availability(doctorId, date.toISOString().split('T')[0]);
    const cached = await cache.get<string[]>(cacheKey);
    if (cached) return cached;

    const dayOfWeek = date.getDay();
    
    // Get doctor's availability for this day
    const availability = await db
      .select()
      .from(doctorAvailability)
      .where(and(
        eq(doctorAvailability.doctorId, doctorId),
        eq(doctorAvailability.dayOfWeek, dayOfWeek),
        eq(doctorAvailability.isActive, true)
      ));

    if (!availability.length) return [];

    // Get doctor's consultation duration
    const doctorData = await this.getById(doctorId);
    const duration = doctorData?.consultationDurationMinutes || 30;

    // Generate time slots
    const slots: string[] = [];
    
    for (const slot of availability) {
      const startParts = slot.startTime.split(':');
      const endParts = slot.endTime.split(':');
      
      let currentMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
      const endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
      
      while (currentMinutes + duration <= endMinutes) {
        const hours = Math.floor(currentMinutes / 60);
        const mins = currentMinutes % 60;
        slots.push(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`);
        currentMinutes += duration;
      }
    }

    // TODO: Filter out already booked slots
    
    // Cache for 1 minute
    await cache.set(cacheKey, slots, CACHE_TTL.SHORT);

    return slots;
  }

  /**
   * Index doctor in Typesense (call after verification)
   */
  async indexDoctor(doctorId: string): Promise<void> {
    const doctor = await this.getById(doctorId);
    if (!doctor || doctor.verificationStatus !== 'verified') return;

    await index.doctor({
      id: doctor.id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      specialties: doctor.specialties,
      bio: doctor.bio || undefined,
      languages: doctor.languages,
      consultationFee: parseFloat(doctor.consultationFee),
      consultationModes: doctor.consultationModes,
      averageRating: parseFloat(doctor.averageRating),
      totalReviews: doctor.totalReviews,
      totalConsultations: doctor.totalConsultations,
      yearsOfExperience: doctor.yearsOfExperience || undefined,
      clinicId: doctor.clinicId || undefined,
      clinicName: doctor.clinicName || undefined,
      city: doctor.city || undefined,
      verificationStatus: doctor.verificationStatus,
      isAvailableToday: true, // TODO: Calculate based on availability
      createdAt: new Date(),
    });
  }

  /**
   * Invalidate cache for doctor
   */
  async invalidateCache(doctorId: string): Promise<void> {
    await cache.del(CACHE_KEYS.doctor(doctorId));
  }
}

export const doctorService = new DoctorService();
