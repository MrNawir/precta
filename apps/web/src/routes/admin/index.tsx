/**
 * T130: Admin Dashboard Page
 * Platform metrics and quick actions
 */

import { Title } from "@solidjs/meta";
import { A } from "@solidjs/router";
import { createSignal, createEffect, Show, For, Component } from "solid-js";
import {
  Users, Calendar, Video, DollarSign, Search,
  FileText, Shield, Activity, BarChart, CheckCircle,
  UserPlus
} from "lucide-solid";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface PlatformMetrics {
  totalUsers: number;
  totalDoctors: number;
  totalPatients: number;
  totalAppointments: number;
  totalRevenue: number;
  pendingVerifications: number;
  activeConsultations: number;
  todayAppointments: number;
}

interface RecentActivity {
  id: string;
  type: 'registration' | 'appointment' | 'verification' | 'payment';
  description: string;
  timestamp: string;
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = createSignal<PlatformMetrics | null>(null);
  const [activities, setActivities] = createSignal<RecentActivity[]>([]);
  const [loading, setLoading] = createSignal(true);

  // Fetch dashboard data
  createEffect(async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/v1/admin/analytics/dashboard`,
        { credentials: 'include' }
      );
      const data = await response.json();

      if (data.success) {
        setMetrics(data.data.metrics);
        setActivities(data.data.recentActivity || []);
      }
    } catch (e) {
      console.error('Failed to fetch dashboard:', e);
      // Set mock data for demo
      setMetrics({
        totalUsers: 1250,
        totalDoctors: 85,
        totalPatients: 1165,
        totalAppointments: 3420,
        totalRevenue: 4520000,
        pendingVerifications: 12,
        activeConsultations: 8,
        todayAppointments: 45,
      });
    } finally {
      setLoading(false);
    }
  });

  const formatCurrency = (amount: number) => `KES ${amount.toLocaleString()}`;

  const quickActions = [
    { label: 'Pending Verifications', count: metrics()?.pendingVerifications || 0, href: '/admin/verifications', icon: Search },
    { label: 'Today\'s Appointments', count: metrics()?.todayAppointments || 0, href: '/admin/appointments', icon: Calendar },
    { label: 'Active Consultations', count: metrics()?.activeConsultations || 0, href: '/admin/consultations', icon: Video },
  ];

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const activityIcons: Record<string, Component> = {
    registration: UserPlus,
    appointment: Calendar,
    verification: CheckCircle,
    payment: DollarSign,
  };

  return (
    <>
      <Title>Admin Dashboard | Precta</Title>

      <div class="min-h-screen bg-base-200/30">
        {/* Header */}
        <div class="bg-base-100 border-b border-base-200">
          <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 class="text-2xl font-bold text-base-content">Admin Dashboard</h1>
            <p class="text-base-content/60 mt-1">Platform overview and management</p>
          </div>
        </div>

        <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Show when={!loading()} fallback={
            <div class="flex justify-center py-12">
              <span class="loading loading-spinner loading-lg text-primary"></span>
            </div>
          }>
            {/* Quick Actions */}
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <For each={quickActions}>
                {(action) => (
                  <A
                    href={action.href}
                    class="bg-base-100 rounded-2xl border border-base-200 p-6 hover:shadow-md transition-shadow flex items-center gap-4 group"
                  >
                    <div class="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <action.icon class="w-8 h-8" />
                    </div>
                    <div>
                      <p class="text-2xl font-bold text-primary">{action.count}</p>
                      <p class="text-sm text-base-content/60">{action.label}</p>
                    </div>
                  </A>
                )}
              </For>
            </div>

            {/* Metrics Grid */}
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {/* Total Users */}
              <div class="bg-base-100 rounded-2xl border border-base-200 p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-base-content/60">Total Users</p>
                    <p class="text-2xl font-bold text-base-content mt-1">
                      {metrics()?.totalUsers?.toLocaleString()}
                    </p>
                  </div>
                  <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                    <Users class="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Total Doctors */}
              <div class="bg-base-100 rounded-2xl border border-base-200 p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-base-content/60">Doctors</p>
                    <p class="text-2xl font-bold text-base-content mt-1">
                      {metrics()?.totalDoctors?.toLocaleString()}
                    </p>
                  </div>
                  <div class="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                    <Activity class="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Total Appointments */}
              <div class="bg-base-100 rounded-2xl border border-base-200 p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-base-content/60">Appointments</p>
                    <p class="text-2xl font-bold text-base-content mt-1">
                      {metrics()?.totalAppointments?.toLocaleString()}
                    </p>
                  </div>
                  <div class="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                    <Calendar class="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Total Revenue */}
              <div class="bg-base-100 rounded-2xl border border-base-200 p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-base-content/60">Total Revenue</p>
                    <p class="text-xl font-bold text-success mt-1">
                      {formatCurrency(metrics()?.totalRevenue || 0)}
                    </p>
                  </div>
                  <div class="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center text-success">
                    <DollarSign class="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activity */}
              <div class="lg:col-span-2 bg-base-100 rounded-2xl border border-base-200">
                <div class="p-4 border-b border-base-200">
                  <h2 class="font-bold text-base-content">Recent Activity</h2>
                </div>
                <Show when={activities().length > 0} fallback={
                  <div class="p-8 text-center">
                    <p class="text-base-content/60">No recent activity</p>
                  </div>
                }>
                  <div class="divide-y divide-base-200">
                    <For each={activities()}>
                      {(activity) => {
                        const Icon = activityIcons[activity.type] || Activity;
                        return (
                          <div class="p-4 flex items-center gap-4">
                            <div class="w-10 h-10 bg-base-200 rounded-full flex items-center justify-center">
                              <Icon class="w-5 h-5" />
                            </div>
                            <div class="flex-1">
                              <p class="text-base-content">{activity.description}</p>
                              <p class="text-sm text-base-content/60">{formatTime(activity.timestamp)}</p>
                            </div>
                          </div>
                        );
                      }}
                    </For>
                  </div>
                </Show>
              </div>

              {/* Quick Links */}
              <div class="bg-base-100 rounded-2xl border border-base-200 p-6">
                <h2 class="font-bold text-base-content mb-4">Quick Links</h2>
                <div class="space-y-2">
                  <A href="/admin/verifications" class="btn btn-ghost justify-start w-full gap-3">
                    <Search class="w-5 h-5" /> Doctor Verifications
                  </A>
                  <A href="/admin/articles/editor" class="btn btn-ghost justify-start w-full gap-3">
                    <FileText class="w-5 h-5" /> Create Article
                  </A>
                  <A href="/admin/moderation" class="btn btn-ghost justify-start w-full gap-3">
                    <Shield class="w-5 h-5" /> Moderation Queue
                  </A>
                  <A href="/admin/users" class="btn btn-ghost justify-start w-full gap-3">
                    <Users class="w-5 h-5" /> User Management
                  </A>
                  <A href="/admin/reports" class="btn btn-ghost justify-start w-full gap-3">
                    <BarChart class="w-5 h-5" /> Reports
                  </A>
                </div>
              </div>
            </div>
          </Show>
        </div>
      </div>
    </>
  );
}
