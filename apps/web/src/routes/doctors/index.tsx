/**
 * Doctor Listing Page
 */

import { createResource, For, Show, createSignal } from 'solid-js';
import { Title } from '@solidjs/meta';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  bio: string | null;
  specialties: string[];
  consultationFee: string;
  consultationModes: string[];
  averageRating: string;
  totalReviews: number;
  totalConsultations: number;
  languages: string[];
}

async function fetchDoctors(params: { search: string; specialty: string }) {
  try {
    const searchParams = new URLSearchParams();
    if (params.specialty) searchParams.set('specialty', params.specialty);
    if (params.search) searchParams.set('search', params.search);
    
    const response = await fetch(`${API_URL}/api/v1/doctors?${searchParams.toString()}`);
    const result = await response.json();
    return result.data || [];
  } catch {
    return [];
  }
}

export default function DoctorsPage() {
  const [search, setSearch] = createSignal('');
  const [specialty, setSpecialty] = createSignal('');
  const [viewMode, setViewMode] = createSignal<'grid' | 'list'>('grid');

  const [doctors, { refetch }] = createResource(
    () => ({ search: search(), specialty: specialty() }),
    fetchDoctors
  );

  const specialties = [
    { name: 'General Practice', icon: '🩺' },
    { name: 'Pediatrics', icon: '👶' },
    { name: 'Gynecology', icon: '👩‍⚕️' },
    { name: 'Cardiology', icon: '❤️' },
    { name: 'Dermatology', icon: '🧴' },
    { name: 'Orthopedics', icon: '🦴' },
    { name: 'Psychiatry', icon: '🧠' },
    { name: 'Dentistry', icon: '🦷' },
  ];

  // Sample doctors for demo when API unavailable
  const sampleDoctors: Doctor[] = [
    {
      id: '1',
      firstName: 'Jane',
      lastName: 'Wanjiku',
      bio: 'Experienced general practitioner with over 15 years of practice in Kenya. Specializing in family medicine and preventive care.',
      specialties: ['General Practice'],
      consultationFee: '1500',
      consultationModes: ['in_person', 'video'],
      averageRating: '4.9',
      totalReviews: 128,
      totalConsultations: 1520,
      languages: ['en', 'sw'],
    },
    {
      id: '2',
      firstName: 'David',
      lastName: 'Ochieng',
      bio: 'Pediatric specialist dedicated to child health. Expert in childhood vaccinations, growth monitoring, and developmental disorders.',
      specialties: ['Pediatrics'],
      consultationFee: '2000',
      consultationModes: ['in_person', 'video'],
      averageRating: '4.8',
      totalReviews: 96,
      totalConsultations: 890,
      languages: ['en', 'sw'],
    },
    {
      id: '3',
      firstName: 'Mary',
      lastName: 'Akinyi',
      bio: 'Board-certified gynecologist with expertise in maternal health, family planning, and reproductive health services.',
      specialties: ['Gynecology'],
      consultationFee: '2500',
      consultationModes: ['in_person', 'video'],
      averageRating: '4.9',
      totalReviews: 156,
      totalConsultations: 1120,
      languages: ['en', 'sw'],
    },
    {
      id: '4',
      firstName: 'Peter',
      lastName: 'Kamau',
      bio: 'Cardiologist specializing in heart disease prevention, diagnosis, and treatment. Expert in ECG interpretation and cardiac imaging.',
      specialties: ['Cardiology'],
      consultationFee: '3500',
      consultationModes: ['in_person', 'video'],
      averageRating: '4.7',
      totalReviews: 84,
      totalConsultations: 650,
      languages: ['en'],
    },
    {
      id: '5',
      firstName: 'Grace',
      lastName: 'Njeri',
      bio: 'Dermatologist with expertise in skin conditions, cosmetic dermatology, and skin cancer screening.',
      specialties: ['Dermatology'],
      consultationFee: '2000',
      consultationModes: ['in_person', 'video'],
      averageRating: '4.8',
      totalReviews: 112,
      totalConsultations: 780,
      languages: ['en', 'sw'],
    },
    {
      id: '6',
      firstName: 'John',
      lastName: 'Mwangi',
      bio: 'Orthopedic surgeon specializing in sports injuries, joint replacements, and spine surgery.',
      specialties: ['Orthopedics'],
      consultationFee: '3500',
      consultationModes: ['in_person'],
      averageRating: '4.9',
      totalReviews: 72,
      totalConsultations: 420,
      languages: ['en', 'sw'],
    },
  ];

  const displayDoctors = () => doctors() && doctors()!.length > 0 ? doctors()! : sampleDoctors;

  return (
    <>
      <Title>Find Doctors - Precta</Title>
      
      {/* Hero Section */}
      <section class="relative bg-linear-to-br from-primary/5 via-base-100 to-secondary/5 py-16">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          <div class="max-w-3xl">
            <h1 class="text-4xl sm:text-5xl font-bold text-base-content mb-4">
              Find Your <span class="text-gradient">Perfect Doctor</span>
            </h1>
            <p class="text-lg text-base-content/70 mb-8">
              Browse our network of verified healthcare professionals. Filter by specialty, 
              read reviews, and book your appointment in minutes.
            </p>
            
            {/* Search Bar */}
            <div class="flex flex-col sm:flex-row gap-3">
              <div class="flex-1 relative">
                <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name, specialty, or condition..."
                  class="w-full pl-12 pr-4 py-4 text-base bg-base-100 border border-base-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  value={search()}
                  onInput={(e) => setSearch(e.currentTarget.value)}
                  onKeyPress={(e) => e.key === 'Enter' && refetch()}
                />
              </div>
              <button 
                class="px-8 py-4 font-semibold text-white gradient-primary rounded-2xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
                onClick={() => refetch()}
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Specialty Filters */}
      <section class="border-b border-base-200 bg-base-100 sticky top-16 z-40">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center gap-2 py-4 overflow-x-auto scrollbar-hide">
            <button
              class={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                specialty() === '' 
                  ? 'bg-primary text-white' 
                  : 'bg-base-200 text-base-content hover:bg-base-300'
              }`}
              onClick={() => setSpecialty('')}
            >
              All Doctors
            </button>
            <For each={specialties}>
              {(spec) => (
                <button
                  class={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                    specialty() === spec.name 
                      ? 'bg-primary text-white' 
                      : 'bg-base-200 text-base-content hover:bg-base-300'
                  }`}
                  onClick={() => setSpecialty(spec.name)}
                >
                  {spec.icon} {spec.name}
                </button>
              )}
            </For>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section class="py-12 bg-base-200/30">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Header */}
          <div class="flex items-center justify-between mb-8">
            <div>
              <h2 class="text-xl font-semibold text-base-content">
                {specialty() ? specialty() : 'All'} Doctors
              </h2>
              <p class="text-sm text-base-content/60">
                {displayDoctors().length} doctors available
              </p>
            </div>
            <div class="flex items-center gap-2">
              <button 
                class={`p-2 rounded-lg transition-colors ${viewMode() === 'grid' ? 'bg-primary text-white' : 'bg-base-200 hover:bg-base-300'}`}
                onClick={() => setViewMode('grid')}
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button 
                class={`p-2 rounded-lg transition-colors ${viewMode() === 'list' ? 'bg-primary text-white' : 'bg-base-200 hover:bg-base-300'}`}
                onClick={() => setViewMode('list')}
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Loading State */}
          <Show when={doctors.loading}>
            <div class="flex justify-center py-20">
              <div class="text-center">
                <div class="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto mb-4"></div>
                <p class="text-base-content/60">Finding doctors...</p>
              </div>
            </div>
          </Show>

          {/* Doctor Cards */}
          <Show when={!doctors.loading}>
            <div class={viewMode() === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
              : "flex flex-col gap-4"
            }>
              <For each={displayDoctors()}>
                {(doctor) => <DoctorCard doctor={doctor} viewMode={viewMode()} />}
              </For>
            </div>
          </Show>
        </div>
      </section>
    </>
  );
}

