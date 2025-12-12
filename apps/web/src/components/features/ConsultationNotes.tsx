/**
 * T084: ConsultationNotes Component
 * Doctor's consultation notes form/display
 */

import { createSignal, Show, For } from "solid-js";

export interface ConsultationNotesData {
  diagnosis?: string;
  symptoms?: string[];
  prescription?: string;
  followUpDate?: string;
  notes?: string;
}

export interface ConsultationNotesProps {
  appointmentId: string;
  initialData?: ConsultationNotesData;
  readOnly?: boolean;
  onSave?: (data: ConsultationNotesData) => Promise<void>;
}

const commonSymptoms = [
  'Fever',
  'Headache',
  'Cough',
  'Fatigue',
  'Nausea',
  'Body Aches',
  'Sore Throat',
  'Runny Nose',
  'Shortness of Breath',
  'Dizziness',
  'Chest Pain',
  'Abdominal Pain',
];

export default function ConsultationNotes(props: ConsultationNotesProps) {
  const [diagnosis, setDiagnosis] = createSignal(props.initialData?.diagnosis || '');
  const [symptoms, setSymptoms] = createSignal<string[]>(props.initialData?.symptoms || []);
  const [prescription, setPrescription] = createSignal(props.initialData?.prescription || '');
  const [followUpDate, setFollowUpDate] = createSignal(props.initialData?.followUpDate || '');
  const [notes, setNotes] = createSignal(props.initialData?.notes || '');
  const [customSymptom, setCustomSymptom] = createSignal('');
  const [saving, setSaving] = createSignal(false);
  const [saved, setSaved] = createSignal(false);

  const toggleSymptom = (symptom: string) => {
    if (props.readOnly) return;
    
    setSymptoms(prev => 
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const addCustomSymptom = () => {
    const symptom = customSymptom().trim();
    if (symptom && !symptoms().includes(symptom)) {
      setSymptoms(prev => [...prev, symptom]);
      setCustomSymptom('');
    }
  };

  const removeSymptom = (symptom: string) => {
    if (props.readOnly) return;
    setSymptoms(prev => prev.filter(s => s !== symptom));
  };

  const handleSave = async () => {
    if (!props.onSave) return;

    setSaving(true);
    setSaved(false);

    try {
      await props.onSave({
        diagnosis: diagnosis(),
        symptoms: symptoms(),
        prescription: prescription(),
        followUpDate: followUpDate() || undefined,
        notes: notes(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error('Failed to save notes:', e);
    } finally {
      setSaving(false);
    }
  };

  // Read-only view
  if (props.readOnly) {
    return (
      <div class="space-y-6">
        {/* Diagnosis */}
        <Show when={diagnosis()}>
          <div class="bg-base-100 rounded-xl border border-base-200 p-4">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-lg">🩺</span>
              <h4 class="font-semibold text-base-content">Diagnosis</h4>
            </div>
            <p class="text-base-content/80">{diagnosis()}</p>
          </div>
        </Show>

        {/* Symptoms */}
        <Show when={symptoms().length > 0}>
          <div class="bg-base-100 rounded-xl border border-base-200 p-4">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-lg">📋</span>
              <h4 class="font-semibold text-base-content">Symptoms</h4>
            </div>
            <div class="flex flex-wrap gap-2">
              <For each={symptoms()}>
                {(symptom) => (
                  <span class="badge badge-outline">{symptom}</span>
                )}
              </For>
            </div>
          </div>
        </Show>

        {/* Prescription */}
        <Show when={prescription()}>
          <div class="bg-base-100 rounded-xl border border-base-200 p-4">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-lg">💊</span>
              <h4 class="font-semibold text-base-content">Prescription</h4>
            </div>
            <pre class="text-base-content/80 whitespace-pre-wrap font-sans text-sm bg-base-200/50 p-3 rounded-lg">
              {prescription()}
            </pre>
          </div>
        </Show>

        {/* Follow-up */}
        <Show when={followUpDate()}>
          <div class="bg-primary/10 rounded-xl border border-primary/20 p-4">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-lg">📅</span>
              <h4 class="font-semibold text-base-content">Follow-up Date</h4>
            </div>
            <p class="text-base-content/80">
              {new Date(followUpDate()).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </Show>

        {/* Notes */}
        <Show when={notes()}>
          <div class="bg-base-100 rounded-xl border border-base-200 p-4">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-lg">📝</span>
              <h4 class="font-semibold text-base-content">Additional Notes</h4>
            </div>
            <p class="text-base-content/80 whitespace-pre-wrap">{notes()}</p>
          </div>
        </Show>

        {/* Empty State */}
        <Show when={!diagnosis() && !symptoms().length && !prescription() && !notes()}>
          <div class="text-center py-8">
            <div class="text-4xl mb-2">📋</div>
            <p class="text-base-content/60">No consultation notes available</p>
          </div>
        </Show>
      </div>
    );
  }

  // Editable form
  return (
    <div class="space-y-6">
      {/* Diagnosis */}
      <div class="form-control">
        <label class="label">
          <span class="label-text font-semibold flex items-center gap-2">
            <span>🩺</span> Diagnosis
          </span>
        </label>
        <textarea
          class="textarea textarea-bordered h-24"
          placeholder="Enter diagnosis..."
          value={diagnosis()}
          onInput={(e) => setDiagnosis(e.currentTarget.value)}
        />
      </div>

      {/* Symptoms */}
      <div class="form-control">
        <label class="label">
          <span class="label-text font-semibold flex items-center gap-2">
            <span>📋</span> Symptoms
          </span>
        </label>
        
        {/* Common symptoms */}
        <div class="flex flex-wrap gap-2 mb-3">
          <For each={commonSymptoms}>
            {(symptom) => (
              <button
                class={`badge badge-lg cursor-pointer transition-colors ${
                  symptoms().includes(symptom)
                    ? 'badge-primary'
                    : 'badge-outline hover:badge-primary'
                }`}
                onClick={() => toggleSymptom(symptom)}
              >
                {symptom}
              </button>
            )}
          </For>
        </div>

        {/* Selected symptoms */}
        <Show when={symptoms().some(s => !commonSymptoms.includes(s))}>
          <div class="flex flex-wrap gap-2 mb-3">
            <For each={symptoms().filter(s => !commonSymptoms.includes(s))}>
              {(symptom) => (
                <span class="badge badge-primary gap-1">
                  {symptom}
                  <button onClick={() => removeSymptom(symptom)}>×</button>
                </span>
              )}
            </For>
          </div>
        </Show>

        {/* Add custom symptom */}
        <div class="flex gap-2">
          <input
            type="text"
            class="input input-bordered flex-1"
            placeholder="Add custom symptom..."
            value={customSymptom()}
            onInput={(e) => setCustomSymptom(e.currentTarget.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCustomSymptom()}
          />
          <button class="btn btn-outline" onClick={addCustomSymptom}>
            Add
          </button>
        </div>
      </div>

      {/* Prescription */}
      <div class="form-control">
        <label class="label">
          <span class="label-text font-semibold flex items-center gap-2">
            <span>💊</span> Prescription
          </span>
        </label>
        <textarea
          class="textarea textarea-bordered h-32 font-mono text-sm"
          placeholder="Enter prescription details...&#10;&#10;Example:&#10;1. Paracetamol 500mg - 1 tablet 3x daily for 5 days&#10;2. Amoxicillin 250mg - 1 capsule 2x daily for 7 days"
          value={prescription()}
          onInput={(e) => setPrescription(e.currentTarget.value)}
        />
      </div>

      {/* Follow-up Date */}
      <div class="form-control">
        <label class="label">
          <span class="label-text font-semibold flex items-center gap-2">
            <span>📅</span> Follow-up Date (Optional)
          </span>
        </label>
        <input
          type="date"
          class="input input-bordered"
          value={followUpDate()}
          min={new Date().toISOString().split('T')[0]}
          onInput={(e) => setFollowUpDate(e.currentTarget.value)}
        />
      </div>

      {/* Additional Notes */}
      <div class="form-control">
        <label class="label">
          <span class="label-text font-semibold flex items-center gap-2">
            <span>📝</span> Additional Notes
          </span>
        </label>
        <textarea
          class="textarea textarea-bordered h-24"
          placeholder="Any additional notes or instructions for the patient..."
          value={notes()}
          onInput={(e) => setNotes(e.currentTarget.value)}
        />
      </div>

      {/* Save Button */}
      <Show when={props.onSave}>
        <div class="flex justify-end gap-4">
          <Show when={saved()}>
            <span class="text-success flex items-center gap-2">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              Saved!
            </span>
          </Show>
          <button
            class="btn btn-primary"
            onClick={handleSave}
            disabled={saving()}
          >
            <Show when={saving()} fallback="Save Notes">
              <span class="loading loading-spinner loading-sm"></span>
              Saving...
            </Show>
          </button>
        </div>
      </Show>
    </div>
  );
}
