"use client";

import { Wallet } from "lucide-react";

import { FinanceBalanceCards } from "@/components/finance/finance-balance-cards";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";

import type { CashBookEntry } from "@/types/finance";

type CashBookTableProps = {
  entries: CashBookEntry[];
  currency?: string;
  openingBalance?: number;
  closingBalance?: number;
  isLoading?: boolean;
};

export function CashBookTable({
  entries,
  currency = "LKR",
  openingBalance = 0,
  closingBalance = 0,
  isLoading = false,
}: CashBookTableProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-[92px] rounded-2xl" />
          <Skeleton className="h-[92px] rounded-2xl" />
        </div>
        <Skeleton className="h-56 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <FinanceBalanceCards
        openingBalance={openingBalance}
        closingBalance={closingBalance}
        currency={currency}
      />

      {entries.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No cash movements"
          description="There are no cash or bank movements in this period. Try a different date range."
        />
      ) : (
        <div className="border-border bg-card shadow-card overflow-hidden rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead className="w-[200px]">Account</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[140px] text-right">In</TableHead>
                <TableHead className="w-[140px] text-right">Out</TableHead>
                <TableHead className="w-[140px] text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {entry.entryDate.slice(0, 10)}
                  </TableCell>
                  <TableCell className="min-w-0 truncate font-medium">
                    {entry.accountCode} — {entry.accountName}
                  </TableCell>
                  <TableCell className="min-w-0 truncate">
                    {entry.description}
                  </TableCell>
                  <TableCell className="text-right text-emerald-700 tabular-nums dark:text-emerald-400">
                    {entry.debit > 0
                      ? formatCurrency(entry.debit, currency)
                      : "—"}
                  </TableCell>
                  <TableCell className="text-destructive text-right tabular-nums">
                    {entry.credit > 0
                      ? formatCurrency(entry.credit, currency)
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatCurrency(entry.runningBalance, currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
