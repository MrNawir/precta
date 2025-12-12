/**
 * T049: Payment Service
 * Paystack integration for M-Pesa and card payments
 */

import { eq, desc } from 'drizzle-orm';
import { db } from '../lib/db';
import { payments, appointments } from '@precta/db';
import { createId } from '@paralleldrive/cuid2';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'mpesa' | 'card';
export type PaymentType = 'appointment' | 'order';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

export interface InitializePaymentInput {
  userId: string;
  type: PaymentType;
  amount: number;
  currency?: string;
  method: PaymentMethod;
  email: string;
  appointmentId?: string;
  orderId?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentDetails {
  id: string;
  userId: string;
  type: PaymentType;
  amount: string;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  provider: string;
  providerReference: string | null;
  providerResponse: unknown;
  paidAt: Date | null;
  createdAt: Date;
}

interface PaystackInitResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    status: string;
    reference: string;
    amount: number;
    currency: string;
    channel: string;
    paid_at: string;
    metadata: Record<string, unknown>;
  };
}

class PaymentService {
  private async paystackRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    body?: Record<string, unknown>
  ): Promise<T> {
    const response = await fetch(`${PAYSTACK_BASE_URL}${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Paystack error: ${response.statusText} - ${JSON.stringify(error)}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Initialize a payment
   */
  async initialize(input: InitializePaymentInput): Promise<{
    paymentId: string;
    authorizationUrl: string;
    reference: string;
  }> {
    // Generate unique reference
    const reference = `PRECTA-${createId()}`;
    const paymentId = createId();

    // Create payment record
    await db.insert(payments).values({
      id: paymentId,
      userId: input.userId,
      type: input.type,
      amount: input.amount.toString(),
      currency: input.currency || 'KES',
      method: input.method,
      status: 'pending',
      provider: 'paystack',
      providerReference: reference,
    });

    // Initialize with Paystack
    const paystackResponse = await this.paystackRequest<PaystackInitResponse>(
      '/transaction/initialize',
      'POST',
      {
        email: input.email,
        amount: input.amount * 100, // Paystack uses kobo/cents
        currency: input.currency || 'KES',
        reference,
        callback_url: `${process.env.VITE_APP_URL}/payments/callback`,
        channels: input.method === 'mpesa' ? ['mobile_money'] : ['card'],
        metadata: {
          payment_id: paymentId,
          type: input.type,
          appointment_id: input.appointmentId,
          order_id: input.orderId,
          ...input.metadata,
        },
      }
    );

    if (!paystackResponse.status) {
      throw new Error(`Payment initialization failed: ${paystackResponse.message}`);
    }

    return {
      paymentId,
      authorizationUrl: paystackResponse.data.authorization_url,
      reference: paystackResponse.data.reference,
    };
  }

  /**
   * Verify payment status
   */
  async verify(reference: string): Promise<PaymentDetails | null> {
    // Get payment by reference
    const paymentRecord = await db
      .select()
      .from(payments)
      .where(eq(payments.providerReference, reference))
      .limit(1);

    if (!paymentRecord.length) {
      return null;
    }

    const payment = paymentRecord[0];

    // If already completed, return
    if (payment.status === 'completed') {
      return this.formatPayment(payment);
    }

    // Verify with Paystack
    try {
      const verification = await this.paystackRequest<PaystackVerifyResponse>(
        `/transaction/verify/${reference}`
      );

      if (verification.data.status === 'success') {
        // Update payment record
        await db
          .update(payments)
          .set({
            status: 'completed',
            providerResponse: verification.data,
            paidAt: new Date(verification.data.paid_at),
          })
          .where(eq(payments.id, payment.id));

        // If this is an appointment payment, confirm the appointment
        const metadata = verification.data.metadata as { appointment_id?: string };
        if (metadata?.appointment_id) {
          await this.confirmAppointmentPayment(metadata.appointment_id, payment.id);
        }

        return this.getById(payment.id);
      } else if (verification.data.status === 'failed') {
        await db
          .update(payments)
          .set({
            status: 'failed',
            providerResponse: verification.data,
          })
          .where(eq(payments.id, payment.id));
      }
    } catch (error) {
      console.error('[PaymentService] Verification error:', error);
    }

    return this.getById(payment.id);
  }

  /**
   * Handle Paystack webhook
   */
  async handleWebhook(event: string, data: Record<string, unknown>): Promise<void> {
    console.log('[PaymentService] Webhook received:', event);

    if (event === 'charge.success') {
      const reference = data.reference as string;
      await this.verify(reference);
    }
  }

  /**
   * Get payment by ID
   */
  async getById(id: string): Promise<PaymentDetails | null> {
    const result = await db
      .select()
      .from(payments)
      .where(eq(payments.id, id))
      .limit(1);

    if (!result.length) return null;

    return this.formatPayment(result[0]);
  }

  /**
   * Get payments for a user
   */
  async getByUser(userId: string, options?: {
    type?: PaymentType;
    status?: PaymentStatus;
    page?: number;
    limit?: number;
  }): Promise<{ data: PaymentDetails[]; total: number }> {
    const page = options?.page || 1;
    const limit = Math.min(options?.limit || 20, 50);
    const offset = (page - 1) * limit;

    // Simple query without dynamic conditions for now
    const result = await db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.createdAt))
      .limit(limit)
      .offset(offset);

    const data = result.map(this.formatPayment);

    return { data, total: data.length };
  }

  /**
   * Request refund
   */
  async refund(paymentId: string, reason?: string): Promise<PaymentDetails | null> {
    const payment = await this.getById(paymentId);
    
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== 'completed') {
      throw new Error('Can only refund completed payments');
    }

    // TODO: Implement Paystack refund API
    // For now, just update status
    await db
      .update(payments)
      .set({ status: 'refunded' })
      .where(eq(payments.id, paymentId));

    return this.getById(paymentId);
  }

  /**
   * Confirm appointment after payment
   */
  private async confirmAppointmentPayment(appointmentId: string, paymentId: string): Promise<void> {
    await db
      .update(appointments)
      .set({
        status: 'confirmed',
        paymentId,
      })
      .where(eq(appointments.id, appointmentId));

    // TODO: Send confirmation notification
    console.log(`[PaymentService] Appointment ${appointmentId} confirmed after payment`);
  }

  private formatPayment(payment: typeof payments.$inferSelect): PaymentDetails {
    return {
      id: payment.id,
      userId: payment.userId,
      type: payment.type as PaymentType,
      amount: payment.amount,
      currency: payment.currency,
      method: payment.method as PaymentMethod,
      status: payment.status as PaymentStatus,
      provider: payment.provider,
      providerReference: payment.providerReference,
      providerResponse: payment.providerResponse,
      paidAt: payment.paidAt,
      createdAt: payment.createdAt,
    };
  }
}

export const paymentService = new PaymentService();
