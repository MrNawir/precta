/**
 * T123: Admin Article Editor Page
 * Create and edit health articles
 */

import { Title } from "@solidjs/meta";
import { useParams, useNavigate, useSearchParams } from "@solidjs/router";
import { createSignal, createEffect, Show, For } from "solid-js";
import MarkdownEditor from "../../../components/features/MarkdownEditor";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

type ArticleCategory = 'wellness' | 'prevention' | 'disease' | 'nutrition' | 'mental_health' | 'fitness' | 'news';
type ArticleStatus = 'draft' | 'published' | 'archived';

interface ArticleForm {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: ArticleCategory;
  tags: string[];
  status: ArticleStatus;
  readTime: number;
}

const categories: { value: ArticleCategory; label: string; icon: string }[] = [
  { value: 'wellness', label: 'Wellness', icon: '🌿' },
  { value: 'prevention', label: 'Prevention', icon: '🛡️' },
  { value: 'disease', label: 'Disease', icon: '🏥' },
  { value: 'nutrition', label: 'Nutrition', icon: '🥗' },
  { value: 'mental_health', label: 'Mental Health', icon: '🧠' },
  { value: 'fitness', label: 'Fitness', icon: '💪' },
  { value: 'news', label: 'Health News', icon: '📰' },
];

export default function ArticleEditorPage() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const isEditing = () => !!params.id;
  
  const [form, setForm] = createSignal<ArticleForm>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    coverImage: '',
    category: 'wellness',
    tags: [],
    status: 'draft',
    readTime: 0,
  });
  
  const [tagInput, setTagInput] = createSignal('');
  const [loading, setLoading] = createSignal(false);
  const [saving, setSaving] = createSignal(false);
  const [error, setError] = createSignal('');
  const [success, setSuccess] = createSignal('');

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Calculate read time (approx 200 words per minute)
  const calculateReadTime = (content: string) => {
    const words = content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  // Update form field
  const updateField = <K extends keyof ArticleForm>(field: K, value: ArticleForm[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate slug from title
    if (field === 'title' && !isEditing()) {
      setForm(prev => ({ ...prev, slug: generateSlug(value as string) }));
    }
    
    // Auto-calculate read time
    if (field === 'content') {
      setForm(prev => ({ ...prev, readTime: calculateReadTime(value as string) }));
    }
  };

  // Add tag
  const addTag = () => {
    const tag = tagInput().trim().toLowerCase();
    if (tag && !form().tags.includes(tag)) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
    setTagInput('');
  };

  // Remove tag
  const removeTag = (tag: string) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  // Load article for editing
  createEffect(async () => {
    if (params.id) {
      setLoading(true);
      try {
        const response = await fetch(
          `${API_URL}/api/v1/articles/${params.id}`,
          { credentials: 'include' }
        );
        const data = await response.json();
        
        if (data.success) {
          setForm({
            title: data.data.title,
            slug: data.data.slug,
            excerpt: data.data.excerpt,
            content: data.data.content,
            coverImage: data.data.coverImage || '',
            category: data.data.category,
            tags: data.data.tags || [],
            status: data.data.status,
            readTime: data.data.readTime,
          });
        }
      } catch (e) {
        setError('Failed to load article');
      } finally {
        setLoading(false);
      }
    }
  });

  // Save article
  const handleSave = async (status?: ArticleStatus) => {
    if (!form().title.trim()) {
      setError('Title is required');
      return;
    }
    if (!form().content.trim()) {
      setError('Content is required');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    const payload = {
      ...form(),
      status: status || form().status,
    };

    try {
      const url = isEditing()
        ? `${API_URL}/api/v1/articles/${params.id}`
        : `${API_URL}/api/v1/articles`;
      
      const response = await fetch(url, {
        method: isEditing() ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(status === 'published' ? 'Article published!' : 'Article saved!');
        
        if (!isEditing() && data.data?.id) {
          // Redirect to edit mode
          navigate(`/admin/articles/${data.data.id}/edit`);
        }
      } else {
        setError(data.error || 'Failed to save article');
      }
    } catch (e) {
      setError('Failed to save article');
    } finally {
      setSaving(false);
    }
  };

  // Preview article
  const handlePreview = () => {
    // Open preview in new tab (would need slug)
    const slug = form().slug || generateSlug(form().title);
    window.open(`/articles/${slug}?preview=true`, '_blank');
  };

  return (
    <>
      <Title>{isEditing() ? 'Edit Article' : 'New Article'} | Admin | Precta</Title>

      <div class="min-h-screen bg-base-200/30">
        {/* Header */}
        <div class="bg-base-100 border-b border-base-200 sticky top-0 z-10">
          <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <a href="/admin" class="btn btn-ghost btn-sm">
                  ← Back
                </a>
                <h1 class="text-xl font-bold text-base-content">
                  {isEditing() ? 'Edit Article' : 'New Article'}
                </h1>
              </div>

              <div class="flex items-center gap-2">
                <button
                  class="btn btn-ghost btn-sm"
                  onClick={handlePreview}
                  disabled={!form().title}
                >
                  👁️ Preview
                </button>
                <button
                  class="btn btn-ghost btn-sm"
                  onClick={() => handleSave('draft')}
                  disabled={saving()}
                >
                  Save Draft
                </button>
                <button
                  class="btn btn-primary btn-sm"
                  onClick={() => handleSave('published')}
                  disabled={saving()}
                >
                  <Show when={saving()} fallback="Publish">
                    <span class="loading loading-spinner loading-xs"></span>
                  </Show>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Loading */}
        <Show when={loading()}>
          <div class="flex justify-center py-24">
            <span class="loading loading-spinner loading-lg text-primary"></span>
          </div>
        </Show>

        {/* Editor */}
        <Show when={!loading()}>
          <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Editor */}
              <div class="lg:col-span-2 space-y-6">
                {/* Alerts */}
                <Show when={error()}>
                  <div class="alert alert-error">
                    <span>{error()}</span>
                    <button class="btn btn-ghost btn-xs" onClick={() => setError('')}>✕</button>
                  </div>
                </Show>

                <Show when={success()}>
                  <div class="alert alert-success">
                    <span>{success()}</span>
                    <button class="btn btn-ghost btn-xs" onClick={() => setSuccess('')}>✕</button>
                  </div>
                </Show>

                {/* Title */}
                <div class="form-control">
                  <input
                    type="text"
                    class="input input-bordered text-2xl font-bold h-14"
                    placeholder="Article Title"
                    value={form().title}
                    onInput={(e) => updateField('title', e.currentTarget.value)}
                  />
                </div>

                {/* Slug */}
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">URL Slug</span>
                  </label>
                  <div class="flex items-center gap-2">
                    <span class="text-base-content/60 text-sm">/articles/</span>
                    <input
                      type="text"
                      class="input input-bordered input-sm flex-1"
                      value={form().slug}
                      onInput={(e) => updateField('slug', e.currentTarget.value)}
                    />
                  </div>
                </div>

                {/* Excerpt */}
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">Excerpt</span>
                    <span class="label-text-alt">{form().excerpt.length}/200</span>
                  </label>
                  <textarea
                    class="textarea textarea-bordered h-20"
                    placeholder="Brief summary for article cards..."
                    value={form().excerpt}
                    onInput={(e) => updateField('excerpt', e.currentTarget.value)}
                    maxLength={200}
                  />
                </div>

                {/* Content */}
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">Content</span>
                    <span class="label-text-alt">{form().readTime} min read</span>
                  </label>
                  <MarkdownEditor
                    value={form().content}
                    onChange={(value) => updateField('content', value)}
                    placeholder="Write your article content in Markdown..."
                    minHeight={400}
                  />
                </div>
              </div>

              {/* Sidebar */}
              <div class="space-y-6">
                {/* Status */}
                <div class="bg-base-100 rounded-2xl border border-base-200 p-6">
                  <h3 class="font-bold text-base-content mb-4">Status</h3>
                  <select
                    class="select select-bordered w-full"
                    value={form().status}
                    onChange={(e) => updateField('status', e.currentTarget.value as ArticleStatus)}
                  >
                    <option value="draft">📝 Draft</option>
                    <option value="published">✅ Published</option>
                    <option value="archived">📦 Archived</option>
                  </select>
                </div>

                {/* Category */}
                <div class="bg-base-100 rounded-2xl border border-base-200 p-6">
                  <h3 class="font-bold text-base-content mb-4">Category</h3>
                  <div class="space-y-2">
                    <For each={categories}>
                      {(cat) => (
                        <label class="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-base-200 transition-colors">
                          <input
                            type="radio"
                            name="category"
                            class="radio radio-primary radio-sm"
                            checked={form().category === cat.value}
                            onChange={() => updateField('category', cat.value)}
                          />
                          <span>{cat.icon}</span>
                          <span class="text-sm">{cat.label}</span>
                        </label>
                      )}
                    </For>
                  </div>
                </div>

                {/* Cover Image */}
                <div class="bg-base-100 rounded-2xl border border-base-200 p-6">
                  <h3 class="font-bold text-base-content mb-4">Cover Image</h3>
                  <input
                    type="url"
                    class="input input-bordered w-full input-sm"
                    placeholder="https://..."
                    value={form().coverImage}
                    onInput={(e) => updateField('coverImage', e.currentTarget.value)}
                  />
                  <Show when={form().coverImage}>
                    <img
                      src={form().coverImage}
                      alt="Cover preview"
                      class="mt-3 rounded-lg w-full h-32 object-cover"
                    />
                  </Show>
                </div>

                {/* Tags */}
                <div class="bg-base-100 rounded-2xl border border-base-200 p-6">
                  <h3 class="font-bold text-base-content mb-4">Tags</h3>
                  <div class="flex gap-2 mb-3">
                    <input
                      type="text"
                      class="input input-bordered input-sm flex-1"
                      placeholder="Add tag..."
                      value={tagInput()}
                      onInput={(e) => setTagInput(e.currentTarget.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <button class="btn btn-primary btn-sm" onClick={addTag}>
                      Add
                    </button>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <For each={form().tags}>
                      {(tag) => (
                        <span class="badge badge-outline gap-1">
                          {tag}
                          <button
                            class="hover:text-error"
                            onClick={() => removeTag(tag)}
                          >
                            ✕
                          </button>
                        </span>
                      )}
                    </For>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Show>
      </div>
    </>
  );
}
