import './globals.css';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/lib/theme';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Toaster } from '@/components/Toaster';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClerkProvider } from '@clerk/nextjs';

const inter = Inter({ subsets: ['latin'] });
const publishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_xpenzi_placeholder';
if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
  console.warn('Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY. Using placeholder; set a real key for auth.');
}

export const metadata = {
  title: 'Xpenzi',
  description: 'Shared expense and budgeting made simple.',
  manifest: '/manifest.json',
};

export const viewport = {
  themeColor: '#0f172a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClerkProvider publishableKey={publishableKey}>
          <ThemeProvider>
            <ServiceWorkerRegister />
            <div className="min-h-screen bg-background text-foreground">
              <header className="border-b bg-card/60 backdrop-blur-sm">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground font-semibold">
                      XP
                    </div>
                    <div>
                      <p className="text-lg font-semibold">Xpenzi</p>
                      <p className="text-sm text-muted-foreground">Shared expenses, simplified.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ThemeToggle />
                  </div>
                </div>
              </header>
              <main className="mx-auto max-w-5xl px-6 py-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Welcome</CardTitle>
                    <CardDescription>Shared expense and budgeting app shell.</CardDescription>
                  </CardHeader>
                  <CardContent>{children}</CardContent>
                </Card>
              </main>
            </div>
            <Toaster />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
