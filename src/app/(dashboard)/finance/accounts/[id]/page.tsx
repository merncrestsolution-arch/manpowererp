"use client";

import Link from "next/link";
import { use, useState } from "react";

import { LedgerTable } from "@/components/finance/ledger-table";
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar";
import { PageShell } from "@/components/shared/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAccountLedger, useChartAccount } from "@/hooks/use-finance";

type AccountLedgerPageProps = {
  params: Promise<{ id: string }>;
};

export default function AccountLedgerPage({ params }: AccountLedgerPageProps) {
  const { id } = use(params);
  const [filters, setFilters] = useState({ dateFrom: "", dateTo: "" });
  const { data: account } = useChartAccount(id);
  const { data: ledger, isLoading } = useAccountLedger(id, filters);

  return (
    <PageShell
      title={account ? `${account.code} — ${account.name}` : "Account ledger"}
      description="General ledger entries for this account."
      actions={
        <Button variant="outline" render={<Link href="/finance/accounts" />}>
          Back
        </Button>
      }
    >
      <DataTableToolbar>
        <div className="flex flex-wrap items-center gap-2">
          <Label
            htmlFor="ledger-date-from"
            className="text-muted-foreground text-[13px]"
          >
            From
          </Label>
          <Input
            id="ledger-date-from"
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
            htmlFor="ledger-date-to"
            className="text-muted-foreground text-[13px]"
          >
            To
          </Label>
          <Input
            id="ledger-date-to"
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

      <LedgerTable
        entries={ledger?.entries ?? []}
        openingBalance={ledger?.openingBalance ?? 0}
        closingBalance={ledger?.closingBalance ?? 0}
        isLoading={isLoading}
      />
    </PageShell>
  );
}
