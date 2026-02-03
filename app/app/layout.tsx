import { ensureUserForAppLayout } from "@/lib/auth";
import { AppShell } from "@/components/layout/AppShell";
import { Navbar } from "@/components/layout/Navbar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await ensureUserForAppLayout();

  return (
    <AppShell>
      <Navbar />
      <main className="container py-8">{children}</main>
    </AppShell>
  );
}