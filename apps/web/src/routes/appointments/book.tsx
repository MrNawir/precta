/**
 * T059: Booking Page
 * Appointment booking flow with date/time selection and payment
 */

import { Title } from "@solidjs/meta";
import { useSearchParams, useNavigate, A } from "@solidjs/router";
import { createSignal, createEffect, Show, For } from "solid-js";

// API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialties: string[];
  consultationFee: string;
  consultationDurationMinutes: number;
  profileImageUrl: string | null;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

export default function BookAppointmentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const doctorId = searchParams.doctorId;
  const consultationType = (searchParams.type as 'in_person' | 'video') || 'video';
  
  const [doctor, setDoctor] = createSignal<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = createSignal<string>('');
  const [selectedTime, setSelectedTime] = createSignal<string>('');
  const [availableSlots, setAvailableSlots] = createSignal<string[]>([]);
  const [notes, setNotes] = createSignal('');
  const [loading, setLoading] = createSignal(true);
  const [slotsLoading, setSlotsLoading] = createSignal(false);
  const [booking, setBooking] = createSignal(false);
  const [error, setError] = createSignal('');

  // Generate next 14 days
  const availableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
      });
    }
    return dates;
  };

  // Fetch doctor details
  createEffect(async () => {
    if (!doctorId) {
      navigate('/doctors');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/v1/doctors/${doctorId}`);
      const data = await response.json();
      
      if (data.success) {
        setDoctor(data.data);
      } else {
        setError('Doctor not found');
      }
    } catch (e) {
      setError('Failed to load doctor');
    } finally {
      setLoading(false);
    }
  });

  // Fetch available slots when date changes
  createEffect(async () => {
    const date = selectedDate();
    if (!date || !doctorId) return;

    setSlotsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/doctors/${doctorId}/slots?date=${date}`);
      const data = await response.json();
      
      if (data.success) {
        setAvailableSlots(data.data.slots || []);
      }
    } catch (e) {
      console.error('Failed to load slots:', e);
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  });

  // Handle booking
  const handleBook = async () => {
    if (!selectedDate() || !selectedTime()) {
      setError('Please select a date and time');
      return;
    }

    setBooking(true);
    setError('');

    try {
      const scheduledAt = `${selectedDate()}T${selectedTime()}:00`;
      
      const response = await fetch(`${API_URL}/api/v1/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          doctorId,
          scheduledAt,
          consultationType,
          notes: notes() || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to payment or confirmation
        navigate(`/appointments/${data.data.id}?status=pending_payment`);
      } else {
        setError(data.error || 'Booking failed');
      }
    } catch (e) {
      setError('Failed to book appointment');
    } finally {
      setBooking(false);
    }
  };

  return (
    <>
      <Title>Book Appointment | Precta</Title>

      <div class="min-h-screen bg-base-200/30">
        {/* Header */}
        <div class="bg-base-100 border-b border-base-200 py-4">
          <div class="container mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center gap-4">
              <A href={`/doctors/${doctorId}`} class="btn btn-ghost btn-sm">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </A>
              <h1 class="text-xl font-bold text-base-content">Book Appointment</h1>
            </div>
          </div>
        </div>

        <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Show when={!loading()} fallback={
            <div class="flex justify-center py-12">
              <span class="loading loading-spinner loading-lg text-primary"></span>
            </div>
          }>
            <Show when={doctor()} fallback={
              <div class="text-center py-12">
                <p class="text-error">{error() || 'Doctor not found'}</p>
              </div>
            }>
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div class="lg:col-span-2 space-y-6">
                  {/* Doctor Info Card */}
                  <div class="bg-base-100 rounded-2xl p-6 border border-base-200">
                    <div class="flex items-center gap-4">
                      <div class="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                        {doctor()?.firstName[0]}{doctor()?.lastName[0]}
                      </div>
                      <div>
                        <h2 class="text-lg font-bold text-base-content">
                          Dr. {doctor()?.firstName} {doctor()?.lastName}
                        </h2>
                        <p class="text-base-content/60">{doctor()?.specialties?.join(', ')}</p>
                        <div class="mt-1 flex items-center gap-2">
                          <span class={`badge ${consultationType === 'video' ? 'badge-primary' : 'badge-secondary'}`}>
                            {consultationType === 'video' ? '📹 Video Consult' : '🏥 In-Person'}
                          </span>
                          <span class="text-sm text-base-content/60">
                            {doctor()?.consultationDurationMinutes} min
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Date Selection */}
                  <div class="bg-base-100 rounded-2xl p-6 border border-base-200">
                    <h3 class="font-semibold text-base-content mb-4">Select Date</h3>
                    <div class="flex gap-3 overflow-x-auto pb-2">
                      <For each={availableDates()}>
                        {(date) => (
                          <button
                            class={`flex flex-col items-center min-w-[70px] p-3 rounded-xl border-2 transition-all ${
                              selectedDate() === date.date
                                ? 'border-primary bg-primary/10'
                                : 'border-base-200 hover:border-primary/50'
                            }`}
                            onClick={() => {
                              setSelectedDate(date.date);
                              setSelectedTime('');
                            }}
                          >
                            <span class="text-xs text-base-content/60">{date.day}</span>
                            <span class="text-xl font-bold text-base-content">{date.dayNum}</span>
                            <span class="text-xs text-base-content/60">{date.month}</span>
                          </button>
                        )}
                      </For>
                    </div>
                  </div>

                  {/* Time Selection */}
                  <Show when={selectedDate()}>
                    <div class="bg-base-100 rounded-2xl p-6 border border-base-200">
                      <h3 class="font-semibold text-base-content mb-4">Select Time</h3>
                      <Show when={!slotsLoading()} fallback={
                        <div class="flex justify-center py-8">
                          <span class="loading loading-spinner loading-md text-primary"></span>
                        </div>
                      }>
                        <Show when={availableSlots().length > 0} fallback={
                          <p class="text-center text-base-content/60 py-8">
                            No available slots for this date
                          </p>
                        }>
                          <div class="grid grid-cols-4 sm:grid-cols-6 gap-3">
                            <For each={availableSlots()}>
                              {(slot) => (
                                <button
                                  class={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                                    selectedTime() === slot
                                      ? 'bg-primary text-white'
                                      : 'bg-base-200 text-base-content hover:bg-primary/20'
                                  }`}
                                  onClick={() => setSelectedTime(slot)}
                                >
                                  {slot}
                                </button>
                              )}
                            </For>
                          </div>
                        </Show>
                      </Show>
                    </div>
                  </Show>

                  {/* Notes */}
                  <div class="bg-base-100 rounded-2xl p-6 border border-base-200">
                    <h3 class="font-semibold text-base-content mb-4">Notes for Doctor (Optional)</h3>
                    <textarea
                      class="textarea textarea-bordered w-full h-24"
                      placeholder="Describe your symptoms or reason for visit..."
                      value={notes()}
                      onInput={(e) => setNotes(e.currentTarget.value)}
                    />
                  </div>
                </div>

                {/* Summary Sidebar */}
                <div class="lg:col-span-1">
                  <div class="bg-base-100 rounded-2xl p-6 border border-base-200 sticky top-24">
                    <h3 class="font-semibold text-base-content mb-4">Appointment Summary</h3>
                    
                    <div class="space-y-3 mb-6">
                      <div class="flex justify-between">
                        <span class="text-base-content/60">Doctor</span>
                        <span class="font-medium">Dr. {doctor()?.lastName}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-base-content/60">Type</span>
                        <span class="font-medium capitalize">{consultationType.replace('_', ' ')}</span>
                      </div>
                      <Show when={selectedDate()}>
                        <div class="flex justify-between">
                          <span class="text-base-content/60">Date</span>
                          <span class="font-medium">
                            {new Date(selectedDate()).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </Show>
                      <Show when={selectedTime()}>
                        <div class="flex justify-between">
                          <span class="text-base-content/60">Time</span>
                          <span class="font-medium">{selectedTime()}</span>
                        </div>
                      </Show>
                      <div class="flex justify-between">
                        <span class="text-base-content/60">Duration</span>
                        <span class="font-medium">{doctor()?.consultationDurationMinutes} min</span>
                      </div>
                    </div>

                    <div class="border-t border-base-200 pt-4 mb-6">
                      <div class="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span class="text-primary">KES {parseInt(doctor()?.consultationFee || '0').toLocaleString()}</span>
                      </div>
                    </div>

                    <Show when={error()}>
                      <div class="alert alert-error mb-4">
                        <span class="text-sm">{error()}</span>
                      </div>
                    </Show>

                    <button
                      class="btn btn-primary w-full"
                      disabled={!selectedDate() || !selectedTime() || booking()}
                      onClick={handleBook}
                    >
                      {booking() ? (
                        <span class="loading loading-spinner loading-sm"></span>
                      ) : (
                        'Proceed to Payment'
                      )}
                    </button>

                    <p class="text-xs text-center text-base-content/50 mt-4">
                      You will be redirected to complete payment via M-Pesa or Card
                    </p>
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
