"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addMemberSchema } from "@xpenzi/shared/validators";
import { useApiFetch } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const formSchema = addMemberSchema;

type FormValues = z.infer<typeof formSchema>;

export function AddMemberDialog({
  groupId,
  onAdded,
}: {
  groupId: string;
  onAdded?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const apiFetch = useApiFetch();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await apiFetch(`/api/groups/${groupId}/members`, {
        method: "POST",
        json: values,
      });
      toast.success("Member added");
      setOpen(false);
      form.reset();
      onAdded?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add member");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add member</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add group member</DialogTitle>
          <DialogDescription>
            Search by email. The user must already have an Xpenzi account.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" placeholder="member@email.com" {...form.register("email")} />
            {form.formState.errors.email && (
              <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="submit">Add member</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
