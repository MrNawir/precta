/**
 * T055: V1 Routes Index
 * Combines all v1 API routes
 */

import { Elysia } from 'elysia';
import { authRoutes } from './auth';
import { doctorsRoutes } from './doctors';
import { appointmentsRoutes } from './appointments';
import { paymentsRoutes, paymentsWebhookRoutes } from './payments';

/**
 * API v1 Routes
 * All routes are prefixed with /api/v1
 */
export const v1Routes = new Elysia({ prefix: '/api/v1' })
  .use(authRoutes)
  .use(doctorsRoutes)
  .use(appointmentsRoutes)
  .use(paymentsRoutes);

/**
 * Webhook Routes (no prefix, no auth)
 */
export const webhookRoutes = new Elysia()
  .use(paymentsWebhookRoutes);

// Export individual routes for testing
export { authRoutes, doctorsRoutes, appointmentsRoutes, paymentsRoutes };
