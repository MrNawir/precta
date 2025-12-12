/**
 * T137: ReviewForm Component
 * Form for patients to submit doctor reviews
 */

import { createSignal, Show } from "solid-js";
import StarRating from "./StarRating";

export interface ReviewFormProps {
  appointmentId: string;
  doctorName: string;
  onSubmit: (data: ReviewData) => Promise<void>;
  onCancel?: () => void;
}

export interface ReviewData {
  rating: number;
  title?: string;
  content: string;
  isAnonymous: boolean;
}

export default function ReviewForm(props: ReviewFormProps) {
  const [rating, setRating] = createSignal(0);
  const [title, setTitle] = createSignal('');
  const [content, setContent] = createSignal('');
  const [isAnonymous, setIsAnonymous] = createSignal(false);
  const [submitting, setSubmitting] = createSignal(false);
  const [error, setError] = createSignal('');

  const isValid = () => rating() >= 1 && content().trim().length >= 10;

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!isValid()) return;

    setError('');
    setSubmitting(true);

    try {
      await props.onSubmit({
        rating: rating(),
        title: title() || undefined,
        content: content().trim(),
        isAnonymous: isAnonymous(),
      });
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const ratingLabels: Record<number, string> = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent',
  };

  return (
    <form onSubmit={handleSubmit} class="space-y-6">
      {/* Rating */}
      <div class="text-center">
        <p class="text-base-content/60 mb-2">
          How was your experience with <span class="font-medium text-base-content">{props.doctorName}</span>?
        </p>
        
        <div class="flex flex-col items-center gap-2">
          <StarRating
            value={rating()}
            size="lg"
            onChange={setRating}
          />
          <Show when={rating() > 0}>
            <span class={`text-sm font-medium ${
              rating() >= 4 ? 'text-success' :
              rating() >= 3 ? 'text-warning' : 'text-error'
            }`}>
              {ratingLabels[rating()]}
            </span>
          </Show>
        </div>

        <Show when={rating() === 0}>
          <p class="text-xs text-base-content/50 mt-2">Tap a star to rate</p>
        </Show>
      </div>

      {/* Error */}
      <Show when={error()}>
        <div class="alert alert-error">
          <span>{error()}</span>
        </div>
      </Show>

      {/* Title (optional) */}
      <div class="form-control">
        <label class="label">
          <span class="label-text">Title (optional)</span>
        </label>
        <input
          type="text"
          class="input input-bordered w-full"
          placeholder="Summarize your experience"
          value={title()}
          onInput={(e) => setTitle(e.currentTarget.value)}
          maxLength={100}
        />
      </div>

      {/* Review Content */}
      <div class="form-control">
        <label class="label">
          <span class="label-text">Your Review</span>
          <span class="label-text-alt">{content().length}/500</span>
        </label>
        <textarea
          class={`textarea textarea-bordered h-32 ${content().length > 0 && content().length < 10 ? 'textarea-error' : ''}`}
          placeholder="Share details about your experience. What went well? What could be improved?"
          value={content()}
          onInput={(e) => setContent(e.currentTarget.value)}
          maxLength={500}
        />
        <Show when={content().length > 0 && content().length < 10}>
          <label class="label">
            <span class="label-text-alt text-error">Minimum 10 characters</span>
          </label>
        </Show>
      </div>

      {/* Anonymous option */}
      <div class="form-control">
        <label class="label cursor-pointer justify-start gap-3">
          <input
            type="checkbox"
            class="checkbox checkbox-primary"
            checked={isAnonymous()}
            onChange={(e) => setIsAnonymous(e.currentTarget.checked)}
          />
          <div>
            <span class="label-text">Post anonymously</span>
            <p class="text-xs text-base-content/60">
              Your name won't be shown with this review
            </p>
          </div>
        </label>
      </div>

      {/* Actions */}
      <div class="flex gap-3">
        <Show when={props.onCancel}>
          <button
            type="button"
            class="btn btn-ghost flex-1"
            onClick={props.onCancel}
            disabled={submitting()}
          >
            Cancel
          </button>
        </Show>
        <button
          type="submit"
          class={`btn btn-primary ${props.onCancel ? 'flex-1' : 'w-full'}`}
          disabled={!isValid() || submitting()}
        >
          <Show when={submitting()} fallback="Submit Review">
            <span class="loading loading-spinner loading-sm"></span>
            Submitting...
          </Show>
        </button>
      </div>

      {/* Guidelines */}
      <div class="text-xs text-base-content/50 text-center">
        <p>By submitting, you agree to our review guidelines.</p>
        <p class="mt-1">Reviews are moderated and may take up to 24 hours to appear.</p>
      </div>
    </form>
  );
}

// Compact inline review form (for post-consultation)
export function QuickReviewPrompt(props: {
  doctorName: string;
  onRate: (rating: number) => void;
  onSkip: () => void;
}) {
  const [hoveredRating, setHoveredRating] = createSignal(0);

  return (
    <div class="bg-base-100 rounded-2xl border border-base-200 p-6 text-center">
      <div class="text-4xl mb-3">⭐</div>
      <h3 class="font-bold text-base-content mb-1">How was your consultation?</h3>
      <p class="text-sm text-base-content/60 mb-4">
        Rate your experience with {props.doctorName}
      </p>
      
      <div class="flex justify-center gap-2 mb-4">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            class={`text-3xl transition-transform hover:scale-110 ${
              star <= hoveredRating() ? 'text-warning' : 'text-base-300'
            }`}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            onClick={() => props.onRate(star)}
          >
            ★
          </button>
        ))}
      </div>
      
      <button class="btn btn-ghost btn-sm" onClick={props.onSkip}>
        Maybe later
      </button>
    </div>
  );
}
