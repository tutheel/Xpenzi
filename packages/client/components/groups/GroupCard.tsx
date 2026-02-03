import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@xpenzi/shared/utils";
import type { GroupSummary } from "@xpenzi/shared/types";

export function GroupCard({ group }: { group: GroupSummary }) {
  const net = group.yourNet;
  const status = net >= 0 ? "You are owed" : "You owe";
  const badgeVariant = net >= 0 ? "success" : "warning";

  return (
    <Card className="transition hover:-translate-y-1 hover:shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            <Link href={`/app/groups/${group.id}`} className="hover:underline">
              {group.name}
            </Link>
          </CardTitle>
          <Badge variant={badgeVariant}>{status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {group.description || "No description provided"}
        </p>
        <p className="text-lg font-semibold">
          {formatMoney(Math.abs(net), group.currency)}
        </p>
      </CardContent>
    </Card>
  );
}
