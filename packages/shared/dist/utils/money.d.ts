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
export declare function parseMoneyToMinor(input: string | number): number;
export declare function formatMoney(amountMinor: number, currency: string): string;
export declare function minorToString(amountMinor: number): string;
export declare function computeSplitAmounts(options: {
    totalAmount: number;
    splitMethod: SplitMethod;
    participants: SplitParticipantInput[];
}): SplitResult[];
//# sourceMappingURL=money.d.ts.map