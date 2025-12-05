import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExpenseForm } from '@/components/ExpenseForm';

type Params = { params: { id: string } } | { params: Promise<{ id: string }> };

export const dynamic = 'force-dynamic';

export default async function GroupExpensesPage({ params }: Params) {
  const resolved = 'then' in params ? await params : params;
  const groupId = resolved?.id;
  if (!groupId) {
    notFound();
  }

  const user = await getOrCreateDbUser();
  if (!user) notFound();

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: {
        include: { user: true },
        orderBy: { joinedAt: 'asc' },
      },
      expenses: {
        where: { isDeleted: false },
        orderBy: { expenseDate: 'desc' },
        include: {
          payer: { include: { user: true } },
          splits: { include: { member: { include: { user: true } } } },
          receipt: true,
        },
      },
    },
  });

  if (!group) {
    notFound();
  }

  const membership = group.members.find((m) => m.userId === user.id);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{group.name} expenses</h1>
          <p className="text-sm text-muted-foreground">Currency: {group.currency}</p>
        </div>
        <Link href={`/groups/${group.id}`} className="text-sm font-medium text-primary hover:underline">
          Back to group
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add expense</CardTitle>
          <CardDescription>Add a new expense for this group.</CardDescription>
        </CardHeader>
        <CardContent>
          <ExpenseForm
            groupId={group.id}
            members={group.members.map((m) => ({
              id: m.id,
              displayName: m.displayName || m.user?.name || m.user?.email || 'Member',
              user: m.user ? { name: m.user.name, email: m.user.email } : undefined,
            }))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
          <CardDescription>Recent expenses in this group.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {group.expenses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No expenses yet.</p>
          ) : (
            group.expenses.map((exp) => (
              <div key={exp.id} className="rounded-md border border-border p-3 space-y-1">
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">{exp.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(exp.expenseDate).toLocaleDateString()} · {exp.category || 'Uncategorized'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {(exp.amountCents / 100).toFixed(2)} {exp.currency}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Payer:{' '}
                      {exp.payer?.displayName ||
                        exp.payer?.user?.name ||
                        exp.payer?.user?.email ||
                        'Member'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  {exp.splits.map((s) => (
                    <Badge key={s.id} variant="secondary">
                      {s.member.displayName || s.member.user?.name || s.member.user?.email || 'Member'} ·{' '}
                      {(s.owedCents / 100).toFixed(2)} {exp.currency}
                    </Badge>
                  ))}
                  {exp.receiptId && (
                    <Link
                      href={`/api/receipts/${exp.receiptId}`}
                      className="text-primary hover:underline text-sm"
                      target="_blank"
                    >
                      View receipt
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
