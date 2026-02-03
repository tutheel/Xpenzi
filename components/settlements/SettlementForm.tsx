"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { settlementSchema } from "@/lib/validators";
import { apiFetch } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type FormValues = z.infer<typeof settlementSchema>;

type Member = {
  userId: string;
  name: string;
  email: string;
};

export function SettlementForm({
  groupId,
  currency,
  members,
  onCreated,
}: {
  groupId: string;
  currency: string;
  members: Member[];
  onCreated?: () => void;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(settlementSchema),
    defaultValues: {
      fromUserId: members[0]?.userId ?? "",
      toUserId: members[1]?.userId ?? members[0]?.userId ?? "",
      amount: "",
      currency,
      settlementDate: new Date().toISOString().slice(0, 10),
      note: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await apiFetch(`/api/groups/${groupId}/settlements`, {
        method: "POST",
        json: values,
      });
      toast.success("Settlement recorded");
      onCreated?.();
      form.reset({
        ...values,
        amount: "",
        note: "",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to record settlement");
    }
  };

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <input type="hidden" {...form.register("currency")} />
      <input type="hidden" {...form.register("fromUserId")} />
      <input type="hidden" {...form.register("toUserId")} />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>From</Label>
          <Select
            value={form.watch("fromUserId")}
            onValueChange={(value) => form.setValue("fromUserId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select member" />
            </SelectTrigger>
            <SelectContent>
              {members.map((member) => (
                <SelectItem key={member.userId} value={member.userId}>
                  {member.name || member.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>To</Label>
          <Select
            value={form.watch("toUserId")}
            onValueChange={(value) => form.setValue("toUserId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select member" />
            </SelectTrigger>
            <SelectContent>
              {members.map((member) => (
                <SelectItem key={member.userId} value={member.userId}>
                  {member.name || member.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Amount ({currency})</Label>
          <Input placeholder="0.00" {...form.register("amount")} />
          {form.formState.errors.amount && (
            <p className="text-xs text-red-500">{form.formState.errors.amount.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Date</Label>
          <Input type="date" {...form.register("settlementDate")} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Note</Label>
        <Textarea placeholder="Optional note" {...form.register("note")} />
      </div>
      <Button type="submit">Record settlement</Button>
    </form>
  );
}
