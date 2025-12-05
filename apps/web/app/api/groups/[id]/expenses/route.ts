import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth';
import { computeSplits } from '@/lib/splitMath';

const createExpenseSchema = z.object({
  description: z.string().min(1),
  amountCents: z.number().int().positive(),
  currency: z.string().min(1),
  category: z.string().optional(),
  expenseDate: z.string().transform((v) => new Date(v)),
  notes: z.string().optional(),
  payerMemberId: z.string().min(1),
  receiptId: z.string().optional(),
  splits: z
    .array(
      z.object({
        memberId: z.string().min(1),
        shareType: z.enum(['EQUAL', 'PERCENT', 'WEIGHT']),
        shareValue: z.number(),
      }),
    )
    .min(1),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getOrCreateDbUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const membership = await prisma.groupMember.findFirst({
    where: { groupId: id, userId: user.id },
  });
  if (!membership) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const url = new URL(req.url);
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');
  const category = url.searchParams.get('category');

  const where: any = { groupId: id, isDeleted: false };
  if (from || to) {
    where.expenseDate = {};
    if (from) where.expenseDate.gte = new Date(from);
    if (to) where.expenseDate.lte = new Date(to);
  }
  if (category) {
    where.category = category;
  }

  const expenses = await prisma.expense.findMany({
    where,
    orderBy: { expenseDate: 'desc' },
    include: {
      payer: { include: { user: true } },
      splits: { include: { member: { include: { user: true } } } },
      receipt: true,
    },
  });

  return NextResponse.json(expenses);
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getOrCreateDbUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const membership = await prisma.groupMember.findFirst({
    where: { groupId: id, userId: user.id },
  });
  if (!membership) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const json = await req.json().catch(() => null);
  const parsed = createExpenseSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const splitsComputed = computeSplits(data.amountCents, data.splits);

  const expense = await prisma.expense.create({
    data: {
      groupId: id,
      payerMemberId: data.payerMemberId,
      description: data.description,
      amountCents: data.amountCents,
      currency: data.currency,
      category: data.category,
      expenseDate: data.expenseDate,
      notes: data.notes,
      receiptId: data.receiptId,
      status: 'APPROVED',
      createdById: user.id,
      splits: {
        create: splitsComputed.map((s) => ({
          memberId: s.memberId,
          shareType: s.shareType,
          shareValue: s.shareValue,
          owedCents: s.owedCents,
        })),
      },
    },
    include: {
      payer: true,
      splits: true,
    },
  });

  return NextResponse.json(expense, { status: 201 });
}
