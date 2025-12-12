/**
 * T103: Order Service
 * Medicine order management
 */

import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../lib/db';
import { orders, prescriptions } from '@precta/db';
import { createId } from '@paralleldrive/cuid2';
import { notificationService } from './notification.service';
import { prescriptionService } from './prescription.service';

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  medicationName: string;
  dosage: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  patientId: string;
  prescriptionId: string | null;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentReference: string | null;
  deliveryAddress: {
    street: string;
    city: string;
    county: string;
    postalCode?: string;
    phone: string;
    notes?: string;
  } | null;
  estimatedDelivery: Date | null;
  trackingNumber: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderInput {
  patientId: string;
  prescriptionId?: string;
  items: Omit<OrderItem, 'totalPrice'>[];
  deliveryAddress: Order['deliveryAddress'];
}

class OrderService {
  private readonly DELIVERY_FEE = 250; // KES
  private readonly CURRENCY = 'KES';

  /**
   * Create a new order
   */
  async create(input: CreateOrderInput): Promise<Order> {
    // Calculate totals
    const items: OrderItem[] = input.items.map(item => ({
      ...item,
      totalPrice: item.quantity * item.unitPrice,
    }));

    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const deliveryFee = this.DELIVERY_FEE;
    const totalAmount = subtotal + deliveryFee;

    // Create order
    const orderId = createId();
    const now = new Date();

    // Estimate delivery (3-5 business days)
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 4);

    await db.insert(orders).values({
      id: orderId,
      patientId: input.patientId,
      prescriptionId: input.prescriptionId || null,
      items,
      subtotal,
      deliveryFee,
      totalAmount,
      currency: this.CURRENCY,
      status: 'pending',
      paymentStatus: 'pending',
      deliveryAddress: input.deliveryAddress,
      estimatedDelivery,
    });

    // Notify patient
    await notificationService.send({
      userId: input.patientId,
      type: 'order_created',
      title: 'Order Created',
      body: `Your order #${orderId.slice(-8).toUpperCase()} has been created. Complete payment to confirm.`,
      channels: ['push'],
      data: { orderId },
    });

    return {
      id: orderId,
      patientId: input.patientId,
      prescriptionId: input.prescriptionId || null,
      items,
      subtotal,
      deliveryFee,
      totalAmount,
      currency: this.CURRENCY,
      status: 'pending',
      paymentStatus: 'pending',
      paymentReference: null,
      deliveryAddress: input.deliveryAddress,
      estimatedDelivery,
      trackingNumber: null,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Create order from prescription
   */
  async createFromPrescription(
    prescriptionId: string,
    patientId: string,
    deliveryAddress: Order['deliveryAddress'],
    pricing: Record<string, number> // medication name -> unit price
  ): Promise<Order> {
    // Get prescription
    const prescription = await prescriptionService.getById(prescriptionId, patientId);
    if (!prescription) {
      throw new Error('Prescription not found');
    }

    if (prescription.status !== 'active') {
      throw new Error('Prescription is not active');
    }

    // Convert medications to order items
    const items = prescription.medications.map(med => ({
      medicationName: med.name,
      dosage: med.dosage,
      quantity: med.quantity || 1,
      unitPrice: pricing[med.name] || 500, // Default price if not specified
    }));

    return this.create({
      patientId,
      prescriptionId,
      items,
      deliveryAddress,
    });
  }

  /**
   * Get order by ID
   */
  async getById(orderId: string, userId: string): Promise<Order | null> {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) return null;

    // Check access
    if (order.patientId !== userId) {
      throw new Error('Access denied');
    }

    return this.mapToOrder(order);
  }

