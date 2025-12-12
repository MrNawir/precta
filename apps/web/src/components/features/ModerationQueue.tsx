/**
 * T134: ModerationQueue Component
 * Reusable moderation queue for admin panels
 */

import { Show, For, createSignal } from "solid-js";

export type ModerationItemType = 'review' | 'doctor' | 'report' | 'article';
export type ModerationStatus = 'pending' | 'approved' | 'rejected';

export interface ModerationItem {
  id: string;
  type: ModerationItemType;
  title: string;
  content: string;
  submittedBy: {
    name: string;
    email?: string;
    image?: string | null;
  };
  submittedAt: string;
  status: ModerationStatus;
  metadata?: Record<string, any>;
}

export interface ModerationQueueProps {
  items: ModerationItem[];
  loading?: boolean;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason?: string) => Promise<void>;
  onViewDetails?: (item: ModerationItem) => void;
  emptyMessage?: string;
}

const typeConfig: Record<ModerationItemType, { label: string; icon: string; badgeClass: string }> = {
  review: { label: 'Review', icon: '⭐', badgeClass: 'badge-warning' },
  doctor: { label: 'Doctor', icon: '👨‍⚕️', badgeClass: 'badge-info' },
  report: { label: 'Report', icon: '🚨', badgeClass: 'badge-error' },
  article: { label: 'Article', icon: '📝', badgeClass: 'badge-primary' },
};

