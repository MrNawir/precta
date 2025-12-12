/**
 * T104: Orders Routes
 * Medicine order API endpoints
 */

import { Elysia, t } from 'elysia';
import { orderService, type OrderStatus } from '../../services/order.service';
import { authMiddleware } from '../../middleware/auth';

export const ordersRoutes = new Elysia({ prefix: '/orders' })
  .use(authMiddleware)

  // Create order
  .post(
    '/',
    async ({ body, user, set }) => {
      if (!user) {
        set.status = 401;
        return { success: false, error: 'Authentication required' };
      }

      try {
        const order = await orderService.create({
          patientId: user.id,
          prescriptionId: body.prescriptionId,
          items: body.items,
          deliveryAddress: body.deliveryAddress,
        });

        return { success: true, data: order };
      } catch (error) {
        console.error('[Orders] Create error:', error);
        set.status = 400;
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create order',
        };
      }
    },
    {
      body: t.Object({
        prescriptionId: t.Optional(t.String()),
        items: t.Array(t.Object({
          medicationName: t.String(),
          dosage: t.String(),
          quantity: t.Number(),
          unitPrice: t.Number(),
        })),
        deliveryAddress: t.Object({
          street: t.String(),
          city: t.String(),
          county: t.String(),
          postalCode: t.Optional(t.String()),
          phone: t.String(),
          notes: t.Optional(t.String()),
        }),
      }),
      detail: {
        tags: ['orders'],
        summary: 'Create an order',
      },
    }
  )

  // Create order from prescription
  .post(
    '/from-prescription',
    async ({ body, user, set }) => {
      if (!user) {
        set.status = 401;
        return { success: false, error: 'Authentication required' };
      }

      try {
        const order = await orderService.createFromPrescription(
          body.prescriptionId,
          user.id,
          body.deliveryAddress,
          body.pricing || {}
        );

        return { success: true, data: order };
      } catch (error) {
        console.error('[Orders] Create from prescription error:', error);
        set.status = 400;
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create order',
        };
      }
    },
    {
      body: t.Object({
        prescriptionId: t.String(),
        deliveryAddress: t.Object({
          street: t.String(),
          city: t.String(),
          county: t.String(),
          postalCode: t.Optional(t.String()),
          phone: t.String(),
          notes: t.Optional(t.String()),
        }),
        pricing: t.Optional(t.Record(t.String(), t.Number())),
      }),
      detail: {
        tags: ['orders'],
        summary: 'Create order from prescription',
      },
    }
  )

  // Get my orders
  .get(
    '/my',
    async ({ user, query, set }) => {
      if (!user) {
        set.status = 401;
        return { success: false, error: 'Authentication required' };
      }

      try {
        const result = await orderService.getPatientOrders(user.id, {
          status: query.status as OrderStatus | undefined,
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
      } catch (error) {
        console.error('[Orders] Get error:', error);
        set.status = 400;
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get orders',
        };
      }
    },
    {
      query: t.Object({
        status: t.Optional(t.String()),
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
      }),
      detail: {
        tags: ['orders'],
        summary: 'Get my orders',
      },
    }
  )

  // Get order by ID
  .get(
    '/:id',
    async ({ params, user, set }) => {
      if (!user) {
        set.status = 401;
        return { success: false, error: 'Authentication required' };
      }

      try {
        const order = await orderService.getById(params.id, user.id);

        if (!order) {
          set.status = 404;
          return { success: false, error: 'Order not found' };
        }

        return { success: true, data: order };
      } catch (error) {
        console.error('[Orders] Get error:', error);
        set.status = error instanceof Error && error.message === 'Access denied' ? 403 : 400;
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get order',
        };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ['orders'],
        summary: 'Get order by ID',
      },
    }
  )

  // Cancel order
  .post(
    '/:id/cancel',
    async ({ params, body, user, set }) => {
      if (!user) {
        set.status = 401;
        return { success: false, error: 'Authentication required' };
      }

      try {
        await orderService.cancel(params.id, user.id, body?.reason);
        return { success: true, message: 'Order cancelled' };
      } catch (error) {
        console.error('[Orders] Cancel error:', error);
        set.status = 400;
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to cancel order',
        };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Optional(t.Object({
        reason: t.Optional(t.String()),
      })),
      detail: {
        tags: ['orders'],
        summary: 'Cancel order',
      },
    }
  )

  // Update order status (admin only)
  .post(
    '/:id/status',
    async ({ params, body, user, set }) => {
      if (!user) {
        set.status = 401;
        return { success: false, error: 'Authentication required' };
      }

      if (user.role !== 'admin') {
        set.status = 403;
        return { success: false, error: 'Admin access required' };
      }

      try {
        const order = await orderService.updateStatus(
          params.id,
          body.status as OrderStatus,
          body.trackingNumber
        );

        return { success: true, data: order };
      } catch (error) {
        console.error('[Orders] Update status error:', error);
        set.status = 400;
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update order',
        };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        status: t.String(),
        trackingNumber: t.Optional(t.String()),
      }),
      detail: {
        tags: ['orders'],
        summary: 'Update order status (admin)',
      },
    }
  )

  // Update payment status (webhook or admin)
  .post(
    '/:id/payment',
    async ({ params, body, user, set }) => {
      if (!user) {
        set.status = 401;
        return { success: false, error: 'Authentication required' };
      }

      try {
        const order = await orderService.updatePayment(
          params.id,
          body.status as 'pending' | 'paid' | 'failed' | 'refunded',
          body.reference
        );

        return { success: true, data: order };
      } catch (error) {
        console.error('[Orders] Update payment error:', error);
        set.status = 400;
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update payment',
        };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        status: t.String(),
        reference: t.Optional(t.String()),
      }),
      detail: {
        tags: ['orders'],
        summary: 'Update payment status',
      },
    }
  );
