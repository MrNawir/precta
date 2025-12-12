/**
 * T073: Doctor Credentials Upload Page
 * Upload medical license, degrees, and certifications
 */

import { Title } from "@solidjs/meta";
import { A, useNavigate } from "@solidjs/router";
import { createSignal, Show, For } from "solid-js";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  status: 'uploading' | 'uploaded' | 'error';
  error?: string;
}

const credentialTypes = [
  { id: 'license', name: 'Medical License', required: true, description: 'Your KMPDC registration certificate' },
  { id: 'degree', name: 'Medical Degree', required: true, description: 'MBBS, MD, or equivalent qualification' },
  { id: 'specialization', name: 'Specialization Certificate', required: false, description: 'Postgraduate specialization (if applicable)' },
  { id: 'id_proof', name: 'ID Proof', required: true, description: 'National ID or Passport' },
];

export default function CredentialsUploadPage() {
  const navigate = useNavigate();
  
  const [files, setFiles] = createSignal<Record<string, UploadedFile | null>>({
    license: null,
    degree: null,
    specialization: null,
    id_proof: null,
  });
  const [uploading, setUploading] = createSignal(false);
  const [error, setError] = createSignal('');
  const [submitted, setSubmitted] = createSignal(false);

  const handleFileSelect = async (credentialType: string, file: File) => {
    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

    if (file.size > maxSize) {
      setError('File too large. Maximum size is 10MB');
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload JPG, PNG, or PDF');
      return;
    }

    setError('');

    // Create preview
    const newFile: UploadedFile = {
      id: crypto.randomUUID(),
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
      status: 'uploading',
    };

    setFiles(prev => ({ ...prev, [credentialType]: newFile }));

    // Upload file
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('credentialType', credentialType);

      const response = await fetch(`${API_URL}/api/v1/doctors/me/credentials`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setFiles(prev => ({
          ...prev,
          [credentialType]: { ...newFile, status: 'uploaded', url: result.data.url },
        }));
      } else {
        setFiles(prev => ({
          ...prev,
          [credentialType]: { ...newFile, status: 'error', error: result.error },
        }));
      }
    } catch (e) {
      setFiles(prev => ({
        ...prev,
        [credentialType]: { ...newFile, status: 'error', error: 'Upload failed' },
      }));
    }
  };

  const removeFile = (credentialType: string) => {
    setFiles(prev => ({ ...prev, [credentialType]: null }));
  };

  const canSubmit = () => {
    const currentFiles = files();
    return credentialTypes
      .filter(t => t.required)
      .every(t => currentFiles[t.id]?.status === 'uploaded');
  };

  const handleSubmit = async () => {
    if (!canSubmit()) {
      setError('Please upload all required documents');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Submit for verification
      const response = await fetch(`${API_URL}/api/v1/doctors/me/submit-verification`, {
        method: 'POST',
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.error || 'Submission failed');
      }
    } catch (e) {
      setError('Submission failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Success state
  if (submitted()) {
    return (
      <>
        <Title>Credentials Submitted | Precta</Title>
        <div class="min-h-screen bg-base-200/30 flex items-center justify-center p-4">
          <div class="bg-base-100 rounded-3xl shadow-xl max-w-lg w-full p-8 text-center">
            <div class="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-10 h-10 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-base-content mb-2">Credentials Submitted!</h1>
            <p class="text-base-content/60 mb-6">
              Your credentials have been submitted for verification. Our team will review them within 24-48 hours.
            </p>
            <p class="text-sm text-base-content/50 mb-8">
              You'll receive an email notification once your profile is verified.
            </p>
            <A href="/doctor" class="btn btn-primary">
              Go to Dashboard
            </A>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Title>Upload Credentials | Precta</Title>

      <div class="min-h-screen bg-base-200/30">
        {/* Header */}
        <div class="bg-base-100 border-b border-base-200 py-4">
          <div class="container mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center gap-4">
              <A href="/doctor" class="btn btn-ghost btn-sm">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </A>
              <h1 class="text-xl font-bold text-base-content">Upload Credentials</h1>
            </div>
          </div>
        </div>

        <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-3xl">
          {/* Info Banner */}
          <div class="alert alert-info mb-6">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 class="font-bold">Verification Required</h3>
              <p class="text-sm">Upload clear scans or photos of your credentials. Our team will verify them within 24-48 hours.</p>
            </div>
          </div>

          {/* Upload Cards */}
          <div class="space-y-4">
            <For each={credentialTypes}>
              {(credential) => {
                const fileData = () => files()[credential.id];
                
                return (
                  <div class="bg-base-100 rounded-2xl border border-base-200 p-6">
                    <div class="flex items-start justify-between mb-4">
                      <div>
                        <h3 class="font-semibold text-base-content">
                          {credential.name}
                          {credential.required && <span class="text-error ml-1">*</span>}
                        </h3>
                        <p class="text-sm text-base-content/60">{credential.description}</p>
                      </div>
                      <Show when={fileData()?.status === 'uploaded'}>
                        <span class="badge badge-success gap-1">
                          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                          </svg>
                          Uploaded
                        </span>
                      </Show>
                    </div>

                    <Show when={fileData()} fallback={
                      <label class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-base-300 rounded-xl cursor-pointer hover:bg-base-200/50 transition-colors">
                        <div class="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg class="w-8 h-8 text-base-content/40 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p class="text-sm text-base-content/60">
                            <span class="font-semibold text-primary">Click to upload</span> or drag and drop
                          </p>
                          <p class="text-xs text-base-content/40 mt-1">JPG, PNG or PDF (max 10MB)</p>
                        </div>
                        <input
                          type="file"
                          class="hidden"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={(e) => {
                            const file = e.currentTarget.files?.[0];
                            if (file) handleFileSelect(credential.id, file);
                          }}
                        />
                      </label>
                    }>
                      <div class="flex items-center gap-4 p-4 bg-base-200/50 rounded-xl">
                        <div class="w-12 h-12 bg-base-300 rounded-lg flex items-center justify-center">
                          <Show when={fileData()?.type === 'application/pdf'} fallback={
                            <svg class="w-6 h-6 text-base-content/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          }>
                            <svg class="w-6 h-6 text-error" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
                            </svg>
                          </Show>
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="font-medium text-base-content truncate">{fileData()?.name}</p>
                          <p class="text-sm text-base-content/60">{formatFileSize(fileData()?.size || 0)}</p>
                        </div>
                        <Show when={fileData()?.status === 'uploading'}>
                          <span class="loading loading-spinner loading-sm text-primary"></span>
                        </Show>
                        <Show when={fileData()?.status === 'error'}>
                          <span class="text-error text-sm">{fileData()?.error}</span>
                        </Show>
                        <button
                          class="btn btn-ghost btn-sm btn-circle"
                          onClick={() => removeFile(credential.id)}
                        >
                          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </Show>
                  </div>
                );
              }}
            </For>
          </div>

          {/* Error */}
          <Show when={error()}>
            <div class="alert alert-error mt-6">
              <span>{error()}</span>
            </div>
          </Show>

          {/* Submit */}
          <div class="mt-8">
            <button
              class="btn btn-primary w-full"
              disabled={!canSubmit() || uploading()}
              onClick={handleSubmit}
            >
              <Show when={uploading()} fallback="Submit for Verification">
                <span class="loading loading-spinner loading-sm"></span>
                Submitting...
              </Show>
            </button>
            <p class="text-center text-sm text-base-content/50 mt-4">
              <span class="text-error">*</span> Required documents
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
