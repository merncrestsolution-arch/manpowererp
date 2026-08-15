"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { createExpenseSchema } from "@/application/dto/expense.schema";
import { FormSection } from "@/components/shared/forms/form-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useExpenseCategories } from "@/hooks/use-expenses";
import { patchApiData, postApiData } from "@/lib/api-client";
import { UploadDropzone } from "@/lib/uploadthing";

import type { ExpenseDetail } from "@/types/expense";
import type { z } from "zod";

type ExpenseFormValues = z.input<typeof createExpenseSchema>;

type ExpenseFormProps = {
  expense?: ExpenseDetail;
};

export function ExpenseForm({ expense }: ExpenseFormProps) {
  const router = useRouter();
  const isEdit = Boolean(expense);
  const { data: categories = [] } = useExpenseCategories();
  const [error, setError] = useState<string | null>(null);
  const [createdExpense, setCreatedExpense] = useState<ExpenseDetail | null>(
    null,
  );

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      categoryId: expense?.categoryId ?? "",
      description: expense?.description ?? "",
      amount: expense?.amount ?? 0,
      expenseDate: expense
        ? expense.expenseDate.slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      receiptUrl: expense?.receiptUrl ?? "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    try {
      if (isEdit && expense) {
        const updated = await patchApiData<ExpenseDetail>(
          `/api/expenses/${expense.id}`,
          values,
        );
        router.push(`/expenses/${updated.id}`);
        return;
      }

      const created = await postApiData<ExpenseDetail>("/api/expenses", values);
      if (!values.receiptUrl) {
        setCreatedExpense(created);
        return;
      }
      router.push(`/expenses/${created.id}`);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : isEdit
            ? "Failed to update expense"
            : "Failed to submit expense",
      );
    }
  });

  if (createdExpense) {
    return (
      <div className="gap-jk-lg mx-auto flex max-w-3xl flex-col">
        <FormSection
          title="Upload receipt"
          description="Expense submitted. Attach a receipt to complete your submission."
        >
          <div className="space-y-jk-md">
            <p className="text-body-md text-muted-foreground">
              Expense{" "}
              <span className="font-medium">{createdExpense.expenseNo}</span>{" "}
              was created successfully.
            </p>
            <UploadDropzone
              endpoint="expenseReceipt"
              input={{ expenseId: createdExpense.id }}
              onClientUploadComplete={() => {
                router.push(`/expenses/${createdExpense.id}`);
              }}
            />
            <div className="gap-jk-sm flex justify-end">
              <Button
                variant="outline"
                onClick={() => router.push(`/expenses/${createdExpense.id}`)}
              >
                Skip for now
              </Button>
            </div>
          </div>
        </FormSection>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="gap-jk-lg mx-auto flex max-w-3xl flex-col"
    >
      <FormSection title="Expense details">
        <div className="gap-jk-md grid sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="categoryId">Category</Label>
            <Select
              id="categoryId"
              value={form.watch("categoryId")}
              onChange={(event) =>
                form.setValue("categoryId", event.target.value)
              }
            >
              <option value="">Select category</option>
              {categories
                .filter((category) => category.isActive)
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...form.register("description")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (LKR)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              {...form.register("amount")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expenseDate">Expense date</Label>
            <Input
              id="expenseDate"
              type="date"
              {...form.register("expenseDate")}
            />
          </div>
        </div>
      </FormSection>

      {error ? <p className="text-destructive">{error}</p> : null}

      <div className="gap-jk-sm flex justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/expenses")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {isEdit ? "Save changes" : "Submit expense"}
        </Button>
      </div>
    </form>
  );
}
