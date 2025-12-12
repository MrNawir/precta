/**
 * T128: Admin Analytics Routes
 * Platform metrics and analytics for admin dashboard
 */

import { Elysia, t } from 'elysia';
import { analyticsService } from '../../../services/analytics.service';

const adminAnalyticsRoutes = new Elysia({ prefix: '/admin/analytics' })
  /**
   * GET /admin/analytics/metrics - Get platform overview metrics
   */
  .get('/metrics', async () => {
    try {
      // TODO: Add admin auth check
      const metrics = await analyticsService.getPlatformMetrics();

      return {
        success: true,
        data: metrics,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch metrics',
      };
    }
  })

  /**
   * GET /admin/analytics/growth - Get growth metrics
   */
  .get('/growth', async ({ query }) => {
    try {
      // TODO: Add admin auth check
      const period = (query.period as 'week' | 'month') || 'month';
      const growth = await analyticsService.getGrowthMetrics(period);

      return {
        success: true,
        data: growth,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch growth metrics',
      };
    }
  }, {
    query: t.Object({
      period: t.Optional(t.Union([t.Literal('week'), t.Literal('month')])),
    }),
  })

  /**
   * GET /admin/analytics/activity - Get recent platform activity
   */
  .get('/activity', async ({ query }) => {
    try {
      // TODO: Add admin auth check
      const limit = query.limit ? parseInt(query.limit) : 20;
      const activity = await analyticsService.getRecentActivity(limit);

      return {
        success: true,
        data: activity,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch activity',
      };
    }
  }, {
    query: t.Object({
      limit: t.Optional(t.String()),
    }),
  })

  /**
   * GET /admin/analytics/timeseries - Get time series data for charts
   */
  .get('/timeseries', async ({ query }) => {
    try {
      // TODO: Add admin auth check
      const metric = (query.metric as 'users' | 'appointments' | 'revenue') || 'users';
      const days = query.days ? parseInt(query.days) : 30;
      const data = await analyticsService.getTimeSeries(metric, days);

      return {
        success: true,
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch time series',
      };
    }
  }, {
    query: t.Object({
      metric: t.Optional(t.Union([
        t.Literal('users'),
        t.Literal('appointments'),
        t.Literal('revenue'),
      ])),
      days: t.Optional(t.String()),
    }),
  })

  /**
   * GET /admin/analytics/doctors/top - Get top performing doctors
   */
  .get('/doctors/top', async ({ query }) => {
    try {
      // TODO: Add admin auth check
      const limit = query.limit ? parseInt(query.limit) : 10;
      const doctors = await analyticsService.getTopDoctors(limit);

      return {
        success: true,
        data: doctors,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch top doctors',
      };
    }
  }, {
    query: t.Object({
      limit: t.Optional(t.String()),
    }),
  });

export default adminAnalyticsRoutes;
