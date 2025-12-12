/**
 * T138: ReviewList Component
 * Display list of doctor reviews
 */

import { Show, For } from "solid-js";
import StarRating, { RatingDistribution } from "./StarRating";

export interface Review {
  id: string;
  rating: number;
  title?: string;
  content: string;
  isAnonymous: boolean;
  patient?: {
    name: string;
    image?: string | null;
  };
  createdAt: string;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

export interface ReviewListProps {
  reviews: Review[];
  summary?: ReviewSummary;
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export default function ReviewList(props: ReviewListProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  };

  return (
    <div class="space-y-6">
      {/* Summary */}
      <Show when={props.summary}>
        <div class="bg-base-100 rounded-2xl border border-base-200 p-6">
          <div class="flex flex-col md:flex-row md:items-center gap-6">
            {/* Average Rating */}
            <div class="text-center md:text-left">
              <div class="text-5xl font-bold text-base-content">
                {props.summary?.averageRating.toFixed(1)}
              </div>
              <StarRating value={props.summary?.averageRating || 0} readonly size="md" />
              <p class="text-sm text-base-content/60 mt-1">
                {props.summary?.totalReviews} reviews
              </p>
            </div>
            
            {/* Distribution */}
            <div class="flex-1">
              <RatingDistribution
                distribution={props.summary?.ratingDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }}
                total={props.summary?.totalReviews || 0}
              />
            </div>
          </div>
        </div>
      </Show>

      {/* Loading */}
      <Show when={props.loading}>
        <div class="space-y-4">
          <For each={[1, 2, 3]}>
            {() => (
              <div class="bg-base-100 rounded-2xl border border-base-200 p-6 animate-pulse">
                <div class="flex gap-4">
                  <div class="w-12 h-12 bg-base-200 rounded-full"></div>
                  <div class="flex-1">
                    <div class="h-4 w-24 bg-base-200 rounded mb-2"></div>
                    <div class="h-3 w-16 bg-base-200 rounded"></div>
                  </div>
                </div>
                <div class="mt-4 space-y-2">
                  <div class="h-3 bg-base-200 rounded w-full"></div>
                  <div class="h-3 bg-base-200 rounded w-3/4"></div>
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>

      {/* Empty State */}
      <Show when={!props.loading && props.reviews.length === 0}>
        <div class="bg-base-100 rounded-2xl border border-base-200 p-12 text-center">
          <div class="text-5xl mb-4">⭐</div>
          <h3 class="font-bold text-base-content mb-2">No Reviews Yet</h3>
          <p class="text-base-content/60 text-sm">
            Be the first to share your experience
          </p>
        </div>
      </Show>

      {/* Review List */}
      <Show when={!props.loading && props.reviews.length > 0}>
        <div class="space-y-4">
          <For each={props.reviews}>
            {(review) => (
              <div class="bg-base-100 rounded-2xl border border-base-200 p-6">
                {/* Header */}
                <div class="flex items-start gap-4">
                  {/* Avatar */}
                  <Show when={!review.isAnonymous && review.patient?.image} fallback={
                    <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                      {review.isAnonymous ? '?' : (review.patient?.name?.charAt(0) || 'P')}
                    </div>
                  }>
                    <img
                      src={review.patient?.image || ''}
                      alt={review.patient?.name}
                      class="w-12 h-12 rounded-full object-cover"
                    />
                  </Show>

                  {/* Info */}
                  <div class="flex-1">
                    <div class="flex items-center gap-2">
                      <span class="font-medium text-base-content">
                        {review.isAnonymous ? 'Anonymous' : (review.patient?.name || 'Patient')}
                      </span>
                      <Show when={review.isAnonymous}>
                        <span class="badge badge-ghost badge-xs">Anonymous</span>
                      </Show>
                    </div>
                    <div class="flex items-center gap-2 mt-1">
                      <StarRating value={review.rating} readonly size="xs" />
                      <span class="text-xs text-base-content/60">
                        {timeAgo(review.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div class="mt-4">
                  <Show when={review.title}>
                    <h4 class="font-semibold text-base-content mb-2">{review.title}</h4>
                  </Show>
                  <p class="text-base-content/80 whitespace-pre-wrap">{review.content}</p>
                </div>

                {/* Helpful */}
                <div class="mt-4 pt-4 border-t border-base-200 flex items-center gap-4">
                  <button class="btn btn-ghost btn-xs gap-1">
                    👍 Helpful
                  </button>
                  <button class="btn btn-ghost btn-xs">
                    Report
                  </button>
                </div>
              </div>
            )}
          </For>
        </div>

        {/* Load More */}
        <Show when={props.hasMore && props.onLoadMore}>
          <div class="text-center">
            <button class="btn btn-ghost" onClick={props.onLoadMore}>
              Load More Reviews
            </button>
          </div>
        </Show>
      </Show>
    </div>
  );
}

// Compact review card for doctor profile preview
export function ReviewPreview(props: { review: Review }) {
  return (
    <div class="p-4 border-b border-base-200 last:border-0">
      <div class="flex items-center gap-2 mb-2">
        <StarRating value={props.review.rating} readonly size="xs" />
        <span class="text-xs text-base-content/60">
          {props.review.isAnonymous ? 'Anonymous' : props.review.patient?.name}
        </span>
      </div>
      <p class="text-sm text-base-content/80 line-clamp-2">{props.review.content}</p>
    </div>
  );
}
