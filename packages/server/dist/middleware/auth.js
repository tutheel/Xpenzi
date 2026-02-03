import { clerkClient, getAuth } from "@clerk/express";
import prisma from "../lib/db.js";
function getPrimaryEmail(user) {
    const primary = user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId);
    return primary?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? null;
}
function mapClerkUser(user) {
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
export async function ensureUserFromClerkId(clerkUserId) {
    const user = await clerkClient.users.getUser(clerkUserId);
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
// Middleware to require authentication
export async function requireAuth(req, res, next) {
    try {
        const auth = getAuth(req);
        if (!auth.userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const user = await ensureUserFromClerkId(auth.userId);
        req.user = user;
        next();
    }
    catch (error) {
        if (error instanceof Error && error.message === "CLERK_USER_MISSING_EMAIL") {
            return res.status(400).json({ message: "User email is missing" });
        }
        return res.status(401).json({ message: "Unauthorized" });
    }
}
