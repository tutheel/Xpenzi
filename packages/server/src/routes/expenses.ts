import { Router, type Router as RouterType } from "express";
import prisma from "../lib/db.js";
import { jsonError, handleApiError } from "../lib/api.js";
import { requireAuth } from "../middleware/auth.js";
import { expenseSchema, computeSplitAmounts, parseMoneyToMinor } from "@xpenzi/shared";

const router: RouterType = Router();

function parseDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("INVALID_DATE");
  }
  return date;
}

async function getExpenseOrThrow(expenseId: string) {
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: { participants: true, group: true },
  });

  if (!expense || expense.isDeleted) {
    throw new Error("EXPENSE_NOT_FOUND");
  }

  return expense;
}

// GET /api/expenses/:id - Get expense details
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const user = req.user!;
    const expense = await getExpenseOrThrow(req.params.id);

    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: { groupId: expense.groupId, userId: user.id },
      },
    });

    if (!membership) {
      return jsonError(res, "Not authorized", 403);
    }

    const fullExpense = await prisma.expense.findUnique({
      where: { id: expense.id },
      include: {
        paidBy: { select: { id: true, name: true, email: true, imageUrl: true } },
        participants: true,
      },
    });

    return res.json({ expense: fullExpense });
  } catch (error) {
    if (error instanceof Error && error.message === "EXPENSE_NOT_FOUND") {
      return jsonError(res, "Expense not found", 404);
    }
    return handleApiError(res, error);
  }
});

// PATCH /api/expenses/:id - Update expense
router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const user = req.user!;
    const expense = await getExpenseOrThrow(req.params.id);

    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: expense.groupId, userId: user.id } },
    });

    if (!membership) {
      return jsonError(res, "Not authorized", 403);
    }

    if (membership.role !== "ADMIN" && expense.createdById !== user.id) {
      return jsonError(res, "Only admins or the creator can edit", 403);
    }

    const data = expenseSchema.parse(req.body);

    if (expense.group.currency.toUpperCase() !== data.currency.toUpperCase()) {
      return jsonError(res, "Currency must match group currency", 400);
    }

    const members = await prisma.groupMember.findMany({
      where: { groupId: expense.groupId },
      select: { userId: true },
    });
    const memberIds = new Set(members.map((member) => member.userId));

    if (!memberIds.has(data.paidById)) {
      return jsonError(res, "Payer must be a group member", 400);
    }

    for (const participant of data.participants) {
      if (!memberIds.has(participant.userId)) {
        return jsonError(res, "Participants must be group members", 400);
      }
    }

    const uniqueParticipants = new Set(data.participants.map((participant) => participant.userId));
    if (uniqueParticipants.size !== data.participants.length) {
      return jsonError(res, "Participants must be unique", 400);
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
        res,
        error instanceof Error ? error.message : "Invalid split configuration",
        400,
      );
    }

    const expenseDate = parseDate(data.expenseDate);

    const updated = await prisma.$transaction(async (tx) => {
      const saved = await tx.expense.update({
        where: { id: expense.id },
        data: {
          description: data.description,
          totalAmount,
          currency: data.currency.toUpperCase(),
          expenseDate,
          paidById: data.paidById,
          splitMethod: data.splitMethod,
        },
      });

      await tx.expenseParticipant.deleteMany({
        where: { expenseId: expense.id },
      });

      await tx.expenseParticipant.createMany({
        data: splits.map((split) => ({
          expenseId: expense.id,
          userId: split.userId,
          owedAmount: split.owedAmount,
          percent: split.percent ?? null,
          shares: split.shares ?? null,
        })),
      });

      return saved;
    });

    return res.json({ expense: updated });
  } catch (error) {
    if (error instanceof Error && error.message === "EXPENSE_NOT_FOUND") {
      return jsonError(res, "Expense not found", 404);
    }
    if (error instanceof Error && error.message === "INVALID_DATE") {
      return jsonError(res, "Invalid date", 400);
    }
    return handleApiError(res, error);
  }
});

// DELETE /api/expenses/:id - Soft delete expense
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const user = req.user!;
    const expense = await getExpenseOrThrow(req.params.id);

    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: expense.groupId, userId: user.id } },
    });

    if (!membership) {
      return jsonError(res, "Not authorized", 403);
    }

    if (membership.role !== "ADMIN" && expense.createdById !== user.id) {
      return jsonError(res, "Only admins or the creator can delete", 403);
    }

    await prisma.expense.update({
      where: { id: expense.id },
      data: { isDeleted: true },
    });

    return res.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "EXPENSE_NOT_FOUND") {
      return jsonError(res, "Expense not found", 404);
    }
    return handleApiError(res, error);
  }
});

export default router;
