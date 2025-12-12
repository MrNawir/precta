/**
 * T133: AnalyticsChart Component
 * Simple chart components for analytics dashboards
 */

import { For, Show, createSignal, createEffect } from "solid-js";

export interface TimeSeriesData {
  date: string;
  value: number;
}

export interface ChartProps {
  data: TimeSeriesData[];
  title?: string;
  color?: string;
  height?: number;
  formatValue?: (value: number) => string;
  loading?: boolean;
}

// Simple line chart using CSS
export default function AnalyticsChart(props: ChartProps) {
  const height = () => props.height || 200;
  const color = () => props.color || '#6366f1'; // primary/indigo

  const maxValue = () => Math.max(...props.data.map(d => d.value), 1);
  const minValue = () => Math.min(...props.data.map(d => d.value), 0);
  const range = () => maxValue() - minValue();

  const normalizeValue = (value: number) => {
    if (range() === 0) return 50;
    return ((value - minValue()) / range()) * 100;
  };

  const formatValue = (value: number) => {
    if (props.formatValue) return props.formatValue(value);
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const total = () => props.data.reduce((sum, d) => sum + d.value, 0);
  const average = () => props.data.length > 0 ? Math.round(total() / props.data.length) : 0;

  // Generate SVG path for smooth line
  const generatePath = () => {
    if (props.data.length < 2) return '';
    
    const width = 100;
    const pointWidth = width / (props.data.length - 1);
    
    const points = props.data.map((d, i) => ({
      x: i * pointWidth,
      y: 100 - normalizeValue(d.value),
    }));

    // Create smooth bezier curve
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx = (prev.x + curr.x) / 2;
      path += ` Q ${cpx} ${prev.y}, ${curr.x} ${curr.y}`;
    }
    
    return path;
  };

  return (
    <div class="bg-base-100 rounded-2xl border border-base-200 overflow-hidden">
      <Show when={props.title}>
        <div class="p-4 border-b border-base-200 flex items-center justify-between">
          <h3 class="font-bold text-base-content">{props.title}</h3>
          <div class="flex gap-4 text-sm">
            <span class="text-base-content/60">
              Total: <span class="font-medium text-base-content">{formatValue(total())}</span>
            </span>
            <span class="text-base-content/60">
              Avg: <span class="font-medium text-base-content">{formatValue(average())}</span>
            </span>
          </div>
        </div>
      </Show>

      <Show when={props.loading}>
        <div class="p-8 flex justify-center" style={{ height: `${height()}px` }}>
          <span class="loading loading-spinner loading-md text-primary"></span>
        </div>
      </Show>

      <Show when={!props.loading && props.data.length === 0}>
        <div class="p-8 text-center" style={{ height: `${height()}px` }}>
          <p class="text-base-content/60">No data available</p>
        </div>
      </Show>

      <Show when={!props.loading && props.data.length > 0}>
        <div class="p-4">
          {/* Chart */}
          <div class="relative" style={{ height: `${height()}px` }}>
            {/* Y-axis labels */}
            <div class="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-base-content/60">
              <span>{formatValue(maxValue())}</span>
              <span>{formatValue((maxValue() + minValue()) / 2)}</span>
              <span>{formatValue(minValue())}</span>
            </div>

            {/* Chart area */}
            <div class="ml-14 h-full relative">
              {/* Grid lines */}
              <div class="absolute inset-0 flex flex-col justify-between">
                <div class="border-b border-base-200"></div>
                <div class="border-b border-base-200"></div>
                <div class="border-b border-base-200"></div>
              </div>

              {/* SVG Chart */}
              <svg
                class="absolute inset-0 w-full h-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                {/* Area fill */}
                <path
                  d={`${generatePath()} L 100 100 L 0 100 Z`}
                  fill={color()}
                  fill-opacity="0.1"
                />
                {/* Line */}
                <path
                  d={generatePath()}
                  fill="none"
                  stroke={color()}
                  stroke-width="0.5"
                  vector-effect="non-scaling-stroke"
                />
                {/* Data points */}
                <For each={props.data}>
                  {(d, i) => {
                    const x = (i() / (props.data.length - 1)) * 100;
                    const y = 100 - normalizeValue(d.value);
                    return (
                      <circle
                        cx={x}
                        cy={y}
                        r="1"
                        fill={color()}
                        class="hover:r-2 transition-all cursor-pointer"
                      >
                        <title>{formatDate(d.date)}: {formatValue(d.value)}</title>
                      </circle>
                    );
                  }}
                </For>
              </svg>
            </div>
          </div>

          {/* X-axis labels */}
          <div class="ml-14 mt-2 flex justify-between text-xs text-base-content/60">
            <span>{formatDate(props.data[0]?.date || '')}</span>
            <span>{formatDate(props.data[props.data.length - 1]?.date || '')}</span>
          </div>
        </div>
      </Show>
    </div>
  );
}

