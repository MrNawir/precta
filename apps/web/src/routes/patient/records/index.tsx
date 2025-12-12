/**
 * T089: Medical Records Page
 * List and manage patient medical records
 */

import { Title } from "@solidjs/meta";
import { A } from "@solidjs/router";
import { createSignal, createEffect, Show, For } from "solid-js";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

type RecordType = 'lab_result' | 'prescription' | 'imaging' | 'vaccination' | 'medical_history' | 'other';

interface MedicalRecord {
  id: string;
  type: RecordType;
  title: string;
  description: string | null;
  fileUrl: string | null;
  mimeType: string | null;
  recordDate: string;
  uploadedAt: string;
}

const recordTypes: { value: RecordType; label: string; icon: string }[] = [
  { value: 'lab_result', label: 'Lab Results', icon: '🧪' },
  { value: 'prescription', label: 'Prescriptions', icon: '💊' },
  { value: 'imaging', label: 'Imaging/X-Ray', icon: '📷' },
  { value: 'vaccination', label: 'Vaccinations', icon: '💉' },
  { value: 'medical_history', label: 'Medical History', icon: '📋' },
  { value: 'other', label: 'Other', icon: '📄' },
];

export default function MedicalRecordsPage() {
  const [records, setRecords] = createSignal<MedicalRecord[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [filterType, setFilterType] = createSignal<RecordType | ''>('');
  const [showUpload, setShowUpload] = createSignal(false);
  const [uploading, setUploading] = createSignal(false);

  // Upload form state
  const [uploadFile, setUploadFile] = createSignal<File | null>(null);
  const [uploadType, setUploadType] = createSignal<RecordType>('other');
  const [uploadTitle, setUploadTitle] = createSignal('');
  const [uploadDescription, setUploadDescription] = createSignal('');
  const [uploadDate, setUploadDate] = createSignal('');

  // Fetch records
  const fetchRecords = async () => {
    setLoading(true);
    try {
      const url = filterType()
        ? `${API_URL}/api/v1/records/my?type=${filterType()}`
        : `${API_URL}/api/v1/records/my`;
      
      const response = await fetch(url, { credentials: 'include' });
      const data = await response.json();
      
      if (data.success) {
        setRecords(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch records:', e);
    } finally {
      setLoading(false);
    }
  };

  createEffect(() => {
    fetchRecords();
  });

  // Handle upload
  const handleUpload = async () => {
    const file = uploadFile();
    if (!file || !uploadTitle()) return;

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', file.name);
      formData.append('type', uploadType());
      formData.append('title', uploadTitle());
      if (uploadDescription()) formData.append('description', uploadDescription());
      if (uploadDate()) formData.append('recordDate', uploadDate());

      const response = await fetch(`${API_URL}/api/v1/records`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setShowUpload(false);
        resetUploadForm();
        fetchRecords();
      }
    } catch (e) {
      console.error('Upload failed:', e);
    } finally {
      setUploading(false);
    }
  };

  const resetUploadForm = () => {
    setUploadFile(null);
    setUploadType('other');
    setUploadTitle('');
    setUploadDescription('');
    setUploadDate('');
  };

  const deleteRecord = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
      const response = await fetch(`${API_URL}/api/v1/records/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        fetchRecords();
      }
    } catch (e) {
      console.error('Delete failed:', e);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTypeInfo = (type: RecordType) => {
    return recordTypes.find(t => t.value === type) || recordTypes[5];
  };

  return (
    <>
      <Title>Medical Records | Precta</Title>

      <div class="min-h-screen bg-base-200/30">
        {/* Header */}
        <div class="bg-base-100 border-b border-base-200">
          <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-2xl font-bold text-base-content">Medical Records</h1>
                <p class="text-base-content/60 mt-1">Manage your health documents</p>
              </div>
              <button 
                class="btn btn-primary"
                onClick={() => setShowUpload(true)}
              >
                <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Upload Record
              </button>
            </div>
          </div>
        </div>

        <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filter */}
          <div class="flex flex-wrap gap-2 mb-6">
            <button
              class={`btn btn-sm ${filterType() === '' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => { setFilterType(''); fetchRecords(); }}
            >
              All
            </button>
            <For each={recordTypes}>
              {(type) => (
                <button
                  class={`btn btn-sm ${filterType() === type.value ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => { setFilterType(type.value); fetchRecords(); }}
                >
                  {type.icon} {type.label}
                </button>
              )}
            </For>
          </div>

          {/* Records List */}
          <Show when={!loading()} fallback={
            <div class="flex justify-center py-12">
              <span class="loading loading-spinner loading-lg text-primary"></span>
            </div>
          }>
            <Show when={records().length > 0} fallback={
              <div class="bg-base-100 rounded-2xl border border-base-200 p-12 text-center">
                <div class="text-5xl mb-4">📁</div>
                <h3 class="text-lg font-bold text-base-content mb-2">No Records Yet</h3>
                <p class="text-base-content/60 mb-6">Upload your medical documents to keep them safe and accessible.</p>
                <button class="btn btn-primary" onClick={() => setShowUpload(true)}>
                  Upload Your First Record
                </button>
              </div>
            }>
              <div class="grid gap-4">
                <For each={records()}>
                  {(record) => {
                    const typeInfo = getTypeInfo(record.type);
                    return (
                      <div class="bg-base-100 rounded-2xl border border-base-200 p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div class="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                          {typeInfo.icon}
                        </div>
                        <div class="flex-1 min-w-0">
                          <h3 class="font-semibold text-base-content truncate">{record.title}</h3>
                          <div class="flex items-center gap-3 mt-1">
                            <span class="badge badge-sm badge-ghost">{typeInfo.label}</span>
                            <span class="text-sm text-base-content/60">{formatDate(record.recordDate)}</span>
                          </div>
                          <Show when={record.description}>
                            <p class="text-sm text-base-content/60 mt-1 truncate">{record.description}</p>
                          </Show>
                        </div>
                        <div class="flex items-center gap-2">
                          <Show when={record.fileUrl}>
                            <a
                              href={record.fileUrl || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              class="btn btn-ghost btn-sm"
                            >
                              View
                            </a>
                          </Show>
                          <A href={`/patient/records/${record.id}`} class="btn btn-ghost btn-sm">
                            Details
                          </A>
                          <button
                            class="btn btn-ghost btn-sm text-error"
                            onClick={() => deleteRecord(record.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  }}
                </For>
              </div>
            </Show>
          </Show>
        </div>

        {/* Upload Modal */}
        <Show when={showUpload()}>
          <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div class="bg-base-100 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden">
              <div class="p-6 border-b border-base-200">
                <div class="flex items-center justify-between">
                  <h2 class="text-xl font-bold text-base-content">Upload Medical Record</h2>
                  <button class="btn btn-ghost btn-sm btn-circle" onClick={() => setShowUpload(false)}>
                    ✕
                  </button>
                </div>
              </div>

              <div class="p-6 space-y-4">
                {/* File Input */}
                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">Document File</span>
                  </label>
                  <input
                    type="file"
                    class="file-input file-input-bordered w-full"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => setUploadFile(e.currentTarget.files?.[0] || null)}
                  />
                  <label class="label">
                    <span class="label-text-alt">JPG, PNG or PDF (max 20MB)</span>
                  </label>
                </div>

                {/* Type */}
                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">Record Type</span>
                  </label>
                  <select
                    class="select select-bordered w-full"
                    value={uploadType()}
                    onChange={(e) => setUploadType(e.currentTarget.value as RecordType)}
                  >
                    <For each={recordTypes}>
                      {(type) => (
                        <option value={type.value}>{type.icon} {type.label}</option>
                      )}
                    </For>
                  </select>
                </div>

                {/* Title */}
                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">Title</span>
                  </label>
                  <input
                    type="text"
                    class="input input-bordered w-full"
                    placeholder="e.g., Blood Test Results - March 2024"
                    value={uploadTitle()}
                    onInput={(e) => setUploadTitle(e.currentTarget.value)}
                  />
                </div>

                {/* Description */}
                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">Description (Optional)</span>
                  </label>
                  <textarea
                    class="textarea textarea-bordered w-full"
                    placeholder="Add any notes..."
                    value={uploadDescription()}
                    onInput={(e) => setUploadDescription(e.currentTarget.value)}
                  />
                </div>

                {/* Date */}
                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">Record Date</span>
                  </label>
                  <input
                    type="date"
                    class="input input-bordered w-full"
                    value={uploadDate()}
                    onInput={(e) => setUploadDate(e.currentTarget.value)}
                  />
                </div>
              </div>

              <div class="p-6 bg-base-200/30 flex justify-end gap-3">
                <button class="btn btn-ghost" onClick={() => setShowUpload(false)}>
                  Cancel
                </button>
                <button
                  class="btn btn-primary"
                  disabled={!uploadFile() || !uploadTitle() || uploading()}
                  onClick={handleUpload}
                >
                  <Show when={uploading()} fallback="Upload">
                    <span class="loading loading-spinner loading-sm"></span>
                    Uploading...
                  </Show>
                </button>
              </div>
            </div>
          </div>
        </Show>
      </div>
    </>
  );
}
