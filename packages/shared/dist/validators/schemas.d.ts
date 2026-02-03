import { z } from "zod";
export declare const currencySchema: z.ZodString;
export declare const moneyStringSchema: z.ZodString;
export declare const groupCreateSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    currency: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    currency: string;
    description?: string | undefined;
}, {
    name: string;
    currency: string;
    description?: string | undefined;
}>;
export declare const addMemberSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const splitMethodSchema: z.ZodEnum<["EQUAL", "EXACT_AMOUNTS", "PERCENTAGES", "SHARES"]>;
export declare const expenseParticipantSchema: z.ZodObject<{
    userId: z.ZodString;
    amount: z.ZodOptional<z.ZodString>;
    percent: z.ZodOptional<z.ZodNumber>;
    shares: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    amount?: string | undefined;
    percent?: number | undefined;
    shares?: number | undefined;
}, {
    userId: string;
    amount?: string | undefined;
    percent?: number | undefined;
    shares?: number | undefined;
}>;
export declare const expenseSchema: z.ZodObject<{
    description: z.ZodString;
    totalAmount: z.ZodString;
    currency: z.ZodString;
    expenseDate: z.ZodString;
    paidById: z.ZodString;
    splitMethod: z.ZodEnum<["EQUAL", "EXACT_AMOUNTS", "PERCENTAGES", "SHARES"]>;
    participants: z.ZodArray<z.ZodObject<{
        userId: z.ZodString;
        amount: z.ZodOptional<z.ZodString>;
        percent: z.ZodOptional<z.ZodNumber>;
        shares: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        userId: string;
        amount?: string | undefined;
        percent?: number | undefined;
        shares?: number | undefined;
    }, {
        userId: string;
        amount?: string | undefined;
        percent?: number | undefined;
        shares?: number | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    description: string;
    currency: string;
    totalAmount: string;
    expenseDate: string;
    paidById: string;
    splitMethod: "EQUAL" | "EXACT_AMOUNTS" | "PERCENTAGES" | "SHARES";
    participants: {
        userId: string;
        amount?: string | undefined;
        percent?: number | undefined;
        shares?: number | undefined;
    }[];
}, {
    description: string;
    currency: string;
    totalAmount: string;
    expenseDate: string;
    paidById: string;
    splitMethod: "EQUAL" | "EXACT_AMOUNTS" | "PERCENTAGES" | "SHARES";
    participants: {
        userId: string;
        amount?: string | undefined;
        percent?: number | undefined;
        shares?: number | undefined;
    }[];
}>;
export declare const settlementSchema: z.ZodObject<{
    fromUserId: z.ZodString;
    toUserId: z.ZodString;
    amount: z.ZodString;
    currency: z.ZodString;
    settlementDate: z.ZodString;
    note: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    currency: string;
    amount: string;
    fromUserId: string;
    toUserId: string;
    settlementDate: string;
    note?: string | undefined;
}, {
    currency: string;
    amount: string;
    fromUserId: string;
    toUserId: string;
    settlementDate: string;
    note?: string | undefined;
}>;
export type ExpenseInput = z.infer<typeof expenseSchema>;
export type SettlementInput = z.infer<typeof settlementSchema>;
export type GroupCreateInput = z.infer<typeof groupCreateSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
//# sourceMappingURL=schemas.d.ts.map