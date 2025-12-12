/**
 * T131: Admin Moderation Page
 * Content moderation and review management
 */

import { Title } from "@solidjs/meta";
import { createSignal, createEffect, Show, For } from "solid-js";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

type ModerationItemType = 'review' | 'doctor' | 'report';
type ModerationStatus = 'pending' | 'approved' | 'rejected';

interface ModerationItem {
  id: string;
  type: ModerationItemType;
  title: string;
  content: string;
  submittedBy: string;
  submittedAt: string;
  status: ModerationStatus;
  metadata?: Record<string, any>;
}

export default function ModerationPage() {
  const [items, setItems] = createSignal<ModerationItem[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [filter, setFilter] = createSignal<ModerationItemType | ''>('');
  const [processing, setProcessing] = createSignal<string | null>(null);

  // Fetch pending items
  const fetchItems = async () => {
    setLoading(true);
    try {
      const url = filter()
        ? `${API_URL}/api/v1/admin/moderation?type=${filter()}`
        : `${API_URL}/api/v1/admin/moderation`;
      
      const response = await fetch(url, { credentials: 'include' });
      const data = await response.json();
      
      if (data.success) {
        setItems(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch moderation items:', e);
      // Mock data for demo
      setItems([
        {
          id: '1',
          type: 'review',
          title: 'Review for Dr. Sarah Kimani',
          content: 'Great doctor, very professional and caring. Highly recommend!',
          submittedBy: 'John Doe',
          submittedAt: new Date().toISOString(),
          status: 'pending',
        },
        {
          id: '2',
          type: 'doctor',
          title: 'Doctor Verification Request',
          content: 'Dr. James Omondi - Cardiologist, Nairobi Hospital',
          submittedBy: 'james@hospital.co.ke',
          submittedAt: new Date(Date.now() - 86400000).toISOString(),
          status: 'pending',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  createEffect(() => {
    fetchItems();
  });

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setProcessing(id);
    try {
      const response = await fetch(
        `${API_URL}/api/v1/admin/moderation/${id}/${action}`,
        {
          method: 'POST',
          credentials: 'include',
        }
      );
      const data = await response.json();
      
      if (data.success) {
        setItems(prev => prev.filter(item => item.id !== id));
      }
    } catch (e) {
      console.error(`Failed to ${action} item:`, e);
      // For demo, just remove the item
      setItems(prev => prev.filter(item => item.id !== id));
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const typeLabels: Record<ModerationItemType, { label: string; icon: string; color: string }> = {
    review: { label: 'Review', icon: '⭐', color: 'badge-warning' },
    doctor: { label: 'Doctor Verification', icon: '👨‍⚕️', color: 'badge-info' },
    report: { label: 'Report', icon: '🚨', color: 'badge-error' },
  };

  const pendingCount = () => items().filter(i => i.status === 'pending').length;

  return (
    <>
      <Title>Content Moderation | Admin | Precta</Title>

      <div class="min-h-screen bg-base-200/30">
        {/* Header */}
        <div class="bg-base-100 border-b border-base-200">
          <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-2xl font-bold text-base-content">Content Moderation</h1>
                <p class="text-base-content/60 mt-1">
                  {pendingCount()} items pending review
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <div class="flex flex-wrap gap-2 mb-6">
            <button
              class={`btn btn-sm ${filter() === '' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilter('')}
            >
              All
            </button>
            <button
              class={`btn btn-sm ${filter() === 'review' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilter('review')}
            >
              ⭐ Reviews
            </button>
            <button
              class={`btn btn-sm ${filter() === 'doctor' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilter('doctor')}
            >
              👨‍⚕️ Verifications
            </button>
            <button
              class={`btn btn-sm ${filter() === 'report' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilter('report')}
            >
              🚨 Reports
            </button>
          </div>

          {/* Loading */}
          <Show when={loading()}>
            <div class="flex justify-center py-12">
              <span class="loading loading-spinner loading-lg text-primary"></span>
            </div>
          </Show>

          {/* Empty State */}
          <Show when={!loading() && items().length === 0}>
            <div class="bg-base-100 rounded-2xl border border-base-200 p-12 text-center">
              <div class="text-5xl mb-4">✅</div>
              <h3 class="text-lg font-bold text-base-content mb-2">All Caught Up!</h3>
              <p class="text-base-content/60">No items pending moderation</p>
            </div>
          </Show>

          {/* Items List */}
          <Show when={!loading() && items().length > 0}>
            <div class="space-y-4">
              <For each={items()}>
                {(item) => (
                  <div class="bg-base-100 rounded-2xl border border-base-200 overflow-hidden">
                    {/* Header */}
                    <div class="p-4 border-b border-base-200 flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <span class={`badge ${typeLabels[item.type].color}`}>
                          {typeLabels[item.type].icon} {typeLabels[item.type].label}
                        </span>
                        <span class="text-sm text-base-content/60">
                          {formatDate(item.submittedAt)}
                        </span>
                      </div>
                      <span class="text-sm text-base-content/60">
                        by {item.submittedBy}
                      </span>
                    </div>

                    {/* Content */}
                    <div class="p-6">
                      <h3 class="font-bold text-base-content mb-2">{item.title}</h3>
                      <p class="text-base-content/80 whitespace-pre-wrap">{item.content}</p>
                    </div>

                    {/* Actions */}
                    <div class="p-4 bg-base-200/30 border-t border-base-200 flex items-center justify-between">
                      <button class="btn btn-ghost btn-sm">
                        View Details
                      </button>
                      <div class="flex gap-2">
                        <button
                          class="btn btn-error btn-sm"
                          onClick={() => handleAction(item.id, 'reject')}
                          disabled={processing() === item.id}
                        >
                          <Show when={processing() === item.id} fallback="Reject">
                            <span class="loading loading-spinner loading-xs"></span>
                          </Show>
                        </button>
                        <button
                          class="btn btn-success btn-sm"
                          onClick={() => handleAction(item.id, 'approve')}
                          disabled={processing() === item.id}
                        >
                          <Show when={processing() === item.id} fallback="Approve">
                            <span class="loading loading-spinner loading-xs"></span>
                          </Show>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </div>
      </div>
    </>
  );
}
