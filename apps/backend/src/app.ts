/**
 * Precta Elysia Application
 * T034: Create Elysia app with plugins
 * T151: OpenAPI documentation setup
 */

import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { authRoutes } from './routes/auth';
import { doctorRoutes } from './routes/doctors';
import { appointmentRoutes } from './routes/appointments';

// Create Elysia app with plugins
export const app = new Elysia()
  .use(
    cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
    })
  )
  // OpenAPI Documentation (T151)
  // Access: /swagger for UI, /swagger/json for spec
  .use(
    swagger({
      path: '/swagger',
      documentation: {
        info: {
          title: 'Precta Healthcare API',
          version: '1.0.0',
          description: `
# Precta Healthcare Platform API

A Kenya-focused telemedicine platform connecting patients with doctors.

## Features
- Doctor search and profiles
- Appointment booking
- M-Pesa payment integration (Paystack)
- Video consultations (100ms)
- Medical records management
- Prescriptions
- Reviews and ratings

## Authentication
Most endpoints require authentication via session cookies. 
Login at \`/api/v1/auth/login\` to get a session.

## Rate Limits
- General: 100 req/min
- Auth: 10 req/min
- Payments: 20 req/min

## Support
Contact: support@precta.co.ke
          `.trim(),
          contact: {
            name: 'Precta Support',
            email: 'support@precta.co.ke',
            url: 'https://precta.co.ke',
          },
          license: {
            name: 'MIT',
            url: 'https://opensource.org/licenses/MIT',
          },
        },
        servers: [
          { url: 'http://localhost:3001', description: 'Development' },
          { url: 'https://api.precta.co.ke', description: 'Production' },
        ],
        tags: [
          { name: 'auth', description: 'Authentication & user management' },
          { name: 'doctors', description: 'Doctor profiles, search, and availability' },
          { name: 'appointments', description: 'Appointment booking and management' },
          { name: 'consultations', description: 'Video consultation sessions' },
          { name: 'payments', description: 'Payment processing with M-Pesa/Paystack' },
          { name: 'prescriptions', description: 'Digital prescriptions' },
          { name: 'records', description: 'Medical records management' },
          { name: 'reviews', description: 'Doctor reviews and ratings' },
          { name: 'articles', description: 'Health articles and content' },
          { name: 'admin', description: 'Admin dashboard and moderation' },
        ],
        components: {
          securitySchemes: {
            cookieAuth: {
              type: 'apiKey',
              in: 'cookie',
              name: 'session',
            },
          },
        },
      },
    })
  )
  // Health check endpoint
  .get('/health', () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  }), {
    detail: {
      tags: ['system'],
      summary: 'Health check',
      description: 'Returns API health status',
    },
  })
  // Auth routes
  .use(authRoutes)
  // API v1 routes
  .group('/api/v1', (app) =>
    app
      .get('/', () => ({ 
        message: 'Welcome to Precta API v1',
        docs: '/swagger',
        health: '/health',
      }))
      .use(doctorRoutes)
      .use(appointmentRoutes)
  );

// Export app type for Eden Treaty
export type App = typeof app;
