/**
 * T095: Prescription Service
 * Digital prescription management
 */

import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../lib/db';
import { prescriptions, appointments, doctors, patients } from '@precta/db';
import { createId } from '@paralleldrive/cuid2';
import { notificationService } from './notification.service';

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  quantity?: number;
}

export interface Prescription {
  id: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
  medications: Medication[];
  diagnosis: string;
  notes?: string;
  validUntil: Date;
  status: 'active' | 'expired' | 'fulfilled';
  createdAt: Date;
  doctor?: {
    firstName: string;
    lastName: string;
    specialties: string[];
    licenseNumber: string | null;
  };
}

export interface CreatePrescriptionInput {
  appointmentId: string;
  doctorId: string;
  patientId: string;
  medications: Medication[];
  diagnosis: string;
  notes?: string;
  validDays?: number;
}

class PrescriptionService {
  /**
   * Create a new prescription
   */
  async create(input: CreatePrescriptionInput): Promise<Prescription> {
    // Verify appointment exists and belongs to doctor
    const [appointment] = await db
      .select()
      .from(appointments)
      .where(and(
        eq(appointments.id, input.appointmentId),
        eq(appointments.doctorId, input.doctorId)
      ))
      .limit(1);

    if (!appointment) {
      throw new Error('Appointment not found or access denied');
    }

    const prescriptionId = createId();
    const validDays = input.validDays || 30;
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validDays);

    await db.insert(prescriptions).values({
      id: prescriptionId,
      appointmentId: input.appointmentId,
      doctorId: input.doctorId,
      patientId: input.patientId,
      medications: input.medications,
      diagnosis: input.diagnosis,
      notes: input.notes || null,
      validUntil,
      status: 'active',
    });

    // Notify patient
    await notificationService.send({
      userId: input.patientId,
      type: 'new_prescription',
      title: 'New Prescription',
      body: 'You have received a new prescription from your doctor.',
      channels: ['push', 'email'],
      data: {
        prescriptionId,
        appointmentId: input.appointmentId,
      },
    });

    return {
      id: prescriptionId,
      appointmentId: input.appointmentId,
      doctorId: input.doctorId,
      patientId: input.patientId,
      medications: input.medications,
      diagnosis: input.diagnosis,
      notes: input.notes,
      validUntil,
      status: 'active',
      createdAt: new Date(),
    };
  }

  /**
   * Get prescription by ID
   */
  async getById(prescriptionId: string, userId: string): Promise<Prescription | null> {
    const [result] = await db
      .select({
        prescription: prescriptions,
        doctor: {
          firstName: doctors.firstName,
          lastName: doctors.lastName,
          specialties: doctors.specialties,
          licenseNumber: doctors.licenseNumber,
        },
      })
      .from(prescriptions)
      .leftJoin(doctors, eq(prescriptions.doctorId, doctors.id))
      .where(eq(prescriptions.id, prescriptionId))
      .limit(1);

    if (!result) return null;

    // Check access
    if (result.prescription.patientId !== userId && result.prescription.doctorId !== userId) {
      throw new Error('Access denied');
    }

    return this.mapToPrescription(result.prescription, result.doctor);
  }

  /**
   * Get prescriptions for a patient
   */
  async getPatientPrescriptions(
    patientId: string,
    options?: {
      status?: 'active' | 'expired' | 'fulfilled';
      page?: number;
      limit?: number;
    }
  ): Promise<{ data: Prescription[]; total: number }> {
    const page = options?.page || 1;
    const limit = Math.min(options?.limit || 20, 50);
    const offset = (page - 1) * limit;

    const conditions = [eq(prescriptions.patientId, patientId)];
    if (options?.status) {
      conditions.push(eq(prescriptions.status, options.status));
    }

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(prescriptions)
      .where(and(...conditions));

    const total = Number(countResult[0]?.count || 0);

    const results = await db
      .select({
        prescription: prescriptions,
        doctor: {
          firstName: doctors.firstName,
          lastName: doctors.lastName,
          specialties: doctors.specialties,
          licenseNumber: doctors.licenseNumber,
        },
      })
      .from(prescriptions)
      .leftJoin(doctors, eq(prescriptions.doctorId, doctors.id))
      .where(and(...conditions))
      .orderBy(desc(prescriptions.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      data: results.map(r => this.mapToPrescription(r.prescription, r.doctor)),
      total,
    };
  }

  /**
   * Get prescriptions created by a doctor
   */
  async getDoctorPrescriptions(
    doctorId: string,
    options?: {
      page?: number;
      limit?: number;
    }
  ): Promise<{ data: Prescription[]; total: number }> {
    const page = options?.page || 1;
    const limit = Math.min(options?.limit || 20, 50);
    const offset = (page - 1) * limit;

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(prescriptions)
      .where(eq(prescriptions.doctorId, doctorId));

    const total = Number(countResult[0]?.count || 0);

    const results = await db
      .select({
        prescription: prescriptions,
        patient: {
          firstName: patients.firstName,
          lastName: patients.lastName,
        },
      })
      .from(prescriptions)
      .leftJoin(patients, eq(prescriptions.patientId, patients.id))
      .where(eq(prescriptions.doctorId, doctorId))
      .orderBy(desc(prescriptions.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      data: results.map(r => ({
        ...this.mapToPrescription(r.prescription, null),
        patient: r.patient,
      })),
      total,
    };
  }

  /**
   * Get prescription for an appointment
   */
  async getByAppointment(appointmentId: string): Promise<Prescription | null> {
    const [result] = await db
      .select({
        prescription: prescriptions,
        doctor: {
          firstName: doctors.firstName,
          lastName: doctors.lastName,
          specialties: doctors.specialties,
          licenseNumber: doctors.licenseNumber,
        },
      })
      .from(prescriptions)
      .leftJoin(doctors, eq(prescriptions.doctorId, doctors.id))
      .where(eq(prescriptions.appointmentId, appointmentId))
      .limit(1);

    if (!result) return null;

    return this.mapToPrescription(result.prescription, result.doctor);
  }

  /**
   * Mark prescription as fulfilled
   */
  async markFulfilled(prescriptionId: string): Promise<boolean> {
    await db
      .update(prescriptions)
      .set({ status: 'fulfilled' })
      .where(eq(prescriptions.id, prescriptionId));

    return true;
  }

  /**
   * Update expired prescriptions
   */
  async updateExpiredPrescriptions(): Promise<number> {
    const result = await db
      .update(prescriptions)
      .set({ status: 'expired' })
      .where(and(
        eq(prescriptions.status, 'active'),
        sql`${prescriptions.validUntil} < NOW()`
      ));

    return result.rowCount || 0;
  }

  /**
   * Map database prescription to Prescription type
   */
  private mapToPrescription(
    prescription: typeof prescriptions.$inferSelect,
    doctor: { firstName: string; lastName: string; specialties: string[]; licenseNumber: string | null } | null
  ): Prescription {
    return {
      id: prescription.id,
      appointmentId: prescription.appointmentId,
      doctorId: prescription.doctorId,
      patientId: prescription.patientId,
      medications: prescription.medications as Medication[],
      diagnosis: prescription.diagnosis,
      notes: prescription.notes || undefined,
      validUntil: prescription.validUntil,
      status: prescription.status as 'active' | 'expired' | 'fulfilled',
      createdAt: prescription.createdAt,
      doctor: doctor ? {
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        specialties: doctor.specialties,
        licenseNumber: doctor.licenseNumber,
      } : undefined,
    };
  }
}

export const prescriptionService = new PrescriptionService();
