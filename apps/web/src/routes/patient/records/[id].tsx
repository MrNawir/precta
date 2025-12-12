/**
 * T090: Record Detail Page
 * View and manage a single medical record
 */

import { Title } from "@solidjs/meta";
import { useParams, useNavigate, A } from "@solidjs/router";
import { createSignal, createEffect, Show, For } from "solid-js";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

type RecordType = 'lab_result' | 'prescription' | 'imaging' | 'vaccination' | 'medical_history' | 'other';

interface MedicalRecord {
  id: string;
  type: RecordType;
  title: string;
  description: string | null;
  fileUrl: string | null;
  mimeType: string | null;
  fileSize: number | null;
  recordDate: string;
  uploadedAt: string;
  sharedWith: string[];
  metadata: Record<string, unknown> | null;
}

const recordTypes: Record<RecordType, { label: string; icon: string }> = {
  lab_result: { label: 'Lab Results', icon: '🧪' },
  prescription: { label: 'Prescription', icon: '💊' },
  imaging: { label: 'Imaging/X-Ray', icon: '📷' },
  vaccination: { label: 'Vaccination', icon: '💉' },
  medical_history: { label: 'Medical History', icon: '📋' },
  other: { label: 'Other', icon: '📄' },
};

export default function RecordDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  
  const [record, setRecord] = createSignal<MedicalRecord | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal('');
  const [showShareModal, setShowShareModal] = createSignal(false);
  const [shareEmail, setShareEmail] = createSignal('');

  // Fetch record
  createEffect(async () => {
    if (!params.id) return;

    try {
      const response = await fetch(
        `${API_URL}/api/v1/records/${params.id}`,
        { credentials: 'include' }
      );
      const data = await response.json();
      
      if (data.success) {
        setRecord(data.data);
      } else {
        setError(data.error || 'Failed to load record');
      }
    } catch (e) {
      setError('Failed to load record');
    } finally {
      setLoading(false);
    }
  });

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/v1/records/${params.id}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      if (response.ok) {
        navigate('/patient/records');
      }
    } catch (e) {
      console.error('Delete failed:', e);
    }
  };

  const handleShare = async () => {
    // In production, would lookup doctor by email and share
    setShowShareModal(false);
    setShareEmail('');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getTypeInfo = (type: RecordType) => {
    return recordTypes[type] || recordTypes.other;
  };

  const isImage = () => record()?.mimeType?.startsWith('image/');
  const isPdf = () => record()?.mimeType === 'application/pdf';

  return (
    <>
      <Title>{record()?.title || 'Record Detail'} | Precta</Title>

      <div class="min-h-screen bg-base-200/30">
        {/* Header */}
        <div class="bg-base-100 border-b border-base-200">
          <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div class="flex items-center gap-4">
              <A href="/patient/records" class="btn btn-ghost btn-sm">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </A>
              <h1 class="text-xl font-bold text-base-content">Record Details</h1>
            </div>
          </div>
        </div>

        <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
          <Show when={!loading()} fallback={
            <div class="flex justify-center py-12">
              <span class="loading loading-spinner loading-lg text-primary"></span>
            </div>
          }>
            <Show when={record()} fallback={
              <div class="text-center py-12">
                <div class="text-5xl mb-4">📁</div>
                <p class="text-base-content/60">{error() || 'Record not found'}</p>
                <A href="/patient/records" class="btn btn-primary mt-4">
                  Back to Records
                </A>
              </div>
            }>
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Document Preview */}
                <div class="lg:col-span-2">
                  <div class="bg-base-100 rounded-2xl border border-base-200 overflow-hidden">
                    <div class="p-4 border-b border-base-200">
                      <h2 class="font-bold text-base-content">Document</h2>
                    </div>
                    
                    <Show when={record()?.fileUrl} fallback={
                      <div class="p-12 text-center">
                        <div class="text-5xl mb-4">📄</div>
                        <p class="text-base-content/60">No file attached</p>
                      </div>
                    }>
                      <Show when={isImage()}>
                        <div class="p-4">
                          <img
                            src={record()?.fileUrl || ''}
                            alt={record()?.title}
                            class="w-full rounded-lg"
                          />
                        </div>
                      </Show>

                      <Show when={isPdf()}>
                        <div class="aspect-4/5">
                          <iframe
                            src={record()?.fileUrl || ''}
                            class="w-full h-full"
                            title={record()?.title}
                          />
                        </div>
                      </Show>

                      <Show when={!isImage() && !isPdf()}>
                        <div class="p-12 text-center">
                          <div class="text-5xl mb-4">📎</div>
                          <p class="text-base-content/60 mb-4">Preview not available</p>
                          <a
                            href={record()?.fileUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="btn btn-primary"
                          >
                            Download File
                          </a>
                        </div>
                      </Show>
                    </Show>
                  </div>
                </div>

                {/* Details Sidebar */}
                <div class="space-y-6">
                  {/* Record Info */}
                  <div class="bg-base-100 rounded-2xl border border-base-200 p-6">
                    <div class="flex items-center gap-3 mb-4">
                      <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                        {getTypeInfo(record()?.type || 'other').icon}
                      </div>
                      <div>
                        <h2 class="font-bold text-base-content">{record()?.title}</h2>
                        <span class="badge badge-sm badge-ghost">
                          {getTypeInfo(record()?.type || 'other').label}
                        </span>
                      </div>
                    </div>

                    <div class="space-y-3">
                      <div>
                        <p class="text-sm text-base-content/60">Record Date</p>
                        <p class="font-medium">{formatDate(record()?.recordDate || '')}</p>
                      </div>
                      
                      <div>
                        <p class="text-sm text-base-content/60">Uploaded</p>
                        <p class="font-medium">{formatDate(record()?.uploadedAt || '')}</p>
                      </div>

                      <Show when={record()?.fileSize}>
                        <div>
                          <p class="text-sm text-base-content/60">File Size</p>
                          <p class="font-medium">{formatSize(record()?.fileSize || null)}</p>
                        </div>
                      </Show>

                      <Show when={record()?.description}>
                        <div>
                          <p class="text-sm text-base-content/60">Description</p>
                          <p class="text-base-content/80">{record()?.description}</p>
                        </div>
                      </Show>
                    </div>
                  </div>

                  {/* Sharing */}
                  <div class="bg-base-100 rounded-2xl border border-base-200 p-6">
                    <h3 class="font-bold text-base-content mb-4">Sharing</h3>
                    
                    <Show when={(record()?.sharedWith || []).length > 0} fallback={
                      <p class="text-sm text-base-content/60 mb-4">
                        Not shared with anyone
                      </p>
                    }>
                      <div class="space-y-2 mb-4">
                        <For each={record()?.sharedWith || []}>
                          {(doctorId) => (
                            <div class="flex items-center justify-between p-2 bg-base-200/50 rounded-lg">
                              <span class="text-sm">Doctor {doctorId.slice(0, 8)}...</span>
                              <button class="btn btn-ghost btn-xs text-error">
                                Revoke
                              </button>
                            </div>
                          )}
                        </For>
                      </div>
                    </Show>

                    <button
                      class="btn btn-outline btn-sm w-full"
                      onClick={() => setShowShareModal(true)}
                    >
                      Share with Doctor
                    </button>
                  </div>

                  {/* Actions */}
                  <div class="bg-base-100 rounded-2xl border border-base-200 p-6">
                    <h3 class="font-bold text-base-content mb-4">Actions</h3>
                    
                    <div class="space-y-2">
                      <Show when={record()?.fileUrl}>
                        <a
                          href={record()?.fileUrl || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          class="btn btn-outline btn-sm w-full"
                        >
                          <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download
                        </a>
                      </Show>

                      <button
                        class="btn btn-error btn-outline btn-sm w-full"
                        onClick={handleDelete}
                      >
                        <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Record
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Show>
          </Show>
        </div>

        {/* Share Modal */}
        <Show when={showShareModal()}>
          <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div class="bg-base-100 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
              <div class="p-6 border-b border-base-200">
                <h2 class="text-xl font-bold text-base-content">Share Record</h2>
              </div>
              <div class="p-6">
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">Doctor's Email</span>
                  </label>
                  <input
                    type="email"
                    class="input input-bordered w-full"
                    placeholder="doctor@example.com"
                    value={shareEmail()}
                    onInput={(e) => setShareEmail(e.currentTarget.value)}
                  />
                </div>
                <p class="text-sm text-base-content/60 mt-4">
                  The doctor will be able to view this record during your consultations.
                </p>
              </div>
              <div class="p-6 bg-base-200/30 flex justify-end gap-3">
                <button class="btn btn-ghost" onClick={() => setShowShareModal(false)}>
                  Cancel
                </button>
                <button class="btn btn-primary" onClick={handleShare}>
                  Share
                </button>
              </div>
            </div>
          </div>
        </Show>
      </div>
    </>
  );
}
