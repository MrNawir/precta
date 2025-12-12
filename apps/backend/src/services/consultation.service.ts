/**
 * T078: Consultation Service
 * Video consultation management and recording
 */

import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../lib/db';
import { appointments, consultationNotes } from '@precta/db';
import { createId } from '@paralleldrive/cuid2';
import { notificationService } from './notification.service';

export interface ConsultationSession {
  id: string;
  appointmentId: string;
  roomId: string;
  roomToken: string;
  doctorId: string;
  patientId: string;
  startedAt: Date | null;
  endedAt: Date | null;
  status: 'waiting' | 'in_progress' | 'completed' | 'ended';
}

export interface ConsultationNote {
  id: string;
  consultationId: string;
  diagnosis: string | null;
  symptoms: string[];
  prescription: string | null;
  followUpDate: Date | null;
  notes: string | null;
  createdAt: Date;
}

class ConsultationService {
  /**
   * Start a consultation session
   */
  async startSession(appointmentId: string): Promise<ConsultationSession | null> {
    // Get appointment
    const [appointment] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    if (appointment.status !== 'confirmed') {
      throw new Error('Appointment must be confirmed to start consultation');
    }

    // Generate room ID and tokens (would use 100ms in production)
    const roomId = `room_${createId()}`;
    const roomToken = `token_${createId()}_${Date.now()}`;

    // Update appointment status
    await db
      .update(appointments)
      .set({
        status: 'in_progress',
        startedAt: new Date(),
        videoRoomId: roomId,
      })
      .where(eq(appointments.id, appointmentId));

    // Notify patient that consultation started
    await notificationService.send({
      userId: appointment.patientId,
      type: 'appointment_reminder',
      title: 'Consultation Started',
      body: 'Your doctor is ready. Join the consultation now.',
      data: { appointmentId },
    });

    return {
      id: appointmentId,
      appointmentId,
      roomId,
      roomToken,
      doctorId: appointment.doctorId,
      patientId: appointment.patientId,
      startedAt: new Date(),
      endedAt: null,
      status: 'in_progress',
    };
  }

  /**
   * Get consultation session details
   */
  async getSession(appointmentId: string, userId: string): Promise<ConsultationSession | null> {
    const [appointment] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (!appointment) return null;

    // Check if user is participant
    if (appointment.patientId !== userId && appointment.doctorId !== userId) {
      throw new Error('Access denied');
    }

    // Generate token for user
    const roomToken = `token_${createId()}_${userId}`;

    return {
      id: appointmentId,
      appointmentId,
      roomId: appointment.videoRoomId || `room_${appointmentId}`,
      roomToken,
      doctorId: appointment.doctorId,
      patientId: appointment.patientId,
      startedAt: appointment.startedAt,
      endedAt: appointment.endedAt,
      status: appointment.status === 'in_progress' ? 'in_progress' : 
              appointment.status === 'completed' ? 'completed' : 'waiting',
    };
  }

  /**
   * End consultation session
   */
  async endSession(appointmentId: string, endedBy: string): Promise<void> {
    const [appointment] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    // Calculate duration
    const startTime = appointment.startedAt || new Date();
    const endTime = new Date();
    const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

    // Update appointment
    await db
      .update(appointments)
      .set({
        status: 'completed',
        endedAt: endTime,
        actualDurationMinutes: durationMinutes,
      })
      .where(eq(appointments.id, appointmentId));

    // Notify both parties
    const otherUserId = endedBy === appointment.doctorId 
      ? appointment.patientId 
      : appointment.doctorId;

    await notificationService.send({
      userId: otherUserId,
      type: 'appointment_reminder',
      title: 'Consultation Ended',
      body: 'Your consultation has ended. You can view the summary in your appointments.',
      data: { appointmentId },
    });
  }

