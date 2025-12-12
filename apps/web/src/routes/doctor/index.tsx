/**
 * T074: Doctor Dashboard Page
 * Main dashboard for doctors with stats, appointments, and quick actions
 */

import { Title } from "@solidjs/meta";
import { A } from "@solidjs/router";
import { createSignal, createEffect, Show, For } from "solid-js";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface DoctorProfile {
  id: string;
  firstName: string;
  lastName: string;
  specialties: string[];
  verificationStatus: 'pending' | 'verified' | 'rejected';
  totalConsultations: number;
  averageRating: string;
  totalReviews: number;
  consultationFee: string;
}

interface Appointment {
  id: string;
  scheduledAt: string;
  consultationType: 'in_person' | 'video';
  status: string;
  patient?: {
    firstName: string;
    lastName: string;
  };
}

interface DashboardStats {
  todayAppointments: number;
  weekAppointments: number;
  pendingAppointments: number;
  monthlyEarnings: number;
}

export default function DoctorDashboardPage() {
  const [profile, setProfile] = createSignal<DoctorProfile | null>(null);
  const [appointments, setAppointments] = createSignal<Appointment[]>([]);
  const [stats, setStats] = createSignal<DashboardStats | null>(null);
  const [loading, setLoading] = createSignal(true);

  // Fetch doctor data
  createEffect(async () => {
    try {
      // Fetch profile
      const profileRes = await fetch(`${API_URL}/api/v1/auth/me`, {
        credentials: 'include',
      });
      const profileData = await profileRes.json();
      if (profileData.success) {
        setProfile(profileData.user);
      }

      // Fetch today's appointments
      const today = new Date().toISOString().split('T')[0];
      const appointmentsRes = await fetch(
        `${API_URL}/api/v1/appointments/doctor?date=${today}`,
        { credentials: 'include' }
      );
      const appointmentsData = await appointmentsRes.json();
      if (appointmentsData.success) {
        setAppointments(appointmentsData.data || []);
      }

      // Mock stats for now
      setStats({
        todayAppointments: appointmentsData.data?.length || 0,
        weekAppointments: 12,
        pendingAppointments: 3,
        monthlyEarnings: 45000,
      });
    } catch (e) {
      console.error('Failed to load dashboard:', e);
    } finally {
      setLoading(false);
    }
  });

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { class: string; label: string }> = {
      pending: { class: 'badge-warning', label: 'Pending Verification' },
      verified: { class: 'badge-success', label: 'Verified' },
      rejected: { class: 'badge-error', label: 'Verification Rejected' },
    };
    return badges[status] || { class: 'badge-ghost', label: status };
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <Title>Doctor Dashboard | Precta</Title>

      <div class="min-h-screen bg-base-200/30">
        {/* Header */}
        <div class="bg-primary text-primary-content">
          <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div class="flex items-center justify-between">
              <div>
                <Show when={!loading() && profile()}>
                  <h1 class="text-2xl font-bold">
                    Welcome, Dr. {profile()?.lastName}
                  </h1>
                  <div class="flex items-center gap-2 mt-1">
                    <span class={`badge ${getStatusBadge(profile()?.verificationStatus || '').class}`}>
                      {getStatusBadge(profile()?.verificationStatus || '').label}
                    </span>
                    <span class="text-sm opacity-80">
                      {profile()?.specialties?.join(', ')}
                    </span>
                  </div>
                </Show>
              </div>
              <A href="/doctor/settings" class="btn btn-ghost btn-circle">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </A>
            </div>
          </div>
        </div>

        <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Show when={!loading()} fallback={
            <div class="flex justify-center py-12">
              <span class="loading loading-spinner loading-lg text-primary"></span>
            </div>
          }>
            {/* Verification Banner */}
            <Show when={profile()?.verificationStatus === 'pending'}>
              <div class="alert alert-warning mb-6">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h3 class="font-bold">Verification Pending</h3>
                  <p class="text-sm">Complete your profile and upload credentials to start accepting appointments.</p>
                </div>
                <A href="/doctor/credentials" class="btn btn-sm">Upload Credentials</A>
              </div>
            </Show>

            {/* Stats Cards */}
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div class="bg-base-100 rounded-2xl p-6 border border-base-200">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <span class="text-2xl">📅</span>
                  </div>
                  <div>
                    <p class="text-2xl font-bold text-base-content">{stats()?.todayAppointments || 0}</p>
                    <p class="text-sm text-base-content/60">Today</p>
                  </div>
                </div>
              </div>

              <div class="bg-base-100 rounded-2xl p-6 border border-base-200">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                    <span class="text-2xl">📊</span>
                  </div>
                  <div>
                    <p class="text-2xl font-bold text-base-content">{stats()?.weekAppointments || 0}</p>
                    <p class="text-sm text-base-content/60">This Week</p>
                  </div>
                </div>
              </div>

              <div class="bg-base-100 rounded-2xl p-6 border border-base-200">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
                    <span class="text-2xl">⏳</span>
                  </div>
                  <div>
                    <p class="text-2xl font-bold text-base-content">{stats()?.pendingAppointments || 0}</p>
                    <p class="text-sm text-base-content/60">Pending</p>
                  </div>
                </div>
              </div>

              <div class="bg-base-100 rounded-2xl p-6 border border-base-200">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-info/10 rounded-xl flex items-center justify-center">
                    <span class="text-2xl">💰</span>
                  </div>
                  <div>
                    <p class="text-2xl font-bold text-base-content">
                      KES {(stats()?.monthlyEarnings || 0).toLocaleString()}
                    </p>
                    <p class="text-sm text-base-content/60">This Month</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Today's Schedule */}
              <div class="lg:col-span-2">
                <div class="bg-base-100 rounded-2xl border border-base-200 overflow-hidden">
                  <div class="p-4 border-b border-base-200 flex items-center justify-between">
                    <h2 class="font-bold text-base-content">Today's Schedule</h2>
                    <A href="/doctor/appointments" class="text-sm text-primary hover:underline">
                      View All
                    </A>
                  </div>
                  
                  <Show when={appointments().length > 0} fallback={
                    <div class="p-8 text-center">
                      <div class="text-4xl mb-2">📅</div>
                      <p class="text-base-content/60">No appointments today</p>
                    </div>
                  }>
                    <div class="divide-y divide-base-200">
                      <For each={appointments()}>
                        {(appointment) => (
                          <div class="p-4 flex items-center gap-4 hover:bg-base-200/50 transition-colors">
                            <div class="text-center min-w-[60px]">
                              <p class="text-lg font-bold text-base-content">
                                {formatTime(appointment.scheduledAt)}
                              </p>
                            </div>
                            <div class="flex-1">
                              <p class="font-medium text-base-content">
                                {appointment.patient?.firstName} {appointment.patient?.lastName}
                              </p>
                              <div class="flex items-center gap-2 mt-1">
                                <span class={`badge badge-sm ${
                                  appointment.consultationType === 'video' ? 'badge-primary' : 'badge-secondary'
                                }`}>
                                  {appointment.consultationType === 'video' ? '📹 Video' : '🏥 In-Person'}
                                </span>
                                <span class={`badge badge-sm ${
                                  appointment.status === 'confirmed' ? 'badge-success' : 'badge-warning'
                                }`}>
                                  {appointment.status}
                                </span>
                              </div>
                            </div>
                            <Show when={appointment.consultationType === 'video' && appointment.status === 'confirmed'}>
                              <A 
                                href={`/consultations/${appointment.id}/call`}
                                class="btn btn-primary btn-sm"
                              >
                                Join Call
                              </A>
                            </Show>
                          </div>
                        )}
                      </For>
                    </div>
                  </Show>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <div class="bg-base-100 rounded-2xl border border-base-200 p-6">
                  <h2 class="font-bold text-base-content mb-4">Quick Actions</h2>
                  
                  <div class="space-y-3">
                    <A 
                      href="/doctor/availability"
                      class="flex items-center gap-3 p-3 rounded-xl hover:bg-base-200/50 transition-colors"
                    >
                      <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        🗓️
                      </div>
                      <div>
                        <p class="font-medium text-base-content">Set Availability</p>
                        <p class="text-xs text-base-content/60">Manage your schedule</p>
                      </div>
                    </A>

                    <A 
                      href="/doctor/profile"
                      class="flex items-center gap-3 p-3 rounded-xl hover:bg-base-200/50 transition-colors"
                    >
                      <div class="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                        👤
                      </div>
                      <div>
                        <p class="font-medium text-base-content">Edit Profile</p>
                        <p class="text-xs text-base-content/60">Update your information</p>
                      </div>
                    </A>

                    <A 
                      href="/doctor/earnings"
                      class="flex items-center gap-3 p-3 rounded-xl hover:bg-base-200/50 transition-colors"
                    >
                      <div class="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                        💳
                      </div>
                      <div>
                        <p class="font-medium text-base-content">Earnings</p>
                        <p class="text-xs text-base-content/60">View payment history</p>
                      </div>
                    </A>

                    <A 
                      href="/doctor/reviews"
                      class="flex items-center gap-3 p-3 rounded-xl hover:bg-base-200/50 transition-colors"
                    >
                      <div class="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center">
                        ⭐
                      </div>
                      <div>
                        <p class="font-medium text-base-content">Reviews</p>
                        <p class="text-xs text-base-content/60">
                          {profile()?.averageRating || '0'} rating ({profile()?.totalReviews || 0} reviews)
                        </p>
                      </div>
                    </A>
                  </div>
                </div>

                {/* Rating Card */}
                <Show when={profile()?.verificationStatus === 'verified'}>
                  <div class="bg-base-100 rounded-2xl border border-base-200 p-6 mt-4">
                    <div class="text-center">
                      <p class="text-4xl font-bold text-warning mb-1">
                        {profile()?.averageRating || '0.0'}
                      </p>
                      <div class="text-warning text-lg mb-2">★★★★★</div>
                      <p class="text-sm text-base-content/60">
                        Based on {profile()?.totalReviews || 0} reviews
                      </p>
                      <p class="text-sm text-base-content/60 mt-1">
                        {profile()?.totalConsultations || 0} consultations completed
                      </p>
                    </div>
                  </div>
                </Show>
              </div>
            </div>
          </Show>
        </div>
      </div>
    </>
  );
}
