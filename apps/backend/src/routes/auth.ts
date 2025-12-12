/**
 * Auth Routes
 * T033-T036: Auth endpoints integration with Elysia
 */

import { Elysia } from 'elysia';
import { auth } from '../lib/auth';

export const authRoutes = new Elysia({ prefix: '/auth' })
  .all('/*', async ({ request }) => {
    // Forward all auth requests to Better Auth
    return auth.handler(request);
  });
