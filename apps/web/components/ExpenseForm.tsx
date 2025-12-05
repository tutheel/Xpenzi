"use client";

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/Toaster';
import { computeSplits, type SplitInput } from '@/lib/splitMath';

type Member = {
  id: string;
  displayName: string;
  user?: { name: string | null; email: string };
};

type SplitMode = 'EQUAL' | 'PERCENT' | 'WEIGHT';

export function ExpenseForm({ groupId, members }: { groupId: string; members: Member[] }) {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [category, setCategory] = useState('');
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [payerMemberId, setPayerMemberId] = useState(members[0]?.id ?? '');
  const [splitMode, setSplitMode] = useState<SplitMode>('EQUAL');
  const [shareValues, setShareValues] = useState<Record<string, number>>(() => {
    if (!members.length) return {};
    const defaultPercent = 100 / members.length;
    const values: Record<string, number> = {};
    members.forEach((m) => {
      values[m.id] = splitMode === 'PERCENT' ? defaultPercent : 1;
    });
    return values;
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const splitsPreview = useMemo(() => {
    const amountCents = Math.round((parseFloat(amount) || 0) * 100);
    if (!amountCents || !members.length) return null;
    const splits: SplitInput[] = members.map((m) => ({
      memberId: m.id,
      shareType: splitMode,
      shareValue: splitMode === 'EQUAL' ? 1 : shareValues[m.id] ?? 0,
    }));
    try {
      return computeSplits(amountCents, splits);
    } catch {
      return null;
    }
  }, [amount, members, shareValues, splitMode]);

  const handleShareChange = (memberId: string, value: number) => {
    setShareValues((prev) => ({ ...prev, [memberId]: value }));
  };

  const uploadReceipt = async (): Promise<string | undefined> => {
    if (!receiptFile) return undefined;
    const fd = new FormData();
    fd.append('file', receiptFile);
    const res = await fetch('/api/receipts', { method: 'POST', body: fd });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? 'Failed to upload receipt');
    }
    const data = await res.json();
    return data.receiptId as string;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const amountCents = Math.round((parseFloat(amount) || 0) * 100);
      if (!amountCents) throw new Error('Amount is required');
      const splits: SplitInput[] = members.map((m) => ({
        memberId: m.id,
        shareType: splitMode,
        shareValue: splitMode === 'EQUAL' ? 1 : shareValues[m.id] ?? 0,
      }));
      const receiptId = await uploadReceipt();

      const res = await fetch(`/api/groups/${groupId}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          amountCents,
          currency,
          category: category || undefined,
          expenseDate,
          notes: notes || undefined,
          payerMemberId,
          receiptId,
          splits,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to create expense');
      }
      toast.success('Expense created');
      setDescription('');
      setAmount('');
      setCategory('');
      setNotes('');
      setReceiptFile(null);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <div className="grid gap-2 sm:grid-cols-2">
        <Input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <Input
          placeholder="Amount (e.g. 12.34)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          type="number"
          step="0.01"
          min="0"
        />
        <Input
          placeholder="Currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          required
        />
        <Input
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <Input
          type="date"
          value={expenseDate}
          onChange={(e) => setExpenseDate(e.target.value)}
          required
        />
        <Input
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <p className="text-sm font-medium mb-1">Payer</p>
          <select
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            value={payerMemberId}
            onChange={(e) => setPayerMemberId(e.target.value)}
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.displayName || m.user?.name || m.user?.email || 'Member'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="text-sm font-medium mb-1">Split mode</p>
          <select
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            value={splitMode}
            onChange={(e) => setSplitMode(e.target.value as SplitMode)}
          >
            <option value="EQUAL">Equal</option>
            <option value="PERCENT">Percent</option>
            <option value="WEIGHT">Weight</option>
          </select>
        </div>
      </div>

      {splitMode !== 'EQUAL' && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Split values</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {members.map((m) => (
              <div key={m.id} className="flex items-center gap-2">
                <span className="text-sm w-28 truncate">
                  {m.displayName || m.user?.name || m.user?.email || 'Member'}
                </span>
                <Input
                  type="number"
                  step="0.01"
                  value={shareValues[m.id] ?? ''}
                  onChange={(e) => handleShareChange(m.id, parseFloat(e.target.value) || 0)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-sm font-medium">Receipt (optional)</p>
        <Input type="file" accept="image/*,application/pdf" onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)} />
      </div>

      {splitsPreview && (
        <div className="rounded-md border border-border p-3 text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-2">Split preview</p>
          <ul className="space-y-1">
            {splitsPreview.map((s) => {
              const member = members.find((m) => m.id === s.memberId);
              return (
                <li key={s.memberId} className="flex justify-between">
                  <span>{member?.displayName || member?.user?.name || member?.user?.email || 'Member'}</span>
                  <span className="font-medium text-foreground">
                    {(s.owedCents / 100).toFixed(2)} {currency}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Add expense'}
      </Button>
    </form>
  );
}
