import type { ExpenseParticipant, Settlement, User } from "@prisma/client";

export type BalanceMember = {
  userId: string;
  user: Pick<User, "id" | "name" | "email" | "imageUrl">;
};

export type BalanceExpense = {
  paidById: string;
  totalAmount: number;
  participants: Pick<ExpenseParticipant, "userId" | "owedAmount">[];
};

export function computeGroupBalances(options: {
  members: BalanceMember[];
  expenses: BalanceExpense[];
  settlements: Pick<Settlement, "fromUserId" | "toUserId" | "amount">[];
}) {
  const { members, expenses, settlements } = options;
  const balances = new Map<string, number>();

  members.forEach((member) => balances.set(member.userId, 0));

  expenses.forEach((expense) => {
    const paid = balances.get(expense.paidById) ?? 0;
    balances.set(expense.paidById, paid + expense.totalAmount);

    expense.participants.forEach((participant) => {
      const owed = balances.get(participant.userId) ?? 0;
      balances.set(participant.userId, owed - participant.owedAmount);
    });
  });

  settlements.forEach((settlement) => {
    const from = balances.get(settlement.fromUserId) ?? 0;
    balances.set(settlement.fromUserId, from + settlement.amount);

    const to = balances.get(settlement.toUserId) ?? 0;
    balances.set(settlement.toUserId, to - settlement.amount);
  });

  return members.map((member) => ({
    userId: member.userId,
    user: member.user,
    net: balances.get(member.userId) ?? 0,
  }));
}