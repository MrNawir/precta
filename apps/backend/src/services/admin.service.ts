/**
 * T067: Admin Service
 * Admin verification and management operations
 */

import { eq, and, sql, desc, asc } from 'drizzle-orm';
import { db } from '../lib/db';
import { doctors, users, appointments, payments } from '@precta/db';
import { searchService } from './search.service';
import { notificationService } from './notification.service';

export type VerificationStatus = 'pending' | 'under_review' | 'verified' | 'rejected';

export interface VerificationRequest {
  doctorId: string;
  firstName: string;
  lastName: string;
  email: string;
  specialties: string[];
  licenseNumber: string | null;
  qualifications: unknown;
  verificationStatus: VerificationStatus;
  submittedAt: Date;
  credentials?: Array<{
    type: string;
    url: string;
    uploadedAt: Date;
  }>;
}

export interface VerificationDecision {
  doctorId: string;
  status: 'verified' | 'rejected';
  notes?: string;
  reviewedBy: string;
}

export interface AdminStats {
  totalDoctors: number;
  pendingVerifications: number;
  verifiedDoctors: number;
  totalPatients: number;
  totalAppointments: number;
  totalRevenue: number;
  appointmentsToday: number;
}

class AdminService {
  /**
   * Get pending verification requests
   */
  async getPendingVerifications(options?: {
    status?: VerificationStatus;
    page?: number;
    limit?: number;
  }): Promise<{ data: VerificationRequest[]; total: number }> {
    const page = options?.page || 1;
    const limit = Math.min(options?.limit || 20, 50);
    const offset = (page - 1) * limit;
    const status = options?.status || 'pending';

    // Count total
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(doctors)
      .where(eq(doctors.verificationStatus, status));

    const total = Number(countResult[0]?.count || 0);

    // Get doctors with user info
    const result = await db
      .select({
        doctor: doctors,
        user: {
          email: users.email,
        },
      })
      .from(doctors)
      .leftJoin(users, eq(doctors.id, users.id))
      .where(eq(doctors.verificationStatus, status))
      .orderBy(asc(doctors.createdAt))
      .limit(limit)
      .offset(offset);

    const data: VerificationRequest[] = result.map(({ doctor, user }) => ({
      doctorId: doctor.id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      email: user?.email || '',
      specialties: doctor.specialties || [],
      licenseNumber: doctor.licenseNumber,
      qualifications: doctor.qualifications,
      verificationStatus: doctor.verificationStatus as VerificationStatus,
      submittedAt: doctor.createdAt,
      // TODO: Fetch credentials from files table
      credentials: [],
    }));

    return { data, total };
  }

  /**
   * Get single verification request
   */
  async getVerificationRequest(doctorId: string): Promise<VerificationRequest | null> {
    const result = await db
      .select({
        doctor: doctors,
        user: {
          email: users.email,
        },
      })
      .from(doctors)
      .leftJoin(users, eq(doctors.id, users.id))
      .where(eq(doctors.id, doctorId))
      .limit(1);

    if (!result.length) return null;

    const { doctor, user } = result[0];

    return {
      doctorId: doctor.id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      email: user?.email || '',
      specialties: doctor.specialties || [],
      licenseNumber: doctor.licenseNumber,
      qualifications: doctor.qualifications,
      verificationStatus: doctor.verificationStatus as VerificationStatus,
      submittedAt: doctor.createdAt,
      credentials: [],
    };
  }

  /**
   * Process verification decision
   */
  async processVerification(decision: VerificationDecision): Promise<boolean> {
    try {
      // Update doctor status
      await db
        .update(doctors)
        .set({
          verificationStatus: decision.status,
          // Could add verificationNotes, verifiedAt, verifiedBy fields
        })
        .where(eq(doctors.id, decision.doctorId));

      // If verified, index in Typesense
      if (decision.status === 'verified') {
        await searchService.indexDoctor(decision.doctorId);
      } else {
        // If rejected, remove from search (if previously indexed)
        await searchService.removeDoctor(decision.doctorId);
      }

      // Get doctor's user ID for notification
      const doctor = await db
        .select({ id: doctors.id })
        .from(doctors)
        .where(eq(doctors.id, decision.doctorId))
        .limit(1);

      if (doctor.length) {
        await notificationService.verificationStatus(
          doctor[0].id,
          decision.status,
          decision.notes
        );
      }

      return true;
    } catch (error) {
      console.error('[AdminService] Verification error:', error);
      return false;
    }
  }

