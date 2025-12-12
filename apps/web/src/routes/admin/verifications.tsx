/**
 * T075: Admin Pending Verifications Page
 * List of doctors pending verification
 */

import { Title } from "@solidjs/meta";
import { A } from "@solidjs/router";
import { createSignal, createEffect, Show, For } from "solid-js";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface VerificationRequest {
  doctorId: string;
  firstName: string;
  lastName: string;
  email: string;
  specialties: string[];
  licenseNumber: string | null;
  verificationStatus: string;
  submittedAt: string;
}

interface Stats {
  pending: number;
  verified: number;
  rejected: number;
}

export default function AdminVerificationsPage() {
  const [requests, setRequests] = createSignal<VerificationRequest[]>([]);
  const [stats, setStats] = createSignal<Stats>({ pending: 0, verified: 0, rejected: 0 });
  const [loading, setLoading] = createSignal(true);
  const [filter, setFilter] = createSignal<'pending' | 'verified' | 'rejected'>('pending');
  const [page, setPage] = createSignal(1);
  const [total, setTotal] = createSignal(0);

  // Fetch verifications
  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/v1/admin/verifications?status=${filter()}&page=${page()}&limit=20`,
        { credentials: 'include' }
      );
      const data = await response.json();
      
      if (data.success) {
        setRequests(data.data);
        setTotal(data.pagination?.total || 0);
      }
    } catch (e) {
      console.error('Failed to fetch verifications:', e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/admin/verifications/stats`, {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.success) {
        setStats({
          pending: data.data.pendingVerifications || 0,
          verified: data.data.verifiedDoctors || 0,
          rejected: 0,
        });
      }
    } catch (e) {
      console.error('Failed to fetch stats:', e);
    }
  };

  createEffect(() => {
    fetchVerifications();
  });

  createEffect(() => {
    fetchStats();
  });

  // Quick actions
  const handleApprove = async (doctorId: string) => {
    try {
      const response = await fetch(
        `${API_URL}/api/v1/admin/verifications/${doctorId}/approve`,
        {
          method: 'POST',
          credentials: 'include',
        }
      );
      const data = await response.json();
      
      if (data.success) {
        fetchVerifications();
        fetchStats();
      }
    } catch (e) {
      console.error('Failed to approve:', e);
    }
  };

  const handleReject = async (doctorId: string) => {
    const reason = prompt('Enter rejection reason (optional):');
    
    try {
      const response = await fetch(
        `${API_URL}/api/v1/admin/verifications/${doctorId}/reject`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ reason }),
        }
      );
      const data = await response.json();
      
      if (data.success) {
        fetchVerifications();
        fetchStats();
      }
    } catch (e) {
      console.error('Failed to reject:', e);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <Title>Doctor Verifications | Admin | Precta</Title>

      <div class="min-h-screen bg-base-200/30">
        {/* Header */}
        <div class="bg-base-100 border-b border-base-200">
          <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-2xl font-bold text-base-content">Doctor Verifications</h1>
                <p class="text-base-content/60 mt-1">Review and approve doctor registrations</p>
              </div>
              <A href="/admin" class="btn btn-ghost">
                ← Back to Admin
              </A>
            </div>
          </div>
        </div>

        <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats */}
          <div class="grid grid-cols-3 gap-4 mb-8">
            <button
              class={`bg-base-100 rounded-2xl p-6 border-2 transition-all ${
                filter() === 'pending' ? 'border-warning' : 'border-base-200'
              }`}
              onClick={() => { setFilter('pending'); setPage(1); }}
            >
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
                  <span class="text-2xl">⏳</span>
                </div>
                <div class="text-left">
                  <p class="text-3xl font-bold text-base-content">{stats().pending}</p>
                  <p class="text-sm text-base-content/60">Pending</p>
                </div>
              </div>
            </button>

            <button
              class={`bg-base-100 rounded-2xl p-6 border-2 transition-all ${
                filter() === 'verified' ? 'border-success' : 'border-base-200'
              }`}
              onClick={() => { setFilter('verified'); setPage(1); }}
            >
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                  <span class="text-2xl">✅</span>
                </div>
                <div class="text-left">
                  <p class="text-3xl font-bold text-base-content">{stats().verified}</p>
                  <p class="text-sm text-base-content/60">Verified</p>
                </div>
              </div>
            </button>

            <button
              class={`bg-base-100 rounded-2xl p-6 border-2 transition-all ${
                filter() === 'rejected' ? 'border-error' : 'border-base-200'
              }`}
              onClick={() => { setFilter('rejected'); setPage(1); }}
            >
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-error/10 rounded-xl flex items-center justify-center">
                  <span class="text-2xl">❌</span>
                </div>
                <div class="text-left">
                  <p class="text-3xl font-bold text-base-content">{stats().rejected}</p>
                  <p class="text-sm text-base-content/60">Rejected</p>
                </div>
              </div>
            </button>
          </div>

          {/* List */}
          <div class="bg-base-100 rounded-2xl border border-base-200 overflow-hidden">
            <div class="p-4 border-b border-base-200">
              <h2 class="font-bold text-base-content capitalize">{filter()} Verifications</h2>
            </div>

            <Show when={!loading()} fallback={
              <div class="flex justify-center py-12">
                <span class="loading loading-spinner loading-lg text-primary"></span>
              </div>
            }>
              <Show when={requests().length > 0} fallback={
                <div class="p-12 text-center">
                  <div class="text-4xl mb-2">📋</div>
                  <p class="text-base-content/60">No {filter()} verifications</p>
                </div>
              }>
                <div class="overflow-x-auto">
                  <table class="table">
                    <thead>
                      <tr>
                        <th>Doctor</th>
                        <th>Specialties</th>
                        <th>License #</th>
                        <th>Submitted</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <For each={requests()}>
                        {(request) => (
                          <tr class="hover:bg-base-200/50">
                            <td>
                              <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                                  {request.firstName[0]}{request.lastName[0]}
                                </div>
                                <div>
                                  <p class="font-medium">Dr. {request.firstName} {request.lastName}</p>
                                  <p class="text-sm text-base-content/60">{request.email}</p>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div class="flex flex-wrap gap-1">
                                <For each={request.specialties.slice(0, 2)}>
                                  {(specialty) => (
                                    <span class="badge badge-sm badge-outline">{specialty}</span>
                                  )}
                                </For>
                                <Show when={request.specialties.length > 2}>
                                  <span class="badge badge-sm">+{request.specialties.length - 2}</span>
                                </Show>
                              </div>
                            </td>
                            <td>
                              <code class="text-sm">{request.licenseNumber || '-'}</code>
                            </td>
                            <td>
                              <span class="text-sm">{formatDate(request.submittedAt)}</span>
                            </td>
                            <td>
                              <div class="flex items-center gap-2">
                                <A
                                  href={`/admin/verifications/${request.doctorId}`}
                                  class="btn btn-ghost btn-sm"
                                >
                                  View
                                </A>
                                <Show when={filter() === 'pending'}>
                                  <button
                                    class="btn btn-success btn-sm"
                                    onClick={() => handleApprove(request.doctorId)}
                                  >
                                    Approve
                                  </button>
                                  <button
                                    class="btn btn-error btn-sm btn-outline"
                                    onClick={() => handleReject(request.doctorId)}
                                  >
                                    Reject
                                  </button>
                                </Show>
                              </div>
                            </td>
                          </tr>
                        )}
                      </For>
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <Show when={total() > 20}>
                  <div class="p-4 border-t border-base-200 flex justify-center">
                    <div class="join">
                      <button
                        class="join-item btn btn-sm"
                        disabled={page() === 1}
                        onClick={() => setPage(p => p - 1)}
                      >
                        «
                      </button>
                      <button class="join-item btn btn-sm">Page {page()}</button>
                      <button
                        class="join-item btn btn-sm"
                        disabled={page() * 20 >= total()}
                        onClick={() => setPage(p => p + 1)}
                      >
                        »
                      </button>
                    </div>
                  </div>
                </Show>
              </Show>
            </Show>
          </div>
        </div>
      </div>
    </>
  );
}
