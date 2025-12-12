/**
 * Doctor Detail & Booking Page
 */

import { Title } from "@solidjs/meta";
import { createResource, createSignal, For, Show } from "solid-js";
import { useParams } from "@solidjs/router";
import ReviewList from "../../components/features/ReviewList";
import StarRating from "../../components/features/StarRating";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  bio: string | null;
  profileImageUrl: string | null;
  specialties: string[];
  languages: string[];
  consultationFee: string;
  consultationDurationMinutes: number;
  consultationModes: string[];
  averageRating: string;
  totalReviews: number;
  totalConsultations: number;
}

interface Availability {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  consultationMode: string;
}

interface Review {
  id: string;
  rating: number;
  title?: string;
  content: string;
  isAnonymous: boolean;
  patient?: { name: string; image?: string | null };
  createdAt: string;
}

interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

async function fetchDoctor(id: string): Promise<Doctor | null> {
  const response = await fetch(`${API_URL}/api/v1/doctors/${id}`);
  const result = await response.json();
  return result.data || null;
}

async function fetchAvailability(id: string): Promise<Availability[]> {
  const response = await fetch(`${API_URL}/api/v1/doctors/${id}/availability`);
  const result = await response.json();
  return result.data || [];
}

async function fetchReviews(id: string): Promise<{ reviews: Review[]; summary: ReviewSummary }> {
  try {
    const [reviewsRes, summaryRes] = await Promise.all([
      fetch(`${API_URL}/api/v1/reviews/doctor/${id}`),
      fetch(`${API_URL}/api/v1/reviews/doctor/${id}/summary`),
    ]);
    const reviews = await reviewsRes.json();
    const summary = await summaryRes.json();
    return {
      reviews: reviews.data || [],
      summary: summary.data || { averageRating: 0, totalReviews: 0, ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } },
    };
  } catch (e) {
    return {
      reviews: [],
      summary: { averageRating: 0, totalReviews: 0, ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } },
    };
  }
}

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function DoctorDetailPage() {
  const params = useParams();
  const [selectedDate, setSelectedDate] = createSignal<string>("");
  const [selectedTime, setSelectedTime] = createSignal<string>("");
  const [selectedMode, setSelectedMode] = createSignal<string>("in_person");
  const [bookingStep, setBookingStep] = createSignal(1);

  const [doctor] = createResource(() => params.id, fetchDoctor);
  const [availability] = createResource(() => params.id, fetchAvailability);
  const [reviewsData] = createResource(() => params.id, fetchReviews);

  // Generate next 7 days for date selection
  const getNextDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push({
        date: date.toISOString().split('T')[0],
        dayName: dayNames[date.getDay()],
        dayNum: date.getDate(),
        month: date.toLocaleString('default', { month: 'short' }),
      });
    }
    return days;
  };

  // Generate time slots based on availability
  const getTimeSlots = () => {
    if (!selectedDate() || !availability()) return [];
    
    const date = new Date(selectedDate());
    const dayOfWeek = date.getDay();
    const dayAvailability = availability()?.filter(a => a.dayOfWeek === dayOfWeek) || [];
    
    if (dayAvailability.length === 0) return [];

    const slots: string[] = [];
    for (const avail of dayAvailability) {
      const startHour = parseInt(avail.startTime.split(':')[0] || '9', 10);
      const endHour = parseInt(avail.endTime.split(':')[0] || '17', 10);
      
      for (let hour = startHour; hour < endHour; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`);
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    return [...new Set(slots)].sort();
  };

  const handleBooking = async () => {
    // In a real app, this would call the booking API
    alert(`Booking confirmed!\nDoctor: Dr. ${doctor()?.firstName} ${doctor()?.lastName}\nDate: ${selectedDate()}\nTime: ${selectedTime()}\nMode: ${selectedMode()}`);
  };

  return (
    <>
      <Title>{doctor() ? `Dr. ${doctor()?.firstName} ${doctor()?.lastName}` : 'Loading...'} - Precta</Title>
      
      <Show when={doctor.loading}>
        <div class="flex justify-center items-center min-h-[60vh]">
          <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </Show>

      <Show when={doctor.error}>
        <div class="container mx-auto px-4 py-12">
          <div class="alert alert-error">Doctor not found</div>
        </div>
      </Show>

      <Show when={doctor()}>
        <div class="bg-base-200 min-h-screen">
          {/* Doctor Header */}
          <div class="bg-primary text-primary-content py-8">
            <div class="container mx-auto px-4">
              <div class="flex flex-col md:flex-row gap-6 items-start">
                <div class="avatar placeholder">
                  <div class="bg-primary-content text-primary rounded-full w-24 h-24">
                    <span class="text-3xl">
                      {doctor()!.firstName[0]}{doctor()!.lastName[0]}
                    </span>
                  </div>
                </div>
                <div class="flex-1">
                  <h1 class="text-3xl font-bold mb-2">
                    Dr. {doctor()!.firstName} {doctor()!.lastName}
                  </h1>
                  <p class="text-lg opacity-90 mb-3">
                    {doctor()!.specialties.join(' • ')}
                  </p>
                  <div class="flex flex-wrap gap-4 text-sm">
                    <div class="flex items-center gap-1">
                      <span>⭐</span>
                      <span class="font-semibold">{doctor()!.averageRating}</span>
                      <span class="opacity-75">({doctor()!.totalReviews} reviews)</span>
                    </div>
                    <div class="flex items-center gap-1">
                      <span>👥</span>
                      <span>{doctor()!.totalConsultations}+ consultations</span>
                    </div>
                    <div class="flex items-center gap-1">
                      <span>🌐</span>
                      <span>{doctor()!.languages.map(l => l === 'en' ? 'English' : l === 'sw' ? 'Swahili' : l).join(', ')}</span>
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-3xl font-bold">
                    KES {Number(doctor()!.consultationFee).toLocaleString()}
                  </div>
                  <div class="text-sm opacity-75">per consultation</div>
                </div>
              </div>
            </div>
          </div>

          <div class="container mx-auto px-4 py-8">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Doctor Info */}
              <div class="lg:col-span-2 space-y-6">
                {/* About */}
                <div class="card bg-base-100 shadow-lg">
                  <div class="card-body">
                    <h2 class="card-title">About</h2>
                    <p class="text-base-content/80">
                      {doctor()!.bio || 'Experienced healthcare professional dedicated to providing quality care.'}
                    </p>
                  </div>
                </div>

                {/* Consultation Modes */}
                <div class="card bg-base-100 shadow-lg">
                  <div class="card-body">
                    <h2 class="card-title mb-4">Consultation Options</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <For each={doctor()!.consultationModes}>
                        {(mode) => (
                          <div class="flex items-center gap-3 p-4 bg-base-200 rounded-lg">
                            <span class="text-2xl">
                              {mode === 'in_person' ? '🏥' : '📹'}
                            </span>
                            <div>
                              <div class="font-semibold">
                                {mode === 'in_person' ? 'In-Person Visit' : 'Video Consultation'}
                              </div>
                              <div class="text-sm text-base-content/60">
                                {mode === 'in_person' 
                                  ? 'Visit the clinic for face-to-face consultation'
                                  : 'Consult from anywhere via secure video call'}
                              </div>
                            </div>
                          </div>
                        )}
                      </For>
                    </div>
                  </div>
                </div>

                {/* Availability Schedule */}
                <div class="card bg-base-100 shadow-lg">
                  <div class="card-body">
                    <h2 class="card-title mb-4">Weekly Schedule</h2>
                    <Show when={availability()}>
                      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <For each={[1, 2, 3, 4, 5, 6, 0]}>
                          {(day) => {
                            const dayAvail = availability()?.filter(a => a.dayOfWeek === day) || [];
                            return (
                              <div class={`p-3 rounded-lg ${dayAvail.length > 0 ? 'bg-success/10' : 'bg-base-200'}`}>
                                <div class="font-semibold text-sm">{dayNames[day]}</div>
                                <Show when={dayAvail.length > 0} fallback={<div class="text-xs text-base-content/50">Unavailable</div>}>
                                  <div class="text-xs text-success">
                                    {dayAvail[0]?.startTime} - {dayAvail[0]?.endTime}
                                  </div>
                                </Show>
                              </div>
                            );
                          }}
                        </For>
                      </div>
                    </Show>
                  </div>
                </div>

                {/* Reviews Section */}
                <div class="card bg-base-100 shadow-lg">
                  <div class="card-body">
                    <div class="flex items-center justify-between mb-4">
                      <h2 class="card-title">Patient Reviews</h2>
                      <Show when={reviewsData()?.summary}>
                        <div class="flex items-center gap-2">
                          <StarRating value={reviewsData()?.summary?.averageRating || 0} readonly size="sm" />
                          <span class="text-sm text-base-content/60">
                            ({reviewsData()?.summary?.totalReviews || 0})
                          </span>
                        </div>
                      </Show>
                    </div>
                    <ReviewList
                      reviews={reviewsData()?.reviews || []}
                      summary={reviewsData()?.summary}
                      loading={reviewsData.loading}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Booking */}
              <div class="lg:col-span-1">
                <div class="card bg-base-100 shadow-lg sticky top-4">
                  <div class="card-body">
                    <h2 class="card-title mb-4">Book Appointment</h2>
                    
                    {/* Step 1: Select Mode */}
                    <Show when={bookingStep() >= 1}>
                      <div class="mb-4">
                        <label class="label">
                          <span class="label-text font-semibold">Consultation Type</span>
                        </label>
                        <div class="flex gap-2">
                          <For each={doctor()!.consultationModes}>
                            {(mode) => (
                              <button
                                class={`btn btn-sm flex-1 ${selectedMode() === mode ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => setSelectedMode(mode)}
                              >
                                {mode === 'in_person' ? '🏥 In-Person' : '📹 Video'}
                              </button>
                            )}
                          </For>
                        </div>
                      </div>
                    </Show>

                    {/* Step 2: Select Date */}
                    <Show when={bookingStep() >= 1}>
                      <div class="mb-4">
                        <label class="label">
                          <span class="label-text font-semibold">Select Date</span>
                        </label>
                        <div class="grid grid-cols-4 gap-2">
                          <For each={getNextDays()}>
                            {(day) => (
                              <button
                                class={`btn btn-sm flex-col h-auto py-2 ${selectedDate() === day.date ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => {
                                  setSelectedDate(day.date || '');
                                  setSelectedTime("");
                                  setBookingStep(2);
                                }}
                              >
                                <span class="text-xs">{day.dayName?.slice(0, 3)}</span>
                                <span class="font-bold">{day.dayNum}</span>
                                <span class="text-xs">{day.month}</span>
                              </button>
                            )}
                          </For>
                        </div>
                      </div>
                    </Show>

                    {/* Step 3: Select Time */}
                    <Show when={bookingStep() >= 2 && selectedDate()}>
                      <div class="mb-4">
                        <label class="label">
                          <span class="label-text font-semibold">Select Time</span>
                        </label>
                        <Show 
                          when={getTimeSlots().length > 0}
                          fallback={
                            <div class="text-sm text-base-content/60 p-4 bg-base-200 rounded-lg">
                              No slots available for this date
                            </div>
                          }
                        >
                          <div class="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                            <For each={getTimeSlots()}>
                              {(time) => (
                                <button
                                  class={`btn btn-sm ${selectedTime() === time ? 'btn-primary' : 'btn-outline'}`}
                                  onClick={() => {
                                    setSelectedTime(time);
                                    setBookingStep(3);
                                  }}
                                >
                                  {time}
                                </button>
                              )}
                            </For>
                          </div>
                        </Show>
                      </div>
                    </Show>

                    {/* Booking Summary */}
                    <Show when={selectedDate() && selectedTime()}>
                      <div class="bg-base-200 p-4 rounded-lg mb-4">
                        <div class="text-sm space-y-1">
                          <div class="flex justify-between">
                            <span class="text-base-content/60">Date:</span>
                            <span class="font-semibold">{selectedDate()}</span>
                          </div>
                          <div class="flex justify-between">
                            <span class="text-base-content/60">Time:</span>
                            <span class="font-semibold">{selectedTime()}</span>
                          </div>
                          <div class="flex justify-between">
                            <span class="text-base-content/60">Type:</span>
                            <span class="font-semibold">{selectedMode() === 'in_person' ? 'In-Person' : 'Video'}</span>
                          </div>
                          <div class="divider my-2"></div>
                          <div class="flex justify-between text-lg">
                            <span>Total:</span>
                            <span class="font-bold text-primary">
                              KES {Number(doctor()!.consultationFee).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        class="btn btn-primary w-full"
                        onClick={handleBooking}
                      >
                        Confirm Booking
                      </button>
                    </Show>

                    <Show when={!selectedDate() || !selectedTime()}>
                      <button class="btn btn-primary w-full" disabled>
                        Select date & time
                      </button>
                    </Show>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </>
  );
}
