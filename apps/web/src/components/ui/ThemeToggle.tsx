/**
 * Theme Toggle Component
 * Light/Dark mode switch using DaisyUI themes and Lucide icons
 */

import { createSignal, createEffect, onMount } from 'solid-js';
import { Sun, Moon } from 'lucide-solid';

export default function ThemeToggle() {
  const [theme, setTheme] = createSignal<'light' | 'dark'>('light');

  // Initialize theme from localStorage or system preference
  onMount(() => {
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (stored) {
      setTheme(stored);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  });

  // Apply theme to document
  createEffect(() => {
    const currentTheme = theme();
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
  });

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggleTheme}
      class="btn btn-ghost btn-circle"
      aria-label={`Switch to ${theme() === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme() === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme() === 'light' ? (
        <Moon class="w-5 h-5" />
      ) : (
        <Sun class="w-5 h-5" />
      )}
    </button>
  );
}
