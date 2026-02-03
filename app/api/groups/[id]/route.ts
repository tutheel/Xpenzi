import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { handleApiError, jsonError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
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
      include: { group: true },
    });

    if (!membership) {
      return jsonError("Not authorized", 403);
    }

    const members = await prisma.groupMember.findMany({
      where: { groupId },
      include: { user: true },
      orderBy: { joinedAt: "asc" },
    });

    return NextResponse.json({
      group: membership.group,
      role: membership.role,
      currentUserId: user.id,
      members: members.map((member) => ({
        id: member.id,
        userId: member.userId,
        role: member.role,
        joinedAt: member.joinedAt,
        user: {
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          imageUrl: member.user.imageUrl,
        },
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
