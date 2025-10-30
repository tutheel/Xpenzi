export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'xpenzi-theme';

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}

export function resolveInitialTheme(stored: string | null, prefersDark: boolean): Theme {
  if (isTheme(stored)) {
    return stored;
  }

  return prefersDark ? 'dark' : 'light';
}
