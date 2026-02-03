"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";

export function ExpenseCreateClient() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as string;

  const [group, setGroup] = useState<{ id: string; currency: string; name: string } | null>(null);
  const [members, setMembers] = useState<
    { userId: string; name: string; email: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{
        group: { id: string; currency: string; name: string };
        members: { userId: string; user: { name: string; email: string } }[];
      }>(`/api/groups/${groupId}`, { cache: "no-store" });

      setGroup(data.group);
      setMembers(
        data.members.map((member) => ({
          userId: member.userId,
          name: member.user.name,
          email: member.user.email,
        })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load group");
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
        Loading form...
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
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">New expense</h1>
        <p className="text-sm text-muted-foreground">{group.name}</p>
      </div>
      <ExpenseForm
        groupId={group.id}
        currency={group.currency}
        members={members}
        onSaved={() => router.push(`/app/groups/${group.id}`)}
      />
    </div>
  );
}