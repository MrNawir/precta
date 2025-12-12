/**
 * T113: Revenue Service
 * Doctor earnings and payout management
 */

import { eq, and, desc, sql, gte, lte, sum } from 'drizzle-orm';
import { db } from '../lib/db';
import { appointments, payments, doctors } from '@precta/db';
import { createId } from '@paralleldrive/cuid2';

export interface RevenueSummary {
  totalEarnings: number;
  pendingPayout: number;
  totalPaidOut: number;
  thisMonthEarnings: number;
  lastMonthEarnings: number;
  currency: string;
}

export interface Transaction {
  id: string;
  type: 'earning' | 'payout' | 'refund';
  amount: number;
  currency: string;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  appointmentId?: string;
  patientName?: string;
  createdAt: Date;
}

export interface PayoutRequest {
  id: string;
  doctorId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  bankDetails: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  requestedAt: Date;
  processedAt?: Date;
}

class RevenueService {
  private readonly PLATFORM_FEE_PERCENT = 15; // 15% platform fee
  private readonly MIN_PAYOUT_AMOUNT = 1000; // KES 1000 minimum
  private readonly CURRENCY = 'KES';

  /**
   * Get revenue summary for a doctor
   */
  async getSummary(doctorId: string): Promise<RevenueSummary> {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get total earnings from completed appointments
    const totalResult = await db
      .select({ total: sum(payments.amount) })
      .from(payments)
      .innerJoin(appointments, eq(payments.appointmentId, appointments.id))
      .where(and(
        eq(appointments.doctorId, doctorId),
        eq(appointments.status, 'completed'),
        eq(payments.status, 'completed')
      ));

    const totalEarnings = Number(totalResult[0]?.total || 0);

    // Get this month earnings
    const thisMonthResult = await db
      .select({ total: sum(payments.amount) })
      .from(payments)
      .innerJoin(appointments, eq(payments.appointmentId, appointments.id))
      .where(and(
        eq(appointments.doctorId, doctorId),
        eq(appointments.status, 'completed'),
        eq(payments.status, 'completed'),
        gte(payments.createdAt, thisMonthStart)
      ));

    const thisMonthEarnings = Number(thisMonthResult[0]?.total || 0);

    // Get last month earnings
    const lastMonthResult = await db
      .select({ total: sum(payments.amount) })
      .from(payments)
      .innerJoin(appointments, eq(payments.appointmentId, appointments.id))
      .where(and(
        eq(appointments.doctorId, doctorId),
        eq(appointments.status, 'completed'),
        eq(payments.status, 'completed'),
        gte(payments.createdAt, lastMonthStart),
        lte(payments.createdAt, lastMonthEnd)
      ));

    const lastMonthEarnings = Number(lastMonthResult[0]?.total || 0);

    // Calculate doctor's share after platform fee
    const doctorShare = (100 - this.PLATFORM_FEE_PERCENT) / 100;
    const netEarnings = Math.floor(totalEarnings * doctorShare);
    const netThisMonth = Math.floor(thisMonthEarnings * doctorShare);
    const netLastMonth = Math.floor(lastMonthEarnings * doctorShare);

    // For now, assume all is pending (no actual payout tracking yet)
    const pendingPayout = netEarnings;
    const totalPaidOut = 0;

    return {
      totalEarnings: netEarnings,
      pendingPayout,
      totalPaidOut,
      thisMonthEarnings: netThisMonth,
      lastMonthEarnings: netLastMonth,
      currency: this.CURRENCY,
    };
  }