  /**
   * Mark verification as under review
   */
  async markUnderReview(doctorId: string): Promise<boolean> {
    try {
      await db
        .update(doctors)
        .set({ verificationStatus: 'under_review' })
        .where(eq(doctors.id, doctorId));

      return true;
    } catch (error) {
      console.error('[AdminService] Mark under review error:', error);
      return false;
    }
  }

  /**
   * Get admin dashboard statistics
   */
  async getStats(): Promise<AdminStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Total doctors
    const totalDoctorsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(doctors);

    // Pending verifications
    const pendingResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(doctors)
      .where(eq(doctors.verificationStatus, 'pending'));

    // Verified doctors
    const verifiedResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(doctors)
      .where(eq(doctors.verificationStatus, 'verified'));

    // Total patients (users with patient role)
    const patientsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.role, 'patient'));

    // Total appointments
    const appointmentsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(appointments);

    // Today's appointments
    const todayAppointmentsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(appointments)
      .where(and(
        sql`${appointments.scheduledAt} >= ${today}`,
        sql`${appointments.scheduledAt} < ${tomorrow}`
      ));

    // Total revenue from completed payments
    const revenueResult = await db
      .select({ total: sql<number>`COALESCE(SUM(CAST(amount AS DECIMAL)), 0)` })
      .from(payments)
      .where(eq(payments.status, 'completed'));

    return {
      totalDoctors: Number(totalDoctorsResult[0]?.count || 0),
      pendingVerifications: Number(pendingResult[0]?.count || 0),
      verifiedDoctors: Number(verifiedResult[0]?.count || 0),
      totalPatients: Number(patientsResult[0]?.count || 0),
      totalAppointments: Number(appointmentsResult[0]?.count || 0),
      appointmentsToday: Number(todayAppointmentsResult[0]?.count || 0),
      totalRevenue: Number(revenueResult[0]?.total || 0),
    };
  }

  /**
   * Get recent activity
   */
  async getRecentActivity(limit: number = 10): Promise<Array<{
    type: string;
    message: string;
    timestamp: Date;
    data?: unknown;
  }>> {
    // Get recent appointments
    const recentAppointments = await db
      .select()
      .from(appointments)
      .orderBy(desc(appointments.createdAt))
      .limit(limit);

    const activity = recentAppointments.map(apt => ({
      type: 'appointment',
      message: `New appointment booked`,
      timestamp: apt.createdAt,
      data: { appointmentId: apt.id, status: apt.status },
    }));

    return activity;
  }

  /**
   * Get doctors list (admin view)
   */
  async getDoctors(options?: {
    status?: VerificationStatus;
    page?: number;
    limit?: number;
  }): Promise<{ data: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    specialties: string[];
    verificationStatus: string;
    totalConsultations: number;
    averageRating: string;
    createdAt: Date;
  }>; total: number }> {
    const page = options?.page || 1;
    const limit = Math.min(options?.limit || 20, 50);
    const offset = (page - 1) * limit;

    const conditions = options?.status 
      ? [eq(doctors.verificationStatus, options.status)]
      : [];

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(doctors)
      .where(conditions.length ? and(...conditions) : undefined);

    const total = Number(countResult[0]?.count || 0);

    const result = await db
      .select({
        doctor: doctors,
        user: { email: users.email },
      })
      .from(doctors)
      .leftJoin(users, eq(doctors.id, users.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(doctors.createdAt))
      .limit(limit)
      .offset(offset);

    const data = result.map(({ doctor, user }) => ({
      id: doctor.id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      email: user?.email || '',
      specialties: doctor.specialties || [],
      verificationStatus: doctor.verificationStatus,
      totalConsultations: doctor.totalConsultations,
      averageRating: doctor.averageRating || '0',
      createdAt: doctor.createdAt,
    }));

    return { data, total };
  }
}

export const adminService = new AdminService();
