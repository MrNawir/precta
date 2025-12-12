/**
 * T139: StarRating Component
 * Interactive star rating input and display
 */

import { For, createSignal, Show } from "solid-js";

export interface StarRatingProps {
  value: number;
  maxStars?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  readonly?: boolean;
  showValue?: boolean;
  onChange?: (rating: number) => void;
  label?: string;
}

export default function StarRating(props: StarRatingProps) {
  const maxStars = () => props.maxStars || 5;
  const size = () => props.size || 'md';
  const [hoverValue, setHoverValue] = createSignal(0);

  const displayValue = () => hoverValue() || props.value;

  const sizeClasses = () => {
    switch (size()) {
      case 'xs': return 'w-3 h-3';
      case 'sm': return 'w-4 h-4';
      case 'md': return 'w-5 h-5';
      case 'lg': return 'w-6 h-6';
      default: return 'w-5 h-5';
    }
  };

  const gapClass = () => {
    switch (size()) {
      case 'xs': return 'gap-0.5';
      case 'sm': return 'gap-1';
      case 'md': return 'gap-1';
      case 'lg': return 'gap-1.5';
      default: return 'gap-1';
    }
  };

  const handleClick = (star: number) => {
    if (props.readonly) return;
    props.onChange?.(star);
  };

  const handleMouseEnter = (star: number) => {
    if (props.readonly) return;
    setHoverValue(star);
  };

  const handleMouseLeave = () => {
    setHoverValue(0);
  };

  const StarIcon = (props: { filled: boolean; half?: boolean }) => (
    <svg
      viewBox="0 0 24 24"
      fill={props.filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      stroke-width="1.5"
      class="transition-colors"
    >
      <Show when={props.half} fallback={
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
        />
      }>
        <defs>
          <linearGradient id="half-star">
            <stop offset="50%" stop-color="currentColor" />
            <stop offset="50%" stop-color="transparent" />
          </linearGradient>
        </defs>
        <path
          fill="url(#half-star)"
          d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
        />
      </Show>
    </svg>
  );

  return (
    <div class="inline-flex flex-col">
      <Show when={props.label}>
        <span class="text-sm text-base-content/60 mb-1">{props.label}</span>
      </Show>
      
      <div class="flex items-center">
        <div
          class={`flex ${gapClass()} ${props.readonly ? '' : 'cursor-pointer'}`}
          onMouseLeave={handleMouseLeave}
        >
          <For each={Array.from({ length: maxStars() }, (_, i) => i + 1)}>
            {(star) => {
              const isFilled = displayValue() >= star;
              const isHalf = !isFilled && displayValue() >= star - 0.5;
              
              return (
                <button
                  type="button"
                  class={`${sizeClasses()} ${
                    isFilled ? 'text-warning' : isHalf ? 'text-warning' : 'text-base-300'
                  } ${props.readonly ? 'cursor-default' : 'hover:scale-110 transition-transform'}`}
                  onClick={() => handleClick(star)}
                  onMouseEnter={() => handleMouseEnter(star)}
                  disabled={props.readonly}
                >
                  <StarIcon filled={isFilled} half={isHalf} />
                </button>
              );
            }}
          </For>
        </div>

        <Show when={props.showValue}>
          <span class={`ml-2 font-medium ${
            size() === 'xs' ? 'text-xs' :
            size() === 'sm' ? 'text-sm' :
            size() === 'lg' ? 'text-lg' : 'text-base'
          }`}>
            {props.value.toFixed(1)}
          </span>
        </Show>
      </div>
    </div>
  );
}

// Rating Distribution component (for showing breakdown)
export function RatingDistribution(props: {
  distribution: Record<number, number>;
  total: number;
}) {
  const ratings = [5, 4, 3, 2, 1];

  return (
    <div class="space-y-2">
      <For each={ratings}>
        {(rating) => {
          const count = props.distribution[rating] || 0;
          const percentage = props.total > 0 ? (count / props.total) * 100 : 0;
          
          return (
            <div class="flex items-center gap-2 text-sm">
              <span class="w-3 text-base-content/60">{rating}</span>
              <StarRating value={1} maxStars={1} size="xs" readonly />
              <div class="flex-1 h-2 bg-base-200 rounded-full overflow-hidden">
                <div
                  class="h-full bg-warning rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span class="w-8 text-right text-base-content/60">{count}</span>
            </div>
          );
        }}
      </For>
    </div>
  );
}

// Compact rating display
export function RatingBadge(props: { value: number; reviewCount?: number }) {
  return (
    <div class="inline-flex items-center gap-1.5 px-2 py-1 bg-warning/10 rounded-lg">
      <span class="text-warning text-sm">★</span>
      <span class="font-medium text-sm">{props.value.toFixed(1)}</span>
      <Show when={props.reviewCount !== undefined}>
        <span class="text-xs text-base-content/60">
          ({props.reviewCount})
        </span>
      </Show>
    </div>
  );
}
