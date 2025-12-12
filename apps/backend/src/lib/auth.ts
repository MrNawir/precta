/**
 * Better Auth Configuration
 * T029-T032: Authentication setup with email/password and phone OTP
 */

import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { createDbClient } from '@precta/db';

const db = createDbClient(process.env.DATABASE_URL!);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendVerificationEmail: async ({ user, url }: { user: { email: string }; url: string }) => {
      // TODO: Implement email sending with SendGrid/Resend
      console.log(`[Auth] Verification email for ${user.email}: ${url}`);
    },
    sendResetPasswordEmail: async ({ user, url }: { user: { email: string }; url: string }) => {
      // TODO: Implement email sending
      console.log(`[Auth] Reset password email for ${user.email}: ${url}`);
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },

  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: true,
        defaultValue: 'patient',
      },
      phone: {
        type: 'string',
        required: false,
      },
      phoneVerified: {
        type: 'boolean',
        required: false,
        defaultValue: false,
      },
    },
  },

  trustedOrigins: [
    process.env.VITE_APP_URL || 'http://localhost:3000',
  ],

  // Rate limiting
  rateLimit: {
    window: 60, // 1 minute
    max: 10, // 10 requests per minute
  },
});

export type Auth = typeof auth;
