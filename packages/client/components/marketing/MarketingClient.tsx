"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MarketingClient() {
  return (
    <main className="min-h-screen bg-hero-gradient">
      <div className="bg-noise">
        <div className="container flex min-h-screen flex-col justify-between py-12">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xl font-semibold">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="font-display">Xpenzi</span>
            </div>
            <div className="flex items-center gap-3">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button variant="ghost">Sign in</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button>Get started</Button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Button asChild>
                  <Link href="/app">Open app</Link>
                </Button>
              </SignedIn>
            </div>
          </header>

          <section className="grid gap-12 lg:grid-cols-[1.2fr,0.8fr] lg:items-center motion-safe:animate-in motion-safe:fade-in motion-safe:duration-700">
            <div className="space-y-6">
              <p className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground">
                <span className="rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
                  MVP
                </span>
                Split with precision, settle with confidence.
              </p>
              <h1 className="font-display text-4xl leading-tight md:text-5xl">
                Track shared expenses without the awkward math.
              </h1>
              <p className="text-lg text-muted-foreground">
                Xpenzi keeps group spending honest with partial splits, exact shares, and
                transparent settlements. Everything lives in one ledger, so everyone stays on
                the same page.
              </p>
              <div className="flex flex-wrap gap-4">
                <SignedOut>
                  <SignUpButton mode="modal">
                    <Button size="lg" className="gap-2">
                      Create your first group
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </SignUpButton>
                  <SignInButton mode="modal">
                    <Button size="lg" variant="outline">
                      I already have an account
                    </Button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <Button size="lg" className="gap-2" asChild>
                    <Link href="/app">
                      Go to dashboard
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </SignedIn>
              </div>
            </div>
            <div className="rounded-3xl bg-card/80 p-8 shadow-glow backdrop-blur motion-safe:animate-in motion-safe:slide-in-from-bottom-6 motion-safe:duration-700">
              <div className="space-y-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    Real-world groups
                  </p>
                  <h2 className="font-display text-2xl">Lunch, rent, trips, and shared work</h2>
                </div>
                <div className="space-y-4">
                  {[
                    "Split only the people involved",
                    "Handle exact amounts and percentages",
                    "See who owes what instantly",
                    "Settle up with smart suggestions",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/60 p-4"
                    >
                      <span className="mt-1 h-2 w-2 rounded-full bg-accent" />
                      <p className="text-sm text-muted-foreground">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <footer className="flex items-center justify-between text-xs text-muted-foreground">
            <p>Designed for accurate group money flows.</p>
            <p>Built with Next.js, Clerk, Prisma, and PostgreSQL.</p>
          </footer>
        </div>
      </div>
    </main>
  );
}
