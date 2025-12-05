import { currentUser } from '@clerk/nextjs/server';
import { prisma } from './db';

export type AuthUser = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
};

export type DbUser = {
  id: string;
  clerkUserId: string;
  email: string;
  name: string | null;
  createdAt: Date;
};

export async function getCurrentUser(): Promise<AuthUser | null> {
  const user = await currentUser();
  if (!user) return null;

  const email = user.primaryEmailAddress?.emailAddress ?? null;
  const name = user.firstName || user.lastName ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : null;

  await prisma.user.upsert({
    where: { clerkUserId: user.id },
    update: {
      email: email ?? undefined,
      name: name || undefined,
    },
    create: {
      clerkUserId: user.id,
      email: email ?? 'unknown@user.local',
      name,
    },
  });

  return {
    id: user.id,
    email,
    firstName: user.firstName ?? null,
    lastName: user.lastName ?? null,
  };
}

export async function getOrCreateDbUser(): Promise<DbUser | null> {
  const user = await currentUser();
  if (!user) return null;
  const email = user.primaryEmailAddress?.emailAddress ?? null;
  const name = user.firstName || user.lastName ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : null;

  const dbUser = await prisma.user.upsert({
    where: { clerkUserId: user.id },
    update: {
      email: email ?? undefined,
      name: name || undefined,
    },
    create: {
      clerkUserId: user.id,
      email: email ?? 'unknown@user.local',
      name,
    },
  });

  return dbUser;
}
