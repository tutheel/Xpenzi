import type { UserSummary } from "../types/user.js";
export type BalanceMember = {
    userId: string;
    user: Pick<UserSummary, "id" | "name" | "email" | "imageUrl">;
};
export type BalanceExpense = {
    paidById: string;
    totalAmount: number;
    participants: {
        userId: string;
        owedAmount: number;
    }[];
};
export type BalanceSettlement = {
    fromUserId: string;
    toUserId: string;
    amount: number;
};
export declare function computeGroupBalances(options: {
    members: BalanceMember[];
    expenses: BalanceExpense[];
    settlements: BalanceSettlement[];
}): {
    userId: string;
    user: Pick<UserSummary, "id" | "name" | "email" | "imageUrl">;
    net: number;
}[];
//# sourceMappingURL=balances.d.ts.map