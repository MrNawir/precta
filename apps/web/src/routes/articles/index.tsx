/**
 * T121: Articles Listing Page
 * Users browse health articles
 */

import { Title } from "@solidjs/meta";
import { useSearchParams, A } from "@solidjs/router";
import { createSignal, createEffect, Show, For } from "solid-js";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  category: string;
  author: {
    name: string;
    image: string | null;
  };
  publishedAt: string;
  readTime: number;
}

const categories = [
  { value: '', label: 'All', icon: '📚' },
  { value: 'wellness', label: 'Wellness', icon: '🌿' },
  { value: 'prevention', label: 'Prevention', icon: '🛡️' },
  { value: 'disease', label: 'Disease', icon: '🏥' },
  { value: 'nutrition', label: 'Nutrition', icon: '🥗' },
  { value: 'mental_health', label: 'Mental Health', icon: '🧠' },
  { value: 'fitness', label: 'Fitness', icon: '💪' },
  { value: 'news', label: 'Health News', icon: '📰' },
];

export default function ArticlesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [articles, setArticles] = createSignal<Article[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [total, setTotal] = createSignal(0);
  const [search, setSearch] = createSignal(searchParams.q || '');

  const category = () => searchParams.category || '';
  const page = () => parseInt(searchParams.page || '1', 10);

  // Fetch articles
  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category()) params.set('category', category());
      if (search()) params.set('search', search());
      params.set('page', page().toString());
      params.set('limit', '12');

      const response = await fetch(
        `${API_URL}/api/v1/articles?${params}`,
        { credentials: 'include' }
      );
      const data = await response.json();

      if (data.success) {
        setArticles(data.data);
        setTotal(data.pagination?.total || 0);
      }
    } catch (e) {
      console.error('Failed to fetch articles:', e);
    } finally {
      setLoading(false);
    }
  };

  createEffect(() => {
    fetchArticles();
  });

  const handleSearch = () => {
    setSearchParams({ q: search(), category: category(), page: '1' });
  };

  const handleCategoryChange = (cat: string) => {
    setSearchParams({ category: cat, q: search(), page: '1' });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const totalPages = () => Math.ceil(total() / 12);

  return (
    <>
      <Title>Health Articles | Precta</Title>

      <div class="min-h-screen bg-base-200/30">
        {/* Header */}
        <div class="bg-base-100 border-b border-base-200">
          <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 class="text-3xl font-bold text-base-content">Health Articles</h1>
            <p class="text-base-content/60 mt-2">
              Expert insights on health, wellness, and medical topics
            </p>

            {/* Search */}
            <div class="mt-6 flex gap-3">
              <div class="join flex-1 max-w-md">
                <input
                  type="text"
                  class="input input-bordered join-item flex-1"
                  placeholder="Search articles..."
                  value={search()}
                  onInput={(e) => setSearch(e.currentTarget.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button class="btn btn-primary join-item" onClick={handleSearch}>
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Categories */}
          <div class="flex flex-wrap gap-2 mb-8">
            <For each={categories}>
              {(cat) => (
                <button
                  class={`btn btn-sm ${category() === cat.value ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => handleCategoryChange(cat.value)}
                >
                  {cat.icon} {cat.label}
                </button>
              )}
            </For>
          </div>

          {/* Articles Grid */}
          <Show when={!loading()} fallback={
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <For each={[1, 2, 3, 4, 5, 6]}>
                {() => (
                  <div class="bg-base-100 rounded-2xl border border-base-200 overflow-hidden animate-pulse">
                    <div class="h-48 bg-base-200"></div>
                    <div class="p-6">
                      <div class="h-4 w-24 bg-base-200 rounded mb-3"></div>
                      <div class="h-6 w-full bg-base-200 rounded mb-2"></div>
                      <div class="h-4 w-3/4 bg-base-200 rounded"></div>
                    </div>
                  </div>
                )}
              </For>
            </div>
          }>
            <Show when={articles().length > 0} fallback={
              <div class="bg-base-100 rounded-2xl border border-base-200 p-12 text-center">
                <div class="text-5xl mb-4">📚</div>
                <h3 class="text-lg font-bold text-base-content mb-2">No Articles Found</h3>
                <p class="text-base-content/60">
                  {search() ? 'Try a different search term' : 'Check back later for new content'}
                </p>
              </div>
            }>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <For each={articles()}>
                  {(article) => (
                    <A
                      href={`/articles/${article.slug}`}
                      class="bg-base-100 rounded-2xl border border-base-200 overflow-hidden hover:shadow-lg transition-shadow group"
                    >
                      {/* Cover Image */}
                      <div class="h-48 bg-base-200 relative overflow-hidden">
                        <Show when={article.coverImage} fallback={
                          <div class="w-full h-full flex items-center justify-center text-5xl">
                            📄
                          </div>
                        }>
                          <img
                            src={article.coverImage || ''}
                            alt={article.title}
                            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </Show>
                        <span class="absolute top-3 left-3 badge badge-primary">
                          {categories.find(c => c.value === article.category)?.label || article.category}
                        </span>
                      </div>

                      {/* Content */}
                      <div class="p-6">
                        <div class="flex items-center gap-2 text-sm text-base-content/60 mb-3">
                          <span>{formatDate(article.publishedAt)}</span>
                          <span>•</span>
                          <span>{article.readTime} min read</span>
                        </div>

                        <h2 class="text-lg font-bold text-base-content mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {article.title}
                        </h2>
                        <p class="text-base-content/60 text-sm line-clamp-2">
                          {article.excerpt}
                        </p>

                        {/* Author */}
                        <div class="flex items-center gap-2 mt-4 pt-4 border-t border-base-200">
                          <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {article.author?.name?.charAt(0) || 'A'}
                          </div>
                          <span class="text-sm text-base-content/60">
                            {article.author?.name || 'Precta Health'}
                          </span>
                        </div>
                      </div>
                    </A>
                  )}
                </For>
              </div>

              {/* Pagination */}
              <Show when={totalPages() > 1}>
                <div class="flex justify-center mt-8">
                  <div class="join">
                    <button
                      class="join-item btn"
                      disabled={page() === 1}
                      onClick={() => setSearchParams({ page: (page() - 1).toString() })}
                    >
                      «
                    </button>
                    <button class="join-item btn">
                      Page {page()} of {totalPages()}
                    </button>
                    <button
                      class="join-item btn"
                      disabled={page() === totalPages()}
                      onClick={() => setSearchParams({ page: (page() + 1).toString() })}
                    >
                      »
                    </button>
                  </div>
                </div>
              </Show>
            </Show>
          </Show>
        </div>
      </div>
    </>
  );
}
