import type { UserSummary } from "./user.js";

export interface Settlement {
  id: string;
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: string;
  settlementDate: Date;
  note: string | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SettlementWithUsers extends Settlement {
  fromUser: UserSummary;
  toUser: UserSummary;
}

/** Raw suggestion output from settlement algorithm (no user info) */
export interface SettlementSuggestionRaw {
  fromUserId: string;
  toUserId: string;
  amount: number;
}

/** Settlement suggestion with user info for API responses */
export interface SettlementSuggestion extends SettlementSuggestionRaw {
  fromUser: Pick<UserSummary, "id" | "name" | "email"> | null;
  toUser: Pick<UserSummary, "id" | "name" | "email"> | null;
}
