"use client";

import { useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useApiFetch } from "@/lib/api-client";
import {
  moneyStringSchema,
  splitMethodSchema,
} from "@xpenzi/shared/validators";
import {
  computeSplitAmounts,
  formatMoney,
  minorToString,
  parseMoneyToMinor,
} from "@xpenzi/shared/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const participantSchema = z.object({
  userId: z.string().cuid(),
  included: z.boolean(),
  amount: z.union([moneyStringSchema, z.literal("")]).optional(),
  percent: z.preprocess(
    (value) => (value === "" || value === undefined ? undefined : Number(value)),
    z.number().int().min(0).max(100).optional(),
  ),
  shares: z.preprocess(
    (value) => (value === "" || value === undefined ? undefined : Number(value)),
    z.number().int().min(0).optional(),
  ),
});

const expenseFormSchema = z
  .object({
    description: z.string().min(1, "Description is required"),
    totalAmount: moneyStringSchema,
    currency: z.string().min(3),
    expenseDate: z.string().min(1, "Date is required"),
    paidById: z.string().cuid(),
    splitMethod: splitMethodSchema,
    participants: z.array(participantSchema).min(1),
  })
  .superRefine((data, ctx) => {
    const included = data.participants.filter((participant) => participant.included);
    if (included.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select at least one participant",
        path: ["participants"],
      });
      return;
    }

    if (data.splitMethod === "EXACT_AMOUNTS") {
      const missing = included.find((participant) => !participant.amount);
      if (missing) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Exact amounts are required",
          path: ["participants"],
        });
      }
    }

    if (data.splitMethod === "PERCENTAGES") {
      const missing = included.find((participant) => participant.percent === undefined);
      if (missing) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Percentages are required",
          path: ["participants"],
        });
      }
    }

    if (data.splitMethod === "SHARES") {
      const missing = included.find((participant) => participant.shares === undefined);
      if (missing) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Shares are required",
          path: ["participants"],
        });
      }
    }
  });

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

type Member = {
  userId: string;
  name: string;
  email: string;
};

type ExpenseParticipant = {
  userId: string;
  owedAmount: number;
  percent?: number | null;
  shares?: number | null;
};

type ExpenseData = {
  id: string;
  description: string;
  totalAmount: number;
  currency: string;
  expenseDate: string;
  paidById: string;
  splitMethod: "EQUAL" | "EXACT_AMOUNTS" | "PERCENTAGES" | "SHARES";
  participants: ExpenseParticipant[];
};

