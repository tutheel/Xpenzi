import { clerkClient, getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";
import prisma from "../lib/db.js";

// Types for Clerk user
interface ClerkEmailAddress {
  id: string;
  emailAddress: string;
}

interface ClerkUser {
  id: string;
  primaryEmailAddressId: string | null;
  emailAddresses: ClerkEmailAddress[];
  fullName: string | null;
  username: string | null;
  imageUrl: string;
}

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

export async function ensureUserFromClerkId(clerkUserId: string) {
  const user = await clerkClient.users.getUser(clerkUserId);
  const data = mapClerkUser(user as unknown as ClerkUser);
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

// Middleware to require authentication
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    console.log("[Auth] Authorization header:", authHeader ? `Bearer ${authHeader.substring(7, 20)}...` : "Missing");

    const auth = getAuth(req);
    console.log("[Auth] getAuth result:", JSON.stringify({ userId: auth.userId, sessionId: auth.sessionId }));

    if (!auth.userId) {
      console.log("[Auth] No userId found in request");
      return res.status(401).json({ message: "Unauthorized - No user ID" });
    }

    console.log("[Auth] Authenticated user:", auth.userId);
    const user = await ensureUserFromClerkId(auth.userId);
    req.user = user;
    next();
  } catch (error) {
    console.error("[Auth] Error:", error);
    if (error instanceof Error && error.message === "CLERK_USER_MISSING_EMAIL") {
      return res.status(400).json({ message: "User email is missing" });
    }
    return res.status(401).json({ message: "Unauthorized - Auth failed" });
  }
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        clerkUserId: string;
        email: string;
        name: string;
        imageUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
      };
    }
  }
}
