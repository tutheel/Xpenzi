import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { addMemberSchema } from "@/lib/validators";
import { handleApiError, jsonError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await requireUser();
    const groupId = params.id;

    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: user.id,
        },
      },
    });

    if (!membership || membership.role !== "ADMIN") {
      return jsonError("Admin access required", 403);
    }

    const body = await request.json();
    const data = addMemberSchema.parse(body);

    const targetUser = await prisma.user.findFirst({
      where: { email: { equals: data.email.toLowerCase(), mode: "insensitive" } },
    });

    if (!targetUser) {
      return jsonError("User not found", 404);
    }

    const existing = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: targetUser.id,
        },
      },
    });

    if (existing) {
      return jsonError("User already in group", 409);
    }

    const newMember = await prisma.groupMember.create({
      data: {
        groupId,
        userId: targetUser.id,
        role: "MEMBER",
      },
      include: { user: true },
    });

    return NextResponse.json(
      {
        member: {
          id: newMember.id,
          userId: newMember.userId,
          role: newMember.role,
          joinedAt: newMember.joinedAt,
          user: {
            id: newMember.user.id,
            name: newMember.user.name,
            email: newMember.user.email,
            imageUrl: newMember.user.imageUrl,
          },
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}