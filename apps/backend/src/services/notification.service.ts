/**
 * T050: Notification Service
 * Handles push, email, and SMS notifications
 */

import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../lib/db';
import { notifications, users } from '@precta/db';
import { createId } from '@paralleldrive/cuid2';

export type NotificationType =
  | 'appointment_confirmed'
  | 'appointment_reminder'
  | 'appointment_cancelled'
  | 'prescription_ready'
  | 'order_status'
  | 'verification_status'
  | 'payment_received'
  | 'general';

export type NotificationChannel = 'push' | 'email' | 'sms';
export type NotificationStatus = 'pending' | 'sent' | 'read' | 'failed';

export interface NotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  channel?: NotificationChannel;
}

export interface NotificationDetails {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  channel: NotificationChannel;
  status: NotificationStatus;
  sentAt: Date | null;
  readAt: Date | null;
  createdAt: Date;
}

class NotificationService {
  /**
   * Create and send a notification
   */
  async send(input: NotificationData): Promise<NotificationDetails> {
    const notificationId = createId();

    await db.insert(notifications).values({
      id: notificationId,
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      data: input.data || null,
      channel: input.channel || 'push',
      status: 'pending',
    });

    // Process notification based on channel
    const notification = await this.getById(notificationId);

    if (notification) {
      await this.processNotification(notification);
    }

    return notification!;
  }

  /**
   * Process and deliver notification
   */
  private async processNotification(notification: NotificationDetails): Promise<void> {
    try {
      switch (notification.channel) {
        case 'push':
          await this.sendPush(notification);
          break;
        case 'email':
          await this.sendEmail(notification);
          break;
        case 'sms':
          await this.sendSms(notification);
          break;
      }

      await db
        .update(notifications)
        .set({
          status: 'sent',
          sentAt: new Date(),
        })
        .where(eq(notifications.id, notification.id));
    } catch (error) {
      console.error(`[Notification] Failed to send ${notification.id}:`, error);
      
      await db
        .update(notifications)
        .set({ status: 'failed' })
        .where(eq(notifications.id, notification.id));
    }
  }

  /**
   * Send push notification
   */
  private async sendPush(notification: NotificationDetails): Promise<void> {
    // TODO: Implement Firebase Cloud Messaging or similar
    console.log(`[Notification] Push to ${notification.userId}: ${notification.title}`);
  }