function DoctorCard(props: { doctor: Doctor; viewMode: 'grid' | 'list' }) {
  const doctor = () => props.doctor;

  if (props.viewMode === 'list') {
    return (
      <a 
        href={`/doctors/${doctor().id}`}
        class="flex flex-col sm:flex-row gap-6 p-6 bg-base-100 rounded-2xl border border-base-200 hover:border-primary/30 hover:shadow-lg transition-all"
      >
        {/* Avatar */}
        <div class="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-white text-2xl font-bold shrink-0">
          {doctor().firstName[0]}{doctor().lastName[0]}
        </div>
        
        {/* Info */}
        <div class="flex-1 min-w-0">
          <div class="flex flex-wrap items-start justify-between gap-4 mb-2">
            <div>
              <h3 class="text-xl font-semibold text-base-content">
                Dr. {doctor().firstName} {doctor().lastName}
              </h3>
              <p class="text-primary font-medium">{doctor().specialties.join(' • ')}</p>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-primary">
                KES {Number(doctor().consultationFee).toLocaleString()}
              </div>
              <div class="text-sm text-base-content/60">per consultation</div>
            </div>
          </div>
          
          <p class="text-base-content/70 mb-4 line-clamp-2">{doctor().bio}</p>
          
          <div class="flex flex-wrap items-center gap-4">
            <div class="flex items-center gap-1">
              <svg class="w-5 h-5 text-warning" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span class="font-semibold">{doctor().averageRating}</span>
              <span class="text-base-content/60">({doctor().totalReviews} reviews)</span>
            </div>
            <div class="text-base-content/60">•</div>
            <div class="text-base-content/60">{doctor().totalConsultations}+ consultations</div>
            <div class="flex gap-2 ml-auto">
              <For each={doctor().consultationModes}>
                {(mode) => (
                  <span class="px-3 py-1 text-xs font-medium bg-base-200 rounded-full">
                    {mode === 'in_person' ? '🏥 In-Person' : '📹 Video'}
                  </span>
                )}
              </For>
            </div>
          </div>
        </div>
      </a>
    );
  }

  return (
    <a 
      href={`/doctors/${doctor().id}`}
      class="group block p-6 bg-base-100 rounded-2xl border border-base-200 hover:border-primary/30 hover:shadow-xl transition-all card-hover"
    >
      {/* Header */}
      <div class="flex items-start gap-4 mb-4">
        <div class="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-lg shadow-primary/25">
          {doctor().firstName[0]}{doctor().lastName[0]}
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold text-base-content group-hover:text-primary transition-colors truncate">
            Dr. {doctor().firstName} {doctor().lastName}
          </h3>
          <p class="text-sm text-primary">{doctor().specialties.join(' • ')}</p>
          <div class="flex items-center gap-1 mt-1">
            <svg class="w-4 h-4 text-warning" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span class="text-sm font-medium">{doctor().averageRating}</span>
            <span class="text-xs text-base-content/50">({doctor().totalReviews})</span>
          </div>
        </div>
      </div>

      {/* Bio */}
      <p class="text-sm text-base-content/70 mb-4 line-clamp-2">
        {doctor().bio || 'Experienced healthcare professional dedicated to providing quality care.'}
      </p>

      {/* Consultation Modes */}
      <div class="flex gap-2 mb-4">
        <For each={doctor().consultationModes}>
          {(mode) => (
            <span class="px-2 py-1 text-xs font-medium bg-base-200 text-base-content/70 rounded-lg">
              {mode === 'in_person' ? '🏥 In-Person' : '📹 Video'}
            </span>
          )}
        </For>
      </div>

      {/* Footer */}
      <div class="flex items-center justify-between pt-4 border-t border-base-200">
        <div>
          <span class="text-xl font-bold text-base-content">
            KES {Number(doctor().consultationFee).toLocaleString()}
          </span>
          <span class="text-xs text-base-content/50 block">per consultation</span>
        </div>
        <span class="px-4 py-2 text-sm font-semibold text-white gradient-primary rounded-xl group-hover:opacity-90 transition-opacity">
          Book Now
        </span>
      </div>
    </a>
  );
}
