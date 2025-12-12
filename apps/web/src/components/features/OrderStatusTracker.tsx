/**
 * T109: OrderStatusTracker Component
 * Visual order status progression tracker
 */

import { Show, For } from "solid-js";

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderStatusTrackerProps {
  status: OrderStatus;
  trackingNumber?: string;
  estimatedDelivery?: string;
  variant?: 'horizontal' | 'vertical';
}

interface StatusStep {
  key: OrderStatus;
  label: string;
  icon: string;
  description: string;
}

const statusSteps: StatusStep[] = [
  { key: 'pending', label: 'Order Placed', icon: '📝', description: 'Awaiting payment confirmation' },
  { key: 'confirmed', label: 'Confirmed', icon: '✓', description: 'Payment received, preparing order' },
  { key: 'processing', label: 'Processing', icon: '📦', description: 'Order is being prepared' },
  { key: 'shipped', label: 'Shipped', icon: '🚚', description: 'On the way to you' },
  { key: 'delivered', label: 'Delivered', icon: '✅', description: 'Order delivered successfully' },
];

export default function OrderStatusTracker(props: OrderStatusTrackerProps) {
  const isVertical = () => props.variant === 'vertical';

  const getStepIndex = (status: OrderStatus) => {
    return statusSteps.findIndex(s => s.key === status);
  };

  const currentIndex = () => getStepIndex(props.status);
  const isCancelled = () => props.status === 'cancelled';

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  // Horizontal variant (DaisyUI steps)
  if (!isVertical()) {
    return (
      <div class="w-full">
        <Show when={isCancelled()}>
          <div class="alert alert-error mb-4">
            <span class="text-lg">❌</span>
            <span>This order has been cancelled</span>
          </div>
        </Show>

        <Show when={!isCancelled()}>
          <ul class="steps steps-horizontal w-full">
            <For each={statusSteps}>
              {(step, index) => {
                const isActive = index() <= currentIndex();
                const isCurrent = index() === currentIndex();
                return (
                  <li class={`step ${isActive ? 'step-primary' : ''}`} data-content={isActive ? '✓' : (index() + 1).toString()}>
                    <span class={`text-xs ${isCurrent ? 'font-bold text-primary' : 'text-base-content/60'}`}>
                      {step.label}
                    </span>
                  </li>
                );
              }}
            </For>
          </ul>

          <Show when={props.trackingNumber}>
            <div class="mt-4 p-3 bg-primary/10 rounded-lg flex items-center gap-3">
              <span class="text-xl">🚚</span>
              <div class="text-sm">
                <p class="text-base-content/60">Tracking</p>
                <p class="font-mono font-medium text-primary">{props.trackingNumber}</p>
              </div>
            </div>
          </Show>

          <Show when={props.estimatedDelivery && !['delivered', 'cancelled'].includes(props.status)}>
            <p class="text-center text-sm text-base-content/60 mt-3">
              Estimated: <span class="font-medium">{formatDate(props.estimatedDelivery)}</span>
            </p>
          </Show>
        </Show>
      </div>
    );
  }

  // Vertical variant (timeline)
  return (
    <div class="w-full">
      <Show when={isCancelled()}>
        <div class="alert alert-error mb-4">
          <span class="text-lg">❌</span>
          <span>This order has been cancelled</span>
        </div>
      </Show>

      <Show when={!isCancelled()}>
        <ul class="timeline timeline-vertical">
          <For each={statusSteps}>
            {(step, index) => {
              const isActive = index() <= currentIndex();
              const isCurrent = index() === currentIndex();
              const isLast = index() === statusSteps.length - 1;
              
              return (
                <li>
                  <Show when={index() > 0}>
                    <hr class={isActive ? 'bg-primary' : ''} />
                  </Show>
                  
                  <div class="timeline-start text-end">
                    <span class={`text-sm ${isCurrent ? 'font-bold' : 'text-base-content/60'}`}>
                      {step.label}
                    </span>
                  </div>
                  
                  <div class={`timeline-middle ${isActive ? 'text-primary' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  
                  <div class="timeline-end timeline-box">
                    <div class="flex items-center gap-2">
                      <span class="text-lg">{step.icon}</span>
                      <div>
                        <p class={`text-sm ${isCurrent ? 'font-semibold text-primary' : ''}`}>
                          {step.description}
                        </p>
                        <Show when={isCurrent && step.key === 'shipped' && props.trackingNumber}>
                          <p class="text-xs font-mono text-primary mt-1">
                            {props.trackingNumber}
                          </p>
                        </Show>
                      </div>
                    </div>
                  </div>
                  
                  <Show when={!isLast}>
                    <hr class={index() < currentIndex() ? 'bg-primary' : ''} />
                  </Show>
                </li>
              );
            }}
          </For>
        </ul>

        <Show when={props.estimatedDelivery && !['delivered', 'cancelled'].includes(props.status)}>
          <div class="mt-4 p-3 bg-base-200/50 rounded-lg text-center">
            <p class="text-sm text-base-content/60">
              Estimated delivery: <span class="font-medium">{formatDate(props.estimatedDelivery)}</span>
            </p>
          </div>
        </Show>
      </Show>
    </div>
  );
}
