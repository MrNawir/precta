/**
 * T108: OrderCard Component
 * Display order summary in a card format
 */

import { Show, For } from "solid-js";
import { A } from "@solidjs/router";

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  medicationName: string;
  dosage: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderCardProps {
  id: string;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  variant?: 'default' | 'compact';
}

export default function OrderCard(props: OrderCardProps) {
  const isCompact = () => props.variant === 'compact';

  const getStatusInfo = () => {
    const statuses: Record<OrderStatus, { class: string; label: string; icon: string }> = {
      pending: { class: 'badge-warning', label: 'Pending Payment', icon: '⏳' },
      confirmed: { class: 'badge-info', label: 'Confirmed', icon: '✓' },
      processing: { class: 'badge-info', label: 'Processing', icon: '📦' },
      shipped: { class: 'badge-primary', label: 'Shipped', icon: '🚚' },
      delivered: { class: 'badge-success', label: 'Delivered', icon: '✅' },
      cancelled: { class: 'badge-error', label: 'Cancelled', icon: '❌' },
    };
    return statuses[props.status] || statuses.pending;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return `${props.currency} ${amount.toLocaleString()}`;
  };

  const orderId = () => props.id.slice(-8).toUpperCase();

  // Compact variant
  if (isCompact()) {
    return (
      <A
        href={`/patient/orders/${props.id}`}
        class="block bg-base-100 rounded-xl border border-base-200 p-4 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center justify-between mb-2">
          <span class="font-mono text-sm text-base-content/60">#{orderId()}</span>
          <span class={`badge badge-sm ${getStatusInfo().class}`}>
            {getStatusInfo().icon} {getStatusInfo().label}
          </span>
        </div>
        <p class="font-medium text-base-content">
          {props.items.length} item{props.items.length > 1 ? 's' : ''}
        </p>
        <div class="flex items-center justify-between mt-2">
          <span class="text-sm text-base-content/60">{formatDate(props.createdAt)}</span>
          <span class="font-semibold text-primary">{formatCurrency(props.totalAmount)}</span>
        </div>
      </A>
    );
  }

  // Default variant
  return (
    <div class="bg-base-100 rounded-2xl border border-base-200 overflow-hidden">
      {/* Header */}
      <div class="p-4 bg-base-200/30 border-b border-base-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-base-content/60">Order</p>
            <p class="font-mono font-bold text-base-content">#{orderId()}</p>
          </div>
          <div class="text-right">
            <span class={`badge ${getStatusInfo().class}`}>
              {getStatusInfo().icon} {getStatusInfo().label}
            </span>
            <p class="text-sm text-base-content/60 mt-1">{formatDate(props.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Items */}
      <div class="p-4">
        <h4 class="text-sm font-semibold text-base-content/60 mb-3">Items</h4>
        <div class="space-y-2">
          <For each={props.items.slice(0, 3)}>
            {(item) => (
              <div class="flex items-center justify-between py-2 border-b border-base-200 last:border-0">
                <div>
                  <p class="font-medium text-base-content">{item.medicationName}</p>
                  <p class="text-sm text-base-content/60">{item.dosage} × {item.quantity}</p>
                </div>
                <span class="font-medium">{formatCurrency(item.totalPrice)}</span>
              </div>
            )}
          </For>
          <Show when={props.items.length > 3}>
            <p class="text-sm text-center text-base-content/60 py-2">
              +{props.items.length - 3} more item{props.items.length > 4 ? 's' : ''}
            </p>
          </Show>
        </div>
      </div>

      {/* Tracking */}
      <Show when={props.trackingNumber}>
        <div class="px-4 py-3 bg-primary/10 border-t border-primary/20">
          <div class="flex items-center gap-2">
            <span class="text-lg">🚚</span>
            <div>
              <p class="text-sm text-base-content/60">Tracking Number</p>
              <p class="font-mono font-medium text-primary">{props.trackingNumber}</p>
            </div>
          </div>
        </div>
      </Show>

      {/* Footer */}
      <div class="p-4 border-t border-base-200 bg-base-200/20">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-base-content/60">Total</p>
            <p class="text-xl font-bold text-primary">{formatCurrency(props.totalAmount)}</p>
          </div>
          <div class="flex gap-2">
            <A
              href={`/patient/orders/${props.id}`}
              class="btn btn-ghost btn-sm"
            >
              View Details
            </A>
            <Show when={props.status === 'shipped'}>
              <button class="btn btn-primary btn-sm">
                Track Order
              </button>
            </Show>
          </div>
        </div>

        <Show when={props.estimatedDelivery && !['delivered', 'cancelled'].includes(props.status)}>
          <p class="text-sm text-base-content/60 mt-3">
            Estimated delivery: <span class="font-medium">{formatDate(props.estimatedDelivery)}</span>
          </p>
        </Show>
      </div>
    </div>
  );
}