// Bar chart variant
export function BarChart(props: ChartProps & { horizontal?: boolean }) {
  const height = () => props.height || 200;
  const color = () => props.color || '#6366f1';
  const maxValue = () => Math.max(...props.data.map(d => d.value), 1);

  const formatValue = (value: number) => {
    if (props.formatValue) return props.formatValue(value);
    return value.toLocaleString();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div class="bg-base-100 rounded-2xl border border-base-200 p-4">
      <Show when={props.title}>
        <h3 class="font-bold text-base-content mb-4">{props.title}</h3>
      </Show>

      <div class="space-y-2" style={{ height: `${height()}px`, overflow: 'auto' }}>
        <For each={props.data}>
          {(d) => {
            const percentage = (d.value / maxValue()) * 100;
            return (
              <div class="flex items-center gap-3">
                <span class="text-xs text-base-content/60 w-16 shrink-0">
                  {formatDate(d.date)}
                </span>
                <div class="flex-1 h-6 bg-base-200 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%`, "background-color": color() }}
                  />
                </div>
                <span class="text-sm font-medium w-16 text-right">
                  {formatValue(d.value)}
                </span>
              </div>
            );
          }}
        </For>
      </div>
    </div>
  );
}

// Donut/Pie chart
export function DonutChart(props: {
  data: Array<{ label: string; value: number; color?: string }>;
  title?: string;
  size?: number;
}) {
  const size = () => props.size || 150;
  const total = () => props.data.reduce((sum, d) => sum + d.value, 0);

  const colors = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  let cumulativePercent = 0;

  return (
    <div class="bg-base-100 rounded-2xl border border-base-200 p-6">
      <Show when={props.title}>
        <h3 class="font-bold text-base-content mb-4 text-center">{props.title}</h3>
      </Show>

      <div class="flex flex-col items-center gap-4">
        {/* SVG Donut */}
        <svg width={size()} height={size()} viewBox="0 0 100 100">
          <For each={props.data}>
            {(d, i) => {
              const percent = (d.value / total()) * 100;
              const startPercent = cumulativePercent;
              cumulativePercent += percent;

              const startAngle = (startPercent / 100) * 360 - 90;
              const endAngle = (cumulativePercent / 100) * 360 - 90;

              const startX = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
              const startY = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
              const endX = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
              const endY = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);

              const largeArcFlag = percent > 50 ? 1 : 0;

              const pathD = `M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;

              return (
                <path
                  d={pathD}
                  fill={d.color || colors[i() % colors.length]}
                  class="hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <title>{d.label}: {d.value} ({percent.toFixed(1)}%)</title>
                </path>
              );
            }}
          </For>
          {/* Center hole */}
          <circle cx="50" cy="50" r="25" fill="currentColor" class="text-base-100" />
          <text x="50" y="50" text-anchor="middle" dominant-baseline="middle" class="text-lg font-bold fill-current">
            {total()}
          </text>
        </svg>

        {/* Legend */}
        <div class="flex flex-wrap justify-center gap-3">
          <For each={props.data}>
            {(d, i) => (
              <div class="flex items-center gap-1.5">
                <div
                  class="w-3 h-3 rounded-full"
                  style={{ "background-color": d.color || colors[i() % colors.length] }}
                />
                <span class="text-xs text-base-content/70">{d.label}</span>
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  );
}
