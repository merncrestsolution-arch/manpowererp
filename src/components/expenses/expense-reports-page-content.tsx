"use client";

import { useState } from "react";

import { ExpenseReportSummary } from "@/components/expenses/expense-report-summary";
import { ExpenseTrendChart } from "@/components/expenses/expense-trend-chart";
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useExpenseCategories, useExpenseReport } from "@/hooks/use-expenses";

export function ExpenseReportsPageContent() {
  const { data: categories = [] } = useExpenseCategories();
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    categoryId: "",
  });

  const { data: report, isLoading } = useExpenseReport(filters);

  return (
    <div className="flex flex-col gap-6">
      <DataTableToolbar>
        <Input
          type="date"
          value={filters.dateFrom}
          onChange={(event) =>
            setFilters((current) => ({
              ...current,
              dateFrom: event.target.value,
            }))
          }
          className="h-9 w-auto"
        />
        <Input
          type="date"
          value={filters.dateTo}
          onChange={(event) =>
            setFilters((current) => ({
              ...current,
              dateTo: event.target.value,
            }))
          }
          className="h-9 w-auto"
        />
        <Select
          value={filters.categoryId}
          onChange={(event) =>
            setFilters((current) => ({
              ...current,
              categoryId: event.target.value,
            }))
          }
          className="h-9 w-[200px]"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </DataTableToolbar>

      <ExpenseReportSummary report={report} isLoading={isLoading} />
      <ExpenseTrendChart report={report} isLoading={isLoading} />
    </div>
  );
}
