/**
 * T048: Appointment Service
 * Business logic for appointment booking, management, and scheduling
 */

import { eq, and, gte, lte, sql, desc, asc } from 'drizzle-orm';
import { db } from '../lib/db';
import { appointments, doctors, patients, payments } from '@precta/db';
import { cache, CACHE_KEYS, CACHE_TTL } from '../lib/redis';
import { createId } from '@paralleldrive/cuid2';

export type AppointmentStatus = 
  | 'pending_payment'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type ConsultationType = 'in_person' | 'video';

export interface BookAppointmentInput {
  patientId: string;
  doctorId: string;
  scheduledAt: Date;
  consultationType: ConsultationType;
  notes?: string;
  clinicId?: string;
}

export interface AppointmentDetails {
  id: string;
  patientId: string;
  doctorId: string;
  clinicId: string | null;
  scheduledAt: Date;
  durationMinutes: number;
  consultationType: ConsultationType;
  status: AppointmentStatus;
  cancellationReason: string | null;
  cancelledAt: Date | null;
  cancelledBy: string | null;
  notes: string | null;
  paymentId: string | null;
  createdAt: Date;
  doctor?: {
    firstName: string;
    lastName: string;
    profileImageUrl: string | null;
    specialties: string[];
    consultationFee: string;
  };
  patient?: {
    firstName: string;
    lastName: string;
  };
}

class AppointmentService {
  /**
   * Book a new appointment
   */
  async book(input: BookAppointmentInput): Promise<AppointmentDetails> {
    // 1. Validate doctor exists and is verified
    const doctor = await db
      .select()
      .from(doctors)
      .where(and(
        eq(doctors.id, input.doctorId),
        eq(doctors.verificationStatus, 'verified')
      ))
      .limit(1);

    if (!doctor.length) {
      throw new Error('Doctor not found or not verified');
    }

    // 2. Check if slot is available
    const existingAppointment = await db
      .select()
      .from(appointments)
      .where(and(
        eq(appointments.doctorId, input.doctorId),
        eq(appointments.scheduledAt, input.scheduledAt),
        sql`${appointments.status} NOT IN ('cancelled', 'no_show')`
      ))
      .limit(1);

    if (existingAppointment.length) {
      throw new Error('This time slot is no longer available');
    }

    // 3. Create appointment
    const appointmentId = createId();
    const durationMinutes = doctor[0].consultationDurationMinutes;

    await db.insert(appointments).values({
      id: appointmentId,
      patientId: input.patientId,
      doctorId: input.doctorId,
      clinicId: input.clinicId || doctor[0].clinicId,
      scheduledAt: input.scheduledAt,
      durationMinutes,
      consultationType: input.consultationType,
      status: 'pending_payment',
      notes: input.notes || null,
    });

    // 4. Invalidate availability cache
    const dateStr = input.scheduledAt.toISOString().split('T')[0];
    await cache.del(CACHE_KEYS.availability(input.doctorId, dateStr));

    // 5. Return appointment details
    return this.getById(appointmentId) as Promise<AppointmentDetails>;
  }

  /**
   * Get appointment by ID
   */
  async getById(id: string): Promise<AppointmentDetails | null> {
    const result = await db
      .select({
        appointment: appointments,
        doctor: {
          firstName: doctors.firstName,
          lastName: doctors.lastName,
          profileImageUrl: doctors.profileImageUrl,
          specialties: doctors.specialties,
          consultationFee: doctors.consultationFee,
        },
        patient: {
          firstName: patients.firstName,
          lastName: patients.lastName,
        },
      })
      .from(appointments)
      .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
      .leftJoin(patients, eq(appointments.patientId, patients.id))
      .where(eq(appointments.id, id))
      .limit(1);

    if (!result.length) return null;

    const { appointment, doctor, patient } = result[0];

    return {
      id: appointment.id,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      clinicId: appointment.clinicId,
      scheduledAt: appointment.scheduledAt,
      durationMinutes: appointment.durationMinutes,
      consultationType: appointment.consultationType as ConsultationType,
      status: appointment.status as AppointmentStatus,
      cancellationReason: appointment.cancellationReason,
      cancelledAt: appointment.cancelledAt,
      cancelledBy: appointment.cancelledBy,
      notes: appointment.notes,
      paymentId: appointment.paymentId,
      createdAt: appointment.createdAt,
      doctor: doctor ? {
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        profileImageUrl: doctor.profileImageUrl,
        specialties: doctor.specialties || [],
        consultationFee: doctor.consultationFee,
      } : undefined,
      patient: patient ? {
        firstName: patient.firstName,
        lastName: patient.lastName,
      } : undefined,
    };
  }

