import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddMemberForm } from '@/components/AddMemberForm';
import Link from 'next/link';

type Params =
  | { params: { id: string } }
  | { params: Promise<{ id: string }> };

export const dynamic = 'force-dynamic';

export default async function GroupDetailPage({ params }: Params) {
  const resolved = 'then' in params ? await params : params;
  const groupId = resolved?.id;
  if (!groupId) {
    notFound();
  }

  const user = await getOrCreateDbUser();
  if (!user) {
    notFound();
  }

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: {
        include: {
          user: true,
        },
        orderBy: { joinedAt: 'asc' },
      },
    },
  });

  if (!group) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Group not found</CardTitle>
          <CardDescription>The group you are looking for does not exist.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const membership = group.members.find((m:any) => m.userId === user?.id);
  if (!membership) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access denied</CardTitle>
          <CardDescription>You are not a member of this group.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{group.name}</CardTitle>
          <CardDescription>Currency: {group.currency}</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Members</CardTitle>
              <CardDescription>People in this group</CardDescription>
            </div>
            <Link href={`/groups/${group.id}/expenses`} className="text-sm font-medium text-primary hover:underline">
              View expenses
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {group.members.map((member:any) => (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-md border border-border px-4 py-3"
            >
              <div>
                <p className="font-semibold">
                  {member.displayName || member.user?.name || member.user?.email || 'Member'}
                </p>
                {member.user?.email && (
                  <p className="text-sm text-muted-foreground">{member.user.email}</p>
                )}
              </div>
              <Badge>{member.role}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add member</CardTitle>
          <CardDescription>Add by email or placeholder name.</CardDescription>
        </CardHeader>
        <CardContent>
          <AddMemberForm groupId={group.id} />
        </CardContent>
      </Card>
    </div>
  );
}
