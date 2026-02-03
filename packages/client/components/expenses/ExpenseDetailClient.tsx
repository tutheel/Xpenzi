"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useApiFetch } from "@/lib/api-client";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatMoney, formatDate } from "@xpenzi/shared/utils";
import { toast } from "sonner";

export function ExpenseDetailClient() {
  const params = useParams();
  const router = useRouter();
  const expenseId = params.expenseId as string;
  const { isLoaded, isSignedIn } = useAuth();
  const apiFetch = useApiFetch();
  const hasFetched = useRef(false);

  const [expense, setExpense] = useState<any | null>(null);
  const [group, setGroup] = useState<{ id: string; currency: string; name: string } | null>(null);
  const [members, setMembers] = useState<
    { userId: string; name: string; email: string }[]
  >([]);
  const [role, setRole] = useState<"ADMIN" | "MEMBER" | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isLoaded || !isSignedIn) return;

    setLoading(true);
    setError(null);
    try {
      const expenseData = await apiFetch<{ expense: any }>(`/api/expenses/${expenseId}`, {
        cache: "no-store",
      });
      const groupData = await apiFetch<{
        group: { id: string; currency: string; name: string };
        members: { userId: string; user: { name: string; email: string } }[];
        role: "ADMIN" | "MEMBER";
        currentUserId: string;
      }>(`/api/groups/${expenseData.expense.groupId}`, { cache: "no-store" });

      setExpense(expenseData.expense);
      setGroup(groupData.group);
      setRole(groupData.role);
      setCurrentUserId(groupData.currentUserId);
      setMembers(
        groupData.members.map((member) => ({
          userId: member.userId,
          name: member.user.name,
          email: member.user.email,
        })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load expense");
    } finally {
      setLoading(false);
    }
  }, [expenseId, apiFetch, isLoaded, isSignedIn]);

  useEffect(() => {
    if (isLoaded && isSignedIn && !hasFetched.current) {
      hasFetched.current = true;
      load();
    }
  }, [isLoaded, isSignedIn, load]);

  const handleDelete = async () => {
    try {
      await apiFetch(`/api/expenses/${expenseId}`, { method: "DELETE" });
      toast.success("Expense deleted");
      if (expense?.groupId) {
        router.push(`/app/groups/${expense.groupId}`);
      } else {
        router.push("/app");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete expense");
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
        {!isLoaded ? "Initializing..." : "Loading expense..."}
      </div>
    );
  }

  if (error || !expense || !group) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        {error || "Expense not found"}
      </div>
    );
  }

  const canEdit = role === "ADMIN" || expense.createdById === currentUserId;

  if (!canEdit) {
    return (
      <Card className="space-y-4 p-6">
        <div>
          <h1 className="font-display text-3xl">{expense.description}</h1>
          <p className="text-sm text-muted-foreground">{formatDate(expense.expenseDate)}</p>
        </div>
        <div className="text-sm">
          <p>
            Paid by <strong>{expense.paidBy?.name || expense.paidBy?.email}</strong>
          </p>
          <p>Total: {formatMoney(expense.totalAmount, expense.currency)}</p>
        </div>
      </Card>
    );
  }

  const initialExpense = {
    id: expense.id,
    description: expense.description,
    totalAmount: expense.totalAmount,
    currency: expense.currency,
    expenseDate: expense.expenseDate,
    paidById: expense.paidById,
    splitMethod: expense.splitMethod,
    participants: expense.participants,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Edit expense</h1>
          <p className="text-sm text-muted-foreground">{group.name}</p>
        </div>
        <Button variant="destructive" onClick={handleDelete}>
          Delete expense
        </Button>
      </div>
      <ExpenseForm
        key={expense.updatedAt ?? expense.id}
        groupId={group.id}
        currency={group.currency}
        members={members}
        initialExpense={initialExpense}
        onSaved={load}
      />
    </div>
  );
}
