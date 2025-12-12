/**
 * T060: Appointment Detail/Confirmation Page
 * Shows appointment details and payment status
 */

import { Title } from "@solidjs/meta";
import { useParams, useSearchParams, A } from "@solidjs/router";
import { createSignal, createEffect, Show } from "solid-js";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Appointment {
  id: string;
  doctorId: string;
  scheduledAt: string;
  durationMinutes: number;
  consultationType: 'in_person' | 'video';
  status: string;
  notes: string | null;
  paymentId: string | null;
  doctor?: {
    firstName: string;
    lastName: string;
    specialties: string[];
    consultationFee: string;
    profileImageUrl: string | null;
  };
}

export default function AppointmentDetailPage() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  
  const [appointment, setAppointment] = createSignal<Appointment | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal('');
  const [paymentLoading, setPaymentLoading] = createSignal(false);

  // Fetch appointment
  createEffect(async () => {
    if (!params.id) return;

    try {
      const response = await fetch(`${API_URL}/api/v1/appointments/${params.id}`, {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.success) {
        setAppointment(data.data);
      } else {
        setError(data.error || 'Appointment not found');
      }
    } catch (e) {
      setError('Failed to load appointment');
    } finally {
      setLoading(false);
    }
  });

  // Handle payment
  const handlePayment = async (method: 'mpesa' | 'card') => {
    const apt = appointment();
    if (!apt) return;

    setPaymentLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/payments/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type: 'appointment',
          amount: parseInt(apt.doctor?.consultationFee || '0'),
          method,
          appointmentId: apt.id,
        }),
      });

      const data = await response.json();

      if (data.success && data.data.authorizationUrl) {
        // Redirect to Paystack
        window.location.href = data.data.authorizationUrl;
      } else {
        setError(data.error || 'Payment initialization failed');
      }
    } catch (e) {
      setError('Failed to initialize payment');
    } finally {
      setPaymentLoading(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const badges: Record<string, { class: string; label: string }> = {
      pending_payment: { class: 'badge-warning', label: 'Pending Payment' },
      confirmed: { class: 'badge-success', label: 'Confirmed' },
      in_progress: { class: 'badge-info', label: 'In Progress' },
      completed: { class: 'badge-success', label: 'Completed' },
      cancelled: { class: 'badge-error', label: 'Cancelled' },
      no_show: { class: 'badge-error', label: 'No Show' },
    };
    return badges[status] || { class: 'badge-ghost', label: status };
  };

  return (
    <>
      <Title>Appointment | Precta</Title>

      <div class="min-h-screen bg-base-200/30">
        {/* Header */}
        <div class="bg-base-100 border-b border-base-200 py-4">
          <div class="container mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center gap-4">
              <A href="/appointments/my" class="btn btn-ghost btn-sm">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                My Appointments
              </A>
              <h1 class="text-xl font-bold text-base-content">Appointment Details</h1>
            </div>
          </div>
        </div>

        <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Show when={!loading()} fallback={
            <div class="flex justify-center py-12">
              <span class="loading loading-spinner loading-lg text-primary"></span>
            </div>
          }>
            <Show when={appointment()} fallback={
              <div class="text-center py-12">
                <div class="text-6xl mb-4">😕</div>
                <h2 class="text-xl font-bold text-base-content mb-2">Appointment Not Found</h2>
                <p class="text-base-content/60 mb-4">{error()}</p>
                <A href="/doctors" class="btn btn-primary">Find a Doctor</A>
              </div>
            }>
              <div class="max-w-2xl mx-auto">
                {/* Status Banner */}
                <Show when={appointment()?.status === 'pending_payment'}>
                  <div class="alert alert-warning mb-6">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <h3 class="font-bold">Payment Required</h3>
                      <p class="text-sm">Please complete payment to confirm your appointment</p>
                    </div>
                  </div>
                </Show>

                <Show when={appointment()?.status === 'confirmed'}>
                  <div class="alert alert-success mb-6">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h3 class="font-bold">Appointment Confirmed!</h3>
                      <p class="text-sm">Your appointment has been confirmed</p>
                    </div>
                  </div>
                </Show>

                {/* Appointment Card */}
                <div class="bg-base-100 rounded-2xl border border-base-200 overflow-hidden">
                  {/* Doctor Section */}
                  <div class="p-6 border-b border-base-200">
                    <div class="flex items-center gap-4">
                      <div class="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                        {appointment()?.doctor?.firstName[0]}{appointment()?.doctor?.lastName[0]}
                      </div>
                      <div class="flex-1">
                        <h2 class="text-lg font-bold text-base-content">
                          Dr. {appointment()?.doctor?.firstName} {appointment()?.doctor?.lastName}
                        </h2>
                        <p class="text-base-content/60">{appointment()?.doctor?.specialties?.join(', ')}</p>
                      </div>
                      <div class={`badge ${getStatusBadge(appointment()?.status || '').class}`}>
                        {getStatusBadge(appointment()?.status || '').label}
                      </div>
                    </div>
                  </div>

                  {/* Details Section */}
                  <div class="p-6 space-y-4">
                    <div class="flex items-center gap-4">
                      <div class="w-10 h-10 rounded-lg bg-base-200 flex items-center justify-center">
                        📅
                      </div>
                      <div>
                        <p class="text-sm text-base-content/60">Date & Time</p>
                        <p class="font-semibold">
                          {new Date(appointment()?.scheduledAt || '').toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                          {' at '}
                          {new Date(appointment()?.scheduledAt || '').toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>

                    <div class="flex items-center gap-4">
                      <div class="w-10 h-10 rounded-lg bg-base-200 flex items-center justify-center">
                        {appointment()?.consultationType === 'video' ? '📹' : '🏥'}
                      </div>
                      <div>
                        <p class="text-sm text-base-content/60">Consultation Type</p>
                        <p class="font-semibold capitalize">
                          {appointment()?.consultationType?.replace('_', ' ')} • {appointment()?.durationMinutes} minutes
                        </p>
                      </div>
                    </div>

                    <div class="flex items-center gap-4">
                      <div class="w-10 h-10 rounded-lg bg-base-200 flex items-center justify-center">
                        💰
                      </div>
                      <div>
                        <p class="text-sm text-base-content/60">Consultation Fee</p>
                        <p class="font-semibold">
                          KES {parseInt(appointment()?.doctor?.consultationFee || '0').toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <Show when={appointment()?.notes}>
                      <div class="flex items-start gap-4">
                        <div class="w-10 h-10 rounded-lg bg-base-200 flex items-center justify-center">
                          📝
                        </div>
                        <div>
                          <p class="text-sm text-base-content/60">Notes</p>
                          <p class="font-medium">{appointment()?.notes}</p>
                        </div>
                      </div>
                    </Show>
                  </div>

                  {/* Payment Section */}
                  <Show when={appointment()?.status === 'pending_payment'}>
                    <div class="p-6 bg-base-200/30 border-t border-base-200">
                      <h3 class="font-semibold text-base-content mb-4">Complete Payment</h3>
                      
                      <Show when={error()}>
                        <div class="alert alert-error mb-4">
                          <span class="text-sm">{error()}</span>
                        </div>
                      </Show>

                      <div class="grid grid-cols-2 gap-4">
                        <button
                          class="btn btn-outline btn-lg flex flex-col items-center gap-2 h-auto py-4"
                          onClick={() => handlePayment('mpesa')}
                          disabled={paymentLoading()}
                        >
                          <span class="text-2xl">📱</span>
                          <span class="font-semibold">M-Pesa</span>
                          <span class="text-xs text-base-content/60">Mobile Money</span>
                        </button>
                        <button
                          class="btn btn-outline btn-lg flex flex-col items-center gap-2 h-auto py-4"
                          onClick={() => handlePayment('card')}
                          disabled={paymentLoading()}
                        >
                          <span class="text-2xl">💳</span>
                          <span class="font-semibold">Card</span>
                          <span class="text-xs text-base-content/60">Visa / Mastercard</span>
                        </button>
                      </div>

                      <Show when={paymentLoading()}>
                        <div class="flex justify-center mt-4">
                          <span class="loading loading-spinner loading-md text-primary"></span>
                        </div>
                      </Show>
                    </div>
                  </Show>

                  {/* Actions for Confirmed */}
                  <Show when={appointment()?.status === 'confirmed'}>
                    <div class="p-6 bg-base-200/30 border-t border-base-200">
                      <div class="flex gap-4">
                        <Show when={appointment()?.consultationType === 'video'}>
                          <A 
                            href={`/consultations/${appointment()?.id}/call`}
                            class="btn btn-primary flex-1"
                          >
                            <span class="mr-2">📹</span>
                            Join Video Call
                          </A>
                        </Show>
                        <button class="btn btn-outline btn-error flex-1">
                          Cancel Appointment
                        </button>
                      </div>
                    </div>
                  </Show>
                </div>

                {/* Help Section */}
                <div class="mt-6 text-center">
                  <p class="text-sm text-base-content/60">
                    Need help? <a href="/support" class="text-primary hover:underline">Contact Support</a>
                  </p>
                </div>
              </div>
            </Show>
          </Show>
        </div>
      </div>
    </>
  );
}
