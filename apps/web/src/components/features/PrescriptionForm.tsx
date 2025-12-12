/**
 * T099: PrescriptionForm Component
 * Form for doctors to create prescriptions
 */

import { createSignal, Show, For } from "solid-js";

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  quantity?: number;
}

export interface PrescriptionFormData {
  medications: Medication[];
  diagnosis: string;
  notes?: string;
  validDays?: number;
}

export interface PrescriptionFormProps {
  appointmentId: string;
  patientId: string;
  patientName?: string;
  onSubmit: (data: PrescriptionFormData) => Promise<void>;
  onCancel?: () => void;
}

const frequencyOptions = [
  'Once daily',
  'Twice daily (BD)',
  'Three times daily (TDS)',
  'Four times daily (QID)',
  'Every 4 hours',
  'Every 6 hours',
  'Every 8 hours',
  'Every 12 hours',
  'As needed (PRN)',
  'Before meals',
  'After meals',
  'At bedtime',
];

const durationOptions = [
  '3 days',
  '5 days',
  '7 days',
  '10 days',
  '14 days',
  '21 days',
  '30 days',
  '60 days',
  '90 days',
  'Until finished',
  'Ongoing',
];

export default function PrescriptionForm(props: PrescriptionFormProps) {
  const [medications, setMedications] = createSignal<Medication[]>([
    { name: '', dosage: '', frequency: '', duration: '' },
  ]);
  const [diagnosis, setDiagnosis] = createSignal('');
  const [notes, setNotes] = createSignal('');
  const [validDays, setValidDays] = createSignal(30);
  const [submitting, setSubmitting] = createSignal(false);
  const [error, setError] = createSignal('');

  const addMedication = () => {
    setMedications([...medications(), { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const removeMedication = (index: number) => {
    if (medications().length === 1) return;
    setMedications(medications().filter((_, i) => i !== index));
  };

  const updateMedication = (index: number, field: keyof Medication, value: string | number) => {
    setMedications(medications().map((med, i) => 
      i === index ? { ...med, [field]: value } : med
    ));
  };

  const validate = (): boolean => {
    setError('');

    if (!diagnosis().trim()) {
      setError('Please enter a diagnosis');
      return false;
    }

    const meds = medications();
    for (let i = 0; i < meds.length; i++) {
      const med = meds[i];
      if (!med.name.trim()) {
        setError(`Please enter medication name for item ${i + 1}`);
        return false;
      }
      if (!med.dosage.trim()) {
        setError(`Please enter dosage for ${med.name}`);
        return false;
      }
      if (!med.frequency.trim()) {
        setError(`Please select frequency for ${med.name}`);
        return false;
      }
      if (!med.duration.trim()) {
        setError(`Please select duration for ${med.name}`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    setError('');

    try {
      await props.onSubmit({
        medications: medications(),
        diagnosis: diagnosis(),
        notes: notes() || undefined,
        validDays: validDays(),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create prescription');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div class="space-y-6">
      {/* Header */}
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-base-content">New Prescription</h2>
          <Show when={props.patientName}>
            <p class="text-base-content/60">For {props.patientName}</p>
          </Show>
        </div>
      </div>

      {/* Diagnosis */}
      <div class="form-control">
        <label class="label">
          <span class="label-text font-semibold">Diagnosis *</span>
        </label>
        <textarea
          class="textarea textarea-bordered h-24"
          placeholder="Enter diagnosis..."
          value={diagnosis()}
          onInput={(e) => setDiagnosis(e.currentTarget.value)}
        />
      </div>

      {/* Medications */}
      <div>
        <div class="flex items-center justify-between mb-3">
          <label class="label-text font-semibold">Medications *</label>
          <button class="btn btn-ghost btn-sm" onClick={addMedication}>
            <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Medication
          </button>
        </div>

        <div class="space-y-4">
          <For each={medications()}>
            {(med, index) => (
              <div class="bg-base-200/50 rounded-xl p-4">
                <div class="flex items-center justify-between mb-3">
                  <span class="badge badge-primary">#{index() + 1}</span>
                  <Show when={medications().length > 1}>
                    <button
                      class="btn btn-ghost btn-xs text-error"
                      onClick={() => removeMedication(index())}
                    >
                      Remove
                    </button>
                  </Show>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Medication Name */}
                  <div class="form-control md:col-span-2">
                    <label class="label py-1">
                      <span class="label-text text-sm">Medication Name</span>
                    </label>
                    <input
                      type="text"
                      class="input input-bordered input-sm"
                      placeholder="e.g., Paracetamol"
                      value={med.name}
                      onInput={(e) => updateMedication(index(), 'name', e.currentTarget.value)}
                    />
                  </div>

                  {/* Dosage */}
                  <div class="form-control">
                    <label class="label py-1">
                      <span class="label-text text-sm">Dosage</span>
                    </label>
                    <input
                      type="text"
                      class="input input-bordered input-sm"
                      placeholder="e.g., 500mg"
                      value={med.dosage}
                      onInput={(e) => updateMedication(index(), 'dosage', e.currentTarget.value)}
                    />
                  </div>

                  {/* Quantity */}
                  <div class="form-control">
                    <label class="label py-1">
                      <span class="label-text text-sm">Quantity (Optional)</span>
                    </label>
                    <input
                      type="number"
                      class="input input-bordered input-sm"
                      placeholder="e.g., 20"
                      value={med.quantity || ''}
                      onInput={(e) => updateMedication(index(), 'quantity', parseInt(e.currentTarget.value) || 0)}
                    />
                  </div>

                  {/* Frequency */}
                  <div class="form-control">
                    <label class="label py-1">
                      <span class="label-text text-sm">Frequency</span>
                    </label>
                    <select
                      class="select select-bordered select-sm"
                      value={med.frequency}
                      onChange={(e) => updateMedication(index(), 'frequency', e.currentTarget.value)}
                    >
                      <option value="">Select frequency</option>
                      <For each={frequencyOptions}>
                        {(option) => <option value={option}>{option}</option>}
                      </For>
                    </select>
                  </div>

                  {/* Duration */}
                  <div class="form-control">
                    <label class="label py-1">
                      <span class="label-text text-sm">Duration</span>
                    </label>
                    <select
                      class="select select-bordered select-sm"
                      value={med.duration}
                      onChange={(e) => updateMedication(index(), 'duration', e.currentTarget.value)}
                    >
                      <option value="">Select duration</option>
                      <For each={durationOptions}>
                        {(option) => <option value={option}>{option}</option>}
                      </For>
                    </select>
                  </div>

                  {/* Instructions */}
                  <div class="form-control md:col-span-2">
                    <label class="label py-1">
                      <span class="label-text text-sm">Special Instructions (Optional)</span>
                    </label>
                    <input
                      type="text"
                      class="input input-bordered input-sm"
                      placeholder="e.g., Take with food"
                      value={med.instructions || ''}
                      onInput={(e) => updateMedication(index(), 'instructions', e.currentTarget.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </For>
        </div>
      </div>

      {/* Additional Notes */}
      <div class="form-control">
        <label class="label">
          <span class="label-text font-semibold">Additional Notes (Optional)</span>
        </label>
        <textarea
          class="textarea textarea-bordered h-20"
          placeholder="Any additional instructions for the patient..."
          value={notes()}
          onInput={(e) => setNotes(e.currentTarget.value)}
        />
      </div>

      {/* Valid For */}
      <div class="form-control">
        <label class="label">
          <span class="label-text font-semibold">Prescription Valid For</span>
        </label>
        <select
          class="select select-bordered"
          value={validDays()}
          onChange={(e) => setValidDays(parseInt(e.currentTarget.value))}
        >
          <option value={7}>7 days</option>
          <option value={14}>14 days</option>
          <option value={30}>30 days</option>
          <option value={60}>60 days</option>
          <option value={90}>90 days</option>
        </select>
      </div>

      {/* Error */}
      <Show when={error()}>
        <div class="alert alert-error">
          <span>{error()}</span>
        </div>
      </Show>

      {/* Actions */}
      <div class="flex justify-end gap-3">
        <Show when={props.onCancel}>
          <button class="btn btn-ghost" onClick={props.onCancel}>
            Cancel
          </button>
        </Show>
        <button
          class="btn btn-primary"
          onClick={handleSubmit}
          disabled={submitting()}
        >
          <Show when={submitting()} fallback="Create Prescription">
            <span class="loading loading-spinner loading-sm"></span>
            Creating...
          </Show>
        </button>
      </div>
    </div>
  );
}
