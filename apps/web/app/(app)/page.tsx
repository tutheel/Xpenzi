export default function HomePage() {
  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-wide text-primary">Stage 1</p>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to Zplit</h1>
        <p className="text-muted-foreground">
          Your budgeting HQ is ready. Flip the theme, pin it to your home screen, and explore the
          shell that will power upcoming expense flows.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card/60 p-6">
          <h2 className="text-lg font-semibold">What&apos;s in this build</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>- Responsive navigation shell with sidebar and top navigation.</li>
            <li>- Theme toggle that persists locally.</li>
            <li>- Install-ready PWA manifest plus service worker registration.</li>
            <li>- Placeholder routes to scaffold future flows.</li>
          </ul>
        </div>

        <div className="rounded-xl border border-dashed border-border bg-background p-6">
          <h2 className="text-lg font-semibold">Next up</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>- Tenant-aware data fetching and caching.</li>
            <li>- Expense workflows with AI-assisted insights.</li>
            <li>- Push notifications and offline-first features.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
