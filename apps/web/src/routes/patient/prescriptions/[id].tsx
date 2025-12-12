/**
 * T098: Prescription View Page (Patient)
 * Patient views prescription details
 */

import { Title } from "@solidjs/meta";
import { useParams, A, useNavigate } from "@solidjs/router";
import { createSignal, createEffect, Show, For } from "solid-js";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  quantity?: number;
}

interface Prescription {
  id: string;
  diagnosis: string;
  medications: Medication[];
  notes?: string;
  validUntil: string;
  status: 'active' | 'expired' | 'fulfilled';
  createdAt: string;
  doctor?: {
    firstName: string;
    lastName: string;
    specialties: string[];
    licenseNumber: string | null;
  };
}

export default function PrescriptionViewPage() {
  const params = useParams();
  const navigate = useNavigate();
  
  const [prescription, setPrescription] = createSignal<Prescription | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal('');

  // Fetch prescription
  createEffect(async () => {
    if (!params.id) return;

    try {
      const response = await fetch(
        `${API_URL}/api/v1/prescriptions/${params.id}`,
        { credentials: 'include' }
      );
      const data = await response.json();
      
      if (data.success) {
        setPrescription(data.data);
      } else {
        setError(data.error || 'Failed to load prescription');
      }
    } catch (e) {
      setError('Failed to load prescription');
    } finally {
      setLoading(false);
    }
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = () => {
    const status = prescription()?.status;
    const badges = {
      active: { class: 'badge-success', label: 'Active' },
      expired: { class: 'badge-error', label: 'Expired' },
      fulfilled: { class: 'badge-info', label: 'Fulfilled' },
    };
    return badges[status || 'active'];
  };

  const isExpiringSoon = () => {
    if (prescription()?.status !== 'active') return false;
    const validUntil = new Date(prescription()?.validUntil || '');
    const now = new Date();
    const daysRemaining = Math.ceil((validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysRemaining <= 7 && daysRemaining > 0;
  };

  const handleOrder = () => {
    navigate(`/patient/orders/checkout?prescriptionId=${params.id}`);
  };

  return (
    <>
      <Title>Prescription | Precta</Title>

      <div class="min-h-screen bg-base-200/30">
        {/* Header */}
        <div class="bg-base-100 border-b border-base-200">
          <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div class="flex items-center gap-4">
              <A href="/patient/prescriptions" class="btn btn-ghost btn-sm">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </A>
              <h1 class="text-xl font-bold text-base-content">Prescription</h1>
            </div>
          </div>
        </div>

        <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-3xl">
          <Show when={!loading()} fallback={
            <div class="flex justify-center py-12">
              <span class="loading loading-spinner loading-lg text-primary"></span>
            </div>
          }>
            <Show when={prescription()} fallback={
              <div class="bg-base-100 rounded-2xl border border-base-200 p-12 text-center">
                <div class="text-5xl mb-4">📋</div>
                <p class="text-base-content/60">{error() || 'Prescription not found'}</p>
                <A href="/patient/prescriptions" class="btn btn-primary mt-4">
                  View All Prescriptions
                </A>
              </div>
            }>
              {/* Status Banner */}
              <Show when={isExpiringSoon()}>
                <div class="alert alert-warning mb-6">
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>This prescription expires soon. Order your medicines before it expires.</span>
                </div>
              </Show>

              {/* Doctor Info */}
              <div class="bg-base-100 rounded-2xl border border-base-200 p-6 mb-6">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-4">
                    <div class="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                      {prescription()?.doctor?.firstName?.[0]}{prescription()?.doctor?.lastName?.[0]}
                    </div>
                    <div>
                      <h2 class="font-bold text-base-content">
                        Dr. {prescription()?.doctor?.firstName} {prescription()?.doctor?.lastName}
                      </h2>
                      <p class="text-sm text-base-content/60">
                        {prescription()?.doctor?.specialties?.join(', ')}
                      </p>
                      <Show when={prescription()?.doctor?.licenseNumber}>
                        <p class="text-xs text-base-content/50">
                          License: {prescription()?.doctor?.licenseNumber}
                        </p>
                      </Show>
                    </div>
                  </div>
                  <span class={`badge ${getStatusBadge().class}`}>
                    {getStatusBadge().label}
                  </span>
                </div>

                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p class="text-base-content/60">Prescribed</p>
                    <p class="font-medium">{formatDate(prescription()?.createdAt || '')}</p>
                  </div>
                  <div>
                    <p class="text-base-content/60">Valid Until</p>
                    <p class="font-medium">{formatDate(prescription()?.validUntil || '')}</p>
                  </div>
                </div>
              </div>

              {/* Diagnosis */}
              <div class="bg-base-100 rounded-2xl border border-base-200 p-6 mb-6">
                <h3 class="font-bold text-base-content mb-3 flex items-center gap-2">
                  <span class="text-lg">🩺</span> Diagnosis
                </h3>
                <p class="text-base-content/80">{prescription()?.diagnosis}</p>
              </div>

              {/* Medications */}
              <div class="bg-base-100 rounded-2xl border border-base-200 overflow-hidden mb-6">
                <div class="p-4 bg-base-200/30 border-b border-base-200">
                  <h3 class="font-bold text-base-content flex items-center gap-2">
                    <span class="text-lg">💊</span> Medications ({prescription()?.medications.length})
                  </h3>
                </div>
                <div class="divide-y divide-base-200">
                  <For each={prescription()?.medications}>
                    {(med, index) => (
                      <div class="p-4">
                        <div class="flex items-start justify-between">
                          <div class="flex items-start gap-3">
                            <span class="badge badge-primary badge-sm mt-1">#{index() + 1}</span>
                            <div>
                              <h4 class="font-semibold text-base-content">{med.name}</h4>
                              <p class="text-sm text-base-content/60 mt-1">
                                <span class="font-medium">{med.dosage}</span>
                                {' • '}
                                {med.frequency}
                                {' • '}
                                {med.duration}
                              </p>
                              <Show when={med.instructions}>
                                <p class="text-sm text-primary mt-2 flex items-center gap-1">
                                  <span>ℹ️</span> {med.instructions}
                                </p>
                              </Show>
                            </div>
                          </div>
                          <Show when={med.quantity}>
                            <div class="text-right">
                              <span class="badge badge-ghost">Qty: {med.quantity}</span>
                            </div>
                          </Show>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </div>

              {/* Notes */}
              <Show when={prescription()?.notes}>
                <div class="bg-base-100 rounded-2xl border border-base-200 p-6 mb-6">
                  <h3 class="font-bold text-base-content mb-3 flex items-center gap-2">
                    <span class="text-lg">📝</span> Doctor's Notes
                  </h3>
                  <p class="text-base-content/80 whitespace-pre-wrap">{prescription()?.notes}</p>
                </div>
              </Show>

              {/* Actions */}
              <div class="flex gap-4">
                <Show when={prescription()?.status === 'active'}>
                  <button
                    class="btn btn-primary flex-1"
                    onClick={handleOrder}
                  >
                    <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Order Medicines
                  </button>
                </Show>
                <button class="btn btn-outline flex-1" onClick={() => window.print()}>
                  <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print
                </button>
              </div>

              {/* Help */}
              <p class="text-center text-sm text-base-content/60 mt-8">
                Have questions about your prescription?{' '}
                <a href="/support" class="text-primary hover:underline">Contact Support</a>
              </p>
            </Show>
          </Show>
        </div>
      </div>
    </>
  );
}
