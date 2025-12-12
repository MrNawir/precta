/**
 * T086: Appointment Reminder Service
 * Scheduled reminders for upcoming appointments
 */

import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { db } from '../lib/db';
import { appointments, doctors, patients, users } from '@precta/db';
import { notificationService } from './notification.service';
import { sendNotification } from '../lib/ws';

export interface ReminderConfig {
  // Hours before appointment to send reminder
  beforeHours: number[];
  // Whether to include SMS
  includeSms: boolean;
  // Whether to include email
  includeEmail: boolean;
  // Whether to include push notification
  includePush: boolean;
}

const DEFAULT_CONFIG: ReminderConfig = {
  beforeHours: [24, 1], // 24 hours and 1 hour before
  includeSms: true,
  includeEmail: true,
  includePush: true,
};

class ReminderService {
  private config: ReminderConfig;
  private checkInterval: ReturnType<typeof setInterval> | null = null;

  constructor(config: ReminderConfig = DEFAULT_CONFIG) {
    this.config = config;
  }

  /**
   * Start the reminder scheduler
   */
  start(intervalMinutes: number = 15): void {
    if (this.checkInterval) {
      console.log('[Reminder] Scheduler already running');
      return;
    }

    console.log(`[Reminder] Starting scheduler (checking every ${intervalMinutes} minutes)`);
    
    // Run immediately
    this.checkAndSendReminders();
    
    // Then schedule periodic checks
    this.checkInterval = setInterval(
      () => this.checkAndSendReminders(),
      intervalMinutes * 60 * 1000
    );
  }

