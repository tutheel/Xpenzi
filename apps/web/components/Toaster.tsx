"use client";

import { Toaster as Sonner, toast } from 'sonner';
import { useTheme } from '@/lib/theme';

export function Toaster() {
  const { resolvedTheme } = useTheme();
  return <Sonner position="top-right" richColors theme={resolvedTheme} />;
}

export { toast };
