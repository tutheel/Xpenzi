import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { computeGroupBalances } from "@/lib/balances";
import { getSuggestedSettlements } from "@/lib/suggestions";
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
      where: { groupId_userId: { groupId, userId: user.id } },
    });

    if (!membership) {
      return jsonError("Not authorized", 403);
    }

    const members = await prisma.groupMember.findMany({
      where: { groupId },
      include: { user: true, group: true },
      orderBy: { joinedAt: "asc" },
    });

    const expenses = await prisma.expense.findMany({
      where: { groupId, isDeleted: false },
      include: { participants: true },
    });

    const settlements = await prisma.settlement.findMany({
      where: { groupId },
    });

    const balances = computeGroupBalances({
      members: members.map((member) => ({
        userId: member.userId,
        user: {
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          imageUrl: member.user.imageUrl,
        },
      })),
      expenses: expenses.map((expense) => ({
        paidById: expense.paidById,
        totalAmount: expense.totalAmount,
        participants: expense.participants,
      })),
      settlements,
    });

    const suggestions = getSuggestedSettlements(
      balances.map((balance) => ({ userId: balance.userId, net: balance.net })),
    ).map((suggestion) => {
      const fromUser = members.find((member) => member.userId === suggestion.fromUserId);
      const toUser = members.find((member) => member.userId === suggestion.toUserId);
      return {
        ...suggestion,
        fromUser: fromUser
          ? {
              id: fromUser.user.id,
              name: fromUser.user.name,
              email: fromUser.user.email,
            }
          : null,
        toUser: toUser
          ? {
              id: toUser.user.id,
              name: toUser.user.name,
              email: toUser.user.email,
            }
          : null,
      };
    });

    return NextResponse.json({ suggestions, currency: members[0]?.group?.currency });
  } catch (error) {
    return handleApiError(error);
  }
}