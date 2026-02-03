import type { SettlementSuggestionRaw } from "../types/settlement.js";
export type { SettlementSuggestionRaw };
export type BalanceSummary = {
    userId: string;
    net: number;
};
export declare function getSuggestedSettlements(balances: BalanceSummary[]): SettlementSuggestionRaw[];
//# sourceMappingURL=suggestions.d.ts.map