import type { Route } from 'next';
import Link from 'next/link';

export default function HomePage() {
  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-16">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Shared expenses with <span className="text-primary">AI clarity</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          Track group spending, automate settlements, and surface budgeting insights before your
          next hang. Built for roommates, friend trips, and scrappy teams.
        </p>
      </div>
      <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Link
          className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          href={'/groups/new' as Route}
        >
          Start a group
        </Link>
        <Link
          className="rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          href={'/demo' as Route}
        >
          Explore demo
        </Link>
      </div>
      <div className="grid gap-4 rounded-xl border border-dashed border-border bg-card/70 p-6 text-left">
        <h2 className="text-lg font-semibold text-foreground">Stage 0 scaffolding</h2>
        <p className="text-sm text-muted-foreground">
          This layout wires up Clerk, Tailwind, shadcn-inspired tokens, and testing utilities.
          Upcoming stages will introduce tenant-aware data, budgeting insights, and full workflows.
        </p>
      </div>
    </section>
  );
}
