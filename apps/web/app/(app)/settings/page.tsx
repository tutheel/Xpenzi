export default function SettingsPage() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          This placeholder will evolve into tenant-aware preferences, notification settings, and
          billing controls.
        </p>
      </header>

      <div className="rounded-lg border border-border bg-card/50 p-6 text-sm text-muted-foreground">
        <p>
          For now, use this page to verify navigation, theming persistence, and offline readiness in
          the PWA shell.
        </p>
      </div>
    </section>
  );
}
