"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { groupCreateSchema } from "@xpenzi/shared/validators";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const currencies = ["INR", "USD", "EUR", "GBP"] as const;

type FormValues = z.infer<typeof groupCreateSchema>;

export function CreateGroupDialog({ onCreated }: { onCreated?: () => void }) {
  const [open, setOpen] = useState(false);
  const apiFetch = useApiFetch();
  const form = useForm<FormValues>({
    resolver: zodResolver(groupCreateSchema),
    defaultValues: {
      name: "",
      description: "",
      currency: "INR",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await apiFetch("/api/groups", {
        method: "POST",
        json: values,
      });
      toast.success("Group created");
      setOpen(false);
      form.reset({ name: "", description: "", currency: values.currency });
      onCreated?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create group");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create group</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new group</DialogTitle>
          <DialogDescription>Groups keep expenses organized per trip or team.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <input type="hidden" {...form.register("currency")} />
          <div className="space-y-2">
            <Label htmlFor="name">Group name</Label>
            <Input id="name" placeholder="Weekend getaway" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional details"
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-xs text-red-500">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Currency</Label>
            <Select
              value={form.watch("currency")}
              onValueChange={(value) => form.setValue("currency", value, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.currency && (
              <p className="text-xs text-red-500">{form.formState.errors.currency.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="submit">Create group</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
