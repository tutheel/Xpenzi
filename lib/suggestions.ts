export type BalanceSummary = {
  userId: string;
  net: number;
};

export type SettlementSuggestion = {
  fromUserId: string;
  toUserId: string;
  amount: number;
};

export function getSuggestedSettlements(balances: BalanceSummary[]): SettlementSuggestion[] {
  const creditors = balances
    .filter((balance) => balance.net > 0)
    .map((balance) => ({ ...balance }))
    .sort((a, b) => b.net - a.net);

  const debtors = balances
    .filter((balance) => balance.net < 0)
    .map((balance) => ({ ...balance }))
    .sort((a, b) => a.net - b.net);

  const suggestions: SettlementSuggestion[] = [];
  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];

    const amount = Math.min(creditor.net, Math.abs(debtor.net));
    if (amount > 0) {
      suggestions.push({
        fromUserId: debtor.userId,
        toUserId: creditor.userId,
        amount,
      });
    }

    creditor.net -= amount;
    debtor.net += amount;

    if (creditor.net === 0) {
      creditorIndex += 1;
    }
    if (debtor.net === 0) {
      debtorIndex += 1;
    }
  }

  return suggestions;
}