import type { SplitMethod } from "../types/expense.js";

export type { SplitMethod };

export type SplitParticipantInput = {
  userId: string;
  amount?: number;
  percent?: number;
  shares?: number;
};

export type SplitResult = {
  userId: string;
  owedAmount: number;
  percent?: number;
  shares?: number;
};

export function parseMoneyToMinor(input: string | number) {
  const raw = String(input).trim();
  if (!/^\d+(\.\d{1,2})?$/.test(raw)) {
    throw new Error("INVALID_MONEY_FORMAT");
  }

  const [whole, decimal = ""] = raw.split(".");
  const normalizedDecimal = decimal.padEnd(2, "0").slice(0, 2);
  const minor = Number(whole) * 100 + Number(normalizedDecimal || 0);
  if (!Number.isFinite(minor)) {
    throw new Error("INVALID_MONEY_FORMAT");
  }

  return minor;
}

export function formatMoney(amountMinor: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amountMinor / 100);
}

export function minorToString(amountMinor: number) {
  return (amountMinor / 100).toFixed(2);
}

function distributeRemainder(
  participants: SplitParticipantInput[],
  baseAmounts: Map<string, number>,
  remainder: number,
) {
  const sorted = [...participants].sort((a, b) => a.userId.localeCompare(b.userId));
  let index = 0;
  while (remainder > 0 && sorted.length > 0) {
    const participant = sorted[index % sorted.length];
    const current = baseAmounts.get(participant.userId) ?? 0;
    baseAmounts.set(participant.userId, current + 1);
    remainder -= 1;
    index += 1;
  }
}

export function computeSplitAmounts(options: {
  totalAmount: number;
  splitMethod: SplitMethod;
  participants: SplitParticipantInput[];
}): SplitResult[] {
  const { totalAmount, splitMethod, participants } = options;

  if (participants.length === 0) {
    throw new Error("NO_PARTICIPANTS");
  }

  if (totalAmount <= 0) {
    throw new Error("TOTAL_MUST_BE_POSITIVE");
  }

  if (splitMethod === "EXACT_AMOUNTS") {
    const missing = participants.find((p) => typeof p.amount !== "number");
    if (missing) {
      throw new Error("MISSING_EXACT_AMOUNTS");
    }

    const sum = participants.reduce((acc, p) => acc + (p.amount ?? 0), 0);
    if (sum !== totalAmount) {
      throw new Error("EXACT_AMOUNTS_MUST_MATCH_TOTAL");
    }

    return participants.map((p) => ({ userId: p.userId, owedAmount: p.amount ?? 0 }));
  }

  if (splitMethod === "PERCENTAGES") {
    const missing = participants.find((p) => typeof p.percent !== "number");
    if (missing) {
      throw new Error("MISSING_PERCENTAGES");
    }

    const sumPercent = participants.reduce((acc, p) => acc + (p.percent ?? 0), 0);
    if (sumPercent !== 100) {
      throw new Error("PERCENTAGES_MUST_SUM_100");
    }

    const baseAmounts = new Map<string, number>();
    let sum = 0;
    participants.forEach((p) => {
      const owed = Math.floor((totalAmount * (p.percent ?? 0)) / 100);
      baseAmounts.set(p.userId, owed);
      sum += owed;
    });

    const remainder = totalAmount - sum;
    distributeRemainder(participants, baseAmounts, remainder);

    return participants.map((p) => ({
      userId: p.userId,
      owedAmount: baseAmounts.get(p.userId) ?? 0,
      percent: p.percent,
    }));
  }

  if (splitMethod === "SHARES") {
    const missing = participants.find((p) => typeof p.shares !== "number");
    if (missing) {
      throw new Error("MISSING_SHARES");
    }

    const totalShares = participants.reduce((acc, p) => acc + (p.shares ?? 0), 0);
    if (totalShares <= 0) {
      throw new Error("SHARES_MUST_BE_POSITIVE");
    }

    const baseAmounts = new Map<string, number>();
    let sum = 0;
    participants.forEach((p) => {
      const owed = Math.floor((totalAmount * (p.shares ?? 0)) / totalShares);
      baseAmounts.set(p.userId, owed);
      sum += owed;
    });

    const remainder = totalAmount - sum;
    distributeRemainder(participants, baseAmounts, remainder);

    return participants.map((p) => ({
      userId: p.userId,
      owedAmount: baseAmounts.get(p.userId) ?? 0,
      shares: p.shares,
    }));
  }

  const baseAmount = Math.floor(totalAmount / participants.length);
  const baseAmounts = new Map<string, number>();
  participants.forEach((p) => baseAmounts.set(p.userId, baseAmount));
  const remainder = totalAmount - baseAmount * participants.length;
  distributeRemainder(participants, baseAmounts, remainder);

  return participants.map((p) => ({
    userId: p.userId,
    owedAmount: baseAmounts.get(p.userId) ?? 0,
  }));
}