  /**
   * Add consultation notes
   */
  async addNotes(appointmentId: string, doctorId: string, notes: {
    diagnosis?: string;
    symptoms?: string[];
    prescription?: string;
    followUpDate?: Date;
    notes?: string;
  }): Promise<ConsultationNote> {
    // Verify appointment belongs to doctor
    const [appointment] = await db
      .select()
      .from(appointments)
      .where(and(
        eq(appointments.id, appointmentId),
        eq(appointments.doctorId, doctorId)
      ))
      .limit(1);

    if (!appointment) {
      throw new Error('Appointment not found or access denied');
    }

    // Check if notes already exist
    const existingNotes = await db
      .select()
      .from(consultationNotes)
      .where(eq(consultationNotes.appointmentId, appointmentId))
      .limit(1);

    if (existingNotes.length > 0) {
      // Update existing notes
      await db
        .update(consultationNotes)
        .set({
          diagnosis: notes.diagnosis,
          symptoms: notes.symptoms,
          prescription: notes.prescription,
          followUpDate: notes.followUpDate,
          notes: notes.notes,
          updatedAt: new Date(),
        })
        .where(eq(consultationNotes.appointmentId, appointmentId));

      return {
        id: existingNotes[0].id,
        consultationId: appointmentId,
        diagnosis: notes.diagnosis || null,
        symptoms: notes.symptoms || [],
        prescription: notes.prescription || null,
        followUpDate: notes.followUpDate || null,
        notes: notes.notes || null,
        createdAt: existingNotes[0].createdAt,
      };
    }

    // Create new notes
    const noteId = createId();
    await db.insert(consultationNotes).values({
      id: noteId,
      appointmentId,
      doctorId,
      diagnosis: notes.diagnosis || null,
      symptoms: notes.symptoms || [],
      prescription: notes.prescription || null,
      followUpDate: notes.followUpDate || null,
      notes: notes.notes || null,
    });

    return {
      id: noteId,
      consultationId: appointmentId,
      diagnosis: notes.diagnosis || null,
      symptoms: notes.symptoms || [],
      prescription: notes.prescription || null,
      followUpDate: notes.followUpDate || null,
      notes: notes.notes || null,
      createdAt: new Date(),
    };
  }

  /**
   * Get consultation notes
   */
  async getNotes(appointmentId: string, userId: string): Promise<ConsultationNote | null> {
    // Verify user is participant
    const [appointment] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (!appointment) return null;

    if (appointment.patientId !== userId && appointment.doctorId !== userId) {
      throw new Error('Access denied');
    }

    const [notes] = await db
      .select()
      .from(consultationNotes)
      .where(eq(consultationNotes.appointmentId, appointmentId))
      .limit(1);

    if (!notes) return null;

    return {
      id: notes.id,
      consultationId: appointmentId,
      diagnosis: notes.diagnosis,
      symptoms: notes.symptoms || [],
      prescription: notes.prescription,
      followUpDate: notes.followUpDate,
      notes: notes.notes,
      createdAt: notes.createdAt,
    };
  }

  /**
   * Get consultation history for a patient
   */
  async getPatientHistory(patientId: string, options?: {
    page?: number;
    limit?: number;
  }): Promise<{ data: Array<{
    appointment: typeof appointments.$inferSelect;
    notes: ConsultationNote | null;
  }>; total: number }> {
    const page = options?.page || 1;
    const limit = Math.min(options?.limit || 20, 50);
    const offset = (page - 1) * limit;

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(appointments)
      .where(and(
        eq(appointments.patientId, patientId),
        eq(appointments.status, 'completed')
      ));

    const total = Number(countResult[0]?.count || 0);

    const result = await db
      .select()
      .from(appointments)
      .where(and(
        eq(appointments.patientId, patientId),
        eq(appointments.status, 'completed')
      ))
      .orderBy(desc(appointments.scheduledAt))
      .limit(limit)
      .offset(offset);

    // Get notes for each appointment
    const data = await Promise.all(
      result.map(async (appointment) => {
        const notes = await this.getNotes(appointment.id, patientId);
        return { appointment, notes };
      })
    );

    return { data, total };
  }
}

export const consultationService = new ConsultationService();
