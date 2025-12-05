import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth';

const createGroupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  currency: z.string().min(1, 'Currency is required'),
});

export async function POST(request: Request) {
  const user = await getOrCreateDbUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = createGroupSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, currency } = parsed.data;
  const group = await prisma.group.create({
    data: {
      name,
      currency,
      createdById: user.id,
      members: {
        create: {
          userId: user.id,
          displayName: user.name ?? user.email ?? 'Owner',
          role: 'OWNER',
        },
      },
    },
    include: {
      members: true,
    },
  });

  return NextResponse.json(group, { status: 201 });
}

export async function GET() {
  const user = await getOrCreateDbUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const memberships = await prisma.groupMember.findMany({
    where: { userId: user.id },
    include: { group: true },
  });

  const groups = memberships.map((m:any) => ({
    id: m.group.id,
    name: m.group.name,
    currency: m.group.currency,
    role: m.role,
  }));

  return NextResponse.json(groups);
}
