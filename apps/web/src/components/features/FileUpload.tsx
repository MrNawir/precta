/**
 * T091: FileUpload Component
 * Drag-and-drop file upload with preview
 */

import { createSignal, Show, For } from "solid-js";

export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  preview?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  maxFiles?: number;
  onUpload?: (files: File[]) => Promise<void>;
  onChange?: (files: UploadedFile[]) => void;
}

export default function FileUpload(props: FileUploadProps) {
  const [files, setFiles] = createSignal<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = createSignal(false);
  const [error, setError] = createSignal('');

  const accept = () => props.accept || '.jpg,.jpeg,.png,.pdf';
  const maxSize = () => props.maxSize || 10;
  const maxFiles = () => props.maxFiles || 5;

  const validateFile = (file: File): string | null => {
    // Check size
    if (file.size > maxSize() * 1024 * 1024) {
      return `File too large. Maximum size is ${maxSize()}MB`;
    }

    // Check type
    const acceptedTypes = accept().split(',').map(t => t.trim());
    const fileExt = `.${file.name.split('.').pop()?.toLowerCase()}`;
    const mimeType = file.type;

    const isAccepted = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return fileExt === type.toLowerCase();
      }
      return mimeType === type || mimeType.startsWith(type.replace('*', ''));
    });

    if (!isAccepted) {
      return `Invalid file type. Accepted: ${accept()}`;
    }

    return null;
  };

  const addFiles = async (newFiles: FileList | File[]) => {
    setError('');
    const fileArray = Array.from(newFiles);

    // Check max files
    if (files().length + fileArray.length > maxFiles()) {
      setError(`Maximum ${maxFiles()} files allowed`);
      return;
    }

    const uploadedFiles: UploadedFile[] = [];

    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        continue;
      }

      // Create preview for images
      let preview: string | undefined;
      if (file.type.startsWith('image/')) {
        preview = URL.createObjectURL(file);
      }

      const uploadedFile: UploadedFile = {
        id: crypto.randomUUID(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        preview,
        progress: 0,
        status: 'pending',
      };

      uploadedFiles.push(uploadedFile);
    }

    const allFiles = [...files(), ...uploadedFiles];
    setFiles(allFiles);
    props.onChange?.(allFiles);

    // Auto upload if handler provided
    if (props.onUpload && uploadedFiles.length > 0) {
      await handleUpload(uploadedFiles);
    }
  };

  const handleUpload = async (filesToUpload: UploadedFile[]) => {
    for (const uploadedFile of filesToUpload) {
      setFiles(prev => prev.map(f => 
        f.id === uploadedFile.id ? { ...f, status: 'uploading' as const, progress: 0 } : f
      ));

      try {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setFiles(prev => prev.map(f => 
            f.id === uploadedFile.id && f.status === 'uploading'
              ? { ...f, progress: Math.min(f.progress + 10, 90) }
              : f
          ));
        }, 100);

        await props.onUpload?.([uploadedFile.file]);

        clearInterval(progressInterval);

        setFiles(prev => prev.map(f => 
          f.id === uploadedFile.id 
            ? { ...f, status: 'completed' as const, progress: 100 } 
            : f
        ));
      } catch (e) {
        setFiles(prev => prev.map(f => 
          f.id === uploadedFile.id 
            ? { ...f, status: 'error' as const, error: 'Upload failed' } 
            : f
        ));
      }
    }

    props.onChange?.(files());
  };

  const removeFile = (id: string) => {
    const file = files().find(f => f.id === id);
    if (file?.preview) {
      URL.revokeObjectURL(file.preview);
    }
    const remaining = files().filter(f => f.id !== id);
    setFiles(remaining);
    props.onChange?.(remaining);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer?.files) {
      addFiles(e.dataTransfer.files);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type === 'application/pdf') return '📄';
    return '📎';
  };

  return (
    <div class="space-y-4">
      {/* Drop Zone */}
      <div
        class={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
          isDragging()
            ? 'border-primary bg-primary/10'
            : 'border-base-300 hover:border-primary/50 hover:bg-base-200/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          class="hidden"
          accept={accept()}
          multiple={props.multiple}
          onChange={(e) => e.currentTarget.files && addFiles(e.currentTarget.files)}
        />
        
        <div class="text-4xl mb-3">📁</div>
        <p class="text-base-content font-medium">
          <span class="text-primary">Click to upload</span> or drag and drop
        </p>
        <p class="text-sm text-base-content/60 mt-1">
          {accept()} (max {maxSize()}MB)
        </p>
        <Show when={props.multiple}>
          <p class="text-xs text-base-content/50 mt-1">
            Up to {maxFiles()} files
          </p>
        </Show>
      </div>

      {/* Error */}
      <Show when={error()}>
        <div class="alert alert-error py-2">
          <span class="text-sm">{error()}</span>
        </div>
      </Show>

      {/* File List */}
      <Show when={files().length > 0}>
        <div class="space-y-2">
          <For each={files()}>
            {(file) => (
              <div class="flex items-center gap-3 p-3 bg-base-200/50 rounded-xl">
                {/* Preview/Icon */}
                <Show when={file.preview} fallback={
                  <div class="w-12 h-12 bg-base-300 rounded-lg flex items-center justify-center text-xl">
                    {getFileIcon(file.type)}
                  </div>
                }>
                  <img
                    src={file.preview}
                    alt={file.name}
                    class="w-12 h-12 rounded-lg object-cover"
                  />
                </Show>

                {/* Info */}
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-base-content truncate">{file.name}</p>
                  <p class="text-sm text-base-content/60">{formatSize(file.size)}</p>
                  
                  {/* Progress */}
                  <Show when={file.status === 'uploading'}>
                    <progress
                      class="progress progress-primary w-full h-1 mt-1"
                      value={file.progress}
                      max="100"
                    />
                  </Show>
                </div>

                {/* Status */}
                <div class="flex items-center gap-2">
                  <Show when={file.status === 'pending'}>
                    <span class="badge badge-ghost badge-sm">Pending</span>
                  </Show>
                  <Show when={file.status === 'uploading'}>
                    <span class="loading loading-spinner loading-sm text-primary"></span>
                  </Show>
                  <Show when={file.status === 'completed'}>
                    <span class="text-success">✓</span>
                  </Show>
                  <Show when={file.status === 'error'}>
                    <span class="text-error text-sm">{file.error}</span>
                  </Show>

                  {/* Remove */}
                  <button
                    class="btn btn-ghost btn-xs btn-circle"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.id);
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}
