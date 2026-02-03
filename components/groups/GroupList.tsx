import { GroupCard, type GroupSummary } from "@/components/groups/GroupCard";

export function GroupList({ groups }: { groups: GroupSummary[] }) {
  if (groups.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
        No groups yet. Create your first shared space.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {groups.map((group) => (
        <GroupCard key={group.id} group={group} />
      ))}
    </div>
  );
}