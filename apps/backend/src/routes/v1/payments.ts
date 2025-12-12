/**
 * T054: Payments Routes
 * Payment initialization and webhook endpoints
 */

import { Elysia, t } from 'elysia';
import { paymentService } from '../../services/payment.service';
import { authMiddleware } from '../../middleware/auth';
import crypto from 'crypto';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || '';

export const paymentsRoutes = new Elysia({ prefix: '/payments' })
  // Initialize payment (authenticated)
  .use(authMiddleware)
  .post(
    '/initialize',
    async ({ body, user, set }) => {
      if (!user) {
        set.status = 401;
        return { success: false, error: 'Authentication required' };
      }

      try {
        const result = await paymentService.initialize({
          userId: user.id,
          type: body.type,
          amount: body.amount,
          currency: body.currency || 'KES',
          method: body.method,
          email: user.email,
          appointmentId: body.appointmentId,
          orderId: body.orderId,
          metadata: body.metadata,
        });

        return {
          success: true,
          data: {
            paymentId: result.paymentId,
            authorizationUrl: result.authorizationUrl,
            reference: result.reference,
          },
        };
      } catch (error) {
        console.error('[Payments] Initialize error:', error);
        set.status = 400;
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Payment initialization failed',
        };
      }
    },
    {
      body: t.Object({
        type: t.Union([t.Literal('appointment'), t.Literal('order')]),
        amount: t.Number({ minimum: 1 }),
        currency: t.Optional(t.String()),
        method: t.Union([t.Literal('mpesa'), t.Literal('card')]),
        appointmentId: t.Optional(t.String()),
        orderId: t.Optional(t.String()),
        metadata: t.Optional(t.Record(t.String(), t.Any())),
      }),
      detail: {
        tags: ['payments'],
        summary: 'Initialize a payment',
      },
    }
  )

  // Verify payment
  .get(
    '/verify/:reference',
    async ({ params, user, set }) => {
      if (!user) {
        set.status = 401;
        return { success: false, error: 'Authentication required' };
      }

      try {
        const payment = await paymentService.verify(params.reference);

        if (!payment) {
          set.status = 404;
          return { success: false, error: 'Payment not found' };
        }

        return { success: true, data: payment };
      } catch (error) {
        console.error('[Payments] Verify error:', error);
        set.status = 400;
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Verification failed',
        };
      }
    },
    {
      params: t.Object({
        reference: t.String(),
      }),
      detail: {
        tags: ['payments'],
        summary: 'Verify payment status',
      },
    }
  )

  // Get my payments
  .get(
    '/my',
    async ({ user, query, set }) => {
      if (!user) {
        set.status = 401;
        return { success: false, error: 'Authentication required' };
      }

      const result = await paymentService.getByUser(user.id, {
        type: query.type as 'appointment' | 'order' | undefined,
        status: query.status as any,
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 20,
      });

      return {
        success: true,
        data: result.data,
        pagination: {
          page: query.page ? parseInt(query.page, 10) : 1,
          limit: query.limit ? parseInt(query.limit, 10) : 20,
          total: result.total,
        },
      };
    },
    {
      query: t.Object({
        type: t.Optional(t.String()),
        status: t.Optional(t.String()),
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
      }),
      detail: {
        tags: ['payments'],
        summary: 'Get my payment history',
      },
    }
  )

  // Get payment by ID
  .get(
    '/:id',
    async ({ params, user, set }) => {
      if (!user) {
        set.status = 401;
        return { success: false, error: 'Authentication required' };
      }

      const payment = await paymentService.getById(params.id);

      if (!payment) {
        set.status = 404;
        return { success: false, error: 'Payment not found' };
      }

      // Check access
      if (payment.userId !== user.id && user.role !== 'admin') {
        set.status = 403;
        return { success: false, error: 'Access denied' };
      }

      return { success: true, data: payment };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ['payments'],
        summary: 'Get payment by ID',
      },
    }
  );

// Paystack Webhook (separate route without auth)
export const paymentsWebhookRoutes = new Elysia({ prefix: '/webhooks/paystack' })
  .post(
    '/',
    async ({ request, body, set }) => {
      // Verify Paystack signature
      const signature = request.headers.get('x-paystack-signature');
      
      if (!signature) {
        set.status = 400;
        return { success: false, error: 'Missing signature' };
      }

      const bodyString = JSON.stringify(body);
      const hash = crypto
        .createHmac('sha512', PAYSTACK_SECRET)
        .update(bodyString)
        .digest('hex');

      if (hash !== signature) {
        console.error('[Webhook] Invalid Paystack signature');
        set.status = 400;
        return { success: false, error: 'Invalid signature' };
      }

      // Process webhook
      try {
        const event = (body as { event: string; data: Record<string, unknown> }).event;
        const data = (body as { event: string; data: Record<string, unknown> }).data;

        console.log(`[Webhook] Received Paystack event: ${event}`);

        await paymentService.handleWebhook(event, data);

        return { success: true };
      } catch (error) {
        console.error('[Webhook] Processing error:', error);
        // Return 200 to prevent Paystack from retrying
        return { success: false, error: 'Processing failed' };
      }
    },
    {
      detail: {
        tags: ['webhooks'],
        summary: 'Paystack webhook endpoint',
      },
    }
  );
