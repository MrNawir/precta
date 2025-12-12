/**
 * T125: MarkdownEditor Component
 * Simple markdown editor with preview
 */

import { createSignal, Show, createEffect } from "solid-js";

export interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  maxLength?: number;
  label?: string;
  error?: string;
  disabled?: boolean;
}

export default function MarkdownEditor(props: MarkdownEditorProps) {
  const [mode, setMode] = createSignal<'write' | 'preview'>('write');
  const [preview, setPreview] = createSignal('');
  const minHeight = () => props.minHeight || 300;

  // Simple markdown to HTML conversion
  const renderMarkdown = (md: string): string => {
    return md
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-6 mb-4">$1</h1>')
      // Bold & Italic
      .replace(/\*\*\*([^*]+)\*\*\*/gim, '<strong><em>$1</em></strong>')
      .replace(/\*\*([^*]+)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/gim, '<em>$1</em>')
      .replace(/___([^_]+)___/gim, '<strong><em>$1</em></strong>')
      .replace(/__([^_]+)__/gim, '<strong>$1</strong>')
      .replace(/_([^_]+)_/gim, '<em>$1</em>')
      // Code
      .replace(/```([^`]+)```/gim, '<pre class="bg-base-200 p-4 rounded-lg my-4 overflow-x-auto"><code>$1</code></pre>')
      .replace(/`([^`]+)`/gim, '<code class="bg-base-200 px-1 rounded text-sm">$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener">$1</a>')
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" class="rounded-lg max-w-full my-4" />')
      // Blockquotes
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-primary pl-4 my-4 text-base-content/80">$1</blockquote>')
      // Horizontal rule
      .replace(/^---$/gim, '<hr class="my-6 border-base-200" />')
      // Unordered lists
      .replace(/^\s*[-*]\s(.*)$/gim, '<li class="ml-4">$1</li>')
      // Ordered lists
      .replace(/^\s*\d+\.\s(.*)$/gim, '<li class="ml-4 list-decimal">$1</li>')
      // Paragraphs (double newlines)
      .replace(/\n\n/g, '</p><p class="mb-4">')
      // Line breaks
      .replace(/\n/g, '<br />')
      // Wrap in paragraph
      .replace(/^(.*)$/, '<p class="mb-4">$1</p>');
  };

  createEffect(() => {
    if (mode() === 'preview') {
      setPreview(renderMarkdown(props.value));
    }
  });

  const insertText = (before: string, after: string = '') => {
    const textarea = document.querySelector('#markdown-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = props.value;
    const selectedText = text.substring(start, end);

    const newText = text.substring(0, start) + before + selectedText + after + text.substring(end);
    props.onChange(newText);

    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const toolbar = [
    { icon: 'B', action: () => insertText('**', '**'), title: 'Bold' },
    { icon: 'I', action: () => insertText('*', '*'), title: 'Italic' },
    { icon: 'H', action: () => insertText('\n## ', '\n'), title: 'Heading' },
    { icon: '🔗', action: () => insertText('[', '](url)'), title: 'Link' },
    { icon: '📷', action: () => insertText('![alt](', ')'), title: 'Image' },
    { icon: '`', action: () => insertText('`', '`'), title: 'Code' },
    { icon: '•', action: () => insertText('\n- ', '\n'), title: 'List' },
    { icon: '"', action: () => insertText('\n> ', '\n'), title: 'Quote' },
    { icon: '—', action: () => insertText('\n---\n', ''), title: 'Divider' },
  ];

  return (
    <div class="border border-base-200 rounded-2xl overflow-hidden bg-base-100">
      {/* Header */}
      <div class="flex items-center justify-between p-2 border-b border-base-200 bg-base-200/30">
        {/* Toolbar */}
        <div class="flex gap-1">
          {toolbar.map(item => (
            <button
              type="button"
              class="btn btn-ghost btn-xs"
              onClick={item.action}
              title={item.title}
              disabled={props.disabled || mode() === 'preview'}
            >
              {item.icon}
            </button>
          ))}
        </div>

        {/* Mode Toggle */}
        <div class="tabs tabs-boxed tabs-xs">
          <button
            class={`tab ${mode() === 'write' ? 'tab-active' : ''}`}
            onClick={() => setMode('write')}
          >
            Write
          </button>
          <button
            class={`tab ${mode() === 'preview' ? 'tab-active' : ''}`}
            onClick={() => setMode('preview')}
          >
            Preview
          </button>
        </div>
      </div>

      {/* Editor/Preview */}
      <Show when={mode() === 'write'}>
        <textarea
          id="markdown-editor"
          class="w-full p-4 resize-none focus:outline-none bg-transparent"
          style={{ "min-height": `${minHeight()}px` }}
          placeholder={props.placeholder || 'Write your content in Markdown...'}
          value={props.value}
          onInput={(e) => props.onChange(e.currentTarget.value)}
          maxLength={props.maxLength}
          disabled={props.disabled}
        />
      </Show>

      <Show when={mode() === 'preview'}>
        <div
          class="p-4 prose prose-sm max-w-none overflow-auto"
          style={{ "min-height": `${minHeight()}px` }}
          innerHTML={preview() || '<p class="text-base-content/50">Nothing to preview</p>'}
        />
      </Show>

      {/* Footer */}
      <div class="flex items-center justify-between p-2 border-t border-base-200 bg-base-200/30">
        <span class="text-xs text-base-content/50">
          Markdown supported
        </span>
        <Show when={props.maxLength}>
          <span class={`text-xs ${
            props.value.length > (props.maxLength || 0) * 0.9 
              ? 'text-warning' 
              : 'text-base-content/50'
          }`}>
            {props.value.length}/{props.maxLength}
          </span>
        </Show>
      </div>

      {/* Error */}
      <Show when={props.error}>
        <div class="px-4 pb-2 text-error text-sm">{props.error}</div>
      </Show>
    </div>
  );
}

// Markdown help modal
export function MarkdownHelp() {
  const [isOpen, setIsOpen] = createSignal(false);

  const examples = [
    { syntax: '**bold**', result: '<strong>bold</strong>' },
    { syntax: '*italic*', result: '<em>italic</em>' },
    { syntax: '# Heading 1', result: '<h1>Heading 1</h1>' },
    { syntax: '## Heading 2', result: '<h2>Heading 2</h2>' },
    { syntax: '[Link](url)', result: '<a href="#">Link</a>' },
    { syntax: '![Image](url)', result: '<img src="#" />' },
    { syntax: '`code`', result: '<code>code</code>' },
    { syntax: '- List item', result: '<li>List item</li>' },
    { syntax: '> Quote', result: '<blockquote>Quote</blockquote>' },
    { syntax: '---', result: '<hr />' },
  ];

  return (
    <>
      <button
        type="button"
        class="btn btn-ghost btn-xs"
        onClick={() => setIsOpen(true)}
      >
        ❓ Help
      </button>

      <Show when={isOpen()}>
        <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div class="bg-base-100 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div class="p-6 border-b border-base-200 flex items-center justify-between">
              <h3 class="text-lg font-bold">Markdown Guide</h3>
              <button class="btn btn-ghost btn-sm btn-circle" onClick={() => setIsOpen(false)}>
                ✕
              </button>
            </div>
            <div class="p-6 max-h-96 overflow-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-base-200">
                    <th class="text-left py-2">Syntax</th>
                    <th class="text-left py-2">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {examples.map(ex => (
                    <tr class="border-b border-base-200">
                      <td class="py-2 font-mono text-xs">{ex.syntax}</td>
                      <td class="py-2" innerHTML={ex.result}></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Show>
    </>
  );
}
