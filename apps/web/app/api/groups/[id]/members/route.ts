import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth';
import { canManageMembers } from '@/lib/rbac';

const addMemberSchema = z
  .object({
    userEmail: z.string().email().optional(),
    displayName: z.string().min(1).optional(),
  })
  .refine((data) => data.userEmail || data.displayName, {
    message: 'userEmail or displayName is required',
    path: ['userEmail'],
  });

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getOrCreateDbUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const membership = await prisma.groupMember.findFirst({
    where: { groupId: id, userId: user.id },
  });

  if (!membership) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (!canManageMembers(membership.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  const json = await req.json().catch(() => null);
  const parsed = addMemberSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { userEmail, displayName } = parsed.data;

  let targetUserId: string | null = null;
  let nameToUse = displayName || userEmail || 'Member';

  if (userEmail) {
    const existingUser = await prisma.user.findFirst({ where: { email: userEmail } });
    if (existingUser) {
      const alreadyMember = await prisma.groupMember.findFirst({
        where: { groupId: id, userId: existingUser.id },
      });
      if (alreadyMember) {
        return NextResponse.json({ error: 'User already a member' }, { status: 400 });
      }
      targetUserId = existingUser.id;
      nameToUse = displayName || existingUser.name || existingUser.email || nameToUse;
    }
  }

  const member = await prisma.groupMember.create({
    data: {
      groupId: id,
      userId: targetUserId,
      displayName: nameToUse,
      role: 'MEMBER',
    },
  });

  return NextResponse.json(member, { status: 201 });
}
