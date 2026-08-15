"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { ExpenseCategoryForm } from "@/components/expenses/expense-category-form";
import { PageShell } from "@/components/shared/page-shell";
import { Button } from "@/components/ui/button";
import { useExpenseCategories } from "@/hooks/use-expenses";

import type { ExpenseCategoryItem } from "@/types/expense";

export function ExpenseCategoryTable() {
  const { data: categories = [], refetch, isLoading } = useExpenseCategories();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<ExpenseCategoryItem | null>(null);

  return (
    <PageShell
      title="Expense categories"
      description="Manage categories used for expense classification"
      actions={
        <>
          <Button
            variant="outline"
            className="h-9"
            render={<Link href="/expenses" />}
          >
            Back
          </Button>
          <Button
            className="h-9"
            onClick={() => {
              setEditingCategory(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="size-4" />
            Add category
          </Button>
        </>
      }
    >
      {isLoading ? (
        <p className="text-muted-foreground">Loading categories...</p>
      ) : categories.length === 0 ? (
        <div className="p-jk-lg text-muted-foreground rounded-lg border border-dashed text-center">
          No categories configured yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="text-body-md w-full text-left">
            <thead className="bg-muted/40 border-b">
              <tr>
                <th className="px-jk-md py-jk-sm font-medium">Name</th>
                <th className="px-jk-md py-jk-sm font-medium">Description</th>
                <th className="px-jk-md py-jk-sm font-medium">Status</th>
                <th className="px-jk-md py-jk-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-b last:border-b-0">
                  <td className="px-jk-md py-jk-sm font-medium">
                    {category.name}
                  </td>
                  <td className="px-jk-md py-jk-sm text-muted-foreground">
                    {category.description || "—"}
                  </td>
                  <td className="px-jk-md py-jk-sm">
                    {category.isActive ? "Active" : "Inactive"}
                  </td>
                  <td className="px-jk-md py-jk-sm">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingCategory(category);
                        setDialogOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ExpenseCategoryForm
        mode={editingCategory ? "edit" : "create"}
        category={editingCategory ?? undefined}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaved={() => refetch()}
      />
    </PageShell>
  );
}
