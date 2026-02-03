"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { CreateGroupDialog } from "@/components/groups/CreateGroupDialog";
import { GroupList } from "@/components/groups/GroupList";
import type { GroupSummary } from "@/components/groups/GroupCard";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function DashboardClient() {
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ groups: GroupSummary[] }>("/api/groups", {
        cache: "no-store",
      });
      setGroups(data.groups);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load groups");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Your groups</h1>
          <p className="text-sm text-muted-foreground">
            Keep every shared expense in one place.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={loadGroups} disabled={loading}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <CreateGroupDialog onCreated={loadGroups} />
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
          Loading groups...
        </div>
      )}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}
      {!loading && !error && <GroupList groups={groups} />}
    </div>
  );
}