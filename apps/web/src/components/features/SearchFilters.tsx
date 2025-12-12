/**
 * T062: SearchFilters Component
 * Filter panel for doctor search
 */

import { createSignal, For, Show } from "solid-js";

export interface SearchFiltersProps {
  onFilterChange: (filters: FilterValues) => void;
  specialties?: string[];
  cities?: string[];
  initialValues?: Partial<FilterValues>;
  collapsed?: boolean;
}

export interface FilterValues {
  specialty?: string;
  city?: string;
  consultationMode?: 'in_person' | 'video' | '';
  minRating?: number;
  maxFee?: number;
  language?: string;
  availableToday?: boolean;
}

const defaultSpecialties = [
  'General Practice',
  'Pediatrics',
  'Gynecology',
  'Cardiology',
  'Dermatology',
  'Orthopedics',
  'Psychiatry',
  'Dentistry',
  'ENT',
  'Ophthalmology',
];

const defaultCities = [
  'Nairobi',
  'Mombasa',
  'Kisumu',
  'Nakuru',
  'Eldoret',
  'Thika',
  'Malindi',
  'Nyeri',
];

const languages = [
  { value: 'en', label: 'English' },
  { value: 'sw', label: 'Swahili' },
];

export default function SearchFilters(props: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = createSignal(!props.collapsed);
  const [filters, setFilters] = createSignal<FilterValues>(props.initialValues || {});

  const updateFilter = <K extends keyof FilterValues>(key: K, value: FilterValues[K]) => {
    const newFilters = { ...filters(), [key]: value };
    setFilters(newFilters);
    props.onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    props.onFilterChange({});
  };

  const hasActiveFilters = () => {
    const f = filters();
    return !!(f.specialty || f.city || f.consultationMode || f.minRating || f.maxFee || f.language || f.availableToday);
  };

  const specialties = () => props.specialties || defaultSpecialties;
  const cities = () => props.cities || defaultCities;

  return (
    <div class="bg-base-100 rounded-2xl border border-base-200 overflow-hidden">
      {/* Header */}
      <button
        class="w-full p-4 flex items-center justify-between text-left hover:bg-base-200/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded())}
      >
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span class="font-semibold text-base-content">Filters</span>
          <Show when={hasActiveFilters()}>
            <span class="badge badge-primary badge-sm">Active</span>
          </Show>
        </div>
        <svg 
          class={`w-5 h-5 text-base-content/60 transition-transform ${isExpanded() ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Filter Content */}
      <Show when={isExpanded()}>
        <div class="p-4 pt-0 space-y-4">
          {/* Specialty */}
          <div>
            <label class="text-sm font-medium text-base-content/70 mb-2 block">Specialty</label>
            <select
              class="select select-bordered w-full"
              value={filters().specialty || ''}
              onChange={(e) => updateFilter('specialty', e.currentTarget.value || undefined)}
            >
              <option value="">All Specialties</option>
              <For each={specialties()}>
                {(specialty) => (
                  <option value={specialty.toLowerCase().replace(/\s+/g, '_')}>{specialty}</option>
                )}
              </For>
            </select>
          </div>

          {/* City */}
          <div>
            <label class="text-sm font-medium text-base-content/70 mb-2 block">City</label>
            <select
              class="select select-bordered w-full"
              value={filters().city || ''}
              onChange={(e) => updateFilter('city', e.currentTarget.value || undefined)}
            >
              <option value="">All Cities</option>
              <For each={cities()}>
                {(city) => <option value={city}>{city}</option>}
              </For>
            </select>
          </div>

          {/* Consultation Mode */}
          <div>
            <label class="text-sm font-medium text-base-content/70 mb-2 block">Consultation Type</label>
            <div class="flex gap-2">
              <button
                class={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  !filters().consultationMode
                    ? 'bg-primary text-white'
                    : 'bg-base-200 text-base-content hover:bg-base-300'
                }`}
                onClick={() => updateFilter('consultationMode', '')}
              >
                All
              </button>
              <button
                class={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  filters().consultationMode === 'video'
                    ? 'bg-primary text-white'
                    : 'bg-base-200 text-base-content hover:bg-base-300'
                }`}
                onClick={() => updateFilter('consultationMode', 'video')}
              >
                📹 Video
              </button>
              <button
                class={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  filters().consultationMode === 'in_person'
                    ? 'bg-primary text-white'
                    : 'bg-base-200 text-base-content hover:bg-base-300'
                }`}
                onClick={() => updateFilter('consultationMode', 'in_person')}
              >
                🏥 In-Person
              </button>
            </div>
          </div>

          {/* Min Rating */}
          <div>
            <label class="text-sm font-medium text-base-content/70 mb-2 block">
              Minimum Rating: {filters().minRating || 'Any'}
            </label>
            <div class="flex gap-1">
              <For each={[0, 3, 3.5, 4, 4.5]}>
                {(rating) => (
                  <button
                    class={`flex-1 py-2 px-2 rounded-lg text-sm font-medium transition-all ${
                      filters().minRating === rating
                        ? 'bg-warning text-warning-content'
                        : 'bg-base-200 text-base-content hover:bg-base-300'
                    }`}
                    onClick={() => updateFilter('minRating', rating || undefined)}
                  >
                    {rating === 0 ? 'Any' : `${rating}★`}
                  </button>
                )}
              </For>
            </div>
          </div>

          {/* Max Fee */}
          <div>
            <label class="text-sm font-medium text-base-content/70 mb-2 block">
              Max Fee: {filters().maxFee ? `KES ${filters().maxFee.toLocaleString()}` : 'Any'}
            </label>
            <input
              type="range"
              class="range range-primary range-sm"
              min="0"
              max="10000"
              step="500"
              value={filters().maxFee || 10000}
              onInput={(e) => {
                const value = parseInt(e.currentTarget.value);
                updateFilter('maxFee', value === 10000 ? undefined : value);
              }}
            />
            <div class="flex justify-between text-xs text-base-content/50 mt-1">
              <span>KES 0</span>
              <span>KES 10,000</span>
            </div>
          </div>

          {/* Language */}
          <div>
            <label class="text-sm font-medium text-base-content/70 mb-2 block">Language</label>
            <select
              class="select select-bordered w-full"
              value={filters().language || ''}
              onChange={(e) => updateFilter('language', e.currentTarget.value || undefined)}
            >
              <option value="">Any Language</option>
              <For each={languages}>
                {(lang) => <option value={lang.value}>{lang.label}</option>}
              </For>
            </select>
          </div>

          {/* Available Today */}
          <div class="form-control">
            <label class="label cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                class="checkbox checkbox-primary"
                checked={filters().availableToday || false}
                onChange={(e) => updateFilter('availableToday', e.currentTarget.checked || undefined)}
              />
              <span class="label-text">Available Today</span>
              <span class="badge badge-success badge-sm">Quick</span>
            </label>
          </div>

          {/* Clear Filters */}
          <Show when={hasActiveFilters()}>
            <button
              class="btn btn-ghost btn-sm w-full"
              onClick={clearFilters}
            >
              <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear All Filters
            </button>
          </Show>
        </div>
      </Show>
    </div>
  );
}
