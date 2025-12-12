/**
 * T132: MetricCard Component
 * Display platform metrics in a card format
 */

import { Show } from "solid-js";

export interface MetricCardProps {
  title: string;
  value: number | string;
  icon: string;
  trend?: {
    value: number;
    label: string;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  format?: 'number' | 'currency' | 'percent';
  currency?: string;
  loading?: boolean;
  href?: string;
}

export default function MetricCard(props: MetricCardProps) {
  const variant = () => props.variant || 'default';
  const format = () => props.format || 'number';

  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;
    
    switch (format()) {
      case 'currency':
        return `${props.currency || 'KES'} ${val.toLocaleString()}`;
      case 'percent':
        return `${val}%`;
      default:
        return val.toLocaleString();
    }
  };

  const variantColors = () => {
    const colors = {
      default: 'bg-base-200',
      primary: 'bg-primary/10',
      success: 'bg-success/10',
      warning: 'bg-warning/10',
      error: 'bg-error/10',
    };
    return colors[variant()];
  };

  const Content = () => (
    <div class="bg-base-100 rounded-2xl border border-base-200 p-6 transition-shadow hover:shadow-md">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <p class="text-sm text-base-content/60 font-medium">{props.title}</p>
          
          <Show when={!props.loading} fallback={
            <div class="h-8 w-24 bg-base-200 animate-pulse rounded mt-2"></div>
          }>
            <p class="text-2xl font-bold text-base-content mt-1">
              {formatValue(props.value)}
            </p>
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

        <div class={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${variantColors()}`}>
          {props.icon}
        </div>
      </div>
    </div>
  );

  if (props.href) {
    return (
      <a href={props.href} class="block">
        <Content />
      </a>
    );
  }

  return <Content />;
}

// Skeleton for loading states
export function MetricCardSkeleton() {
  return (
    <div class="bg-base-100 rounded-2xl border border-base-200 p-6">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="h-4 w-20 bg-base-200 animate-pulse rounded"></div>
          <div class="h-8 w-24 bg-base-200 animate-pulse rounded mt-2"></div>
        </div>
        <div class="w-12 h-12 bg-base-200 animate-pulse rounded-xl"></div>
      </div>
    </div>
  );
}

// Compact variant for smaller spaces
export function MetricCardCompact(props: Omit<MetricCardProps, 'trend'>) {
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;
    if (props.format === 'currency') return `${props.currency || 'KES'} ${val.toLocaleString()}`;
    if (props.format === 'percent') return `${val}%`;
    return val.toLocaleString();
  };

  return (
    <div class="bg-base-100 rounded-xl border border-base-200 p-4 flex items-center gap-3">
      <div class="w-10 h-10 bg-base-200 rounded-lg flex items-center justify-center text-xl">
        {props.icon}
      </div>
      <div>
        <p class="text-lg font-bold text-base-content">{formatValue(props.value)}</p>
        <p class="text-xs text-base-content/60">{props.title}</p>
      </div>
    </div>
  );
}
