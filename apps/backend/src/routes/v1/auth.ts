/**
 * T051: Auth Routes
 * Authentication endpoints: register, login, logout, me
 */

import { Elysia, t } from 'elysia';
import { auth } from '../../lib/auth';
import { db } from '../../lib/db';
import { patients, doctors } from '@precta/db';
import { createId } from '@paralleldrive/cuid2';

export const authRoutes = new Elysia({ prefix: '/auth' })
  // Register patient
  .post(
    '/register',
    async ({ body, set }) => {
      try {
        // Create user with Better Auth
        const result = await auth.api.signUpEmail({
          body: {
            email: body.email,
            password: body.password,
            name: body.name || `${body.firstName} ${body.lastName}`,
            role: body.role || 'patient',
          },
        });

        if (!result.user) {
          set.status = 400;
          return { success: false, error: 'Registration failed' };
        }

        // Create patient profile if role is patient
        if (body.role === 'patient' || !body.role) {
          await db.insert(patients).values({
            id: result.user.id,
            firstName: body.firstName,
            lastName: body.lastName,
            dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
            gender: body.gender || null,
            preferredLanguage: body.preferredLanguage || 'en',
          });
        }

        // Create doctor profile if role is doctor
        if (body.role === 'doctor') {
          await db.insert(doctors).values({
            id: result.user.id,
            firstName: body.firstName,
            lastName: body.lastName,
            specialties: body.specialties || [],
            consultationFee: body.consultationFee?.toString() || '0',
            consultationDurationMinutes: body.consultationDurationMinutes || 30,
            consultationModes: ['in_person'],
            verificationStatus: 'pending',
          });
        }

        return {
          success: true,
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            role: body.role || 'patient',
          },
        };
      } catch (error) {
        console.error('[Auth] Registration error:', error);
        set.status = 400;
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Registration failed',
        };
      }
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
        password: t.String({ minLength: 8 }),
        firstName: t.String({ minLength: 1 }),
        lastName: t.String({ minLength: 1 }),
        name: t.Optional(t.String()),
        role: t.Optional(t.Union([t.Literal('patient'), t.Literal('doctor')])),
        phone: t.Optional(t.String()),
        dateOfBirth: t.Optional(t.String()),
        gender: t.Optional(t.String()),
        preferredLanguage: t.Optional(t.String()),
        // Doctor-specific fields
        specialties: t.Optional(t.Array(t.String())),
        consultationFee: t.Optional(t.Number()),
        consultationDurationMinutes: t.Optional(t.Number()),
      }),
      detail: {
        tags: ['auth'],
        summary: 'Register a new user',
      },
    }
  )

  // Login
  .post(
    '/login',
    async ({ body, set }) => {
      try {
        const result = await auth.api.signInEmail({
          body: {
            email: body.email,
            password: body.password,
          },
        });

        if (!result.user) {
          set.status = 401;
          return { success: false, error: 'Invalid credentials' };
        }

        return {
          success: true,
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            role: result.user.role || 'patient',
          },
          session: result.session,
        };
      } catch (error) {
        console.error('[Auth] Login error:', error);
        set.status = 401;
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Login failed',
        };
      }
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
        password: t.String(),
      }),
      detail: {
        tags: ['auth'],
        summary: 'Login with email and password',
      },
    }
  )

  // Logout
  .post(
    '/logout',
    async ({ request, set }) => {
      try {
        await auth.api.signOut({
          headers: request.headers,
        });

        return { success: true };
      } catch (error) {
        console.error('[Auth] Logout error:', error);
        set.status = 500;
        return { success: false, error: 'Logout failed' };
      }
    },
    {
      detail: {
        tags: ['auth'],
        summary: 'Logout current user',
      },
    }
  )

  // Get current user
  .get(
    '/me',
    async ({ request, set }) => {
      try {
        const session = await auth.api.getSession({
          headers: request.headers,
        });

        if (!session?.user) {
          set.status = 401;
          return { success: false, error: 'Not authenticated' };
        }

        return {
          success: true,
          user: {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            role: session.user.role || 'patient',
            emailVerified: session.user.emailVerified,
            image: session.user.image,
          },
        };
      } catch (error) {
        console.error('[Auth] Get user error:', error);
        set.status = 401;
        return { success: false, error: 'Not authenticated' };
      }
    },
    {
      detail: {
        tags: ['auth'],
        summary: 'Get current authenticated user',
      },
    }
  )

  // Verify email
  .post(
    '/verify-email',
    async ({ body, set }) => {
      try {
        await auth.api.verifyEmail({
          query: { token: body.token },
        });

        return { success: true, message: 'Email verified successfully' };
      } catch (error) {
        console.error('[Auth] Email verification error:', error);
        set.status = 400;
        return { success: false, error: 'Invalid or expired token' };
      }
    },
    {
      body: t.Object({
        token: t.String(),
      }),
      detail: {
        tags: ['auth'],
        summary: 'Verify email address',
      },
    }
  )

  // Request password reset
  .post(
    '/forgot-password',
    async ({ body, set }) => {
      try {
        await auth.api.forgetPassword({
          body: { email: body.email },
        });

        return { success: true, message: 'Password reset email sent' };
      } catch (error) {
        console.error('[Auth] Forgot password error:', error);
        // Don't reveal if email exists or not
        return { success: true, message: 'If email exists, reset instructions were sent' };
      }
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
      }),
      detail: {
        tags: ['auth'],
        summary: 'Request password reset',
      },
    }
  )

  // Reset password
  .post(
    '/reset-password',
    async ({ body, set }) => {
      try {
        await auth.api.resetPassword({
          body: {
            token: body.token,
            newPassword: body.password,
          },
        });

        return { success: true, message: 'Password reset successfully' };
      } catch (error) {
        console.error('[Auth] Reset password error:', error);
        set.status = 400;
        return { success: false, error: 'Invalid or expired token' };
      }
    },
    {
      body: t.Object({
        token: t.String(),
        password: t.String({ minLength: 8 }),
      }),
      detail: {
        tags: ['auth'],
        summary: 'Reset password with token',
      },
    }
  );