  /**
   * Stop the reminder scheduler
   */
  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('[Reminder] Scheduler stopped');
    }
  }

  /**
   * Check for upcoming appointments and send reminders
   */
  async checkAndSendReminders(): Promise<void> {
    console.log('[Reminder] Checking for upcoming appointments...');

    for (const hours of this.config.beforeHours) {
      await this.sendRemindersForTimeframe(hours);
    }
  }

  /**
   * Send reminders for appointments X hours from now
   */
  private async sendRemindersForTimeframe(hoursBeforeAppointment: number): Promise<void> {
    const now = new Date();
    const targetTime = new Date(now.getTime() + hoursBeforeAppointment * 60 * 60 * 1000);
    
    // Window of 15 minutes around target time
    const windowStart = new Date(targetTime.getTime() - 7.5 * 60 * 1000);
    const windowEnd = new Date(targetTime.getTime() + 7.5 * 60 * 1000);

    try {
      // Get confirmed appointments in the time window
      const upcomingAppointments = await db
        .select({
          appointment: appointments,
          doctor: {
            firstName: doctors.firstName,
            lastName: doctors.lastName,
          },
          patient: {
            firstName: patients.firstName,
            lastName: patients.lastName,
          },
          patientUser: {
            email: users.email,
          },
        })
        .from(appointments)
        .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
        .leftJoin(patients, eq(appointments.patientId, patients.id))
        .leftJoin(users, eq(appointments.patientId, users.id))
        .where(and(
          eq(appointments.status, 'confirmed'),
          gte(appointments.scheduledAt, windowStart),
          lte(appointments.scheduledAt, windowEnd)
        ));

      console.log(`[Reminder] Found ${upcomingAppointments.length} appointments for ${hoursBeforeAppointment}h reminder`);

      for (const { appointment, doctor, patient, patientUser } of upcomingAppointments) {
        await this.sendReminderForAppointment(
          appointment,
          doctor,
          patient,
          patientUser?.email || null,
          hoursBeforeAppointment
        );
      }
    } catch (error) {
      console.error('[Reminder] Error checking appointments:', error);
    }
  }

  /**
   * Send reminder for a specific appointment
   */
  private async sendReminderForAppointment(
    appointment: typeof appointments.$inferSelect,
    doctor: { firstName: string; lastName: string } | null,
    patient: { firstName: string; lastName: string } | null,
    patientEmail: string | null,
    hoursRemaining: number
  ): Promise<void> {
    const doctorName = doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'your doctor';
    const appointmentTime = new Date(appointment.scheduledAt).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const appointmentDate = new Date(appointment.scheduledAt).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

    const isVideoConsult = appointment.consultationType === 'video';
    const reminderText = hoursRemaining === 1
      ? 'in 1 hour'
      : hoursRemaining < 24
        ? `in ${hoursRemaining} hours`
        : 'tomorrow';

    // Send to patient
    try {
      await notificationService.send({
        userId: appointment.patientId,
        type: 'appointment_reminder',
        title: `Appointment ${reminderText}`,
        body: `Your ${isVideoConsult ? 'video' : 'in-person'} consultation with ${doctorName} is scheduled for ${appointmentTime} on ${appointmentDate}.`,
        channels: ['push', 'email'],
        data: {
          appointmentId: appointment.id,
          doctorName,
          scheduledAt: appointment.scheduledAt.toISOString(),
          consultationType: appointment.consultationType,
        },
      });

      // Also send via WebSocket for real-time
      sendNotification(appointment.patientId, {
        id: `reminder_${appointment.id}_${hoursRemaining}h`,
        type: 'appointment_reminder',
        title: `Appointment ${reminderText}`,
        body: `Your consultation with ${doctorName} is coming up at ${appointmentTime}.`,
        data: {
          appointmentId: appointment.id,
          consultationType: appointment.consultationType,
        },
      });

      console.log(`[Reminder] Sent ${hoursRemaining}h reminder for appointment ${appointment.id}`);
    } catch (error) {
      console.error(`[Reminder] Failed to send reminder for ${appointment.id}:`, error);
    }

    // Send to doctor (only for 1 hour reminder)
    if (hoursRemaining === 1) {
      try {
        const patientName = patient ? `${patient.firstName} ${patient.lastName}` : 'Patient';
        
        await notificationService.send({
          userId: appointment.doctorId,
          type: 'appointment_reminder',
          title: 'Upcoming Appointment',
          body: `You have a ${isVideoConsult ? 'video' : 'in-person'} consultation with ${patientName} at ${appointmentTime}.`,
          channels: ['push'],
          data: {
            appointmentId: appointment.id,
            patientName,
            scheduledAt: appointment.scheduledAt.toISOString(),
            consultationType: appointment.consultationType,
          },
        });

        sendNotification(appointment.doctorId, {
          id: `reminder_doc_${appointment.id}`,
          type: 'appointment_reminder',
          title: 'Upcoming Appointment',
          body: `Consultation with ${patientName} at ${appointmentTime}.`,
          data: {
            appointmentId: appointment.id,
            consultationType: appointment.consultationType,
          },
        });
      } catch (error) {
        console.error(`[Reminder] Failed to send doctor reminder:`, error);
      }
    }
  }

  /**
   * Send immediate reminder for a specific appointment
   */
  async sendImmediateReminder(appointmentId: string): Promise<boolean> {
    try {
      const [result] = await db
        .select({
          appointment: appointments,
          doctor: {
            firstName: doctors.firstName,
            lastName: doctors.lastName,
          },
          patient: {
            firstName: patients.firstName,
            lastName: patients.lastName,
          },
        })
        .from(appointments)
        .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
        .leftJoin(patients, eq(appointments.patientId, patients.id))
        .where(eq(appointments.id, appointmentId))
        .limit(1);

      if (!result) {
        console.error('[Reminder] Appointment not found:', appointmentId);
        return false;
      }

      await this.sendReminderForAppointment(
        result.appointment,
        result.doctor,
        result.patient,
        null,
        0 // immediate
      );

      return true;
    } catch (error) {
      console.error('[Reminder] Error sending immediate reminder:', error);
      return false;
    }
  }
}

export const reminderService = new ReminderService();
export default reminderService;
