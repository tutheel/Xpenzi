import { describe, expect, it } from 'vitest';
import { computeSplits, type SplitInput } from '../splitMath';

describe('computeSplits', () => {
  it('splits equally and balances remainder', () => {
    const inputs: SplitInput[] = [
      { memberId: 'a', shareType: 'EQUAL', shareValue: 1 },
      { memberId: 'b', shareType: 'EQUAL', shareValue: 1 },
      { memberId: 'c', shareType: 'EQUAL', shareValue: 1 },
    ];
    const result = computeSplits(100, inputs);
    expect(result.map((r) => r.owedCents)).toEqual([34, 33, 33]);
    expect(result.reduce((s, r) => s + r.owedCents, 0)).toBe(100);
  });

  it('splits by percent with banker rounding and balances', () => {
    const inputs: SplitInput[] = [
      { memberId: 'a', shareType: 'PERCENT', shareValue: 33.33 },
      { memberId: 'b', shareType: 'PERCENT', shareValue: 33.33 },
      { memberId: 'c', shareType: 'PERCENT', shareValue: 33.34 },
    ];
    const result = computeSplits(101, inputs);
    expect(result.reduce((s, r) => s + r.owedCents, 0)).toBe(101);
  });

  it('splits by weight and balances', () => {
    const inputs: SplitInput[] = [
      { memberId: 'a', shareType: 'WEIGHT', shareValue: 1 },
      { memberId: 'b', shareType: 'WEIGHT', shareValue: 2 },
    ];
    const result = computeSplits(100, inputs);
    expect(result.map((r) => r.owedCents)).toEqual([33, 67]);
    expect(result.reduce((s, r) => s + r.owedCents, 0)).toBe(100);
  });

  it('throws on mixed shareType', () => {
    const inputs: SplitInput[] = [
      { memberId: 'a', shareType: 'EQUAL', shareValue: 1 },
      { memberId: 'b', shareType: 'PERCENT', shareValue: 50 },
    ];
    expect(() => computeSplits(100, inputs)).toThrow();
  });
});