  /**
   * Send email notification
   */
  private async sendEmail(notification: NotificationDetails): Promise<void> {
    // Get user email
    const user = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, notification.userId))
      .limit(1);

    if (!user.length) {
      throw new Error('User not found');
    }

    // TODO: Implement email sending with SendGrid/Resend
    console.log(`[Notification] Email to ${user[0].email}: ${notification.title}`);
  }

  /**
   * Send SMS notification
   */
  private async sendSms(notification: NotificationDetails): Promise<void> {
    // Get user phone
    const user = await db
      .select({ phone: users.phone })
      .from(users)
      .where(eq(users.id, notification.userId))
      .limit(1);

    if (!user.length || !user[0].phone) {
      throw new Error('User phone not found');
    }

    // TODO: Implement SMS sending with Africa's Talking or similar
    console.log(`[Notification] SMS to ${user[0].phone}: ${notification.title}`);
  }

  /**
   * Get notification by ID
   */
  async getById(id: string): Promise<NotificationDetails | null> {
    const result = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id))
      .limit(1);

    if (!result.length) return null;

    const n = result[0];
    return {
      id: n.id,
      userId: n.userId,
      type: n.type as NotificationType,
      title: n.title,
      body: n.body,
      data: n.data as Record<string, unknown> | null,
      channel: n.channel as NotificationChannel,
      status: n.status as NotificationStatus,
      sentAt: n.sentAt,
      readAt: n.readAt,
      createdAt: n.createdAt,
    };
  }

  /**
   * Get notifications for a user
   */
  async getByUser(userId: string, options?: {
    unreadOnly?: boolean;
    type?: NotificationType;
    page?: number;
    limit?: number;
  }): Promise<{ data: NotificationDetails[]; total: number; unreadCount: number }> {
    const page = options?.page || 1;
    const limit = Math.min(options?.limit || 20, 50);
    const offset = (page - 1) * limit;

    // Build conditions
    const conditions = [eq(notifications.userId, userId)];

    if (options?.unreadOnly) {
      conditions.push(sql`${notifications.readAt} IS NULL`);
    }

    if (options?.type) {
      conditions.push(eq(notifications.type, options.type));
    }

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(...conditions));

    const total = Number(countResult[0]?.count || 0);

    // Get unread count
    const unreadResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        sql`${notifications.readAt} IS NULL`
      ));

    const unreadCount = Number(unreadResult[0]?.count || 0);

    // Get notifications
    const result = await db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);

    const data: NotificationDetails[] = result.map((n) => ({
      id: n.id,
      userId: n.userId,
      type: n.type as NotificationType,
      title: n.title,
      body: n.body,
      data: n.data as Record<string, unknown> | null,
      channel: n.channel as NotificationChannel,
      status: n.status as NotificationStatus,
      sentAt: n.sentAt,
      readAt: n.readAt,
      createdAt: n.createdAt,
    }));

    return { data, total, unreadCount };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId)
      ));
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(and(
        eq(notifications.userId, userId),
        sql`${notifications.readAt} IS NULL`
      ));
  }

  // ===== Convenience methods for common notifications =====

  /**
   * Send appointment confirmed notification
   */
  async appointmentConfirmed(userId: string, appointmentData: {
    doctorName: string;
    scheduledAt: Date;
    consultationType: string;
  }): Promise<void> {
    const formattedDate = appointmentData.scheduledAt.toLocaleDateString('en-KE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    await this.send({
      userId,
      type: 'appointment_confirmed',
      title: 'Appointment Confirmed',
      body: `Your ${appointmentData.consultationType} appointment with Dr. ${appointmentData.doctorName} is confirmed for ${formattedDate}`,
      data: appointmentData,
    });
  }

  /**
   * Send appointment reminder
   */
  async appointmentReminder(userId: string, appointmentData: {
    doctorName: string;
    scheduledAt: Date;
    consultationType: string;
    appointmentId: string;
  }): Promise<void> {
    await this.send({
      userId,
      type: 'appointment_reminder',
      title: 'Appointment Reminder',
      body: `Reminder: Your appointment with Dr. ${appointmentData.doctorName} is in 1 hour`,
      data: appointmentData,
    });
  }

  /**
   * Send appointment cancellation notification
   */
  async appointmentCancelled(userId: string, appointmentData: {
    doctorName: string;
    scheduledAt: Date;
    cancelledBy: 'patient' | 'doctor';
    reason?: string;
  }): Promise<void> {
    await this.send({
      userId,
      type: 'appointment_cancelled',
      title: 'Appointment Cancelled',
      body: `Your appointment with Dr. ${appointmentData.doctorName} has been cancelled${appointmentData.reason ? `: ${appointmentData.reason}` : ''}`,
      data: appointmentData,
    });
  }

  /**
   * Send verification status notification (for doctors)
   */
  async verificationStatus(userId: string, status: 'verified' | 'rejected', notes?: string): Promise<void> {
    const title = status === 'verified' ? 'Verification Approved!' : 'Verification Update';
    const body = status === 'verified'
      ? 'Your profile has been verified. You can now accept appointments.'
      : `Your verification requires attention${notes ? `: ${notes}` : ''}`;

    await this.send({
      userId,
      type: 'verification_status',
      title,
      body,
      data: { status, notes },
    });
  }

  /**
   * Send payment received notification
   */
  async paymentReceived(userId: string, paymentData: {
    amount: number;
    currency: string;
    type: 'appointment' | 'order';
  }): Promise<void> {
    await this.send({
      userId,
      type: 'payment_received',
      title: 'Payment Received',
      body: `Your payment of ${paymentData.currency} ${paymentData.amount.toLocaleString()} has been received`,
      data: paymentData,
    });
  }
}

export const notificationService = new NotificationService();
