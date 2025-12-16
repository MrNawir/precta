/**
 * FeatureGrid Component (Bento Grid)
 * 
 * Premium animated feature grid for the landing page.
 * Displays service cards in a responsive bento-style layout.
 * 
 * Features:
 * - Glassmorphic hover effects (150ms per spec)
 * - GPU-accelerated CSS transforms
 * - Responsive grid layout (12-column)
 * - Lucide icons instead of emojis (FR-002)
 * - WCAG AA compliant contrast
 * 
 * Usage:
 * ```tsx
 * <FeatureGrid items={services} />
 * ```
 * 
 * References:
 * - User Story 1, Acceptance Scenario 3
 * - Animation timing: FR-003 (<200ms)
 * 
 * @module components/layout/FeatureGrid
 */

import { For, createSignal, onMount, Show } from 'solid-js';
import type { Component, JSX } from 'solid-js';
import { ChevronRight } from 'lucide-solid';

/**
 * Feature item data structure.
 * Defines the content and styling for each grid card.
 */
export interface FeatureItem {
  /** Unique identifier */
  id: string;
  /** Card title */
  title: string;
  /** Short description */
  description: string;
  /** Lucide icon component */
  icon: Component<{ class?: string }>;
  /** Navigation href */
  href: string;
  /** Optional background image URL */
  image?: string;
  /** Grid span classes (Tailwind) */
  span: string;
  /** Gradient overlay classes */
  gradient: string;
}

interface FeatureGridProps {
  /** Array of feature items to display */
  items: FeatureItem[];
  /** Optional CSS class for the container */
  class?: string;
}

/**
 * FeatureGrid Component
 * 
 * Renders a bento-style grid of feature cards with
 * premium hover effects and animations.
 */
export default function FeatureGrid(props: FeatureGridProps) {
  // Track mounted state for entrance animations
  const [isMounted, setIsMounted] = createSignal(false);

  onMount(() => {
    // Stagger entrance animation
    requestAnimationFrame(() => setIsMounted(true));
  });

  return (
    <div 
      class={`grid grid-cols-12 gap-4 md:gap-6 ${props.class || ''}`}
      role="list"
      aria-label="Healthcare services"
    >
      <For each={props.items}>
        {(item, index) => (
          <FeatureCard 
            item={item} 
            index={index()} 
            isMounted={isMounted()} 
          />
        )}
      </For>
    </div>
  );
}

/**
 * Individual feature card with hover effects.
 */
function FeatureCard(props: { 
  item: FeatureItem; 
  index: number; 
  isMounted: boolean;
}) {
  const [isHovered, setIsHovered] = createSignal(false);

  // Calculate stagger delay for entrance animation
  const entranceDelay = () => props.index * 100;

  return (
    <a
      href={props.item.href}
      class={`
        group relative overflow-hidden rounded-3xl md:rounded-4xl
        ${props.item.span}
        h-56 md:h-72 lg:h-80
        hover-lift
        transition-all duration-150
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
        ${props.isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
      `}
      style={{ 
        'transition-delay': `${entranceDelay()}ms`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="listitem"
      aria-label={`${props.item.title}: ${props.item.description}`}
    >
      {/* Background Image (lazy-loaded) */}
      <Show when={props.item.image}>
        <img
          src={props.item.image}
          alt=""
          loading="lazy"
          class={`
            absolute inset-0 w-full h-full object-cover
            transition-transform duration-500 ease-out
            ${isHovered() ? 'scale-105' : 'scale-100'}
          `}
          aria-hidden="true"
        />
      </Show>

      {/* Gradient Overlay - provides text contrast */}
      <div 
        class={`
          absolute inset-0 
          bg-linear-to-t ${props.item.gradient}
          transition-opacity duration-150
          ${isHovered() ? 'opacity-95' : 'opacity-90'}
        `}
        aria-hidden="true"
      />

      {/* Glass Effect Overlay on Hover */}
      <div 
        class={`
          absolute inset-0 
          backdrop-blur-sm
          transition-opacity duration-150
          ${isHovered() ? 'opacity-100' : 'opacity-0'}
        `}
        style={{ background: 'rgba(255, 255, 255, 0.05)' }}
        aria-hidden="true"
      />

      {/* Content */}
      <div class="absolute inset-0 p-6 md:p-8 flex flex-col justify-between text-white">
        {/* Icon Container - Glassmorphic */}
        <div 
          class={`
            w-12 h-12 md:w-14 md:h-14
            rounded-xl md:rounded-2xl
            flex items-center justify-center
            bg-white/20 backdrop-blur-md
            border border-white/30
            transition-transform duration-150
            ${isHovered() ? 'scale-110' : 'scale-100'}
          `}
        >
          <props.item.icon class="w-6 h-6 md:w-7 md:h-7 text-white" />
        </div>

        {/* Text Content */}
        <div>
          <h3 
            class={`
              text-xl md:text-2xl font-bold mb-2
              transition-transform duration-150
              ${isHovered() ? 'translate-x-1' : 'translate-x-0'}
            `}
          >
            {props.item.title}
          </h3>
          
          <p 
            class={`
              text-white/90 font-medium text-sm md:text-base
              flex items-center gap-2
            `}
          >
            {props.item.description}
            
            {/* Arrow indicator - animates on hover */}
            <ChevronRight 
              class={`
                w-4 h-4
                transition-all duration-150
                ${isHovered() 
                  ? 'opacity-100 translate-x-0' 
                  : 'opacity-0 -translate-x-2'
                }
              `}
              aria-hidden="true"
            />
          </p>
        </div>
      </div>
    </a>
  );
}

/**
 * Skeleton loader for feature grid while data loads.
 */
export function FeatureGridSkeleton(props: { count?: number }) {
  const skeletonCount = props.count || 4;
  const spans = [
    'col-span-12 md:col-span-6',
    'col-span-12 md:col-span-3',
    'col-span-12 md:col-span-3',
    'col-span-12 md:col-span-6',
  ];

  return (
    <div class="grid grid-cols-12 gap-4 md:gap-6">
      <For each={Array(skeletonCount).fill(0)}>
        {(_, index) => (
          <div 
            class={`
              ${spans[index() % spans.length]}
              h-56 md:h-72 lg:h-80
              rounded-3xl md:rounded-4xl
              bg-base-200 animate-pulse
            `}
          />
        )}
      </For>
    </div>
  );
}
