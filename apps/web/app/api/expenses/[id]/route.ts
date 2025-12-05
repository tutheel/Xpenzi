import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth';
import { computeSplits } from '@/lib/splitMath';
import type { Prisma } from '@prisma/client';

const updateExpenseSchema = z.object({
  description: z.string().min(1).optional(),
  amountCents: z.number().int().positive().optional(),
  currency: z.string().min(1).optional(),
  category: z.string().optional(),
  expenseDate: z.string().transform((v) => new Date(v)).optional(),
  notes: z.string().optional(),
  splits: z
    .array(
      z.object({
        memberId: z.string().min(1),
        shareType: z.enum(['EQUAL', 'PERCENT', 'WEIGHT']),
        shareValue: z.number(),
      }),
    )
    .optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getOrCreateDbUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const expense = await prisma.expense.findUnique({
    where: { id },
    include: {
      group: {
        include: { members: true },
      },
    },
  });

  if (!expense) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const isMember = expense.group.members.some((m: { userId: string | null }) => m.userId === user.id);
  if (!isMember) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const json = await req.json().catch(() => null);
  const parsed = updateExpenseSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updates = parsed.data;
  let splitsData: ReturnType<typeof computeSplits> | undefined;
  if (updates.splits) {
    const amount = updates.amountCents ?? expense.amountCents;
    splitsData = computeSplits(amount, updates.splits);
  }

  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    if (splitsData) {
      await tx.expenseSplit.deleteMany({ where: { expenseId: id } });
      await tx.expenseSplit.createMany({
        data: splitsData.map((s) => ({
          expenseId: id,
          memberId: s.memberId,
          shareType: s.shareType,
          shareValue: s.shareValue,
          owedCents: s.owedCents,
        })),
      });
    }

    const updated = await tx.expense.update({
      where: { id },
      data: {
        description: updates.description ?? undefined,
        amountCents: updates.amountCents ?? undefined,
        currency: updates.currency ?? undefined,
        category: updates.category ?? undefined,
        expenseDate: updates.expenseDate ?? undefined,
        notes: updates.notes ?? undefined,
      },
      include: {
        splits: true,
      },
    });
    return updated;
  });

  return NextResponse.json(result);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getOrCreateDbUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const expense = await prisma.expense.findUnique({
    where: { id },
    include: { group: { include: { members: true } } },
  });
  if (!expense) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const isMember = expense.group.members.some((m: { userId: string | null }) => m.userId === user.id);
  if (!isMember) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await prisma.expense.update({
    where: { id },
    data: { isDeleted: true },
  });
  return NextResponse.json({ ok: true });
}
