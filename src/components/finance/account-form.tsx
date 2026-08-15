"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  createAccountSchema,
  updateAccountSchema,
} from "@/application/dto/account.schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { patchApiData, postApiData } from "@/lib/api-client";

import type { ChartAccountItem } from "@/types/finance";
import type { z } from "zod";

type CreateValues = z.input<typeof createAccountSchema>;
type UpdateValues = z.input<typeof updateAccountSchema>;

type AccountFormProps = {
  mode: "create" | "edit";
  account?: ChartAccountItem;
  accounts: ChartAccountItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
};

export function AccountForm({
  mode,
  account,
  accounts,
  open,
  onOpenChange,
  onSaved,
}: AccountFormProps) {
  const [error, setError] = useState<string | null>(null);
  const schema = mode === "create" ? createAccountSchema : updateAccountSchema;

  const form = useForm<CreateValues | UpdateValues>({
    resolver: zodResolver(schema),
    values: {
      code: account?.code ?? "",
      name: account?.name ?? "",
      type: account?.type ?? "ASSET",
      parentAccountId: account?.parentAccountId ?? "",
      isActive: account?.isActive ?? true,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    try {
      const payload = {
        ...values,
        parentAccountId: values.parentAccountId || null,
      };

      if (mode === "create") {
        await postApiData<ChartAccountItem>("/api/finance/accounts", payload);
      } else if (account) {
        await patchApiData<ChartAccountItem>(
          `/api/finance/accounts/${account.id}`,
          payload,
        );
      }

      onSaved();
      onOpenChange(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to save account",
      );
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add account" : "Edit account"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-jk-sm">
          <div className="space-y-1">
            <Label htmlFor="code">Code</Label>
            <Input id="code" {...form.register("code")} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...form.register("name")} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="type">Type</Label>
            <Select id="type" {...form.register("type")}>
              <option value="ASSET">Asset</option>
              <option value="LIABILITY">Liability</option>
              <option value="EQUITY">Equity</option>
              <option value="REVENUE">Revenue</option>
              <option value="EXPENSE">Expense</option>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="parentAccountId">Parent account</Label>
            <Select id="parentAccountId" {...form.register("parentAccountId")}>
              <option value="">None</option>
              {accounts
                .filter((item) => item.id !== account?.id)
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.code} — {item.name}
                  </option>
                ))}
            </Select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...form.register("isActive")} />
            Active
          </label>
          {error ? <p className="text-destructive text-sm">{error}</p> : null}
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
