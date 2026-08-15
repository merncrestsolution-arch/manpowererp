"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  createExpenseCategorySchema,
  updateExpenseCategorySchema,
} from "@/application/dto/expense-category.schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { patchApiData, postApiData } from "@/lib/api-client";

import type { ExpenseCategoryItem } from "@/types/expense";
import type { z } from "zod";

type CreateValues = z.input<typeof createExpenseCategorySchema>;
type UpdateValues = z.input<typeof updateExpenseCategorySchema>;

type ExpenseCategoryFormProps = {
  mode: "create" | "edit";
  category?: ExpenseCategoryItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
};

export function ExpenseCategoryForm({
  mode,
  category,
  open,
  onOpenChange,
  onSaved,
}: ExpenseCategoryFormProps) {
  const [error, setError] = useState<string | null>(null);
  const schema =
    mode === "create"
      ? createExpenseCategorySchema
      : updateExpenseCategorySchema;

  const form = useForm<CreateValues | UpdateValues>({
    resolver: zodResolver(schema),
    values: {
      name: category?.name ?? "",
      description: category?.description ?? "",
      isActive: category?.isActive ?? true,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    try {
      if (mode === "create") {
        await postApiData<ExpenseCategoryItem>(
          "/api/expenses/categories",
          values,
        );
      } else if (category) {
        await patchApiData<ExpenseCategoryItem>("/api/expenses/categories", {
          id: category.id,
          ...values,
        });
      }
      onSaved();
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save category");
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add category" : "Edit category"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-jk-md">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...form.register("name")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...form.register("description")} />
          </div>
          <label className="text-label-md flex items-center gap-2">
            <input type="checkbox" {...form.register("isActive")} />
            Active
          </label>
          {error ? <p className="text-destructive">{error}</p> : null}
          <div className="gap-jk-sm flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
