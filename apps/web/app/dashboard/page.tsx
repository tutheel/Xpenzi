import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getOrCreateDbUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddGroupForm } from '@/components/AddGroupForm';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getOrCreateDbUser();
  if (!user) {
    const signInRoute = '/sign-in' as const;
    redirect(signInRoute);
  }

  const memberships = await prisma.groupMember.findMany({
    where: { userId: user.id },
    include: { group: true },
    orderBy: { joinedAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription>Manage your groups and members.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Welcome{user.name ? `, ${user.name}` : ''}! Your primary email is{' '}
            <span className="font-medium text-foreground">{user.email}</span>.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Groups</CardTitle>
          <CardDescription>Create a group or view existing ones.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AddGroupForm />
          <div className="space-y-3">
            {memberships.length === 0 ? (
              <p className="text-sm text-muted-foreground">No groups yet. Create one to get started.</p>
            ) : (
              memberships.map((m:any) => (
                <div
                  key={m.group.id}
                  className="flex items-center justify-between rounded-md border border-border px-4 py-3"
                >
                  <div>
                    <Link href={`/groups/${m.group.id}`} className="font-semibold hover:underline">
                      {m.group.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">{m.group.currency}</p>
                  </div>
                  <Badge>{m.role}</Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
