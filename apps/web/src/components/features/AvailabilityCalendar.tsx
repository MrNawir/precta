/**
 * T063: AvailabilityCalendar Component
 * Weekly availability view for doctor booking
 */

import { createSignal, createEffect, For, Show } from "solid-js";

export interface AvailabilitySlot {
  time: string;
  available: boolean;
}

export interface DayAvailability {
  date: string;
  dayName: string;
  dayNum: number;
  month: string;
  isToday: boolean;
  slots: AvailabilitySlot[];
}

export interface AvailabilityCalendarProps {
  doctorId: string;
  consultationType?: 'in_person' | 'video';
  onSlotSelect: (date: string, time: string) => void;
  selectedDate?: string;
  selectedTime?: string;
  fetchSlots?: (doctorId: string, date: string) => Promise<string[]>;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function AvailabilityCalendar(props: AvailabilityCalendarProps) {
  const [selectedDayIndex, setSelectedDayIndex] = createSignal(0);
  const [days, setDays] = createSignal<DayAvailability[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [slotsLoading, setSlotsLoading] = createSignal(false);

  // Generate next 14 days
  const generateDays = (): DayAvailability[] => {
    const result: DayAvailability[] = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      result.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        isToday: i === 0,
        slots: [],
      });
    }
    
    return result;
  };

  // Initialize days
  createEffect(() => {
    setDays(generateDays());
    setLoading(false);
  });

  // Fetch slots when selected day changes
  createEffect(async () => {
    const dayIndex = selectedDayIndex();
    const allDays = days();
    
    if (!allDays.length || dayIndex >= allDays.length) return;
    
    const day = allDays[dayIndex];
    if (day.slots.length > 0) return; // Already fetched
    
    setSlotsLoading(true);
    
    try {
      let slots: string[];
      
      if (props.fetchSlots) {
        slots = await props.fetchSlots(props.doctorId, day.date);
      } else {
        // Default fetch
        const response = await fetch(
          `${API_URL}/api/v1/doctors/${props.doctorId}/slots?date=${day.date}`
        );
        const data = await response.json();
        slots = data.success ? data.data.slots : [];
      }
      
      // Update the day with slots
      setDays(prevDays => 
        prevDays.map((d, i) => 
          i === dayIndex 
            ? { ...d, slots: slots.map(time => ({ time, available: true })) }
            : d
        )
      );
    } catch (error) {
      console.error('Failed to fetch slots:', error);
    } finally {
      setSlotsLoading(false);
    }
  });

  const handleSlotClick = (time: string) => {
    const day = days()[selectedDayIndex()];
    props.onSlotSelect(day.date, time);
  };

  const isSelected = (date: string, time: string) => {
    return props.selectedDate === date && props.selectedTime === time;
  };

  const currentDay = () => days()[selectedDayIndex()];

  return (
    <div class="bg-base-100 rounded-2xl border border-base-200 overflow-hidden">
      {/* Date Selector */}
      <div class="p-4 border-b border-base-200">
        <h3 class="font-semibold text-base-content mb-4">Select Date</h3>
        
        <div class="relative">
          <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <For each={days()}>
              {(day, index) => (
                <button
                  class={`flex flex-col items-center min-w-[60px] p-3 rounded-xl border-2 transition-all ${
                    selectedDayIndex() === index()
                      ? 'border-primary bg-primary/10'
                      : 'border-base-200 hover:border-primary/50'
                  } ${day.isToday ? 'ring-2 ring-success ring-offset-2' : ''}`}
                  onClick={() => setSelectedDayIndex(index())}
                >
                  <span class="text-xs text-base-content/60">{day.dayName}</span>
                  <span class="text-lg font-bold text-base-content">{day.dayNum}</span>
                  <span class="text-xs text-base-content/60">{day.month}</span>
                  <Show when={day.isToday}>
                    <span class="text-[10px] text-success font-medium mt-1">Today</span>
                  </Show>
                </button>
              )}
            </For>
          </div>
        </div>
      </div>

      {/* Time Slots */}
      <div class="p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-base-content">Available Times</h3>
          <Show when={currentDay()}>
            <span class="text-sm text-base-content/60">
              {new Date(currentDay().date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </Show>
        </div>

        <Show when={loading() || slotsLoading()}>
          <div class="flex justify-center py-8">
            <span class="loading loading-spinner loading-md text-primary"></span>
          </div>
        </Show>

        <Show when={!loading() && !slotsLoading()}>
          <Show when={currentDay()?.slots.length > 0} fallback={
            <div class="text-center py-8">
              <div class="text-4xl mb-2">📅</div>
              <p class="text-base-content/60">No available slots for this date</p>
              <p class="text-sm text-base-content/40 mt-1">Try selecting another date</p>
            </div>
          }>
            {/* Morning Slots */}
            <Show when={currentDay().slots.filter(s => parseInt(s.time.split(':')[0]) < 12).length > 0}>
              <div class="mb-4">
                <p class="text-xs text-base-content/60 mb-2 flex items-center gap-2">
                  <span>🌅</span> Morning
                </p>
                <div class="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  <For each={currentDay().slots.filter(s => parseInt(s.time.split(':')[0]) < 12)}>
                    {(slot) => (
                      <button
                        class={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                          isSelected(currentDay().date, slot.time)
                            ? 'bg-primary text-white'
                            : slot.available
                              ? 'bg-base-200 text-base-content hover:bg-primary/20'
                              : 'bg-base-200/50 text-base-content/30 cursor-not-allowed'
                        }`}
                        disabled={!slot.available}
                        onClick={() => slot.available && handleSlotClick(slot.time)}
                      >
                        {slot.time}
                      </button>
                    )}
                  </For>
                </div>
              </div>
            </Show>

            {/* Afternoon Slots */}
            <Show when={currentDay().slots.filter(s => {
              const hour = parseInt(s.time.split(':')[0]);
              return hour >= 12 && hour < 17;
            }).length > 0}>
              <div class="mb-4">
                <p class="text-xs text-base-content/60 mb-2 flex items-center gap-2">
                  <span>☀️</span> Afternoon
                </p>
                <div class="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  <For each={currentDay().slots.filter(s => {
                    const hour = parseInt(s.time.split(':')[0]);
                    return hour >= 12 && hour < 17;
                  })}>
                    {(slot) => (
                      <button
                        class={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                          isSelected(currentDay().date, slot.time)
                            ? 'bg-primary text-white'
                            : slot.available
                              ? 'bg-base-200 text-base-content hover:bg-primary/20'
                              : 'bg-base-200/50 text-base-content/30 cursor-not-allowed'
                        }`}
                        disabled={!slot.available}
                        onClick={() => slot.available && handleSlotClick(slot.time)}
                      >
                        {slot.time}
                      </button>
                    )}
                  </For>
                </div>
              </div>
            </Show>

            {/* Evening Slots */}
            <Show when={currentDay().slots.filter(s => parseInt(s.time.split(':')[0]) >= 17).length > 0}>
              <div>
                <p class="text-xs text-base-content/60 mb-2 flex items-center gap-2">
                  <span>🌙</span> Evening
                </p>
                <div class="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  <For each={currentDay().slots.filter(s => parseInt(s.time.split(':')[0]) >= 17)}>
                    {(slot) => (
                      <button
                        class={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                          isSelected(currentDay().date, slot.time)
                            ? 'bg-primary text-white'
                            : slot.available
                              ? 'bg-base-200 text-base-content hover:bg-primary/20'
                              : 'bg-base-200/50 text-base-content/30 cursor-not-allowed'
                        }`}
                        disabled={!slot.available}
                        onClick={() => slot.available && handleSlotClick(slot.time)}
                      >
                        {slot.time}
                      </button>
                    )}
                  </For>
                </div>
              </div>
            </Show>
          </Show>
        </Show>
      </div>
    </div>
  );
}
