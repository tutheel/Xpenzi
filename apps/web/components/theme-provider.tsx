'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import type { Theme } from '@/lib/theme';
import { THEME_STORAGE_KEY, resolveInitialTheme } from '@/lib/theme';

interface ThemeContextValue {
  theme: Theme;
  isReady: boolean;
  setTheme: (nextTheme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function applyDomTheme(theme: Theme) {
  if (typeof window === 'undefined') {
    return;
  }

  const root = window.document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.setAttribute('data-theme', theme);
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = resolveInitialTheme(stored, prefersDark);

    setThemeState(initialTheme);
    applyDomTheme(initialTheme);
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    applyDomTheme(theme);
  }, [theme, isReady]);

  const setTheme = useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => (current === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      isReady,
      setTheme,
      toggleTheme,
    }),
    [theme, isReady, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}
