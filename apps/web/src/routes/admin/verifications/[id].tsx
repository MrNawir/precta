/**
 * T076: Verification Detail Page
 * Detailed view of doctor verification request
 */

import { Title } from "@solidjs/meta";
import { useParams, useNavigate, A } from "@solidjs/router";
import { createSignal, createEffect, Show, For } from "solid-js";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface VerificationDetail {
  doctorId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  specialties: string[];
  licenseNumber: string | null;
  qualifications: Array<{
    type: string;
    name: string;
    institution: string;
    year: number;
  }> | null;
  yearsOfExperience: number | null;
  bio: string | null;
  verificationStatus: string;
  submittedAt: string;
  credentials: Array<{
    type: string;
    url: string;
    uploadedAt: string;
  }>;
}

export default function VerificationDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  
  const [request, setRequest] = createSignal<VerificationDetail | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [processing, setProcessing] = createSignal(false);
  const [notes, setNotes] = createSignal('');

  // Fetch verification details
  createEffect(async () => {
    if (!params.id) return;

    try {
      const response = await fetch(
        `${API_URL}/api/v1/admin/verifications/${params.id}`,
        { credentials: 'include' }
      );
      const data = await response.json();
      
      if (data.success) {
        setRequest(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch verification:', e);
    } finally {
      setLoading(false);
    }
  });

  const handleApprove = async () => {
    setProcessing(true);
    try {
      const response = await fetch(
        `${API_URL}/api/v1/admin/verifications/${params.id}/approve`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ notes: notes() }),
        }
      );
      const data = await response.json();
      
      if (data.success) {
        navigate('/admin/verifications');
      }
    } catch (e) {
      console.error('Failed to approve:', e);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!notes()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(
        `${API_URL}/api/v1/admin/verifications/${params.id}/reject`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ reason: notes() }),
        }
      );
      const data = await response.json();
      
      if (data.success) {
        navigate('/admin/verifications');
      }
    } catch (e) {
      console.error('Failed to reject:', e);
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { class: string; label: string }> = {
      pending: { class: 'badge-warning', label: 'Pending Review' },
      verified: { class: 'badge-success', label: 'Verified' },
      rejected: { class: 'badge-error', label: 'Rejected' },
    };
    return badges[status] || { class: 'badge-ghost', label: status };
  };

  return (
    <>
      <Title>Verification Review | Admin | Precta</Title>

      <div class="min-h-screen bg-base-200/30">
        {/* Header */}
        <div class="bg-base-100 border-b border-base-200">
          <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div class="flex items-center gap-4">
              <A href="/admin/verifications" class="btn btn-ghost btn-sm">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </A>
              <h1 class="text-xl font-bold text-base-content">Verification Review</h1>
            </div>
          </div>
        </div>

        <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Show when={!loading()} fallback={
            <div class="flex justify-center py-12">
              <span class="loading loading-spinner loading-lg text-primary"></span>
            </div>
          }>
            <Show when={request()} fallback={
              <div class="text-center py-12">
                <p class="text-base-content/60">Verification request not found</p>
              </div>
            }>
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div class="lg:col-span-2 space-y-6">
                  {/* Doctor Info */}
                  <div class="bg-base-100 rounded-2xl border border-base-200 p-6">
                    <div class="flex items-start gap-4">
                      <div class="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary">
                        {request()?.firstName[0]}{request()?.lastName[0]}
                      </div>
                      <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                          <h2 class="text-xl font-bold text-base-content">
                            Dr. {request()?.firstName} {request()?.lastName}
                          </h2>
                          <span class={`badge ${getStatusBadge(request()?.verificationStatus || '').class}`}>
                            {getStatusBadge(request()?.verificationStatus || '').label}
                          </span>
                        </div>
                        <p class="text-base-content/60">{request()?.email}</p>
                        <Show when={request()?.phone}>
                          <p class="text-base-content/60">{request()?.phone}</p>
                        </Show>
                      </div>
                    </div>

                    <div class="divider"></div>

                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <p class="text-sm text-base-content/60">License Number</p>
                        <p class="font-mono font-medium">{request()?.licenseNumber || 'Not provided'}</p>
                      </div>
                      <div>
                        <p class="text-sm text-base-content/60">Years of Experience</p>
                        <p class="font-medium">{request()?.yearsOfExperience || 0} years</p>
                      </div>
                      <div class="col-span-2">
                        <p class="text-sm text-base-content/60">Specialties</p>
                        <div class="flex flex-wrap gap-2 mt-1">
                          <For each={request()?.specialties || []}>
                            {(specialty) => (
                              <span class="badge badge-primary badge-outline">{specialty}</span>
                            )}
                          </For>
                        </div>
                      </div>
                      <div class="col-span-2">
                        <p class="text-sm text-base-content/60">Submitted</p>
                        <p class="font-medium">{formatDate(request()?.submittedAt || '')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <Show when={request()?.bio}>
                    <div class="bg-base-100 rounded-2xl border border-base-200 p-6">
                      <h3 class="font-bold text-base-content mb-3">Bio</h3>
                      <p class="text-base-content/80 whitespace-pre-wrap">{request()?.bio}</p>
                    </div>
                  </Show>

                  {/* Qualifications */}
                  <Show when={request()?.qualifications?.length}>
                    <div class="bg-base-100 rounded-2xl border border-base-200 p-6">
                      <h3 class="font-bold text-base-content mb-4">Qualifications</h3>
                      <div class="space-y-3">
                        <For each={request()?.qualifications || []}>
                          {(qual) => (
                            <div class="p-4 bg-base-200/50 rounded-xl">
                              <div class="flex items-start justify-between">
                                <div>
                                  <p class="font-medium text-base-content">{qual.name}</p>
                                  <p class="text-sm text-base-content/60">{qual.institution}</p>
                                </div>
                                <div class="text-right">
                                  <span class="badge badge-ghost">{qual.type}</span>
                                  <p class="text-sm text-base-content/60 mt-1">{qual.year}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </For>
                      </div>
                    </div>
                  </Show>

                  {/* Credentials */}
                  <div class="bg-base-100 rounded-2xl border border-base-200 p-6">
                    <h3 class="font-bold text-base-content mb-4">Uploaded Credentials</h3>
                    <Show when={request()?.credentials?.length} fallback={
                      <div class="text-center py-8">
                        <div class="text-4xl mb-2">📄</div>
                        <p class="text-base-content/60">No credentials uploaded yet</p>
                      </div>
                    }>
                      <div class="grid grid-cols-2 gap-4">
                        <For each={request()?.credentials || []}>
                          {(credential) => (
                            <a
                              href={credential.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              class="p-4 border border-base-200 rounded-xl hover:bg-base-200/50 transition-colors flex items-center gap-3"
                            >
                              <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                📄
                              </div>
                              <div class="flex-1 min-w-0">
                                <p class="font-medium text-base-content capitalize">
                                  {credential.type.replace('_', ' ')}
                                </p>
                                <p class="text-xs text-base-content/60">
                                  {formatDate(credential.uploadedAt)}
                                </p>
                              </div>
                              <svg class="w-5 h-5 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          )}
                        </For>
                      </div>
                    </Show>
                  </div>
                </div>

                {/* Action Sidebar */}
                <div class="lg:col-span-1">
                  <div class="bg-base-100 rounded-2xl border border-base-200 p-6 sticky top-24">
                    <h3 class="font-bold text-base-content mb-4">Review Decision</h3>

                    <Show when={request()?.verificationStatus === 'pending'}>
                      <div class="form-control mb-4">
                        <label class="label">
                          <span class="label-text">Notes / Reason</span>
                        </label>
                        <textarea
                          class="textarea textarea-bordered h-32"
                          placeholder="Add notes or reason for rejection..."
                          value={notes()}
                          onInput={(e) => setNotes(e.currentTarget.value)}
                        />
                      </div>

                      <div class="space-y-3">
                        <button
                          class="btn btn-success w-full"
                          onClick={handleApprove}
                          disabled={processing()}
                        >
                          <Show when={processing()} fallback={
                            <>
                              <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                              </svg>
                              Approve
                            </>
                          }>
                            <span class="loading loading-spinner loading-sm"></span>
                          </Show>
                        </button>

                        <button
                          class="btn btn-error btn-outline w-full"
                          onClick={handleReject}
                          disabled={processing()}
                        >
                          <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Reject
                        </button>
                      </div>

                      <p class="text-xs text-base-content/50 mt-4 text-center">
                        Approving will notify the doctor and make their profile visible in search.
                      </p>
                    </Show>

                    <Show when={request()?.verificationStatus === 'verified'}>
                      <div class="alert alert-success">
                        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>This doctor has been verified</span>
                      </div>
                    </Show>

                    <Show when={request()?.verificationStatus === 'rejected'}>
                      <div class="alert alert-error">
                        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>This verification was rejected</span>
                      </div>
                    </Show>
                  </div>
                </div>
              </div>
            </Show>
          </Show>
        </div>
      </div>
    </>
  );
}
