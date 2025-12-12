/**
 * T116: RevenueCard Component
 * Display revenue metrics in a card format
 */

import { Show } from "solid-js";

export interface RevenueCardProps {
  title: string;
  amount: number;
  currency?: string;
  icon: string;
  trend?: {
    value: number;
    label: string;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning';
  subtitle?: string;
  loading?: boolean;
}

export default function RevenueCard(props: RevenueCardProps) {
  const currency = () => props.currency || 'KES';
  const variant = () => props.variant || 'default';

  const formatCurrency = (amount: number) => {
    return `${currency()} ${amount.toLocaleString()}`;
  };

  const variantStyles = () => {
    const styles = {
      default: {
        bg: 'bg-base-200/50',
        iconBg: 'bg-base-300',
        text: 'text-base-content',
      },
      primary: {
        bg: 'bg-primary/10',
        iconBg: 'bg-primary/20',
        text: 'text-primary',
      },
      success: {
        bg: 'bg-success/10',
        iconBg: 'bg-success/20',
        text: 'text-success',
      },
      warning: {
        bg: 'bg-warning/10',
        iconBg: 'bg-warning/20',
        text: 'text-warning',
      },
    };
    return styles[variant()];
  };

  return (
    <div class="bg-base-100 rounded-2xl border border-base-200 p-6 transition-shadow hover:shadow-md">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <p class="text-sm text-base-content/60 font-medium">{props.title}</p>
          
          <Show when={!props.loading} fallback={
            <div class="h-8 w-32 bg-base-200 animate-pulse rounded mt-2"></div>
          }>
            <p class={`text-2xl font-bold mt-1 ${variantStyles().text}`}>
              {formatCurrency(props.amount)}
            </p>
          </Show>

          <Show when={props.subtitle}>
            <p class="text-xs text-base-content/50 mt-1">{props.subtitle}</p>
          </Show>

          <Show when={props.trend}>
            <div class="flex items-center gap-1 mt-2">
              <span class={`text-xs font-medium ${
                (props.trend?.value || 0) >= 0 ? 'text-success' : 'text-error'
              }`}>
                {(props.trend?.value || 0) >= 0 ? '↑' : '↓'}
                {Math.abs(props.trend?.value || 0)}%
              </span>
              <span class="text-xs text-base-content/50">
                {props.trend?.label}
              </span>
            </div>
          </Show>
        </div>

        <div class={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${variantStyles().iconBg}`}>
          {props.icon}
        </div>
      </div>
    </div>
  );
}

// Skeleton variant for loading states
export function RevenueCardSkeleton() {
  return (
    <div class="bg-base-100 rounded-2xl border border-base-200 p-6">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="h-4 w-24 bg-base-200 animate-pulse rounded"></div>
          <div class="h-8 w-32 bg-base-200 animate-pulse rounded mt-2"></div>
        </div>
        <div class="w-12 h-12 bg-base-200 animate-pulse rounded-xl"></div>
      </div>
    </div>
  );
}
