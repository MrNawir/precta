/**
 * T127: Analytics Service
 * Platform metrics and analytics for admin dashboard
 */

import { eq, and, desc, sql, gte, lte, count } from 'drizzle-orm';
import { db } from '../lib/db';
import { users, doctors, appointments, payments, reviews, articles } from '@precta/db';

export interface PlatformMetrics {
  totalUsers: number;
  totalDoctors: number;
  totalPatients: number;
  verifiedDoctors: number;
  pendingVerifications: number;
  totalAppointments: number;
  completedAppointments: number;
  activeConsultations: number;
  todayAppointments: number;
  totalRevenue: number;
  thisMonthRevenue: number;
  totalArticles: number;
  publishedArticles: number;
}

export interface GrowthMetrics {
  users: { current: number; previous: number; growth: number };
  appointments: { current: number; previous: number; growth: number };
  revenue: { current: number; previous: number; growth: number };
}

export interface RecentActivity {
  id: string;
  type: 'registration' | 'appointment' | 'verification' | 'payment' | 'review';
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface TimeSeriesData {
  date: string;
  value: number;
}

class AnalyticsService {
  /**
   * Get platform overview metrics
   */
  async getPlatformMetrics(): Promise<PlatformMetrics> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // User counts
    const [userCount] = await db.select({ count: count() }).from(users);
    const [doctorCount] = await db.select({ count: count() }).from(doctors);
    const [verifiedCount] = await db
      .select({ count: count() })
      .from(doctors)
      .where(eq(doctors.verificationStatus, 'verified'));
    const [pendingCount] = await db
      .select({ count: count() })
      .from(doctors)
      .where(eq(doctors.verificationStatus, 'pending'));

    // Appointment counts
    const [appointmentCount] = await db.select({ count: count() }).from(appointments);
    const [completedCount] = await db
      .select({ count: count() })
      .from(appointments)
      .where(eq(appointments.status, 'completed'));
    const [activeCount] = await db
      .select({ count: count() })
      .from(appointments)
      .where(eq(appointments.status, 'in_progress'));
    const [todayCount] = await db
      .select({ count: count() })
      .from(appointments)
      .where(gte(appointments.scheduledAt, todayStart));

    // Revenue
    const [totalRevenue] = await db
      .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
      .from(payments)
      .where(eq(payments.status, 'completed'));

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const [monthRevenue] = await db
      .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
      .from(payments)
      .where(and(
        eq(payments.status, 'completed'),
        gte(payments.createdAt, monthStart)
      ));

    // Articles
    const [articleCount] = await db.select({ count: count() }).from(articles);
    const [publishedCount] = await db
      .select({ count: count() })
      .from(articles)
      .where(eq(articles.status, 'published'));

    return {
      totalUsers: Number(userCount?.count || 0),
      totalDoctors: Number(doctorCount?.count || 0),
      totalPatients: Number(userCount?.count || 0) - Number(doctorCount?.count || 0),
      verifiedDoctors: Number(verifiedCount?.count || 0),
      pendingVerifications: Number(pendingCount?.count || 0),
      totalAppointments: Number(appointmentCount?.count || 0),
      completedAppointments: Number(completedCount?.count || 0),
      activeConsultations: Number(activeCount?.count || 0),
      todayAppointments: Number(todayCount?.count || 0),
      totalRevenue: Number(totalRevenue?.total || 0),
      thisMonthRevenue: Number(monthRevenue?.total || 0),
      totalArticles: Number(articleCount?.count || 0),
      publishedArticles: Number(publishedCount?.count || 0),
    };
  }

  /**
   * Get growth metrics comparing periods
   */
  async getGrowthMetrics(period: 'week' | 'month' = 'month'): Promise<GrowthMetrics> {
    const now = new Date();
    const currentStart = period === 'week'
      ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const previousStart = period === 'week'
      ? new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
      : new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousEnd = currentStart;

    // User growth
    const [currentUsers] = await db
      .select({ count: count() })
      .from(users)
      .where(gte(users.createdAt, currentStart));
    const [previousUsers] = await db
      .select({ count: count() })
      .from(users)
      .where(and(gte(users.createdAt, previousStart), lte(users.createdAt, previousEnd)));

    // Appointment growth
    const [currentAppts] = await db
      .select({ count: count() })
      .from(appointments)
      .where(gte(appointments.createdAt, currentStart));
    const [previousAppts] = await db
      .select({ count: count() })
      .from(appointments)
      .where(and(gte(appointments.createdAt, previousStart), lte(appointments.createdAt, previousEnd)));

    // Revenue growth
    const [currentRev] = await db
      .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
      .from(payments)
      .where(and(eq(payments.status, 'completed'), gte(payments.createdAt, currentStart)));
    const [previousRev] = await db
      .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
      .from(payments)
      .where(and(
        eq(payments.status, 'completed'),
        gte(payments.createdAt, previousStart),
        lte(payments.createdAt, previousEnd)
      ));

    const calcGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    return {
      users: {
        current: Number(currentUsers?.count || 0),
        previous: Number(previousUsers?.count || 0),
        growth: calcGrowth(Number(currentUsers?.count || 0), Number(previousUsers?.count || 0)),
      },
      appointments: {
        current: Number(currentAppts?.count || 0),
        previous: Number(previousAppts?.count || 0),
        growth: calcGrowth(Number(currentAppts?.count || 0), Number(previousAppts?.count || 0)),
      },
      revenue: {
        current: Number(currentRev?.total || 0),
        previous: Number(previousRev?.total || 0),
        growth: calcGrowth(Number(currentRev?.total || 0), Number(previousRev?.total || 0)),
      },
    };
  }

