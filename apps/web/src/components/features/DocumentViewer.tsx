/**
 * T092: DocumentViewer Component
 * Preview documents (images, PDFs) with zoom and download
 */

import { createSignal, Show } from "solid-js";

export interface DocumentViewerProps {
  url: string;
  title?: string;
  mimeType?: string;
  onClose?: () => void;
  showDownload?: boolean;
}

export default function DocumentViewer(props: DocumentViewerProps) {
  const [zoom, setZoom] = createSignal(100);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal(false);

  const isImage = () => {
    const type = props.mimeType || '';
    return type.startsWith('image/') || 
      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(props.url);
  };

  const isPdf = () => {
    const type = props.mimeType || '';
    return type === 'application/pdf' || /\.pdf$/i.test(props.url);
  };

  const zoomIn = () => setZoom(z => Math.min(z + 25, 200));
  const zoomOut = () => setZoom(z => Math.max(z - 25, 50));
  const resetZoom = () => setZoom(100);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = props.url;
    link.download = props.title || 'document';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div class="fixed inset-0 bg-black/90 z-50 flex flex-col">
      {/* Header */}
      <div class="flex items-center justify-between p-4 bg-black/50">
        <div class="flex items-center gap-4">
          <Show when={props.onClose}>
            <button
              class="btn btn-ghost btn-sm btn-circle text-white"
              onClick={props.onClose}
            >
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </Show>
          <h2 class="text-white font-medium truncate max-w-md">
            {props.title || 'Document'}
          </h2>
        </div>

        <div class="flex items-center gap-2">
          {/* Zoom Controls */}
          <Show when={isImage()}>
            <div class="flex items-center gap-1 bg-white/10 rounded-lg px-2">
              <button
                class="btn btn-ghost btn-sm btn-circle text-white"
                onClick={zoomOut}
                disabled={zoom() <= 50}
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                </svg>
              </button>
              <button
                class="btn btn-ghost btn-sm text-white min-w-[60px]"
                onClick={resetZoom}
              >
                {zoom()}%
              </button>
              <button
                class="btn btn-ghost btn-sm btn-circle text-white"
                onClick={zoomIn}
                disabled={zoom() >= 200}
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </Show>

          {/* Download */}
          <Show when={props.showDownload !== false}>
            <button
              class="btn btn-ghost btn-sm text-white"
              onClick={handleDownload}
            >
              <svg class="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
          </Show>

          {/* Open in new tab */}
          <a
            href={props.url}
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-ghost btn-sm text-white"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

      {/* Content */}
      <div class="flex-1 overflow-auto flex items-center justify-center p-4">
        <Show when={loading()}>
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="loading loading-spinner loading-lg text-white"></span>
          </div>
        </Show>

        <Show when={error()}>
          <div class="text-center">
            <div class="text-5xl mb-4">⚠️</div>
            <p class="text-white">Failed to load document</p>
            <button class="btn btn-primary mt-4" onClick={handleDownload}>
              Download Instead
            </button>
          </div>
        </Show>

        {/* Image Viewer */}
        <Show when={isImage() && !error()}>
          <div 
            class="transition-transform duration-200"
            style={{ transform: `scale(${zoom() / 100})` }}
          >
            <img
              src={props.url}
              alt={props.title || 'Document'}
              class="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
              onLoad={() => setLoading(false)}
              onError={() => { setLoading(false); setError(true); }}
            />
          </div>
        </Show>

        {/* PDF Viewer */}
        <Show when={isPdf() && !error()}>
          <iframe
            src={props.url}
            class="w-full h-full max-w-4xl rounded-lg bg-white"
            title={props.title || 'PDF Document'}
            onLoad={() => setLoading(false)}
            onError={() => { setLoading(false); setError(true); }}
          />
        </Show>

        {/* Unsupported Type */}
        <Show when={!isImage() && !isPdf() && !error()}>
          <div class="text-center">
            <div class="text-6xl mb-4">📄</div>
            <p class="text-white mb-2">Preview not available</p>
            <p class="text-gray-400 text-sm mb-4">
              {props.mimeType || 'Unknown file type'}
            </p>
            <button class="btn btn-primary" onClick={handleDownload}>
              Download File
            </button>
          </div>
        </Show>
      </div>

      {/* Footer with file info */}
      <div class="p-4 bg-black/50 text-center">
        <p class="text-gray-400 text-sm">
          {props.mimeType && <span class="mr-4">{props.mimeType}</span>}
          <span>Press ESC to close</span>
        </p>
      </div>
    </div>
  );
}

// Modal wrapper for easy use
export function useDocumentViewer() {
  const [isOpen, setIsOpen] = createSignal(false);
  const [document, setDocument] = createSignal<DocumentViewerProps | null>(null);

  const open = (doc: Omit<DocumentViewerProps, 'onClose'>) => {
    setDocument({ ...doc, onClose: close });
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setDocument(null);
  };

  return {
    isOpen,
    document,
    open,
    close,
  };
}
