/**
 * T106: Order List Page
 * Patient views their medicine orders
 */

import { Title } from "@solidjs/meta";
import { A } from "@solidjs/router";
import { createSignal, createEffect, Show, For } from "solid-js";
import OrderCard from "../../../components/features/OrderCard";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface Order {
  id: string;
  items: Array<{
    medicationName: string;
    dosage: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: string;
  createdAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
}

export default function OrdersListPage() {
  const [orders, setOrders] = createSignal<Order[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [filter, setFilter] = createSignal<OrderStatus | ''>('');

  // Fetch orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const url = filter()
        ? `${API_URL}/api/v1/orders/my?status=${filter()}`
        : `${API_URL}/api/v1/orders/my`;
      
      const response = await fetch(url, { credentials: 'include' });
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch orders:', e);
    } finally {
      setLoading(false);
    }
  };

  createEffect(() => {
    fetchOrders();
  });

  const statusFilters: { value: OrderStatus | ''; label: string; icon: string }[] = [
    { value: '', label: 'All', icon: '📦' },
    { value: 'pending', label: 'Pending', icon: '⏳' },
    { value: 'confirmed', label: 'Confirmed', icon: '✓' },
    { value: 'processing', label: 'Processing', icon: '🔄' },
    { value: 'shipped', label: 'Shipped', icon: '🚚' },
    { value: 'delivered', label: 'Delivered', icon: '✅' },
  ];

  const activeOrders = () => orders().filter(o => 
    ['pending', 'confirmed', 'processing', 'shipped'].includes(o.status)
  );

  const completedOrders = () => orders().filter(o => 
    ['delivered', 'cancelled'].includes(o.status)
  );

  return (
    <>
      <Title>My Orders | Precta</Title>

      <div class="min-h-screen bg-base-200/30">
        {/* Header */}
        <div class="bg-base-100 border-b border-base-200">
          <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 class="text-2xl font-bold text-base-content">My Orders</h1>
            <p class="text-base-content/60 mt-1">Track and manage your medicine orders</p>
          </div>
        </div>

        <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <div class="flex flex-wrap gap-2 mb-6">
            <For each={statusFilters}>
              {(status) => (
                <button
                  class={`btn btn-sm ${filter() === status.value ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => { setFilter(status.value); fetchOrders(); }}
                >
                  {status.icon} {status.label}
                </button>
              )}
            </For>
          </div>

          <Show when={!loading()} fallback={
            <div class="flex justify-center py-12">
              <span class="loading loading-spinner loading-lg text-primary"></span>
            </div>
          }>
            <Show when={orders().length > 0} fallback={
              <div class="bg-base-100 rounded-2xl border border-base-200 p-12 text-center">
                <div class="text-5xl mb-4">📦</div>
                <h3 class="text-lg font-bold text-base-content mb-2">No Orders Yet</h3>
                <p class="text-base-content/60 mb-6">
                  Order medicines from your prescriptions to see them here.
                </p>
                <A href="/patient/prescriptions" class="btn btn-primary">
                  View Prescriptions
                </A>
              </div>
            }>
              {/* Active Orders */}
              <Show when={!filter() && activeOrders().length > 0}>
                <div class="mb-8">
                  <h2 class="text-lg font-bold text-base-content mb-4">
                    Active Orders ({activeOrders().length})
                  </h2>
                  <div class="grid gap-4">
                    <For each={activeOrders()}>
                      {(order) => (
                        <OrderCard
                          id={order.id}
                          items={order.items}
                          totalAmount={order.totalAmount}
                          currency={order.currency}
                          status={order.status}
                          paymentStatus={order.paymentStatus as any}
                          createdAt={order.createdAt}
                          estimatedDelivery={order.estimatedDelivery}
                          trackingNumber={order.trackingNumber}
                        />
                      )}
                    </For>
                  </div>
                </div>
              </Show>

              {/* Completed Orders */}
              <Show when={!filter() && completedOrders().length > 0}>
                <div>
                  <h2 class="text-lg font-bold text-base-content mb-4">
                    Completed Orders ({completedOrders().length})
                  </h2>
                  <div class="grid gap-4">
                    <For each={completedOrders()}>
                      {(order) => (
                        <OrderCard
                          id={order.id}
                          items={order.items}
                          totalAmount={order.totalAmount}
                          currency={order.currency}
                          status={order.status}
                          paymentStatus={order.paymentStatus as any}
                          createdAt={order.createdAt}
                          variant="compact"
                        />
                      )}
                    </For>
                  </div>
                </div>
              </Show>

              {/* Filtered View */}
              <Show when={filter()}>
                <div class="grid gap-4">
                  <For each={orders()}>
                    {(order) => (
                      <OrderCard
                        id={order.id}
                        items={order.items}
                        totalAmount={order.totalAmount}
                        currency={order.currency}
                        status={order.status}
                        paymentStatus={order.paymentStatus as any}
                        createdAt={order.createdAt}
                        estimatedDelivery={order.estimatedDelivery}
                        trackingNumber={order.trackingNumber}
                      />
                    )}
                  </For>
                </div>
              </Show>
            </Show>
          </Show>
        </div>
      </div>
    </>
  );
}