  /**
   * Get recent platform activity
   */
  async getRecentActivity(limit: number = 20): Promise<RecentActivity[]> {
    const activities: RecentActivity[] = [];

    // Recent registrations
    const recentUsers = await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(5);

    for (const user of recentUsers) {
      activities.push({
        id: `reg-${user.id}`,
        type: 'registration',
        description: `New user registered: ${user.email}`,
        timestamp: user.createdAt,
      });
    }

    // Recent appointments
    const recentAppointments = await db
      .select()
      .from(appointments)
      .orderBy(desc(appointments.createdAt))
      .limit(5);

    for (const appt of recentAppointments) {
      activities.push({
        id: `appt-${appt.id}`,
        type: 'appointment',
        description: `Appointment ${appt.status}: ${appt.id.slice(-6)}`,
        timestamp: appt.createdAt,
      });
    }

    // Recent payments
    const recentPayments = await db
      .select()
      .from(payments)
      .where(eq(payments.status, 'completed'))
      .orderBy(desc(payments.createdAt))
      .limit(5);

    for (const payment of recentPayments) {
      activities.push({
        id: `pay-${payment.id}`,
        type: 'payment',
        description: `Payment received: KES ${Number(payment.amount).toLocaleString()}`,
        timestamp: payment.createdAt,
      });
    }

    // Sort by timestamp and return limited
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get time series data for charts
   */
  async getTimeSeries(
    metric: 'users' | 'appointments' | 'revenue',
    days: number = 30
  ): Promise<TimeSeriesData[]> {
    const result: TimeSeriesData[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      let value = 0;

      switch (metric) {
        case 'users':
          const [userResult] = await db
            .select({ count: count() })
            .from(users)
            .where(and(gte(users.createdAt, dayStart), lte(users.createdAt, dayEnd)));
          value = Number(userResult?.count || 0);
          break;

        case 'appointments':
          const [apptResult] = await db
            .select({ count: count() })
            .from(appointments)
            .where(and(gte(appointments.createdAt, dayStart), lte(appointments.createdAt, dayEnd)));
          value = Number(apptResult?.count || 0);
          break;

        case 'revenue':
          const [revResult] = await db
            .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
            .from(payments)
            .where(and(
              eq(payments.status, 'completed'),
              gte(payments.createdAt, dayStart),
              lte(payments.createdAt, dayEnd)
            ));
          value = Number(revResult?.total || 0);
          break;
      }

      result.push({
        date: dayStart.toISOString().split('T')[0],
        value,
      });
    }

    return result;
  }

  /**
   * Get top performing doctors
   */
  async getTopDoctors(limit: number = 10): Promise<Array<{
    id: string;
    name: string;
    specialty: string;
    appointmentCount: number;
    revenue: number;
    rating: number;
  }>> {
    const results = await db
      .select({
        doctor: doctors,
        appointmentCount: sql<number>`COUNT(DISTINCT ${appointments.id})`,
        revenue: sql<number>`COALESCE(SUM(${payments.amount}), 0)`,
        avgRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
      })
      .from(doctors)
      .leftJoin(appointments, eq(doctors.id, appointments.doctorId))
      .leftJoin(payments, eq(appointments.id, payments.appointmentId))
      .leftJoin(reviews, eq(doctors.id, reviews.doctorId))
      .groupBy(doctors.id)
      .orderBy(desc(sql`COUNT(DISTINCT ${appointments.id})`))
      .limit(limit);

    return results.map(r => ({
      id: r.doctor.id,
      name: r.doctor.displayName || 'Doctor',
      specialty: r.doctor.specialization || 'General',
      appointmentCount: Number(r.appointmentCount),
      revenue: Number(r.revenue),
      rating: Number(r.avgRating),
    }));
  }
}

export const analyticsService = new AnalyticsService();
