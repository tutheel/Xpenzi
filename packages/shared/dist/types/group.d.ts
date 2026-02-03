import type { UserSummary } from "./user.js";
export type GroupRole = "ADMIN" | "MEMBER";
export interface Group {
    id: string;
    name: string;
    description: string | null;
    currency: string;
    createdById: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface GroupSummary {
    id: string;
    name: string;
    description: string | null;
    currency: string;
    createdAt: Date;
    role: GroupRole;
    yourNet: number;
}
export interface GroupMember {
    id: string;
    userId: string;
    role: GroupRole;
    joinedAt: Date;
    user: UserSummary;
}
export interface GroupDetail {
    group: Group;
    role: GroupRole;
    currentUserId: string;
    members: GroupMember[];
}
//# sourceMappingURL=group.d.ts.map