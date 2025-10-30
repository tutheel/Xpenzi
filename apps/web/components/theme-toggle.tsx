'use client';

import { Moon, Sun } from 'lucide-react';

import { useTheme } from './theme-provider';

export function ThemeToggle() {
  const { theme, toggleTheme, isReady } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      disabled={!isReady}
      aria-label={`Activate ${isDark ? 'light' : 'dark'} mode`}
      className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground shadow-sm transition hover:bg-card/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isDark ? (
        <Moon aria-hidden className="h-4 w-4" />
      ) : (
        <Sun aria-hidden className="h-4 w-4" />
      )}
      <span>{isDark ? 'Dark' : 'Light'} mode</span>
    </button>
  );
}
