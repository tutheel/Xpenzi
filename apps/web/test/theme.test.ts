import { describe, expect, it } from 'vitest';

import { resolveInitialTheme } from '@/lib/theme';

describe('resolveInitialTheme', () => {
  it('returns stored theme when value is valid', () => {
    expect(resolveInitialTheme('dark', false)).toBe('dark');
    expect(resolveInitialTheme('light', true)).toBe('light');
  });

  it('falls back to prefers-color-scheme when stored theme is invalid', () => {
    expect(resolveInitialTheme(null, true)).toBe('dark');
    expect(resolveInitialTheme('unknown', false)).toBe('light');
  });
});
