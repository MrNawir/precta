/**
 * T097: Prescription Form Page (Doctor)
 * Doctor creates prescriptions for patients
 */

import { Title } from "@solidjs/meta";
import { useSearchParams, useNavigate, A } from "@solidjs/router";
import { createSignal, createEffect, Show } from "solid-js";
import PrescriptionForm, { type PrescriptionFormData } from "../../../components/features/PrescriptionForm";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface AppointmentInfo {
  id: string;
  patientId: string;
  patientName: string;
  scheduledAt: string;
  diagnosis?: string;
}

export default function NewPrescriptionPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [appointment, setAppointment] = createSignal<AppointmentInfo | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal('');
  const [success, setSuccess] = createSignal(false);

  // Fetch appointment details
  createEffect(async () => {
    const appointmentId = searchParams.appointmentId;
    if (!appointmentId) {
      setError('No appointment specified');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/v1/appointments/${appointmentId}`,
        { credentials: 'include' }
      );
      const data = await response.json();
      
      if (data.success) {
        setAppointment({
          id: data.data.id,
          patientId: data.data.patientId,
          patientName: `${data.data.patient?.firstName || ''} ${data.data.patient?.lastName || ''}`.trim() || 'Patient',
          scheduledAt: data.data.scheduledAt,
          diagnosis: data.data.notes,
        });
      } else {
        setError(data.error || 'Failed to load appointment');
      }
    } catch (e) {
      setError('Failed to load appointment details');
    } finally {
      setLoading(false);
    }
  });

  const handleSubmit = async (data: PrescriptionFormData) => {
    const appt = appointment();
    if (!appt) return;

    const response = await fetch(`${API_URL}/api/v1/prescriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        appointmentId: appt.id,
        patientId: appt.patientId,
        ...data,
      }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to create prescription');
    }

    setSuccess(true);
    
    // Redirect after showing success
    setTimeout(() => {
      navigate(`/doctor`);
    }, 2000);
  };

  return (
    <>
      <Title>New Prescription | Doctor | Precta</Title>

      <div class="min-h-screen bg-base-200/30">
        {/* Header */}
        <div class="bg-base-100 border-b border-base-200">
          <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div class="flex items-center gap-4">
              <A href="/doctor" class="btn btn-ghost btn-sm">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </A>
              <h1 class="text-xl font-bold text-base-content">New Prescription</h1>
            </div>
          </div>
        </div>

        <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-3xl">
          <Show when={!loading()} fallback={
            <div class="flex justify-center py-12">
              <span class="loading loading-spinner loading-lg text-primary"></span>
            </div>
          }>
            <Show when={success()}>
              <div class="bg-base-100 rounded-2xl border border-base-200 p-12 text-center">
                <div class="text-6xl mb-4">✅</div>
                <h2 class="text-2xl font-bold text-base-content mb-2">Prescription Created</h2>
                <p class="text-base-content/60 mb-6">
                  The prescription has been sent to the patient.
                </p>
                <A href="/doctor" class="btn btn-primary">
                  Back to Dashboard
                </A>
              </div>
            </Show>

            <Show when={!success() && error()}>
              <div class="bg-base-100 rounded-2xl border border-base-200 p-12 text-center">
                <div class="text-5xl mb-4">⚠️</div>
                <h2 class="text-xl font-bold text-base-content mb-2">Error</h2>
                <p class="text-base-content/60 mb-6">{error()}</p>
                <A href="/doctor" class="btn btn-primary">
                  Back to Dashboard
                </A>
              </div>
            </Show>

            <Show when={!success() && !error() && appointment()}>
              {/* Patient Info */}
              <div class="bg-base-100 rounded-2xl border border-base-200 p-6 mb-6">
                <div class="flex items-center gap-4">
                  <div class="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                    {appointment()?.patientName?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <h2 class="font-bold text-base-content">{appointment()?.patientName}</h2>
                    <p class="text-sm text-base-content/60">
                      Appointment: {new Date(appointment()?.scheduledAt || '').toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Prescription Form */}
              <div class="bg-base-100 rounded-2xl border border-base-200 p-6">
                <PrescriptionForm
                  appointmentId={appointment()?.id || ''}
                  patientId={appointment()?.patientId || ''}
                  patientName={appointment()?.patientName}
                  onSubmit={handleSubmit}
                  onCancel={() => navigate('/doctor')}
                />
              </div>
            </Show>
          </Show>
        </div>
      </div>
    </>
  );
}