  /**
   * Get appointments for a patient
   */
  async getByPatient(patientId: string, options?: {
    status?: AppointmentStatus;
    upcoming?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ data: AppointmentDetails[]; total: number }> {
    const page = options?.page || 1;
    const limit = Math.min(options?.limit || 20, 50);
    const offset = (page - 1) * limit;

    const conditions = [eq(appointments.patientId, patientId)];

    if (options?.status) {
      conditions.push(eq(appointments.status, options.status));
    }

    if (options?.upcoming) {
      conditions.push(gte(appointments.scheduledAt, new Date()));
      conditions.push(sql`${appointments.status} NOT IN ('cancelled', 'completed', 'no_show')`);
    }

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(appointments)
      .where(and(...conditions));

    const total = Number(countResult[0]?.count || 0);

    const result = await db
      .select({
        appointment: appointments,
        doctor: {
          firstName: doctors.firstName,
          lastName: doctors.lastName,
          profileImageUrl: doctors.profileImageUrl,
          specialties: doctors.specialties,
          consultationFee: doctors.consultationFee,
        },
      })
      .from(appointments)
      .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
      .where(and(...conditions))
      .orderBy(options?.upcoming ? asc(appointments.scheduledAt) : desc(appointments.scheduledAt))
      .limit(limit)
      .offset(offset);

    const data: AppointmentDetails[] = result.map(({ appointment, doctor }) => ({
      id: appointment.id,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      clinicId: appointment.clinicId,
      scheduledAt: appointment.scheduledAt,
      durationMinutes: appointment.durationMinutes,
      consultationType: appointment.consultationType as ConsultationType,
      status: appointment.status as AppointmentStatus,
      cancellationReason: appointment.cancellationReason,
      cancelledAt: appointment.cancelledAt,
      cancelledBy: appointment.cancelledBy,
      notes: appointment.notes,
      paymentId: appointment.paymentId,
      createdAt: appointment.createdAt,
      doctor: doctor ? {
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        profileImageUrl: doctor.profileImageUrl,
        specialties: doctor.specialties || [],
        consultationFee: doctor.consultationFee,
      } : undefined,
    }));

    return { data, total };
  }

  /**
   * Get appointments for a doctor
   */
  async getByDoctor(doctorId: string, options?: {
    date?: Date;
    status?: AppointmentStatus;
    page?: number;
    limit?: number;
  }): Promise<{ data: AppointmentDetails[]; total: number }> {
    const page = options?.page || 1;
    const limit = Math.min(options?.limit || 20, 50);
    const offset = (page - 1) * limit;

    const conditions = [eq(appointments.doctorId, doctorId)];

    if (options?.status) {
      conditions.push(eq(appointments.status, options.status));
    }

    if (options?.date) {
      const startOfDay = new Date(options.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(options.date);
      endOfDay.setHours(23, 59, 59, 999);
      
      conditions.push(gte(appointments.scheduledAt, startOfDay));
      conditions.push(lte(appointments.scheduledAt, endOfDay));
    }

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(appointments)
      .where(and(...conditions));

    const total = Number(countResult[0]?.count || 0);

    const result = await db
      .select({
        appointment: appointments,
        patient: {
          firstName: patients.firstName,
          lastName: patients.lastName,
        },
      })
      .from(appointments)
      .leftJoin(patients, eq(appointments.patientId, patients.id))
      .where(and(...conditions))
      .orderBy(asc(appointments.scheduledAt))
      .limit(limit)
      .offset(offset);

    const data: AppointmentDetails[] = result.map(({ appointment, patient }) => ({
      id: appointment.id,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      clinicId: appointment.clinicId,
      scheduledAt: appointment.scheduledAt,
      durationMinutes: appointment.durationMinutes,
      consultationType: appointment.consultationType as ConsultationType,
      status: appointment.status as AppointmentStatus,
      cancellationReason: appointment.cancellationReason,
      cancelledAt: appointment.cancelledAt,
      cancelledBy: appointment.cancelledBy,
      notes: appointment.notes,
      paymentId: appointment.paymentId,
      createdAt: appointment.createdAt,
      patient: patient ? {
        firstName: patient.firstName,
        lastName: patient.lastName,
      } : undefined,
    }));

    return { data, total };
  }

  /**
   * Confirm appointment after payment
   */
  async confirm(appointmentId: string, paymentId: string): Promise<AppointmentDetails | null> {
    await db
      .update(appointments)
      .set({
        status: 'confirmed',
        paymentId,
      })
      .where(eq(appointments.id, appointmentId));

    // TODO: Send confirmation notification to patient and doctor

    return this.getById(appointmentId);
  }

  /**
   * Cancel an appointment
   */
  async cancel(
    appointmentId: string,
    cancelledBy: string,
    reason?: string
  ): Promise<AppointmentDetails | null> {
    const appointment = await this.getById(appointmentId);
    
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    if (['completed', 'cancelled'].includes(appointment.status)) {
      throw new Error('Cannot cancel this appointment');
    }

    await db
      .update(appointments)
      .set({
        status: 'cancelled',
        cancelledBy,
        cancelledAt: new Date(),
        cancellationReason: reason || null,
      })
      .where(eq(appointments.id, appointmentId));

    // Invalidate availability cache
    const dateStr = appointment.scheduledAt.toISOString().split('T')[0];
    await cache.del(CACHE_KEYS.availability(appointment.doctorId, dateStr));

    // TODO: Initiate refund if payment was made
    // TODO: Send cancellation notification

    return this.getById(appointmentId);
  }

  /**
   * Start an appointment (mark as in_progress)
   */
  async start(appointmentId: string): Promise<AppointmentDetails | null> {
    await db
      .update(appointments)
      .set({ status: 'in_progress' })
      .where(and(
        eq(appointments.id, appointmentId),
        eq(appointments.status, 'confirmed')
      ));

    return this.getById(appointmentId);
  }

  /**
   * Complete an appointment
   */
  async complete(appointmentId: string): Promise<AppointmentDetails | null> {
    await db
      .update(appointments)
      .set({ status: 'completed' })
      .where(and(
        eq(appointments.id, appointmentId),
        eq(appointments.status, 'in_progress')
      ));

    // Update doctor's consultation count
    const appointment = await this.getById(appointmentId);
    if (appointment) {
      await db
        .update(doctors)
        .set({
          totalConsultations: sql`${doctors.totalConsultations} + 1`,
        })
        .where(eq(doctors.id, appointment.doctorId));
    }

    return appointment;
  }

  /**
   * Mark as no-show
   */
  async markNoShow(appointmentId: string): Promise<AppointmentDetails | null> {
    await db
      .update(appointments)
      .set({ status: 'no_show' })
      .where(and(
        eq(appointments.id, appointmentId),
        eq(appointments.status, 'confirmed')
      ));

    return this.getById(appointmentId);
  }
}

export const appointmentService = new AppointmentService();
