import { Router } from "express";
import prisma from "../lib/db.js";
import { jsonError, handleApiError } from "../lib/api.js";
import { requireAuth } from "../middleware/auth.js";
import { groupCreateSchema, addMemberSchema, expenseSchema, settlementSchema, computeSplitAmounts, parseMoneyToMinor, computeGroupBalances, getSuggestedSettlements, } from "@xpenzi/shared";
const router = Router();
function parseDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        throw new Error("INVALID_DATE");
    }
    return date;
}
// GET /api/groups - List user's groups
router.get("/", requireAuth, async (req, res) => {
    try {
        const user = req.user;
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
        const netByGroup = new Map();
        groupIds.forEach((groupId) => netByGroup.set(groupId, 0));
        expenses.forEach((expense) => {
            if (expense.paidById === user.id) {
                netByGroup.set(expense.groupId, (netByGroup.get(expense.groupId) ?? 0) + expense.totalAmount);
            }
            expense.participants.forEach((participant) => {
                if (participant.userId === user.id) {
                    netByGroup.set(expense.groupId, (netByGroup.get(expense.groupId) ?? 0) - participant.owedAmount);
                }
            });
        });
        settlements.forEach((settlement) => {
            if (settlement.fromUserId === user.id) {
                netByGroup.set(settlement.groupId, (netByGroup.get(settlement.groupId) ?? 0) + settlement.amount);
            }
            if (settlement.toUserId === user.id) {
                netByGroup.set(settlement.groupId, (netByGroup.get(settlement.groupId) ?? 0) - settlement.amount);
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
        return res.json({ groups });
    }
    catch (error) {
        return handleApiError(res, error);
    }
});
// POST /api/groups - Create a new group
router.post("/", requireAuth, async (req, res) => {
    try {
        const user = req.user;
        const data = groupCreateSchema.parse(req.body);
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
        return res.status(201).json({ group });
    }
    catch (error) {
        if (error instanceof Error && error.message.includes("Unique constraint")) {
            return jsonError(res, "Group already exists", 409);
        }
        return handleApiError(res, error);
    }
});
// GET /api/groups/:id - Get group details
router.get("/:id", requireAuth, async (req, res) => {
    try {
        const user = req.user;
        const groupId = req.params.id;
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
            return jsonError(res, "Not authorized", 403);
        }
        const members = await prisma.groupMember.findMany({
            where: { groupId },
            include: { user: true },
            orderBy: { joinedAt: "asc" },
        });
        return res.json({
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
    }
    catch (error) {
        return handleApiError(res, error);
    }
});
// POST /api/groups/:id/members - Add a member
router.post("/:id/members", requireAuth, async (req, res) => {
    try {
        const user = req.user;
        const groupId = req.params.id;
        const membership = await prisma.groupMember.findUnique({
            where: {
                groupId_userId: {
                    groupId,
                    userId: user.id,
                },
            },
        });
        if (!membership || membership.role !== "ADMIN") {
            return jsonError(res, "Admin access required", 403);
        }
        const data = addMemberSchema.parse(req.body);
        const targetUser = await prisma.user.findFirst({
            where: { email: { equals: data.email.toLowerCase(), mode: "insensitive" } },
        });
        if (!targetUser) {
            return jsonError(res, "User not found", 404);
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
            return jsonError(res, "User already in group", 409);
        }
        const newMember = await prisma.groupMember.create({
            data: {
                groupId,
                userId: targetUser.id,
                role: "MEMBER",
            },
            include: { user: true },
        });
        return res.status(201).json({
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
        });
    }
    catch (error) {
        return handleApiError(res, error);
    }
});
// GET /api/groups/:id/expenses - List group expenses
router.get("/:id/expenses", requireAuth, async (req, res) => {
    try {
        const user = req.user;
        const groupId = req.params.id;
        const membership = await prisma.groupMember.findUnique({
            where: {
                groupId_userId: { groupId, userId: user.id },
            },
        });
        if (!membership) {
            return jsonError(res, "Not authorized", 403);
        }
        const expenses = await prisma.expense.findMany({
            where: { groupId, isDeleted: false },
            include: {
                paidBy: { select: { id: true, name: true, email: true, imageUrl: true } },
                participants: true,
            },
            orderBy: { expenseDate: "desc" },
        });
        return res.json({ expenses });
    }
    catch (error) {
        return handleApiError(res, error);
    }
});
// POST /api/groups/:id/expenses - Create expense
router.post("/:id/expenses", requireAuth, async (req, res) => {
    try {
        const user = req.user;
        const groupId = req.params.id;
        const membership = await prisma.groupMember.findUnique({
            where: { groupId_userId: { groupId, userId: user.id } },
        });
        if (!membership) {
            return jsonError(res, "Not authorized", 403);
        }
        const group = await prisma.group.findUnique({ where: { id: groupId } });
        if (!group) {
            return jsonError(res, "Group not found", 404);
        }
        const data = expenseSchema.parse(req.body);
        if (group.currency.toUpperCase() !== data.currency.toUpperCase()) {
            return jsonError(res, "Currency must match group currency", 400);
        }
        const members = await prisma.groupMember.findMany({
            where: { groupId },
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
        }
        catch (error) {
            return jsonError(res, error instanceof Error ? error.message : "Invalid split configuration", 400);
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
        return res.status(201).json({ expense });
    }
    catch (error) {
        if (error instanceof Error && error.message === "INVALID_DATE") {
            return jsonError(res, "Invalid date", 400);
        }
        return handleApiError(res, error);
    }
});
// GET /api/groups/:id/balances - Get group balances
router.get("/:id/balances", requireAuth, async (req, res) => {
    try {
        const user = req.user;
        const groupId = req.params.id;
        const membership = await prisma.groupMember.findUnique({
            where: { groupId_userId: { groupId, userId: user.id } },
        });
        if (!membership) {
            return jsonError(res, "Not authorized", 403);
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
        return res.json({ balances, currency: members[0]?.group?.currency });
    }
    catch (error) {
        return handleApiError(res, error);
    }
});
// GET /api/groups/:id/settlements - List settlements
router.get("/:id/settlements", requireAuth, async (req, res) => {
    try {
        const user = req.user;
        const groupId = req.params.id;
        const membership = await prisma.groupMember.findUnique({
            where: { groupId_userId: { groupId, userId: user.id } },
        });
        if (!membership) {
            return jsonError(res, "Not authorized", 403);
        }
        const settlements = await prisma.settlement.findMany({
            where: { groupId },
            include: {
                fromUser: { select: { id: true, name: true, email: true, imageUrl: true } },
                toUser: { select: { id: true, name: true, email: true, imageUrl: true } },
            },
            orderBy: { settlementDate: "desc" },
        });
        return res.json({ settlements });
    }
    catch (error) {
        return handleApiError(res, error);
    }
});
// POST /api/groups/:id/settlements - Create settlement
router.post("/:id/settlements", requireAuth, async (req, res) => {
    try {
        const user = req.user;
        const groupId = req.params.id;
        const membership = await prisma.groupMember.findUnique({
            where: { groupId_userId: { groupId, userId: user.id } },
        });
        if (!membership) {
            return jsonError(res, "Not authorized", 403);
        }
        const group = await prisma.group.findUnique({ where: { id: groupId } });
        if (!group) {
            return jsonError(res, "Group not found", 404);
        }
        const data = settlementSchema.parse(req.body);
        if (data.fromUserId === data.toUserId) {
            return jsonError(res, "Sender and receiver must be different", 400);
        }
        if (group.currency.toUpperCase() !== data.currency.toUpperCase()) {
            return jsonError(res, "Currency must match group currency", 400);
        }
        const members = await prisma.groupMember.findMany({
            where: { groupId },
            select: { userId: true },
        });
        const memberIds = new Set(members.map((member) => member.userId));
        if (!memberIds.has(data.fromUserId) || !memberIds.has(data.toUserId)) {
            return jsonError(res, "Settlement users must be group members", 400);
        }
        const amount = parseMoneyToMinor(data.amount);
        if (amount <= 0) {
            return jsonError(res, "Amount must be positive", 400);
        }
        const settlementDate = parseDate(data.settlementDate);
        const settlement = await prisma.$transaction(async (tx) => tx.settlement.create({
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
        }));
        return res.status(201).json({ settlement });
    }
    catch (error) {
        if (error instanceof Error && error.message === "INVALID_DATE") {
            return jsonError(res, "Invalid date", 400);
        }
        return handleApiError(res, error);
    }
});
// GET /api/groups/:id/suggestions - Get settlement suggestions
router.get("/:id/suggestions", requireAuth, async (req, res) => {
    try {
        const user = req.user;
        const groupId = req.params.id;
        const membership = await prisma.groupMember.findUnique({
            where: { groupId_userId: { groupId, userId: user.id } },
        });
        if (!membership) {
            return jsonError(res, "Not authorized", 403);
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
        const suggestions = getSuggestedSettlements(balances.map((balance) => ({ userId: balance.userId, net: balance.net }))).map((suggestion) => {
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
        return res.json({ suggestions, currency: members[0]?.group?.currency });
    }
    catch (error) {
        return handleApiError(res, error);
    }
});
export default router;
