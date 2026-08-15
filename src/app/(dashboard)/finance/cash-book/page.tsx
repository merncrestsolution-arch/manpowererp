"use client";

import Link from "next/link";
import { useState } from "react";

import { CashBookTable } from "@/components/finance/cash-book-table";
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar";
import { PageShell } from "@/components/shared/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCashBook } from "@/hooks/use-finance";
import { getDefaultMonthDateRange } from "@/lib/finance-dates";

export default function CashBookPage() {
  const [filters, setFilters] = useState(getDefaultMonthDateRange);
  const { data, isLoading } = useCashBook(filters);

  return (
    <PageShell
      title="Cash book"
      description="Cash and bank account movements with running balance."
      actions={
        <Button variant="outline" render={<Link href="/finance" />}>
          Back
        </Button>
      }
    >
      <DataTableToolbar>
        <div className="flex flex-wrap items-center gap-2">
          <Label
            htmlFor="cash-date-from"
            className="text-muted-foreground text-[13px]"
          >
            From
          </Label>
          <Input
            id="cash-date-from"
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
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Label
            htmlFor="cash-date-to"
            className="text-muted-foreground text-[13px]"
          >
            To
          </Label>
          <Input
            id="cash-date-to"
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
        </div>
      </DataTableToolbar>

      <CashBookTable
        entries={data?.entries ?? []}
        currency={data?.currency}
        openingBalance={data?.openingBalance}
        closingBalance={data?.closingBalance}
        isLoading={isLoading}
      />
    </PageShell>
  );
}
