import { z } from "zod";

export const currencySchema = z.string().min(3).max(5);

export const moneyStringSchema = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, "Invalid money format");

export const groupCreateSchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().max(280).optional(),
  currency: currencySchema,
});

export const addMemberSchema = z.object({
  email: z.string().email(),
});

export const splitMethodSchema = z.enum([
  "EQUAL",
  "EXACT_AMOUNTS",
  "PERCENTAGES",
  "SHARES",
]);

export const expenseParticipantSchema = z.object({
  userId: z.string().cuid(),
  amount: moneyStringSchema.optional(),
  percent: z.number().int().min(0).max(100).optional(),
  shares: z.number().int().min(0).optional(),
});

export const expenseSchema = z.object({
  description: z.string().min(1).max(200),
  totalAmount: moneyStringSchema,
  currency: currencySchema,
  expenseDate: z.string().min(1),
  paidById: z.string().cuid(),
  splitMethod: splitMethodSchema,
  participants: z.array(expenseParticipantSchema).min(1),
});

export const settlementSchema = z.object({
  fromUserId: z.string().cuid(),
  toUserId: z.string().cuid(),
  amount: moneyStringSchema,
  currency: currencySchema,
  settlementDate: z.string().min(1),
  note: z.string().max(280).optional(),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;
export type SettlementInput = z.infer<typeof settlementSchema>;