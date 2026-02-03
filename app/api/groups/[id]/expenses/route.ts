import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { expenseSchema } from "@/lib/validators";
import { handleApiError, jsonError } from "@/lib/api";
import { computeSplitAmounts, parseMoneyToMinor } from "@/lib/money";

export const dynamic = "force-dynamic";

function parseDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("INVALID_DATE");
  }
  return date;
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await requireUser();
    const groupId = params.id;

    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId: user.id },
      },
    });

    if (!membership) {
      return jsonError("Not authorized", 403);
    }

    const expenses = await prisma.expense.findMany({
      where: { groupId, isDeleted: false },
      include: {
        paidBy: { select: { id: true, name: true, email: true, imageUrl: true } },
        participants: true,
      },
      orderBy: { expenseDate: "desc" },
    });

    return NextResponse.json({ expenses });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: Request,
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

    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) {
      return jsonError("Group not found", 404);
    }

    const body = await request.json();
    const data = expenseSchema.parse(body);

    if (group.currency.toUpperCase() !== data.currency.toUpperCase()) {
      return jsonError("Currency must match group currency", 400);
    }

    const members = await prisma.groupMember.findMany({
      where: { groupId },
      select: { userId: true },
    });
    const memberIds = new Set(members.map((member) => member.userId));

    if (!memberIds.has(data.paidById)) {
      return jsonError("Payer must be a group member", 400);
    }

    for (const participant of data.participants) {
      if (!memberIds.has(participant.userId)) {
        return jsonError("Participants must be group members", 400);
      }
    }

    const uniqueParticipants = new Set(data.participants.map((participant) => participant.userId));
    if (uniqueParticipants.size !== data.participants.length) {
      return jsonError("Participants must be unique", 400);
    }

    const totalAmount = parseMoneyToMinor(data.totalAmount);
    const participantInputs = data.participants.map((participant) => ({
      userId: participant.userId,
      amount: participant.amount ? parseMoneyToMinor(participant.amount) : undefined,
      percent: participant.percent,
      shares: participant.shares,
    }));

    let splits;
    try {
      splits = computeSplitAmounts({
        totalAmount,
        splitMethod: data.splitMethod,
        participants: participantInputs,
      });
    } catch (error) {
      return jsonError(
        error instanceof Error ? error.message : "Invalid split configuration",
        400,
      );
    }

    const expenseDate = parseDate(data.expenseDate);

    const expense = await prisma.$transaction(async (tx) => {
      const created = await tx.expense.create({
        data: {
          groupId,
          description: data.description,
          totalAmount,
          currency: data.currency.toUpperCase(),
          expenseDate,
          paidById: data.paidById,
          splitMethod: data.splitMethod,
          createdById: user.id,
        },
      });

      await tx.expenseParticipant.createMany({
        data: splits.map((split) => ({
          expenseId: created.id,
          userId: split.userId,
          owedAmount: split.owedAmount,
          percent: split.percent ?? null,
          shares: split.shares ?? null,
        })),
      });

      return created;
    });

    return NextResponse.json({ expense }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_DATE") {
      return jsonError("Invalid date", 400);
    }
    return handleApiError(error);
  }
}
