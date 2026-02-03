import Link from "next/link";
import { formatMoney, formatDate } from "@xpenzi/shared/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export type ExpenseListItem = {
  id: string;
  description: string;
  totalAmount: number;
  currency: string;
  expenseDate: string;
  paidBy: { id: string; name: string; email: string };
  participants: { userId: string; owedAmount: number }[];
};

export function ExpenseTable({
  expenses,
  currentUserId,
  groupId,
}: {
  expenses: ExpenseListItem[];
  currentUserId?: string | null;
  groupId: string;
}) {
  if (expenses.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
        No expenses yet. Add the first one.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Paid by</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Your share</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses.map((expense) => {
          const yourShare = currentUserId
            ? expense.participants.find((p) => p.userId === currentUserId)?.owedAmount ?? 0
            : 0;
          return (
            <TableRow key={expense.id}>
              <TableCell>{formatDate(expense.expenseDate)}</TableCell>
              <TableCell className="font-medium">{expense.description}</TableCell>
              <TableCell>{expense.paidBy.name || expense.paidBy.email}</TableCell>
              <TableCell>{formatMoney(expense.totalAmount, expense.currency)}</TableCell>
              <TableCell>{formatMoney(yourShare, expense.currency)}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/app/groups/${groupId}/expenses/${expense.id}`}>View</Link>
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
