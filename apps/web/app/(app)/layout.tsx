import Link from 'next/link';

import { ServiceWorkerRegister } from '@/components/service-worker-register';
import { ThemeToggle } from '@/components/theme-toggle';

const appName = process.env.NEXT_PUBLIC_APP_NAME ?? 'Zplit';

const sidebarLinks: { href: string; label: string; description: string }[] = [
  {
    href: '/',
    label: 'Overview',
    description: 'Latest activity across your shared budgets.',
  },
  {
    href: '/groups/demo',
    label: 'Groups',
    description: 'Manage roommates, friends, or team budgets.',
  },
  {
    href: '/recurring',
    label: 'Recurring',
    description: 'Upcoming expenses and reminders.',
  },
  {
    href: '/trips',
    label: 'Trips',
    description: 'Plan and track travel budgets together.',
  },
];

const headerLinks: { href: string; label: string }[] = [
  { href: '/', label: 'Home' },
  { href: '/groups/demo', label: 'Groups' },
  { href: '/recurring', label: 'Recurring' },
  { href: '/trips', label: 'Trips' },
  { href: '/settings', label: 'Settings' },
];

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-72 border-r border-border bg-card/30 md:flex md:flex-col">
        <div className="border-b border-border px-6 py-6">
          <Link href="/" className="text-xl font-semibold tracking-tight text-foreground">
            {appName}
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">
            Collaborative expense hub with AI-powered insights.
          </p>
        </div>
        <nav className="flex-1 space-y-4 px-6 py-6">
          {sidebarLinks.map(({ href, label, description }) => (
            <Link
              key={href}
              href={href}
              className="block rounded-lg border border-transparent bg-card/40 p-4 text-left transition hover:border-primary/30 hover:bg-card/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <div className="text-sm font-semibold">{label}</div>
              <p className="text-xs text-muted-foreground">{description}</p>
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-border px-6 py-4 text-xs text-muted-foreground">
          Built for the Stage 1 theming &amp; PWA shell milestone.
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <ServiceWorkerRegister />
        <header className="border-b border-border bg-card/60 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-8">
            <nav className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
              {headerLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-full px-3 py-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  {label}
                </Link>
              ))}
            </nav>
            <ThemeToggle />
          </div>
        </header>

        <main className="flex flex-1 flex-col bg-background">
          <div className="flex-1 px-4 py-8 sm:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