  /**
   * Get transaction history for a doctor
   */
  async getTransactions(
    doctorId: string,
    options?: {
      type?: 'earning' | 'payout' | 'refund';
      startDate?: Date;
      endDate?: Date;
      page?: number;
      limit?: number;
    }
  ): Promise<{ data: Transaction[]; total: number }> {
    const page = options?.page || 1;
    const limit = Math.min(options?.limit || 20, 50);
    const offset = (page - 1) * limit;

    // Get earnings from completed appointments
    const conditions = [
      eq(appointments.doctorId, doctorId),
      eq(appointments.status, 'completed'),
      eq(payments.status, 'completed'),
    ];

    if (options?.startDate) {
      conditions.push(gte(payments.createdAt, options.startDate));
    }
    if (options?.endDate) {
      conditions.push(lte(payments.createdAt, options.endDate));
    }

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(payments)
      .innerJoin(appointments, eq(payments.appointmentId, appointments.id))
      .where(and(...conditions));

    const total = Number(countResult[0]?.count || 0);

    const results = await db
      .select({
        payment: payments,
        appointment: appointments,
      })
      .from(payments)
      .innerJoin(appointments, eq(payments.appointmentId, appointments.id))
      .where(and(...conditions))
      .orderBy(desc(payments.createdAt))
      .limit(limit)
      .offset(offset);

    const doctorShare = (100 - this.PLATFORM_FEE_PERCENT) / 100;

    const transactions: Transaction[] = results.map(r => ({
      id: r.payment.id,
      type: 'earning' as const,
      amount: Math.floor(Number(r.payment.amount) * doctorShare),
      currency: this.CURRENCY,
      description: `Consultation fee`,
      status: 'completed' as const,
      appointmentId: r.appointment.id,
      createdAt: r.payment.createdAt,
    }));

    return { data: transactions, total };
  }

  /**
   * Request a payout
   */
  async requestPayout(
    doctorId: string,
    amount: number,
    bankDetails: PayoutRequest['bankDetails']
  ): Promise<PayoutRequest> {
    // Validate amount
    if (amount < this.MIN_PAYOUT_AMOUNT) {
      throw new Error(`Minimum payout amount is ${this.CURRENCY} ${this.MIN_PAYOUT_AMOUNT}`);
    }

    // Check available balance
    const summary = await this.getSummary(doctorId);
    if (amount > summary.pendingPayout) {
      throw new Error('Insufficient balance');
    }

    // Create payout request (would typically store in a payouts table)
    const payoutId = createId();
    
    // In production, this would initiate actual payout via payment provider

    return {
      id: payoutId,
      doctorId,
      amount,
      currency: this.CURRENCY,
      status: 'pending',
      bankDetails,
      requestedAt: new Date(),
    };
  }

  /**
   * Get monthly earnings breakdown
   */
  async getMonthlyBreakdown(
    doctorId: string,
    year: number = new Date().getFullYear()
  ): Promise<{ month: number; earnings: number }[]> {
    const breakdown: { month: number; earnings: number }[] = [];
    const doctorShare = (100 - this.PLATFORM_FEE_PERCENT) / 100;

    for (let month = 0; month < 12; month++) {
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);

      const result = await db
        .select({ total: sum(payments.amount) })
        .from(payments)
        .innerJoin(appointments, eq(payments.appointmentId, appointments.id))
        .where(and(
          eq(appointments.doctorId, doctorId),
          eq(appointments.status, 'completed'),
          eq(payments.status, 'completed'),
          gte(payments.createdAt, startDate),
          lte(payments.createdAt, endDate)
        ));

      const earnings = Math.floor(Number(result[0]?.total || 0) * doctorShare);
      breakdown.push({ month: month + 1, earnings });
    }

    return breakdown;
  }

  /**
   * Get earnings stats
   */
  async getStats(doctorId: string): Promise<{
    totalConsultations: number;
    avgEarningPerConsultation: number;
    topEarningMonth: { month: number; earnings: number };
  }> {
    // Count completed consultations
    const consultResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(appointments)
      .where(and(
        eq(appointments.doctorId, doctorId),
        eq(appointments.status, 'completed')
      ));

    const totalConsultations = Number(consultResult[0]?.count || 0);

    // Get summary for average calculation
    const summary = await this.getSummary(doctorId);
    const avgEarning = totalConsultations > 0 
      ? Math.floor(summary.totalEarnings / totalConsultations) 
      : 0;

    // Get monthly breakdown for top month
    const monthly = await this.getMonthlyBreakdown(doctorId);
    const topMonth = monthly.reduce((max, curr) => 
      curr.earnings > max.earnings ? curr : max,
      { month: 1, earnings: 0 }
    );

    return {
      totalConsultations,
      avgEarningPerConsultation: avgEarning,
      topEarningMonth: topMonth,
    };
  }
}

export const revenueService = new RevenueService();
