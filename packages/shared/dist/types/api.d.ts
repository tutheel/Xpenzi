import type { GroupSummary, GroupDetail, GroupMember } from "./group.js";
import type { ExpenseWithDetails, Expense } from "./expense.js";
import type { Settlement, SettlementWithUsers, SettlementSuggestion } from "./settlement.js";
import type { UserSummary } from "./user.js";
export interface ApiError {
    message: string;
}
export interface GetGroupsResponse {
    groups: GroupSummary[];
}
export interface CreateGroupRequest {
    name: string;
    description?: string;
    currency: string;
}
export interface CreateGroupResponse {
    group: {
        id: string;
        name: string;
        description: string | null;
        currency: string;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
    };
}
export interface GetGroupResponse extends GroupDetail {
}
export interface AddMemberRequest {
    email: string;
}
export interface AddMemberResponse {
    member: GroupMember;
}
export interface GetExpensesResponse {
    expenses: ExpenseWithDetails[];
}
export interface ExpenseParticipantInput {
    userId: string;
    amount?: string;
    percent?: number;
    shares?: number;
}
export interface CreateExpenseRequest {
    description: string;
    totalAmount: string;
    currency: string;
    expenseDate: string;
    paidById: string;
    splitMethod: "EQUAL" | "EXACT_AMOUNTS" | "PERCENTAGES" | "SHARES";
    participants: ExpenseParticipantInput[];
}
export interface CreateExpenseResponse {
    expense: Expense;
}
export interface GetExpenseResponse {
    expense: ExpenseWithDetails;
}
export interface UpdateExpenseResponse {
    expense: Expense;
}
export interface DeleteExpenseResponse {
    success: boolean;
}
export interface BalanceEntry {
    userId: string;
    user: UserSummary;
    net: number;
}
export interface GetBalancesResponse {
    balances: BalanceEntry[];
    currency: string;
}
export interface GetSettlementsResponse {
    settlements: SettlementWithUsers[];
}
export interface CreateSettlementRequest {
    fromUserId: string;
    toUserId: string;
    amount: string;
    currency: string;
    settlementDate: string;
    note?: string;
}
export interface CreateSettlementResponse {
    settlement: Settlement;
}
export interface GetSuggestionsResponse {
    suggestions: SettlementSuggestion[];
    currency: string;
}
//# sourceMappingURL=api.d.ts.map