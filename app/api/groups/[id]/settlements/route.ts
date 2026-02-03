import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { settlementSchema } from "@/lib/validators";
import { handleApiError, jsonError } from "@/lib/api";
import { parseMoneyToMinor } from "@/lib/money";

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
      where: { groupId_userId: { groupId, userId: user.id } },
    });

    if (!membership) {
      return jsonError("Not authorized", 403);
    }

    const settlements = await prisma.settlement.findMany({
      where: { groupId },
      include: {
        fromUser: { select: { id: true, name: true, email: true, imageUrl: true } },
        toUser: { select: { id: true, name: true, email: true, imageUrl: true } },
      },
      orderBy: { settlementDate: "desc" },
    });

    return NextResponse.json({ settlements });
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
    const data = settlementSchema.parse(body);

    if (data.fromUserId === data.toUserId) {
      return jsonError("Sender and receiver must be different", 400);
    }

    if (group.currency.toUpperCase() !== data.currency.toUpperCase()) {
      return jsonError("Currency must match group currency", 400);
    }

    const members = await prisma.groupMember.findMany({
      where: { groupId },
      select: { userId: true },
    });
    const memberIds = new Set(members.map((member) => member.userId));

    if (!memberIds.has(data.fromUserId) || !memberIds.has(data.toUserId)) {
      return jsonError("Settlement users must be group members", 400);
    }

    const amount = parseMoneyToMinor(data.amount);
    if (amount <= 0) {
      return jsonError("Amount must be positive", 400);
    }

    const settlementDate = parseDate(data.settlementDate);

    const settlement = await prisma.$transaction(async (tx) =>
      tx.settlement.create({
        data: {
          groupId,
          fromUserId: data.fromUserId,
          toUserId: data.toUserId,
          amount,
          currency: data.currency.toUpperCase(),
          settlementDate,
          note: data.note,
          createdById: user.id,
        },
      }),
    );

    return NextResponse.json({ settlement }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_DATE") {
      return jsonError("Invalid date", 400);
    }
    return handleApiError(error);
  }
}