export default function ModerationQueue(props: ModerationQueueProps) {
  const [processingId, setProcessingId] = createSignal<string | null>(null);
  const [rejectingId, setRejectingId] = createSignal<string | null>(null);
  const [rejectReason, setRejectReason] = createSignal('');

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (hours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      await props.onApprove(id);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      await props.onReject(id, rejectReason());
      setRejectingId(null);
      setRejectReason('');
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (id: string) => {
    setRejectingId(id);
    setRejectReason('');
  };

  // Loading state
  if (props.loading) {
    return (
      <div class="space-y-4">
        <For each={[1, 2, 3]}>
          {() => (
            <div class="bg-base-100 rounded-2xl border border-base-200 p-6 animate-pulse">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-base-200 rounded-full"></div>
                <div class="flex-1">
                  <div class="h-4 w-48 bg-base-200 rounded mb-2"></div>
                  <div class="h-3 w-32 bg-base-200 rounded"></div>
                </div>
              </div>
            </div>
          )}
        </For>
      </div>
    );
  }

  // Empty state
  if (props.items.length === 0) {
    return (
      <div class="bg-base-100 rounded-2xl border border-base-200 p-12 text-center">
        <div class="text-5xl mb-4">✅</div>
        <h3 class="font-bold text-base-content mb-2">Queue Empty</h3>
        <p class="text-base-content/60">
          {props.emptyMessage || 'No items pending moderation'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div class="space-y-4">
        <For each={props.items}>
          {(item) => {
            const config = typeConfig[item.type];
            const isProcessing = processingId() === item.id;

            return (
              <div class="bg-base-100 rounded-2xl border border-base-200 overflow-hidden">
                {/* Header */}
                <div class="p-4 border-b border-base-200 flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <span class={`badge ${config.badgeClass}`}>
                      {config.icon} {config.label}
                    </span>
                    <span class="text-sm text-base-content/60">
                      {formatDate(item.submittedAt)}
                    </span>
                  </div>
                  <Show when={item.status === 'pending'}>
                    <span class="badge badge-ghost">Pending</span>
                  </Show>
                </div>

                {/* Content */}
                <div class="p-6">
                  {/* Submitter */}
                  <div class="flex items-center gap-3 mb-4">
                    <Show when={item.submittedBy.image} fallback={
                      <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                        {item.submittedBy.name.charAt(0)}
                      </div>
                    }>
                      <img
                        src={item.submittedBy.image || ''}
                        alt={item.submittedBy.name}
                        class="w-10 h-10 rounded-full object-cover"
                      />
                    </Show>
                    <div>
                      <p class="font-medium text-base-content">{item.submittedBy.name}</p>
                      <Show when={item.submittedBy.email}>
                        <p class="text-xs text-base-content/60">{item.submittedBy.email}</p>
                      </Show>
                    </div>
                  </div>

                  {/* Title & Content */}
                  <h3 class="font-bold text-base-content mb-2">{item.title}</h3>
                  <p class="text-base-content/80 line-clamp-3">{item.content}</p>

                  {/* Metadata */}
                  <Show when={item.metadata && Object.keys(item.metadata).length > 0}>
                    <div class="mt-4 p-3 bg-base-200/50 rounded-lg">
                      <For each={Object.entries(item.metadata || {})}>
                        {([key, value]) => (
                          <div class="flex justify-between text-sm">
                            <span class="text-base-content/60 capitalize">{key.replace(/_/g, ' ')}</span>
                            <span class="text-base-content">{String(value)}</span>
                          </div>
                        )}
                      </For>
                    </div>
                  </Show>
                </div>

                {/* Actions */}
                <Show when={item.status === 'pending'}>
                  <div class="p-4 bg-base-200/30 border-t border-base-200 flex items-center justify-between">
                    <Show when={props.onViewDetails}>
                      <button
                        class="btn btn-ghost btn-sm"
                        onClick={() => props.onViewDetails?.(item)}
                      >
                        View Details
                      </button>
                    </Show>
                    <div class="flex gap-2 ml-auto">
                      <button
                        class="btn btn-error btn-outline btn-sm"
                        onClick={() => openRejectModal(item.id)}
                        disabled={isProcessing}
                      >
                        Reject
                      </button>
                      <button
                        class="btn btn-success btn-sm"
                        onClick={() => handleApprove(item.id)}
                        disabled={isProcessing}
                      >
                        <Show when={isProcessing} fallback="Approve">
                          <span class="loading loading-spinner loading-xs"></span>
                        </Show>
                      </button>
                    </div>
                  </div>
                </Show>
              </div>
            );
          }}
        </For>
      </div>

      {/* Reject Modal */}
      <Show when={rejectingId()}>
        <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div class="bg-base-100 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div class="p-6 border-b border-base-200">
              <h3 class="text-lg font-bold text-base-content">Reject Item</h3>
              <p class="text-sm text-base-content/60 mt-1">
                Provide a reason for rejection (optional)
              </p>
            </div>

            <div class="p-6">
              <textarea
                class="textarea textarea-bordered w-full h-24"
                placeholder="Reason for rejection..."
                value={rejectReason()}
                onInput={(e) => setRejectReason(e.currentTarget.value)}
              />
            </div>

            <div class="p-6 bg-base-200/30 flex justify-end gap-3">
              <button
                class="btn btn-ghost"
                onClick={() => setRejectingId(null)}
                disabled={processingId() !== null}
              >
                Cancel
              </button>
              <button
                class="btn btn-error"
                onClick={() => handleReject(rejectingId()!)}
                disabled={processingId() !== null}
              >
                <Show when={processingId()} fallback="Confirm Rejection">
                  <span class="loading loading-spinner loading-sm"></span>
                  Rejecting...
                </Show>
              </button>
            </div>
          </div>
        </div>
      </Show>
    </>
  );
}

// Compact queue summary card
export function ModerationSummary(props: {
  counts: { reviews: number; doctors: number; reports: number };
  onClick?: () => void;
}) {
  const total = () => props.counts.reviews + props.counts.doctors + props.counts.reports;

  return (
    <div
      class={`bg-base-100 rounded-2xl border border-base-200 p-6 ${props.onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={props.onClick}
    >
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-bold text-base-content">Moderation Queue</h3>
        <span class="badge badge-primary">{total()} pending</span>
      </div>

      <div class="grid grid-cols-3 gap-4">
        <div class="text-center">
          <div class="text-2xl">⭐</div>
          <div class="text-lg font-bold text-base-content">{props.counts.reviews}</div>
          <div class="text-xs text-base-content/60">Reviews</div>
        </div>
        <div class="text-center">
          <div class="text-2xl">👨‍⚕️</div>
          <div class="text-lg font-bold text-base-content">{props.counts.doctors}</div>
          <div class="text-xs text-base-content/60">Doctors</div>
        </div>
        <div class="text-center">
          <div class="text-2xl">🚨</div>
          <div class="text-lg font-bold text-base-content">{props.counts.reports}</div>
          <div class="text-xs text-base-content/60">Reports</div>
        </div>
      </div>
    </div>
  );
}
