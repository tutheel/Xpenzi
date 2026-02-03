export interface User {
    id: string;
    clerkUserId: string;
    email: string;
    name: string;
    imageUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface UserSummary {
    id: string;
    name: string;
    email: string;
    imageUrl: string | null;
}
//# sourceMappingURL=user.d.ts.map