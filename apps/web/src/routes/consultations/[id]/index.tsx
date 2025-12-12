/**
 * T082: Consultation Summary Page
 * Post-consultation summary with notes and follow-up
 */

import { Title } from "@solidjs/meta";
import { useParams, A } from "@solidjs/router";
import { createSignal, createEffect, Show } from "solid-js";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface ConsultationSummary {
  id: string;
  scheduledAt: string;
  duration: number;
  consultationType: string;
  status: string;
  doctor: {
    firstName: string;
    lastName: string;
    specialties: string[];
  };
  notes?: {
    diagnosis: string | null;
    symptoms: string[];
    prescription: string | null;
    followUpDate: string | null;
    notes: string | null;
  };
}

export default function ConsultationSummaryPage() {
  const params = useParams();
  
  const [consultation, setConsultation] = createSignal<ConsultationSummary | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal('');

  // Fetch consultation details
  createEffect(async () => {
    if (!params.id) return;

    try {
      // Get appointment details
      const appointmentRes = await fetch(
        `${API_URL}/api/v1/appointments/${params.id}`,
        { credentials: 'include' }
      );
      const appointmentData = await appointmentRes.json();
      
      // Get consultation notes
      const notesRes = await fetch(
        `${API_URL}/api/v1/consultations/${params.id}/notes`,
        { credentials: 'include' }
      );
      const notesData = await notesRes.json();
      
      if (appointmentData.success) {
        setConsultation({
          id: appointmentData.data.id,
          scheduledAt: appointmentData.data.scheduledAt,
          duration: appointmentData.data.actualDurationMinutes || appointmentData.data.durationMinutes,
          consultationType: appointmentData.data.consultationType,
          status: appointmentData.data.status,
          doctor: appointmentData.data.doctor,
          notes: notesData.success ? notesData.data : null,
        });
      } else {
        setError(appointmentData.error || 'Failed to load consultation');
      }
    } catch (e) {
      setError('Failed to load consultation details');
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <Title>Consultation Summary | Precta</Title>

      <div class="min-h-screen bg-base-200/30">
        {/* Header */}
        <div class="bg-success text-success-content">
          <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
            <div class="text-5xl mb-4">✅</div>
            <h1 class="text-2xl font-bold">Consultation Complete</h1>
            <p class="opacity-80 mt-2">Your consultation has been completed successfully</p>
          </div>
        </div>

        <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-3xl">
          <Show when={!loading()} fallback={
            <div class="flex justify-center py-12">
              <span class="loading loading-spinner loading-lg text-primary"></span>
            </div>
          }>
            <Show when={consultation()} fallback={
              <div class="text-center py-12">
                <p class="text-base-content/60">{error() || 'Consultation not found'}</p>
              </div>
            }>
              {/* Summary Card */}
              <div class="bg-base-100 rounded-2xl border border-base-200 overflow-hidden mb-6">
                <div class="p-6 border-b border-base-200">
                  <div class="flex items-center gap-4">
                    <div class="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center text-2xl font-bold text-primary">
                      {consultation()?.doctor?.firstName?.[0]}{consultation()?.doctor?.lastName?.[0]}
                    </div>
                    <div>
                      <h2 class="text-lg font-bold text-base-content">
                        Dr. {consultation()?.doctor?.firstName} {consultation()?.doctor?.lastName}
                      </h2>
                      <p class="text-base-content/60">
                        {consultation()?.doctor?.specialties?.join(', ')}
                      </p>
                    </div>
                  </div>
                </div>

                <div class="p-6 grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-base-content/60">Date & Time</p>
                    <p class="font-medium">{formatDate(consultation()?.scheduledAt || '')}</p>
                  </div>
                  <div>
                    <p class="text-sm text-base-content/60">Duration</p>
                    <p class="font-medium">{consultation()?.duration} minutes</p>
                  </div>
                  <div>
                    <p class="text-sm text-base-content/60">Type</p>
                    <p class="font-medium capitalize">
                      {consultation()?.consultationType?.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <p class="text-sm text-base-content/60">Status</p>
                    <span class="badge badge-success">{consultation()?.status}</span>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <Show when={consultation()?.notes}>
                <div class="space-y-4">
                  {/* Diagnosis */}
                  <Show when={consultation()?.notes?.diagnosis}>
                    <div class="bg-base-100 rounded-2xl border border-base-200 p-6">
                      <div class="flex items-center gap-3 mb-3">
                        <div class="w-10 h-10 bg-error/10 rounded-lg flex items-center justify-center">
                          🩺
                        </div>
                        <h3 class="font-bold text-base-content">Diagnosis</h3>
                      </div>
                      <p class="text-base-content/80">{consultation()?.notes?.diagnosis}</p>
                    </div>
                  </Show>

                  {/* Symptoms */}
                  <Show when={consultation()?.notes?.symptoms?.length}>
                    <div class="bg-base-100 rounded-2xl border border-base-200 p-6">
                      <div class="flex items-center gap-3 mb-3">
                        <div class="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                          📋
                        </div>
                        <h3 class="font-bold text-base-content">Symptoms</h3>
                      </div>
                      <div class="flex flex-wrap gap-2">
                        {consultation()?.notes?.symptoms?.map(symptom => (
                          <span class="badge badge-outline">{symptom}</span>
                        ))}
                      </div>
                    </div>
                  </Show>

                  {/* Prescription */}
                  <Show when={consultation()?.notes?.prescription}>
                    <div class="bg-base-100 rounded-2xl border border-base-200 p-6">
                      <div class="flex items-center gap-3 mb-3">
                        <div class="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                          💊
                        </div>
                        <h3 class="font-bold text-base-content">Prescription</h3>
                      </div>
                      <pre class="text-base-content/80 whitespace-pre-wrap font-sans">
                        {consultation()?.notes?.prescription}
                      </pre>
                    </div>
                  </Show>

                  {/* Doctor's Notes */}
                  <Show when={consultation()?.notes?.notes}>
                    <div class="bg-base-100 rounded-2xl border border-base-200 p-6">
                      <div class="flex items-center gap-3 mb-3">
                        <div class="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center">
                          📝
                        </div>
                        <h3 class="font-bold text-base-content">Doctor's Notes</h3>
                      </div>
                      <p class="text-base-content/80">{consultation()?.notes?.notes}</p>
                    </div>
                  </Show>

                  {/* Follow-up */}
                  <Show when={consultation()?.notes?.followUpDate}>
                    <div class="bg-primary/10 rounded-2xl border border-primary/20 p-6">
                      <div class="flex items-center gap-3 mb-3">
                        <div class="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                          📅
                        </div>
                        <h3 class="font-bold text-base-content">Follow-up Appointment</h3>
                      </div>
                      <p class="text-base-content/80 mb-4">
                        Your doctor has recommended a follow-up on{' '}
                        <strong>{formatDate(consultation()?.notes?.followUpDate || '')}</strong>
                      </p>
                      <A
                        href={`/appointments/book?doctorId=${consultation()?.doctor}`}
                        class="btn btn-primary btn-sm"
                      >
                        Book Follow-up
                      </A>
                    </div>
                  </Show>
                </div>
              </Show>

              {/* No Notes Message */}
              <Show when={!consultation()?.notes}>
                <div class="bg-base-100 rounded-2xl border border-base-200 p-8 text-center">
                  <div class="text-4xl mb-4">📋</div>
                  <h3 class="font-bold text-base-content mb-2">Notes Pending</h3>
                  <p class="text-base-content/60">
                    Your doctor will add consultation notes shortly. Check back later.
                  </p>
                </div>
              </Show>

              {/* Actions */}
              <div class="mt-8 flex gap-4">
                <A href="/appointments/my" class="btn btn-primary flex-1">
                  View All Appointments
                </A>
                <A href="/doctors" class="btn btn-outline flex-1">
                  Book Another Consultation
                </A>
              </div>

              {/* Need Help */}
              <div class="mt-8 text-center">
                <p class="text-sm text-base-content/60">
                  Have questions about your consultation?{' '}
                  <a href="/support" class="text-primary hover:underline">Contact Support</a>
                </p>
              </div>
            </Show>
          </Show>
        </div>
      </div>
    </>
  );
}
