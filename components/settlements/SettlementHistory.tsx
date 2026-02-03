import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type SettlementListItem = {
  id: string;
  amount: number;
  currency: string;
  settlementDate: string;
  note?: string | null;
  fromUser: { id: string; name: string; email: string };
  toUser: { id: string; name: string; email: string };
};

export function SettlementHistory({ settlements }: { settlements: SettlementListItem[] }) {
  if (settlements.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
        No settlements recorded yet.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>From</TableHead>
          <TableHead>To</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Note</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {settlements.map((settlement) => (
          <TableRow key={settlement.id}>
            <TableCell>{formatDate(settlement.settlementDate)}</TableCell>
            <TableCell>{settlement.fromUser.name || settlement.fromUser.email}</TableCell>
            <TableCell>{settlement.toUser.name || settlement.toUser.email}</TableCell>
            <TableCell>{formatMoney(settlement.amount, settlement.currency)}</TableCell>
            <TableCell>{settlement.note || "-"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}