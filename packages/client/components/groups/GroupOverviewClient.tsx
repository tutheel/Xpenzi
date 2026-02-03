"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useApiFetch } from "@/lib/api-client";
import { formatMoney } from "@xpenzi/shared/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AddMemberDialog } from "@/components/groups/AddMemberDialog";
import { ExpenseTable, type ExpenseListItem } from "@/components/expenses/ExpenseTable";
import { SettlementHistory, type SettlementListItem } from "@/components/settlements/SettlementHistory";
import { SuggestionsPanel, type SuggestionItem } from "@/components/settlements/SuggestionsPanel";
import { RefreshCw } from "lucide-react";

type GroupInfo = {
  id: string;
  name: string;
  description?: string | null;
  currency: string;
};

type MemberInfo = {
  userId: string;
  role: "ADMIN" | "MEMBER";
  user: { id: string; name: string; email: string; imageUrl?: string | null };
};

type BalanceItem = {
  userId: string;
  user: { id: string; name: string; email: string; imageUrl?: string | null };
  net: number;
};

export function GroupOverviewClient() {
  const params = useParams();
  const groupId = params.groupId as string;
  const { isLoaded, isSignedIn } = useAuth();
  const apiFetch = useApiFetch();
  const hasFetched = useRef(false);

  const [group, setGroup] = useState<GroupInfo | null>(null);
  const [role, setRole] = useState<MemberInfo["role"] | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<ExpenseListItem[]>([]);
  const [balances, setBalances] = useState<BalanceItem[]>([]);
  const [settlements, setSettlements] = useState<SettlementListItem[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGroup = useCallback(async () => {
    if (!isLoaded || !isSignedIn) return;

    setLoading(true);
    setError(null);
    try {
      const [groupData, expenseData, balancesData, settlementsData, suggestionsData] =
        await Promise.all([
          apiFetch<{
            group: GroupInfo;
            members: MemberInfo[];
            role: MemberInfo["role"];
            currentUserId: string;
          }>(`/api/groups/${groupId}`, { cache: "no-store" }),
          apiFetch<{ expenses: ExpenseListItem[] }>(`/api/groups/${groupId}/expenses`, {
            cache: "no-store",
          }),
          apiFetch<{ balances: BalanceItem[] }>(`/api/groups/${groupId}/balances`, {
            cache: "no-store",
          }),
          apiFetch<{ settlements: SettlementListItem[] }>(`/api/groups/${groupId}/settlements`, {
            cache: "no-store",
          }),
          apiFetch<{ suggestions: SuggestionItem[] }>(`/api/groups/${groupId}/suggestions`, {
            cache: "no-store",
          }),
        ]);

      setGroup(groupData.group);
      setRole(groupData.role);
      setCurrentUserId(groupData.currentUserId);
      setExpenses(expenseData.expenses);
      setBalances(balancesData.balances);
      setSettlements(settlementsData.settlements.slice(0, 5));
      setSuggestions(suggestionsData.suggestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load group");
    } finally {
      setLoading(false);
    }
  }, [groupId, apiFetch, isLoaded, isSignedIn]);

  useEffect(() => {
    if (isLoaded && isSignedIn && !hasFetched.current) {
      hasFetched.current = true;
      loadGroup();
    }
  }, [isLoaded, isSignedIn, loadGroup]);

  if (!isLoaded || loading) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
        {!isLoaded ? "Initializing..." : "Loading group..."}
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        {error || "Group not found"}
      </div>
    );
  }

  const yourNet = balances.find((balance) => balance.userId === currentUserId)?.net ?? 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">{group.name}</h1>
          <p className="text-sm text-muted-foreground">{group.description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="icon" onClick={loadGroup}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button asChild>
            <Link href={`/app/groups/${group.id}/expenses/new`}>Add expense</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/app/groups/${group.id}/settlements`}>Settle up</Link>
          </Button>
          {role === "ADMIN" && <AddMemberDialog groupId={group.id} onAdded={loadGroup} />}
        </div>
      </div>

      <Card className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Your position</p>
            <p className="text-2xl font-semibold">
              {formatMoney(Math.abs(yourNet), group.currency)}
            </p>
          </div>
          <Badge variant={yourNet >= 0 ? "success" : "warning"}>
            {yourNet >= 0 ? "You are owed" : "You owe"}
          </Badge>
        </div>
      </Card>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Balances</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Net balance</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {balances.map((balance) => (
              <TableRow key={balance.userId}>
                <TableCell>{balance.user.name || balance.user.email}</TableCell>
                <TableCell>{formatMoney(Math.abs(balance.net), group.currency)}</TableCell>
                <TableCell>
                  <Badge variant={balance.net >= 0 ? "success" : "warning"}>
                    {balance.net >= 0 ? "Is owed" : "Owes"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Expenses</h2>
          <Button variant="outline" asChild>
            <Link href={`/app/groups/${group.id}/expenses/new`}>Add expense</Link>
          </Button>
        </div>
        <ExpenseTable expenses={expenses} currentUserId={currentUserId} groupId={group.id} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent settlements</h2>
            <Button variant="outline" asChild>
              <Link href={`/app/groups/${group.id}/settlements`}>View all</Link>
            </Button>
          </div>
          <SettlementHistory settlements={settlements} />
        </div>
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Suggested settlements</h2>
          <SuggestionsPanel suggestions={suggestions} currency={group.currency} />
        </div>
      </section>
    </div>
  );
}
