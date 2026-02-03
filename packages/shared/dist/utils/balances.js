export function computeGroupBalances(options) {
    const { members, expenses, settlements } = options;
    const balances = new Map();
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
//# sourceMappingURL=balances.js.map