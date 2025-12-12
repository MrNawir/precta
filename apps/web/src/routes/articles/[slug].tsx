/**
 * T122: Article Detail Page
 * Display full article content
 */

import { Title, Meta } from "@solidjs/meta";
import { useParams, A } from "@solidjs/router";
import { createSignal, createEffect, Show, For } from "solid-js";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  category: string;
  tags: string[];
  author: {
    name: string;
    image: string | null;
  };
  publishedAt: string;
  readTime: number;
  viewCount: number;
}

interface RelatedArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  readTime: number;
}

const categoryLabels: Record<string, { label: string; icon: string }> = {
  wellness: { label: 'Wellness', icon: '🌿' },
  prevention: { label: 'Prevention', icon: '🛡️' },
  disease: { label: 'Disease', icon: '🏥' },
  nutrition: { label: 'Nutrition', icon: '🥗' },
  mental_health: { label: 'Mental Health', icon: '🧠' },
  fitness: { label: 'Fitness', icon: '💪' },
  news: { label: 'Health News', icon: '📰' },
};

export default function ArticleDetailPage() {
  const params = useParams();
  
  const [article, setArticle] = createSignal<Article | null>(null);
  const [related, setRelated] = createSignal<RelatedArticle[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal('');

  // Fetch article
  createEffect(async () => {
    if (!params.slug) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/v1/articles/${params.slug}`,
        { credentials: 'include' }
      );
      const data = await response.json();

      if (data.success) {
        setArticle(data.data);
        // Fetch related articles
        fetchRelated(data.data.category);
      } else {
        setError(data.error || 'Article not found');
      }
    } catch (e) {
      setError('Failed to load article');
    } finally {
      setLoading(false);
    }
  });

  const fetchRelated = async (category: string) => {
    try {
      const response = await fetch(
        `${API_URL}/api/v1/articles?category=${category}&limit=3`,
        { credentials: 'include' }
      );
      const data = await response.json();
      if (data.success) {
        // Exclude current article
        setRelated(data.data.filter((a: RelatedArticle) => a.slug !== params.slug).slice(0, 3));
      }
    } catch (e) {
      console.error('Failed to fetch related articles');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const categoryInfo = () => {
    const cat = article()?.category || '';
    return categoryLabels[cat] || { label: cat, icon: '📄' };
  };

  // Simple markdown to HTML (basic implementation)
  const renderContent = (content: string) => {
    return content
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-6 mb-3">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>')
      // Bold & Italic
      .replace(/\*\*([^*]+)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/gim, '<em>$1</em>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener">$1</a>')
      // Lists
      .replace(/^\s*-\s(.*)$/gim, '<li class="ml-4">$1</li>')
      .replace(/(<li.*<\/li>)/s, '<ul class="list-disc my-4">$1</ul>')
      // Paragraphs
      .replace(/\n\n/g, '</p><p class="mb-4">')
      // Wrap
      .replace(/^(.*)$/, '<p class="mb-4">$1</p>');
  };

  return (
    <>
      <Show when={article()}>
        <Title>{article()?.title} | Precta Health</Title>
        <Meta name="description" content={article()?.excerpt} />
      </Show>

      <div class="min-h-screen bg-base-200/30">
        <Show when={!loading()} fallback={
          <div class="flex justify-center py-24">
            <span class="loading loading-spinner loading-lg text-primary"></span>
          </div>
        }>
          <Show when={article()} fallback={
            <div class="container mx-auto px-4 py-24 text-center">
              <div class="text-6xl mb-4">📄</div>
              <h1 class="text-2xl font-bold text-base-content mb-2">Article Not Found</h1>
              <p class="text-base-content/60 mb-6">{error() || 'The article you\'re looking for doesn\'t exist.'}</p>
              <A href="/articles" class="btn btn-primary">
                Browse Articles
              </A>
            </div>
          }>
            {/* Cover Image */}
            <Show when={article()?.coverImage}>
              <div class="w-full h-64 md:h-96 bg-base-200 relative">
                <img
                  src={article()?.coverImage || ''}
                  alt={article()?.title}
                  class="w-full h-full object-cover"
                />
                <div class="absolute inset-0 bg-linear-to-t from-base-100 to-transparent"></div>
              </div>
            </Show>

            <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
              {/* Article Header */}
              <header class={`${article()?.coverImage ? '-mt-24 relative z-10' : 'pt-8'}`}>
                <div class="bg-base-100 rounded-2xl border border-base-200 p-6 md:p-8">
                  {/* Category & Meta */}
                  <div class="flex flex-wrap items-center gap-3 mb-4">
                    <span class="badge badge-primary badge-lg">
                      {categoryInfo().icon} {categoryInfo().label}
                    </span>
                    <span class="text-base-content/60 text-sm">
                      {article()?.readTime} min read
                    </span>
                    <span class="text-base-content/60 text-sm">
                      •
                    </span>
                    <span class="text-base-content/60 text-sm">
                      {article()?.viewCount?.toLocaleString()} views
                    </span>
                  </div>

                  {/* Title */}
                  <h1 class="text-3xl md:text-4xl font-bold text-base-content mb-4">
                    {article()?.title}
                  </h1>

                  {/* Excerpt */}
                  <p class="text-lg text-base-content/70 mb-6">
                    {article()?.excerpt}
                  </p>

                  {/* Author & Date */}
                  <div class="flex items-center gap-4 pt-4 border-t border-base-200">
                    <Show when={article()?.author?.image} fallback={
                      <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                        {article()?.author?.name?.charAt(0) || 'P'}
                      </div>
                    }>
                      <img
                        src={article()?.author?.image || ''}
                        alt={article()?.author?.name}
                        class="w-12 h-12 rounded-full object-cover"
                      />
                    </Show>
                    <div>
                      <p class="font-medium text-base-content">
                        {article()?.author?.name || 'Precta Health'}
                      </p>
                      <p class="text-sm text-base-content/60">
                        {formatDate(article()?.publishedAt || '')}
                      </p>
                    </div>
                  </div>
                </div>
              </header>

              {/* Article Content */}
              <article class="bg-base-100 rounded-2xl border border-base-200 p-6 md:p-8 mt-6">
                <div 
                  class="prose prose-lg max-w-none"
                  innerHTML={renderContent(article()?.content || '')}
                />
              </article>

              {/* Tags */}
              <Show when={article()?.tags && article()!.tags.length > 0}>
                <div class="mt-6 flex flex-wrap gap-2">
                  <span class="text-base-content/60 text-sm">Tags:</span>
                  <For each={article()?.tags}>
                    {(tag) => (
                      <A
                        href={`/articles?tag=${tag}`}
                        class="badge badge-outline hover:badge-primary"
                      >
                        {tag}
                      </A>
                    )}
                  </For>
                </div>
              </Show>

              {/* Share */}
              <div class="mt-6 p-6 bg-base-100 rounded-2xl border border-base-200">
                <p class="font-medium text-base-content mb-3">Share this article</p>
                <div class="flex gap-2">
                  <button
                    class="btn btn-circle btn-ghost"
                    onClick={() => {
                      navigator.share?.({
                        title: article()?.title,
                        url: window.location.href,
                      });
                    }}
                  >
                    📤
                  </button>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article()?.title || '')}&url=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn btn-circle btn-ghost"
                  >
                    𝕏
                  </a>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`${article()?.title} ${window.location.href}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn btn-circle btn-ghost"
                  >
                    📱
                  </a>
                </div>
              </div>

              {/* Related Articles */}
              <Show when={related().length > 0}>
                <section class="mt-12 mb-12">
                  <h2 class="text-2xl font-bold text-base-content mb-6">Related Articles</h2>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <For each={related()}>
                      {(article) => (
                        <A
                          href={`/articles/${article.slug}`}
                          class="bg-base-100 rounded-2xl border border-base-200 overflow-hidden hover:shadow-lg transition-shadow group"
                        >
                          <div class="h-32 bg-base-200">
                            <Show when={article.coverImage} fallback={
                              <div class="w-full h-full flex items-center justify-center text-4xl">
                                📄
                              </div>
                            }>
                              <img
                                src={article.coverImage || ''}
                                alt={article.title}
                                class="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            </Show>
                          </div>
                          <div class="p-4">
                            <h3 class="font-bold text-base-content line-clamp-2 group-hover:text-primary transition-colors">
                              {article.title}
                            </h3>
                            <p class="text-sm text-base-content/60 mt-1">
                              {article.readTime} min read
                            </p>
                          </div>
                        </A>
                      )}
                    </For>
                  </div>
                </section>
              </Show>

              {/* Back to articles */}
              <div class="text-center py-8">
                <A href="/articles" class="btn btn-ghost">
                  ← Back to Articles
                </A>
              </div>
            </div>
          </Show>
        </Show>
      </div>
    </>
  );
}