export function ExpenseForm({
  groupId,
  currency,
  members,
  initialExpense,
  onSaved,
}: {
  groupId: string;
  currency: string;
  members: Member[];
  initialExpense?: ExpenseData;
  onSaved?: () => void;
}) {
  const apiFetch = useApiFetch();
  const defaultParticipants = members.map((member) => {
    const existing = initialExpense?.participants.find(
      (participant) => participant.userId === member.userId,
    );
    return {
      userId: member.userId,
      included: Boolean(existing) || !initialExpense,
      amount: existing ? minorToString(existing.owedAmount) : "",
      percent: existing?.percent ?? undefined,
      shares: existing?.shares ?? undefined,
    };
  });

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      description: initialExpense?.description ?? "",
      totalAmount: initialExpense ? minorToString(initialExpense.totalAmount) : "",
      currency: initialExpense?.currency ?? currency,
      expenseDate: initialExpense
        ? initialExpense.expenseDate.slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      paidById: initialExpense?.paidById ?? members[0]?.userId ?? "",
      splitMethod: initialExpense?.splitMethod ?? "EQUAL",
      participants: defaultParticipants,
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "participants",
  });

  const values = form.watch();

  const summary = useMemo(() => {
    const included = values.participants.filter((participant) => participant.included);
    if (!values.totalAmount || included.length === 0) {
      return { splits: [], error: "" };
    }

    try {
      const totalAmountMinor = parseMoneyToMinor(values.totalAmount);
      const splits = computeSplitAmounts({
        totalAmount: totalAmountMinor,
        splitMethod: values.splitMethod,
        participants: included.map((participant) => ({
          userId: participant.userId,
          amount: participant.amount ? parseMoneyToMinor(participant.amount) : undefined,
          percent: (() => {
            if (participant.percent === undefined || participant.percent === null) {
              return undefined;
            }
            const value = Number(participant.percent);
            return Number.isNaN(value) ? undefined : value;
          })(),
          shares: (() => {
            if (participant.shares === undefined || participant.shares === null) {
              return undefined;
            }
            const value = Number(participant.shares);
            return Number.isNaN(value) ? undefined : value;
          })(),
        })),
      });
      return { splits, error: "" };
    } catch (error) {
      return {
        splits: [],
        error: error instanceof Error ? error.message : "Split is invalid",
      };
    }
  }, [values]);

  const onSubmit = async (data: ExpenseFormValues) => {
    const participants = data.participants
      .filter((participant) => participant.included)
      .map((participant) => ({
        userId: participant.userId,
        amount: participant.amount ? participant.amount : undefined,
        percent: participant.percent,
        shares: participant.shares,
      }));

    const payload = {
      description: data.description,
      totalAmount: data.totalAmount,
      currency: data.currency,
      expenseDate: data.expenseDate,
      paidById: data.paidById,
      splitMethod: data.splitMethod,
      participants,
    };

    try {
      if (initialExpense) {
        await apiFetch(`/api/expenses/${initialExpense.id}`, {
          method: "PATCH",
          json: payload,
        });
        toast.success("Expense updated");
      } else {
        await apiFetch(`/api/groups/${groupId}/expenses`, {
          method: "POST",
          json: payload,
        });
        toast.success("Expense created");
      }

      onSaved?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save expense");
    }
  };

  return (
    <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
      <input type="hidden" {...form.register("currency")} />
      <input type="hidden" {...form.register("paidById")} />
      <input type="hidden" {...form.register("splitMethod")} />
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Step 1: Details</TabsTrigger>
          <TabsTrigger value="participants">Step 2: Participants</TabsTrigger>
          <TabsTrigger value="split">Step 3: Split</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Dinner at Khao Gully"
                {...form.register("description")}
              />
              {form.formState.errors.description && (
                <p className="text-xs text-red-500">{form.formState.errors.description.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Total amount ({currency})</Label>
              <Input placeholder="0.00" {...form.register("totalAmount")} />
              {form.formState.errors.totalAmount && (
                <p className="text-xs text-red-500">{form.formState.errors.totalAmount.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" {...form.register("expenseDate")} />
              {form.formState.errors.expenseDate && (
                <p className="text-xs text-red-500">{form.formState.errors.expenseDate.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Paid by</Label>
              <Select
                value={values.paidById}
                onValueChange={(value) => form.setValue("paidById", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.userId} value={member.userId}>
                      {member.name || member.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.paidById && (
                <p className="text-xs text-red-500">{form.formState.errors.paidById.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Split method</Label>
              <Select
                value={values.splitMethod}
                onValueChange={(value) =>
                  form.setValue("splitMethod", value as ExpenseFormValues["splitMethod"])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select split" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EQUAL">Equal</SelectItem>
                  <SelectItem value="EXACT_AMOUNTS">Exact amounts</SelectItem>
                  <SelectItem value="PERCENTAGES">Percentages</SelectItem>
                  <SelectItem value="SHARES">Shares</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="participants">
          <Card className="space-y-4 p-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center justify-between">
                <label className="flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-input"
                    {...form.register(`participants.${index}.included` as const)}
                  />
                  <span>{members[index]?.name || members[index]?.email}</span>
                </label>
                <Badge variant={values.participants[index]?.included ? "success" : "outline"}>
                  {values.participants[index]?.included ? "Included" : "Excluded"}
                </Badge>
              </div>
            ))}
          </Card>
          {form.formState.errors.participants && (
            <p className="text-xs text-red-500">{form.formState.errors.participants.message as string}</p>
          )}
        </TabsContent>

        <TabsContent value="split">
          <Card className="space-y-4 p-4">
            {fields.map((field, index) => {
              const participant = values.participants[index];
              const isIncluded = participant?.included;
              return (
                <div key={field.id} className="grid gap-3 md:grid-cols-3 md:items-center">
                  <div className="text-sm font-medium">
                    {members[index]?.name || members[index]?.email}
                    {!isIncluded && (
                      <span className="ml-2 text-xs text-muted-foreground">Excluded</span>
                    )}
                  </div>
                  {values.splitMethod === "EXACT_AMOUNTS" && (
                    <Input
                      placeholder="0.00"
                      disabled={!isIncluded}
                      {...form.register(`participants.${index}.amount` as const)}
                    />
                  )}
                  {values.splitMethod === "PERCENTAGES" && (
                    <Input
                      placeholder="0"
                      type="number"
                      disabled={!isIncluded}
                      {...form.register(`participants.${index}.percent` as const)}
                    />
                  )}
                  {values.splitMethod === "SHARES" && (
                    <Input
                      placeholder="0"
                      type="number"
                      disabled={!isIncluded}
                      {...form.register(`participants.${index}.shares` as const)}
                    />
                  )}
                  {values.splitMethod === "EQUAL" && (
                    <p className="text-xs text-muted-foreground">Equal split</p>
                  )}
                </div>
              );
            })}
            {summary.error && (
              <p className="text-xs text-red-500">{summary.error}</p>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Live summary</p>
          <Badge variant={summary.error ? "warning" : "success"}>
            {summary.error ? "Needs attention" : "Balanced"}
          </Badge>
        </div>
        <div className="space-y-2 text-sm">
          {summary.splits.length === 0 && (
            <p className="text-muted-foreground">Add participants and amounts to preview splits.</p>
          )}
          {summary.splits.map((split) => {
            const member = members.find((m) => m.userId === split.userId);
            return (
              <div key={split.userId} className="flex items-center justify-between">
                <span>{member?.name || member?.email}</span>
                <span className="font-semibold">
                  {formatMoney(split.owedAmount, currency)}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button type="submit">{initialExpense ? "Update expense" : "Create expense"}</Button>
      </div>
    </form>
  );
}
