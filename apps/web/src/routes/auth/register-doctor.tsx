/**
 * T072: Doctor Registration Page
 * Multi-step registration for doctors
 */

import { Title } from "@solidjs/meta";
import { A, useNavigate } from "@solidjs/router";
import { createSignal, Show, For } from "solid-js";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const specialties = [
  'General Practice',
  'Pediatrics',
  'Gynecology & Obstetrics',
  'Cardiology',
  'Dermatology',
  'Orthopedics',
  'Psychiatry',
  'Dentistry',
  'ENT',
  'Ophthalmology',
  'Gastroenterology',
  'Neurology',
  'Urology',
  'Oncology',
  'Physiotherapy',
];

export default function DoctorRegistrationPage() {
  const navigate = useNavigate();
  
  const [step, setStep] = createSignal(1);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal('');

  // Form data
  const [formData, setFormData] = createSignal({
    // Step 1: Account
    email: '',
    password: '',
    confirmPassword: '',
    // Step 2: Personal
    firstName: '',
    lastName: '',
    phone: '',
    // Step 3: Professional
    specialties: [] as string[],
    licenseNumber: '',
    yearsOfExperience: '',
    consultationFee: '',
    bio: '',
  });

  const updateField = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSpecialty = (specialty: string) => {
    const current = formData().specialties;
    if (current.includes(specialty)) {
      updateField('specialties', current.filter(s => s !== specialty));
    } else {
      updateField('specialties', [...current, specialty]);
    }
  };

  const validateStep = (stepNum: number): boolean => {
    setError('');
    const data = formData();

    if (stepNum === 1) {
      if (!data.email || !data.password) {
        setError('Email and password are required');
        return false;
      }
      if (data.password.length < 8) {
        setError('Password must be at least 8 characters');
        return false;
      }
      if (data.password !== data.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }

    if (stepNum === 2) {
      if (!data.firstName || !data.lastName) {
        setError('First name and last name are required');
        return false;
      }
    }

    if (stepNum === 3) {
      if (data.specialties.length === 0) {
        setError('Please select at least one specialty');
        return false;
      }
      if (!data.licenseNumber) {
        setError('Medical license number is required');
        return false;
      }
    }

    return true;
  };

  const nextStep = () => {
    if (validateStep(step())) {
      setStep(s => s + 1);
    }
  };

  const prevStep = () => {
    setStep(s => Math.max(1, s - 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setLoading(true);
    setError('');

    const data = formData();

    try {
      const response = await fetch(`${API_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          role: 'doctor',
          specialties: data.specialties.map(s => s.toLowerCase().replace(/\s+/g, '_')),
          licenseNumber: data.licenseNumber,
          yearsOfExperience: parseInt(data.yearsOfExperience) || undefined,
          consultationFee: parseInt(data.consultationFee) || 2000,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Redirect to credentials upload
        navigate('/doctor/credentials');
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (e) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Title>Doctor Registration | Precta</Title>

      <div class="min-h-screen bg-base-200/30 flex items-center justify-center p-4">
        <div class="bg-base-100 rounded-3xl shadow-xl max-w-2xl w-full overflow-hidden">
          {/* Header */}
          <div class="bg-primary text-primary-content p-8 text-center">
            <div class="text-4xl mb-2">👨‍⚕️</div>
            <h1 class="text-2xl font-bold">Join Precta as a Doctor</h1>
            <p class="text-primary-content/80 mt-2">
              Reach thousands of patients across Kenya
            </p>
          </div>

          {/* Progress Steps */}
          <div class="px-8 pt-6">
            <ul class="steps steps-horizontal w-full">
              <li class={`step ${step() >= 1 ? 'step-primary' : ''}`}>Account</li>
              <li class={`step ${step() >= 2 ? 'step-primary' : ''}`}>Personal</li>
              <li class={`step ${step() >= 3 ? 'step-primary' : ''}`}>Professional</li>
            </ul>
          </div>

          {/* Form */}
          <div class="p-8">
            {/* Step 1: Account */}
            <Show when={step() === 1}>
              <div class="space-y-4">
                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">Email Address</span>
                  </label>
                  <input
                    type="email"
                    class="input input-bordered w-full"
                    placeholder="doctor@example.com"
                    value={formData().email}
                    onInput={(e) => updateField('email', e.currentTarget.value)}
                  />
                </div>

                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">Password</span>
                  </label>
                  <input
                    type="password"
                    class="input input-bordered w-full"
                    placeholder="At least 8 characters"
                    value={formData().password}
                    onInput={(e) => updateField('password', e.currentTarget.value)}
                  />
                </div>

                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">Confirm Password</span>
                  </label>
                  <input
                    type="password"
                    class="input input-bordered w-full"
                    placeholder="Confirm your password"
                    value={formData().confirmPassword}
                    onInput={(e) => updateField('confirmPassword', e.currentTarget.value)}
                  />
                </div>
              </div>
            </Show>

            {/* Step 2: Personal */}
            <Show when={step() === 2}>
              <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium">First Name</span>
                    </label>
                    <input
                      type="text"
                      class="input input-bordered w-full"
                      placeholder="John"
                      value={formData().firstName}
                      onInput={(e) => updateField('firstName', e.currentTarget.value)}
                    />
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium">Last Name</span>
                    </label>
                    <input
                      type="text"
                      class="input input-bordered w-full"
                      placeholder="Doe"
                      value={formData().lastName}
                      onInput={(e) => updateField('lastName', e.currentTarget.value)}
                    />
                  </div>
                </div>

                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">Phone Number</span>
                  </label>
                  <input
                    type="tel"
                    class="input input-bordered w-full"
                    placeholder="+254 7XX XXX XXX"
                    value={formData().phone}
                    onInput={(e) => updateField('phone', e.currentTarget.value)}
                  />
                </div>

                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">Bio / About (Optional)</span>
                  </label>
                  <textarea
                    class="textarea textarea-bordered w-full h-24"
                    placeholder="Tell patients about yourself and your experience..."
                    value={formData().bio}
                    onInput={(e) => updateField('bio', e.currentTarget.value)}
                  />
                </div>
              </div>
            </Show>

            {/* Step 3: Professional */}
            <Show when={step() === 3}>
              <div class="space-y-4">
                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">Specialties</span>
                    <span class="label-text-alt">Select all that apply</span>
                  </label>
                  <div class="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border border-base-200 rounded-lg">
                    <For each={specialties}>
                      {(specialty) => (
                        <button
                          type="button"
                          class={`badge badge-lg cursor-pointer transition-colors ${
                            formData().specialties.includes(specialty)
                              ? 'badge-primary'
                              : 'badge-outline hover:badge-primary'
                          }`}
                          onClick={() => toggleSpecialty(specialty)}
                        >
                          {specialty}
                        </button>
                      )}
                    </For>
                  </div>
                </div>

                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">Medical License Number</span>
                  </label>
                  <input
                    type="text"
                    class="input input-bordered w-full"
                    placeholder="e.g., KEN-12345"
                    value={formData().licenseNumber}
                    onInput={(e) => updateField('licenseNumber', e.currentTarget.value)}
                  />
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium">Years of Experience</span>
                    </label>
                    <input
                      type="number"
                      class="input input-bordered w-full"
                      placeholder="5"
                      min="0"
                      value={formData().yearsOfExperience}
                      onInput={(e) => updateField('yearsOfExperience', e.currentTarget.value)}
                    />
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium">Consultation Fee (KES)</span>
                    </label>
                    <input
                      type="number"
                      class="input input-bordered w-full"
                      placeholder="2000"
                      min="0"
                      value={formData().consultationFee}
                      onInput={(e) => updateField('consultationFee', e.currentTarget.value)}
                    />
                  </div>
                </div>
              </div>
            </Show>

            {/* Error */}
            <Show when={error()}>
              <div class="alert alert-error mt-4">
                <span>{error()}</span>
              </div>
            </Show>

            {/* Actions */}
            <div class="flex justify-between mt-8">
              <Show when={step() > 1} fallback={
                <A href="/auth/login" class="btn btn-ghost">
                  Already have an account?
                </A>
              }>
                <button class="btn btn-ghost" onClick={prevStep}>
                  Back
                </button>
              </Show>

              <Show when={step() < 3} fallback={
                <button 
                  class="btn btn-primary" 
                  onClick={handleSubmit}
                  disabled={loading()}
                >
                  {loading() ? (
                    <span class="loading loading-spinner loading-sm"></span>
                  ) : (
                    'Create Account'
                  )}
                </button>
              }>
                <button class="btn btn-primary" onClick={nextStep}>
                  Continue
                </button>
              </Show>
            </div>
          </div>

          {/* Footer */}
          <div class="px-8 pb-8 text-center">
            <p class="text-sm text-base-content/60">
              By registering, you agree to our{' '}
              <a href="/terms" class="link link-primary">Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" class="link link-primary">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
