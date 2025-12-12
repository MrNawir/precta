/**
 * T124: ArticleCard Component
 * Display article summary in a card format
 */

import { Show } from "solid-js";
import { A } from "@solidjs/router";

export interface ArticleCardProps {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage?: string | null;
  category: string;
  author?: {
    name: string;
    image?: string | null;
  };
  publishedAt: string;
  readTime: number;
  variant?: 'default' | 'horizontal' | 'compact';
}

const categoryLabels: Record<string, { label: string; icon: string }> = {
  wellness: { label: 'Wellness', icon: '🌿' },
  prevention: { label: 'Prevention', icon: '🛡️' },
  disease: { label: 'Disease', icon: '🏥' },
  nutrition: { label: 'Nutrition', icon: '🥗' },
  mental_health: { label: 'Mental Health', icon: '🧠' },
  fitness: { label: 'Fitness', icon: '💪' },
  news: { label: 'Health News', icon: '📰' },
};

export default function ArticleCard(props: ArticleCardProps) {
  const variant = () => props.variant || 'default';

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const categoryInfo = () => categoryLabels[props.category] || { label: props.category, icon: '📄' };

  // Compact variant
  if (variant() === 'compact') {
    return (
      <A
        href={`/articles/${props.slug}`}
        class="flex items-start gap-4 p-4 rounded-xl hover:bg-base-200/50 transition-colors"
      >
        <Show when={props.coverImage} fallback={
          <div class="w-20 h-16 bg-base-200 rounded-lg flex items-center justify-center text-2xl shrink-0">
            📄
          </div>
        }>
          <img
            src={props.coverImage || ''}
            alt={props.title}
            class="w-20 h-16 object-cover rounded-lg shrink-0"
          />
        </Show>
        <div class="min-w-0">
          <h3 class="font-medium text-base-content line-clamp-2 hover:text-primary transition-colors">
            {props.title}
          </h3>
          <p class="text-xs text-base-content/60 mt-1">
            {formatDate(props.publishedAt)} • {props.readTime} min read
          </p>
        </div>
      </A>
    );
  }

  // Horizontal variant
  if (variant() === 'horizontal') {
    return (
      <A
        href={`/articles/${props.slug}`}
        class="bg-base-100 rounded-2xl border border-base-200 overflow-hidden flex hover:shadow-md transition-shadow group"
      >
        <div class="w-48 h-36 bg-base-200 shrink-0 overflow-hidden">
          <Show when={props.coverImage} fallback={
            <div class="w-full h-full flex items-center justify-center text-4xl">
              📄
            </div>
          }>
            <img
              src={props.coverImage || ''}
              alt={props.title}
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </Show>
        </div>
        <div class="flex-1 p-4 flex flex-col">
          <span class="badge badge-sm badge-primary mb-2">
            {categoryInfo().icon} {categoryInfo().label}
          </span>
          <h3 class="font-bold text-base-content line-clamp-2 group-hover:text-primary transition-colors">
            {props.title}
          </h3>
          <p class="text-sm text-base-content/60 line-clamp-2 mt-1 flex-1">
            {props.excerpt}
          </p>
          <div class="flex items-center gap-2 mt-2 text-xs text-base-content/60">
            <span>{formatDate(props.publishedAt)}</span>
            <span>•</span>
            <span>{props.readTime} min read</span>
          </div>
        </div>
      </A>
    );
  }

  // Default vertical variant
  return (
    <A
      href={`/articles/${props.slug}`}
      class="bg-base-100 rounded-2xl border border-base-200 overflow-hidden hover:shadow-lg transition-shadow group"
    >
      {/* Cover Image */}
      <div class="h-48 bg-base-200 relative overflow-hidden">
        <Show when={props.coverImage} fallback={
          <div class="w-full h-full flex items-center justify-center text-5xl">
            📄
          </div>
        }>
          <img
            src={props.coverImage || ''}
            alt={props.title}
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Show>
        <span class="absolute top-3 left-3 badge badge-primary">
          {categoryInfo().icon} {categoryInfo().label}
        </span>
      </div>

      {/* Content */}
      <div class="p-6">
        <div class="flex items-center gap-2 text-sm text-base-content/60 mb-3">
          <span>{formatDate(props.publishedAt)}</span>
          <span>•</span>
          <span>{props.readTime} min read</span>
        </div>

        <h2 class="text-lg font-bold text-base-content mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {props.title}
        </h2>
        <p class="text-base-content/60 text-sm line-clamp-2">
          {props.excerpt}
        </p>

        {/* Author */}
        <Show when={props.author}>
          <div class="flex items-center gap-2 mt-4 pt-4 border-t border-base-200">
            <Show when={props.author?.image} fallback={
              <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                {props.author?.name?.charAt(0) || 'A'}
              </div>
            }>
              <img
                src={props.author?.image || ''}
                alt={props.author?.name}
                class="w-8 h-8 rounded-full object-cover"
              />
            </Show>
            <span class="text-sm text-base-content/60">
              {props.author?.name || 'Precta Health'}
            </span>
          </div>
        </Show>
      </div>
    </A>
  );
}
