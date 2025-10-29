import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';
import { cn } from '@/lib/utils';
import { AppProviders } from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const appName = process.env.NEXT_PUBLIC_APP_NAME ?? 'Zplit'; // placeholder brand

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
    <html lang="en" suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background font-sans antialiased', inter.variable)}>
        <AppProviders>
          <div className="flex min-h-screen flex-col">
            <header className="border-b border-border bg-card/80 backdrop-blur">
              <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
                <span className="text-lg font-semibold tracking-tight text-foreground">
                  {appName}
                </span>
                <span className="text-sm text-muted-foreground">Shared budgets made simple.</span>
              </div>
            </header>
            <main className="flex-1">{children}</main>
            <footer className="border-t border-border bg-muted/30">
              <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
                <span className="text-xs text-muted-foreground">
                  &copy; {new Date().getFullYear()} {appName}. All rights reserved.
                </span>
              </div>
            </footer>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
