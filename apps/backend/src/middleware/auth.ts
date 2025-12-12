/**
 * T039: Auth Middleware
 * Authentication and authorization middleware for Elysia routes
 */

import { Elysia } from 'elysia';
import { auth } from '../lib/auth';

/**
 * User roles hierarchy
 */
export const ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  ADMIN: 'admin',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

/**
 * Session user type
 */
export interface SessionUser {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  phone?: string;
  phoneVerified?: boolean;
  emailVerified?: boolean;
  image?: string;
}

/**
 * Auth middleware that validates session and extracts user
 */
export const authMiddleware = new Elysia({ name: 'auth' })
  .derive(async ({ request, set }) => {
    try {
      // Get session from Better Auth
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session || !session.user) {
        return { user: null, session: null };
      }

      const user: SessionUser = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name || undefined,
        role: (session.user.role as UserRole) || ROLES.PATIENT,
        phone: session.user.phone || undefined,
        phoneVerified: session.user.phoneVerified || false,
        emailVerified: session.user.emailVerified || false,
        image: session.user.image || undefined,
      };

      return { user, session };
    } catch (error) {
      console.error('[Auth] Session validation error:', error);
      return { user: null, session: null };
    }
  });

/**
 * Guard that requires authentication
 */
export const requireAuth = new Elysia({ name: 'require-auth' })
  .use(authMiddleware)
  .onBeforeHandle(({ user, set }) => {
    if (!user) {
      set.status = 401;
      return { success: false, error: 'Authentication required' };
    }
  });

/**
 * Guard that requires a specific role
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return new Elysia({ name: `require-role-${allowedRoles.join('-')}` })
    .use(authMiddleware)
    .onBeforeHandle(({ user, set }) => {
      if (!user) {
        set.status = 401;
        return { success: false, error: 'Authentication required' };
      }
      if (!allowedRoles.includes(user.role)) {
        set.status = 403;
        return { success: false, error: `Access denied. Required roles: ${allowedRoles.join(', ')}` };
      }
    });
}

/**
 * Guard that requires patient role
 */
export const requirePatient = requireRole(ROLES.PATIENT, ROLES.ADMIN);

/**
 * Guard that requires doctor role
 */
export const requireDoctor = requireRole(ROLES.DOCTOR, ROLES.ADMIN);

/**
 * Guard that requires admin role
 */
export const requireAdmin = requireRole(ROLES.ADMIN);

/**
 * Optional auth - doesn't fail if not authenticated
 */
export const optionalAuth = authMiddleware;

export type { SessionUser as User };
