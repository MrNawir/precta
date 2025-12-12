/**
 * T100: PrescriptionCard Component
 * Display prescription summary in a card format
 */

import { Show, For } from "solid-js";
import { A } from "@solidjs/router";

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  quantity?: number;
}

export interface PrescriptionCardProps {
  id: string;
  diagnosis: string;
  medications: Medication[];
  validUntil: string;
  status: 'active' | 'expired' | 'fulfilled';
  createdAt: string;
  doctor?: {
    firstName: string;
    lastName: string;
    specialties?: string[];
  };
  showActions?: boolean;
  onOrder?: () => void;
  variant?: 'default' | 'compact';
}

export default function PrescriptionCard(props: PrescriptionCardProps) {
  const isCompact = () => props.variant === 'compact';

  const getStatusBadge = () => {
    const badges = {
      active: { class: 'badge-success', label: 'Active' },
      expired: { class: 'badge-error', label: 'Expired' },
      fulfilled: { class: 'badge-info', label: 'Fulfilled' },
    };
    return badges[props.status] || badges.active;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isExpiringSoon = () => {
    if (props.status !== 'active') return false;
    const validUntil = new Date(props.validUntil);
    const now = new Date();
    const daysRemaining = Math.ceil((validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysRemaining <= 7 && daysRemaining > 0;
  };

  // Compact variant
  if (isCompact()) {
    return (
      <A
        href={`/patient/prescriptions/${props.id}`}
        class="block bg-base-100 rounded-xl border border-base-200 p-4 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center justify-between mb-2">
          <span class={`badge badge-sm ${getStatusBadge().class}`}>
            {getStatusBadge().label}
          </span>
          <span class="text-sm text-base-content/60">{formatDate(props.createdAt)}</span>
        </div>
        <p class="font-medium text-base-content truncate">{props.diagnosis}</p>
        <p class="text-sm text-base-content/60">
          {props.medications.length} medication{props.medications.length > 1 ? 's' : ''}
        </p>
        <Show when={props.doctor}>
          <p class="text-sm text-base-content/60 mt-1">
            Dr. {props.doctor?.firstName} {props.doctor?.lastName}
          </p>
        </Show>
      </A>
    );
  }

  // Default variant
  return (
    <div class="bg-base-100 rounded-2xl border border-base-200 overflow-hidden">
      {/* Header */}
      <div class="p-4 bg-base-200/30 border-b border-base-200">
        <div class="flex items-start justify-between">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class={`badge ${getStatusBadge().class}`}>
                {getStatusBadge().label}
              </span>
              <Show when={isExpiringSoon()}>
                <span class="badge badge-warning badge-sm">Expiring Soon</span>
              </Show>
            </div>
            <h3 class="font-bold text-base-content">{props.diagnosis}</h3>
          </div>
          <div class="text-right text-sm">
            <p class="text-base-content/60">Prescribed</p>
            <p class="font-medium">{formatDate(props.createdAt)}</p>
          </div>
        </div>

        <Show when={props.doctor}>
          <div class="flex items-center gap-2 mt-3">
            <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
              {props.doctor?.firstName?.[0]}{props.doctor?.lastName?.[0]}
            </div>
            <div>
              <p class="text-sm font-medium">Dr. {props.doctor?.firstName} {props.doctor?.lastName}</p>
              <Show when={props.doctor?.specialties?.length}>
                <p class="text-xs text-base-content/60">{props.doctor?.specialties?.[0]}</p>
              </Show>
            </div>
          </div>
        </Show>
      </div>

      {/* Medications */}
      <div class="p-4">
        <h4 class="text-sm font-semibold text-base-content/60 mb-3">Medications</h4>
        <div class="space-y-3">
          <For each={props.medications.slice(0, 3)}>
            {(med) => (
              <div class="flex items-start gap-3 p-3 bg-base-200/50 rounded-xl">
                <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg">
                  💊
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-base-content">{med.name}</p>
                  <p class="text-sm text-base-content/60">
                    {med.dosage} • {med.frequency} • {med.duration}
                  </p>
                  <Show when={med.instructions}>
                    <p class="text-xs text-primary mt-1">{med.instructions}</p>
                  </Show>
                </div>
                <Show when={med.quantity}>
                  <span class="badge badge-ghost">×{med.quantity}</span>
                </Show>
              </div>
            )}
          </For>

          <Show when={props.medications.length > 3}>
            <p class="text-sm text-center text-base-content/60">
              +{props.medications.length - 3} more medication{props.medications.length > 4 ? 's' : ''}
            </p>
          </Show>
        </div>
      </div>

      {/* Footer */}
      <div class="p-4 border-t border-base-200 bg-base-200/20">
        <div class="flex items-center justify-between">
          <div class="text-sm">
            <p class="text-base-content/60">Valid until</p>
            <p class="font-medium">{formatDate(props.validUntil)}</p>
          </div>

          <Show when={props.showActions !== false}>
            <div class="flex gap-2">
              <A
                href={`/patient/prescriptions/${props.id}`}
                class="btn btn-ghost btn-sm"
              >
                View Details
              </A>
              <Show when={props.status === 'active' && props.onOrder}>
                <button
                  class="btn btn-primary btn-sm"
                  onClick={props.onOrder}
                >
                  Order Medicines
                </button>
              </Show>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
}
