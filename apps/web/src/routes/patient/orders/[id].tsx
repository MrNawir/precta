/**
 * T107: Order Detail Page
 * Patient views order details and tracks status
 */

import { Title } from "@solidjs/meta";
import { useParams, A, useNavigate } from "@solidjs/router";
import { createSignal, createEffect, Show, For } from "solid-js";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface OrderItem {
  medicationName: string;
  dosage: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: string;
  deliveryAddress: {
    street: string;
    city: string;
    county: string;
    phone: string;
    notes?: string;
  };
  estimatedDelivery?: string;
  trackingNumber?: string;
  createdAt: string;
}

export default function OrderDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = createSignal<Order | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal('');
  const [cancelling, setCancelling] = createSignal(false);

  // Fetch order
  createEffect(async () => {
    if (!params.id) return;

    try {
      const response = await fetch(
        `${API_URL}/api/v1/orders/${params.id}`,
        { credentials: 'include' }
      );
      const data = await response.json();
      
      if (data.success) {
        setOrder(data.data);
      } else {
        setError(data.error || 'Failed to load order');
      }
    } catch (e) {
      setError('Failed to load order');
    } finally {
      setLoading(false);
    }
  });

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    setCancelling(true);
    try {
      const response = await fetch(
        `${API_URL}/api/v1/orders/${params.id}/cancel`,
        {
          method: 'POST',
          credentials: 'include',
        }
      );
      const data = await response.json();

      if (data.success) {
        setOrder(prev => prev ? { ...prev, status: 'cancelled' } : null);
      }
    } catch (e) {
      console.error('Cancel failed:', e);
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => `${order()?.currency || 'KES'} ${amount.toLocaleString()}`;

  const orderId = () => order()?.id?.slice(-8).toUpperCase() || '';

  const getStatusInfo = (status: OrderStatus) => {
    const statuses: Record<OrderStatus, { class: string; label: string; icon: string }> = {
      pending: { class: 'text-warning', label: 'Pending Payment', icon: '⏳' },
      confirmed: { class: 'text-info', label: 'Confirmed', icon: '✓' },
      processing: { class: 'text-info', label: 'Processing', icon: '📦' },
      shipped: { class: 'text-primary', label: 'Shipped', icon: '🚚' },
      delivered: { class: 'text-success', label: 'Delivered', icon: '✅' },
      cancelled: { class: 'text-error', label: 'Cancelled', icon: '❌' },
    };
    return statuses[status];
  };

  const statusSteps: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

  const getCurrentStep = () => {
    const status = order()?.status;
    if (!status || status === 'cancelled') return -1;
    return statusSteps.indexOf(status);
  };

  return (
    <>
      <Title>Order #{orderId()} | Precta</Title>

      <div class="min-h-screen bg-base-200/30">
        {/* Header */}
        <div class="bg-base-100 border-b border-base-200">
          <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div class="flex items-center gap-4">
              <A href="/patient/orders" class="btn btn-ghost btn-sm">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </A>
              <h1 class="text-xl font-bold text-base-content">Order #{orderId()}</h1>
            </div>
          </div>
        </div>

        <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
          <Show when={!loading()} fallback={
            <div class="flex justify-center py-12">
              <span class="loading loading-spinner loading-lg text-primary"></span>
            </div>
          }>
            <Show when={order()} fallback={
              <div class="bg-base-100 rounded-2xl border border-base-200 p-12 text-center">
                <div class="text-5xl mb-4">📦</div>
                <p class="text-base-content/60">{error() || 'Order not found'}</p>
                <A href="/patient/orders" class="btn btn-primary mt-4">
                  View All Orders
                </A>
              </div>
            }>
              {/* Status Tracker */}
              <Show when={order()?.status !== 'cancelled'}>
                <div class="bg-base-100 rounded-2xl border border-base-200 p-6 mb-6">
                  <h2 class="font-bold text-base-content mb-6">Order Status</h2>
                  
                  <ul class="steps steps-horizontal w-full">
                    <For each={statusSteps}>
                      {(step, index) => {
                        const current = getCurrentStep();
                        const isActive = index() <= current;
                        const isCurrent = index() === current;
                        return (
                          <li class={`step ${isActive ? 'step-primary' : ''}`}>
                            <span class={`text-xs ${isCurrent ? 'font-bold' : ''}`}>
                              {getStatusInfo(step).label}
                            </span>
                          </li>
                        );
                      }}
                    </For>
                  </ul>

                  <Show when={order()?.trackingNumber}>
                    <div class="mt-6 p-4 bg-primary/10 rounded-xl">
                      <div class="flex items-center gap-3">
                        <span class="text-2xl">🚚</span>
                        <div>
                          <p class="text-sm text-base-content/60">Tracking Number</p>
                          <p class="font-mono font-bold text-primary">{order()?.trackingNumber}</p>
                        </div>
                      </div>
                    </div>
                  </Show>

                  <Show when={order()?.estimatedDelivery && !['delivered', 'cancelled'].includes(order()?.status || '')}>
                    <p class="text-center text-base-content/60 mt-4">
                      Estimated delivery: <span class="font-medium">{formatDate(order()?.estimatedDelivery || '')}</span>
                    </p>
                  </Show>
                </div>
              </Show>

              {/* Cancelled Banner */}
              <Show when={order()?.status === 'cancelled'}>
                <div class="alert alert-error mb-6">
                  <span class="text-lg">❌</span>
                  <span>This order has been cancelled</span>
                </div>
              </Show>

              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Items */}
                <div class="lg:col-span-2">
                  <div class="bg-base-100 rounded-2xl border border-base-200 overflow-hidden">
                    <div class="p-4 bg-base-200/30 border-b border-base-200">
                      <h2 class="font-bold text-base-content">Order Items</h2>
                    </div>

                    <div class="divide-y divide-base-200">
                      <For each={order()?.items}>
                        {(item) => (
                          <div class="p-4 flex items-center gap-4">
                            <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-2xl">
                              💊
                            </div>
                            <div class="flex-1">
                              <h3 class="font-medium text-base-content">{item.medicationName}</h3>
                              <p class="text-sm text-base-content/60">
                                {item.dosage} × {item.quantity}
                              </p>
                            </div>
                            <div class="text-right">
                              <p class="font-semibold">{formatCurrency(item.totalPrice)}</p>
                              <p class="text-xs text-base-content/60">
                                {formatCurrency(item.unitPrice)} each
                              </p>
                            </div>
                          </div>
                        )}
                      </For>
                    </div>

                    {/* Totals */}
                    <div class="p-4 bg-base-200/30 border-t border-base-200">
                      <div class="space-y-2">
                        <div class="flex justify-between text-sm">
                          <span class="text-base-content/60">Subtotal</span>
                          <span>{formatCurrency(order()?.subtotal || 0)}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                          <span class="text-base-content/60">Delivery</span>
                          <span>{formatCurrency(order()?.deliveryFee || 0)}</span>
                        </div>
                        <div class="flex justify-between text-lg font-bold pt-2 border-t border-base-200">
                          <span>Total</span>
                          <span class="text-primary">{formatCurrency(order()?.totalAmount || 0)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div class="space-y-6">
                  {/* Delivery Address */}
                  <div class="bg-base-100 rounded-2xl border border-base-200 p-6">
                    <h3 class="font-bold text-base-content mb-4">Delivery Address</h3>
                    <div class="text-sm space-y-1">
                      <p>{order()?.deliveryAddress?.street}</p>
                      <p>{order()?.deliveryAddress?.city}, {order()?.deliveryAddress?.county}</p>
                      <p class="text-base-content/60">{order()?.deliveryAddress?.phone}</p>
                      <Show when={order()?.deliveryAddress?.notes}>
                        <p class="text-primary mt-2">{order()?.deliveryAddress?.notes}</p>
                      </Show>
                    </div>
                  </div>

                  {/* Order Info */}
                  <div class="bg-base-100 rounded-2xl border border-base-200 p-6">
                    <h3 class="font-bold text-base-content mb-4">Order Info</h3>
                    <div class="space-y-3 text-sm">
                      <div>
                        <p class="text-base-content/60">Order ID</p>
                        <p class="font-mono font-medium">#{orderId()}</p>
                      </div>
                      <div>
                        <p class="text-base-content/60">Placed</p>
                        <p class="font-medium">{formatDate(order()?.createdAt || '')}</p>
                      </div>
                      <div>
                        <p class="text-base-content/60">Payment</p>
                        <span class={`badge badge-sm ${
                          order()?.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'
                        }`}>
                          {order()?.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <Show when={['pending', 'confirmed'].includes(order()?.status || '')}>
                    <div class="bg-base-100 rounded-2xl border border-base-200 p-6">
                      <h3 class="font-bold text-base-content mb-4">Actions</h3>
                      
                      <Show when={order()?.paymentStatus !== 'paid'}>
                        <button class="btn btn-primary w-full mb-3">
                          Complete Payment
                        </button>
                      </Show>
                      
                      <button
                        class="btn btn-error btn-outline w-full"
                        onClick={handleCancel}
                        disabled={cancelling()}
                      >
                        <Show when={cancelling()} fallback="Cancel Order">
                          <span class="loading loading-spinner loading-sm"></span>
                          Cancelling...
                        </Show>
                      </button>
                    </div>
                  </Show>
                </div>
              </div>

              {/* Help */}
              <p class="text-center text-sm text-base-content/60 mt-8">
                Need help with your order?{' '}
                <a href="/support" class="text-primary hover:underline">Contact Support</a>
              </p>
            </Show>
          </Show>
        </div>
      </div>
    </>
  );
}
