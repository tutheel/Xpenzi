import type { UserSummary } from "./user.js";
export type SplitMethod = "EQUAL" | "EXACT_AMOUNTS" | "PERCENTAGES" | "SHARES";
export interface ExpenseParticipant {
    id: string;
    expenseId: string;
    userId: string;
    owedAmount: number;
    percent: number | null;
    shares: number | null;
}
export interface Expense {
    id: string;
    groupId: string;
    description: string;
    totalAmount: number;
    currency: string;
    expenseDate: Date;
    paidById: string;
    splitMethod: SplitMethod;
    createdById: string;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface ExpenseWithDetails extends Expense {
    paidBy: UserSummary;
    participants: ExpenseParticipant[];
}
//# sourceMappingURL=expense.d.ts.map