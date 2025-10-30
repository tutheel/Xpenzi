import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';
import { cn } from '@/lib/utils';
import { THEME_STORAGE_KEY } from '@/lib/theme';
import { AppProviders } from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const appName = process.env.NEXT_PUBLIC_APP_NAME ?? 'Zplit';

const themeInitScript = `
(() => {
  const storageKey = '${THEME_STORAGE_KEY}';
  const darkClass = 'dark';
  try {
    const storedTheme = window.localStorage.getItem(storageKey);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = storedTheme === 'light' || storedTheme === 'dark'
      ? storedTheme
      : (prefersDark ? 'dark' : 'light');
    document.documentElement.classList.toggle(darkClass, theme === 'dark');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (error) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
`;

export const metadata: Metadata = {
  title: `${appName} | Smarter shared budgets`,
  description:
    'Collaborative expense tracking with AI budgeting insights tailored for roommates, trips, and teams.',
  manifest: '/manifest.json',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={cn('min-h-screen bg-background font-sans antialiased', inter.variable)}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
