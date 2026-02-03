"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useApiFetch } from "@/lib/api-client";
import { SettlementForm } from "@/components/settlements/SettlementForm";
import { SettlementHistory, type SettlementListItem } from "@/components/settlements/SettlementHistory";
import { SuggestionsPanel, type SuggestionItem } from "@/components/settlements/SuggestionsPanel";

export function SettlementPageClient() {
  const params = useParams();
  const groupId = params.groupId as string;
  const { isLoaded, isSignedIn } = useAuth();
  const apiFetch = useApiFetch();
  const hasFetched = useRef(false);

  const [group, setGroup] = useState<{ id: string; currency: string; name: string } | null>(null);
  const [members, setMembers] = useState<
    { userId: string; name: string; email: string }[]
  >([]);
  const [settlements, setSettlements] = useState<SettlementListItem[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isLoaded || !isSignedIn) return;

    setLoading(true);
    setError(null);
    try {
      const [groupData, settlementsData, suggestionsData] = await Promise.all([
        apiFetch<{
          group: { id: string; currency: string; name: string };
          members: { userId: string; user: { name: string; email: string } }[];
        }>(`/api/groups/${groupId}`, { cache: "no-store" }),
        apiFetch<{ settlements: SettlementListItem[] }>(`/api/groups/${groupId}/settlements`, {
          cache: "no-store",
        }),
        apiFetch<{ suggestions: SuggestionItem[] }>(`/api/groups/${groupId}/suggestions`, {
          cache: "no-store",
        }),
      ]);

      setGroup(groupData.group);
      setMembers(
        groupData.members.map((member) => ({
          userId: member.userId,
          name: member.user.name,
          email: member.user.email,
        })),
      );
      setSettlements(settlementsData.settlements);
      setSuggestions(suggestionsData.suggestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settlements");
    } finally {
      setLoading(false);
    }
  }, [groupId, apiFetch, isLoaded, isSignedIn]);

  useEffect(() => {
    if (isLoaded && isSignedIn && !hasFetched.current) {
      hasFetched.current = true;
      load();
    }
  }, [isLoaded, isSignedIn, load]);

  if (!isLoaded || loading) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
        {!isLoaded ? "Initializing..." : "Loading settlements..."}
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Settlements</h1>
        <p className="text-sm text-muted-foreground">{group.name}</p>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Record a settlement</h2>
          <SettlementForm
            groupId={group.id}
            currency={group.currency}
            members={members}
            onCreated={load}
          />
        </div>
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Suggested transfers</h2>
          <SuggestionsPanel suggestions={suggestions} currency={group.currency} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">History</h2>
        <SettlementHistory settlements={settlements} />
      </section>
    </div>
  );
}
