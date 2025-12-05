export type SplitInput = {
  memberId: string;
  shareType: 'EQUAL' | 'PERCENT' | 'WEIGHT';
  shareValue: number;
};

export type SplitOutput = SplitInput & { owedCents: number };

function bankersRound(value: number): number {
  const floor = Math.floor(value);
  const diff = value - floor;
  if (diff > 0.5) return Math.ceil(value);
  if (diff < 0.5) return floor;
  return floor % 2 === 0 ? floor : floor + 1;
}

function adjustToTotal(owed: number[], raw: number[], total: number): number[] {
  const current = owed.reduce((a, b) => a + b, 0);
  let diff = total - current;
  if (diff === 0) return owed;

  const indexed = raw
    .map((val, idx) => ({ idx, frac: val - Math.floor(val) }))
    .sort((a, b) => (diff > 0 ? b.frac - a.frac : a.frac - b.frac));

  let i = 0;
  while (diff !== 0 && i < indexed.length) {
    owed[indexed[i].idx] += diff > 0 ? 1 : -1;
    diff += diff > 0 ? -1 : 1;
    i = (i + 1) % indexed.length;
  }
  return owed;
}

export function computeSplits(amountCents: number, splits: SplitInput[]): SplitOutput[] {
  if (amountCents <= 0) {
    throw new Error('amountCents must be > 0');
  }
  if (!splits.length) {
    throw new Error('At least one split entry required');
  }

  const shareType = splits[0].shareType;
  if (!splits.every((s) => s.shareType === shareType)) {
    throw new Error('All splits must use the same shareType');
  }

  let owed: number[] = [];
  if (shareType === 'EQUAL') {
    const base = Math.floor(amountCents / splits.length);
    const remainder = amountCents - base * splits.length;
    owed = splits.map((_, idx) => base + (idx < remainder ? 1 : 0));
  } else if (shareType === 'PERCENT') {
    const totalPercent = splits.reduce((sum, s) => sum + s.shareValue, 0);
    if (totalPercent <= 0) throw new Error('Total percent must be > 0');
    const raw = splits.map((s) => (amountCents * s.shareValue) / 100);
    owed = raw.map((r) => bankersRound(r));
    owed = adjustToTotal(owed, raw, amountCents);
  } else if (shareType === 'WEIGHT') {
    const totalWeight = splits.reduce((sum, s) => sum + s.shareValue, 0);
    if (totalWeight <= 0) throw new Error('Total weight must be > 0');
    const raw = splits.map((s) => (amountCents * s.shareValue) / totalWeight);
    owed = raw.map((r) => bankersRound(r));
    owed = adjustToTotal(owed, raw, amountCents);
  } else {
    throw new Error('Unsupported shareType');
  }

  const sum = owed.reduce((a, b) => a + b, 0);
  if (sum !== amountCents) {
    throw new Error('Split computation did not balance to total');
  }

  return splits.map((s, idx) => ({
    ...s,
    owedCents: owed[idx],
  }));
}
