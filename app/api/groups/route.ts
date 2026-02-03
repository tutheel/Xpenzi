import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { groupCreateSchema } from "@/lib/validators";
import { handleApiError, jsonError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    const memberships = await prisma.groupMember.findMany({
      where: { userId: user.id },
      include: { group: true },
      orderBy: { joinedAt: "desc" },
    });

    const groupIds = memberships.map((membership) => membership.groupId);

    const expenses = await prisma.expense.findMany({
      where: { groupId: { in: groupIds }, isDeleted: false },
      include: { participants: true },
    });

    const settlements = await prisma.settlement.findMany({
      where: { groupId: { in: groupIds } },
    });

    const netByGroup = new Map<string, number>();

    groupIds.forEach((groupId) => netByGroup.set(groupId, 0));

    expenses.forEach((expense) => {
      if (expense.paidById === user.id) {
        netByGroup.set(
          expense.groupId,
          (netByGroup.get(expense.groupId) ?? 0) + expense.totalAmount,
        );
      }

      expense.participants.forEach((participant) => {
        if (participant.userId === user.id) {
          netByGroup.set(
            expense.groupId,
            (netByGroup.get(expense.groupId) ?? 0) - participant.owedAmount,
          );
        }
      });
    });

    settlements.forEach((settlement) => {
      if (settlement.fromUserId === user.id) {
        netByGroup.set(
          settlement.groupId,
          (netByGroup.get(settlement.groupId) ?? 0) + settlement.amount,
        );
      }
      if (settlement.toUserId === user.id) {
        netByGroup.set(
          settlement.groupId,
          (netByGroup.get(settlement.groupId) ?? 0) - settlement.amount,
        );
      }
    });

    const groups = memberships.map((membership) => ({
      id: membership.group.id,
      name: membership.group.name,
      description: membership.group.description,
      currency: membership.group.currency,
      createdAt: membership.group.createdAt,
      role: membership.role,
      yourNet: netByGroup.get(membership.groupId) ?? 0,
    }));

    return NextResponse.json({ groups });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const data = groupCreateSchema.parse(body);

    const group = await prisma.$transaction(async (tx) => {
      const created = await tx.group.create({
        data: {
          name: data.name,
          description: data.description,
          currency: data.currency.toUpperCase(),
          createdById: user.id,
        },
      });

      await tx.groupMember.create({
        data: {
          groupId: created.id,
          userId: user.id,
          role: "ADMIN",
        },
      });

      return created;
    });

    return NextResponse.json({ group }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return jsonError("Group already exists", 409);
    }
    return handleApiError(error);
  }
}