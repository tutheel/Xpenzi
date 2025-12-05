import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getOrCreateDbUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const expense = await prisma.expense.findFirst({
    where: {
      receiptId: id,
      isDeleted: false,
      group: {
        members: {
          some: { userId: user.id },
        },
      },
    },
    include: {
      receipt: true,
    },
  });

  if (!expense || !expense.receipt) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return new NextResponse(expense.receipt.content, {
    status: 200,
    headers: {
      'Content-Type': expense.receipt.mimeType,
      'Cache-Control': 'private, max-age=0',
    },
  });
}