  /**
   * Get patient orders
   */
  async getPatientOrders(
    patientId: string,
    options?: {
      status?: OrderStatus;
      page?: number;
      limit?: number;
    }
  ): Promise<{ data: Order[]; total: number }> {
    const page = options?.page || 1;
    const limit = Math.min(options?.limit || 20, 50);
    const offset = (page - 1) * limit;

    const conditions = [eq(orders.patientId, patientId)];
    if (options?.status) {
      conditions.push(eq(orders.status, options.status));
    }

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(and(...conditions));

    const total = Number(countResult[0]?.count || 0);

    const results = await db
      .select()
      .from(orders)
      .where(and(...conditions))
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      data: results.map(this.mapToOrder),
      total,
    };
  }

  /**
   * Update order status
   */
  async updateStatus(orderId: string, status: OrderStatus, trackingNumber?: string): Promise<Order> {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) {
      throw new Error('Order not found');
    }

    const updates: Partial<typeof orders.$inferInsert> = {
      status,
      updatedAt: new Date(),
    };

    if (trackingNumber) {
      updates.trackingNumber = trackingNumber;
    }

    await db
      .update(orders)
      .set(updates)
      .where(eq(orders.id, orderId));

    // Notify patient
    const statusMessages: Record<OrderStatus, string> = {
      pending: 'is pending payment',
      confirmed: 'has been confirmed',
      processing: 'is being processed',
      shipped: `has been shipped${trackingNumber ? `. Tracking: ${trackingNumber}` : ''}`,
      delivered: 'has been delivered',
      cancelled: 'has been cancelled',
    };

    await notificationService.send({
      userId: order.patientId,
      type: 'order_status',
      title: 'Order Update',
      body: `Your order #${orderId.slice(-8).toUpperCase()} ${statusMessages[status]}`,
      channels: ['push'],
      data: { orderId, status },
    });

    // If delivered and from prescription, mark prescription as fulfilled
    if (status === 'delivered' && order.prescriptionId) {
      await prescriptionService.markFulfilled(order.prescriptionId);
    }

    return {
      ...this.mapToOrder(order),
      status,
      trackingNumber: trackingNumber || order.trackingNumber,
      updatedAt: new Date(),
    };
  }

  /**
   * Update payment status
   */
  async updatePayment(
    orderId: string,
    paymentStatus: PaymentStatus,
    paymentReference?: string
  ): Promise<Order> {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) {
      throw new Error('Order not found');
    }

    const updates: Partial<typeof orders.$inferInsert> = {
      paymentStatus,
      updatedAt: new Date(),
    };

    if (paymentReference) {
      updates.paymentReference = paymentReference;
    }

    // If payment successful, confirm order
    if (paymentStatus === 'paid') {
      updates.status = 'confirmed';
    }

    await db
      .update(orders)
      .set(updates)
      .where(eq(orders.id, orderId));

    // Notify patient
    if (paymentStatus === 'paid') {
      await notificationService.send({
        userId: order.patientId,
        type: 'order_paid',
        title: 'Payment Successful',
        body: `Your payment for order #${orderId.slice(-8).toUpperCase()} was successful. We'll process it shortly.`,
        channels: ['push', 'email'],
        data: { orderId },
      });
    }

    return {
      ...this.mapToOrder(order),
      paymentStatus,
      paymentReference: paymentReference || order.paymentReference,
      status: paymentStatus === 'paid' ? 'confirmed' : order.status,
      updatedAt: new Date(),
    };
  }

  /**
   * Cancel order
   */
  async cancel(orderId: string, userId: string, reason?: string): Promise<boolean> {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.patientId !== userId) {
      throw new Error('Access denied');
    }

    // Can only cancel pending or confirmed orders
    if (!['pending', 'confirmed'].includes(order.status)) {
      throw new Error('Cannot cancel order in current status');
    }

    await db
      .update(orders)
      .set({
        status: 'cancelled',
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    return true;
  }

  /**
   * Map database order to Order type
   */
  private mapToOrder(order: typeof orders.$inferSelect): Order {
    return {
      id: order.id,
      patientId: order.patientId,
      prescriptionId: order.prescriptionId,
      items: order.items as OrderItem[],
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      totalAmount: order.totalAmount,
      currency: order.currency,
      status: order.status as OrderStatus,
      paymentStatus: order.paymentStatus as PaymentStatus,
      paymentReference: order.paymentReference,
      deliveryAddress: order.deliveryAddress as Order['deliveryAddress'],
      estimatedDelivery: order.estimatedDelivery,
      trackingNumber: order.trackingNumber,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}

export const orderService = new OrderService();
