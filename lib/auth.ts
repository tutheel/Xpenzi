import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import type { User as ClerkUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";

function getPrimaryEmail(user: ClerkUser) {
  const primary = user.emailAddresses.find(
    (email) => email.id === user.primaryEmailAddressId,
  );
  return primary?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? null;
}

function mapClerkUser(user: ClerkUser) {
  const email = getPrimaryEmail(user);
  if (!email) {
    throw new Error("CLERK_USER_MISSING_EMAIL");
  }

  return {
    clerkUserId: user.id,
    email: email.toLowerCase(),
    name: user.fullName || user.username || email,
    imageUrl: user.imageUrl || null,
  };
}

export async function ensureUserFromClerkUser(user: ClerkUser) {
  const data = mapClerkUser(user);
  return prisma.user.upsert({
    where: { clerkUserId: data.clerkUserId },
    update: {
      email: data.email,
      name: data.name,
      imageUrl: data.imageUrl,
    },
    create: data,
  });
}

export async function ensureUserFromClerkId(clerkUserId: string) {
  const user = await clerkClient.users.getUser(clerkUserId);
  return ensureUserFromClerkUser(user);
}

export async function requireUser() {
  const { userId } = auth();
  if (!userId) {
    throw new Error("UNAUTHORIZED");
  }

  return ensureUserFromClerkId(userId);
}

export async function ensureUserForAppLayout() {
  const user = await currentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  return ensureUserFromClerkUser(user);
}