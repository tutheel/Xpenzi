"use client";

import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme, type Theme } from '@/lib/theme';

const OPTIONS: { value: Theme; label: string; icon: React.ReactNode }[] = [
  { value: 'light', label: 'Light', icon: <Sun className="h-4 w-4" /> },
  { value: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4" /> },
  { value: 'system', label: 'System', icon: <Monitor className="h-4 w-4" /> },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      {OPTIONS.map((option) => (
        <Button
          key={option.value}
          variant={theme === option.value ? 'default' : 'outline'}
          size="sm"
          aria-pressed={theme === option.value}
          onClick={() => setTheme(option.value)}
          className="flex items-center gap-1"
        >
          {option.icon}
          <span className="sr-only">{option.label}</span>
        </Button>
      ))}
    </div>
  );
}
