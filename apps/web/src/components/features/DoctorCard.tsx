/**
 * T061: DoctorCard Component
 * Reusable doctor card for listings
 */

import { A } from "@solidjs/router";
import { Show, For } from "solid-js";

export interface DoctorCardProps {
  id: string;
  firstName: string;
  lastName: string;
  specialties: string[];
  consultationFee: string;
  consultationModes: string[];
  averageRating: string;
  totalReviews: number;
  profileImageUrl?: string | null;
  bio?: string | null;
  yearsOfExperience?: number | null;
  clinicName?: string;
  city?: string;
  isAvailableToday?: boolean;
  variant?: 'default' | 'compact' | 'horizontal';
}

export default function DoctorCard(props: DoctorCardProps) {
  const variant = props.variant || 'default';
  
  const initials = () => `${props.firstName[0]}${props.lastName[0]}`;
  const fullName = () => `Dr. ${props.firstName} ${props.lastName}`;
  const rating = () => parseFloat(props.averageRating);
  const fee = () => parseInt(props.consultationFee).toLocaleString();

  // Star rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push('★');
      } else if (i === fullStars && hasHalfStar) {
        stars.push('☆');
      } else {
        stars.push('☆');
      }
    }
    return stars.join('');
  };

  // Compact variant
  if (variant === 'compact') {
    return (
      <A 
        href={`/doctors/${props.id}`}
        class="flex items-center gap-4 p-4 bg-base-100 rounded-xl border border-base-200 hover:border-primary/30 hover:shadow-md transition-all"
      >
        <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-lg font-bold text-primary shrink-0">
          {initials()}
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold text-base-content truncate">{fullName()}</h3>
          <p class="text-sm text-base-content/60 truncate">{props.specialties.slice(0, 2).join(', ')}</p>
        </div>
        <div class="text-right">
          <p class="font-bold text-primary">KES {fee()}</p>
          <p class="text-xs text-warning">{renderStars(rating())}</p>
        </div>
      </A>
    );
  }

  // Horizontal variant
  if (variant === 'horizontal') {
    return (
      <div class="flex gap-6 p-6 bg-base-100 rounded-2xl border border-base-200 hover:shadow-lg transition-all">
        {/* Avatar */}
        <div class="shrink-0">
          <Show when={props.profileImageUrl} fallback={
            <div class="w-24 h-24 rounded-xl bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary">
              {initials()}
            </div>
          }>
            <img 
              src={props.profileImageUrl!} 
              alt={fullName()}
              class="w-24 h-24 rounded-xl object-cover"
            />
          </Show>
        </div>

        {/* Content */}
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h3 class="text-lg font-bold text-base-content">{fullName()}</h3>
              <p class="text-base-content/60">{props.specialties.join(', ')}</p>
              
              <div class="flex items-center gap-4 mt-2">
                <div class="flex items-center gap-1">
                  <span class="text-warning">{renderStars(rating())}</span>
                  <span class="text-sm text-base-content/60">({props.totalReviews})</span>
                </div>
                <Show when={props.yearsOfExperience}>
                  <span class="text-sm text-base-content/60">
                    {props.yearsOfExperience}+ years exp
                  </span>
                </Show>
              </div>
            </div>

            <div class="text-right">
              <p class="text-2xl font-bold text-primary">KES {fee()}</p>
              <p class="text-xs text-base-content/50">per consultation</p>
            </div>
          </div>

          <Show when={props.bio}>
            <p class="mt-3 text-sm text-base-content/70 line-clamp-2">{props.bio}</p>
          </Show>

          <div class="flex items-center justify-between mt-4">
            <div class="flex gap-2">
              <For each={props.consultationModes}>
                {(mode) => (
                  <span class={`badge badge-sm ${mode === 'video' ? 'badge-primary badge-outline' : 'badge-secondary badge-outline'}`}>
                    {mode === 'video' ? '📹 Video' : '🏥 In-Person'}
                  </span>
                )}
              </For>
              <Show when={props.isAvailableToday}>
                <span class="badge badge-sm badge-success">Available Today</span>
              </Show>
            </div>

            <A href={`/doctors/${props.id}`} class="btn btn-primary btn-sm">
              Book Now
            </A>
          </div>
        </div>
      </div>
    );
  }

  // Default card variant
  return (
    <div class="bg-base-100 rounded-2xl border border-base-200 overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all">
      {/* Header */}
      <div class="p-4 flex items-center gap-4">
        <Show when={props.profileImageUrl} fallback={
          <div class="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
            {initials()}
          </div>
        }>
          <img 
            src={props.profileImageUrl!} 
            alt={fullName()}
            class="w-16 h-16 rounded-xl object-cover"
          />
        </Show>
        
        <div class="flex-1 min-w-0">
          <h3 class="font-bold text-base-content truncate">{fullName()}</h3>
          <p class="text-sm text-base-content/60 truncate">{props.specialties.slice(0, 2).join(', ')}</p>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-warning text-sm">{renderStars(rating())}</span>
            <span class="text-xs text-base-content/50">({props.totalReviews})</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div class="px-4 pb-4">
        <Show when={props.bio}>
          <p class="text-sm text-base-content/70 line-clamp-2 mb-3">{props.bio}</p>
        </Show>

        {/* Info Badges */}
        <div class="flex flex-wrap gap-2 mb-4">
          <Show when={props.yearsOfExperience}>
            <span class="badge badge-ghost badge-sm">{props.yearsOfExperience}+ yrs</span>
          </Show>
          <For each={props.consultationModes}>
            {(mode) => (
              <span class={`badge badge-sm ${mode === 'video' ? 'badge-primary badge-outline' : 'badge-secondary badge-outline'}`}>
                {mode === 'video' ? '📹' : '🏥'}
              </span>
            )}
          </For>
          <Show when={props.isAvailableToday}>
            <span class="badge badge-sm badge-success">Today</span>
          </Show>
        </div>

        {/* Footer */}
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xl font-bold text-primary">KES {fee()}</p>
          </div>
          <A href={`/doctors/${props.id}`} class="btn btn-primary btn-sm">
            Book
          </A>
        </div>
      </div>
    </div>
  );
}
