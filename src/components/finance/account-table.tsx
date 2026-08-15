"use client";

import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { AccountForm } from "@/components/finance/account-form";
import { AccountTypeBadge } from "@/components/finance/account-type-badge";
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar";
import { EmptyState } from "@/components/shared/empty-state";
import { PageShell } from "@/components/shared/page-shell";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useChartAccounts } from "@/hooks/use-finance";

export function AccountTable() {
  const { data: accounts = [], refetch, isLoading } = useChartAccounts();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const editingAccount = accounts.find((account) => account.id === editingId);

  const filteredAccounts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return accounts;
    }

    return accounts.filter((account) =>
      [
        account.code,
        account.name,
        account.type,
        account.parentAccountName ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [accounts, search]);

  return (
    <PageShell
      title="Chart of accounts"
      description="Manage ledger accounts for financial reporting."
      actions={
        <>
          <Button variant="outline" render={<Link href="/finance" />}>
            Back
          </Button>
          <Button
            onClick={() => {
              setEditingId(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="size-4" />
            Add account
          </Button>
        </>
      }
    >
      <DataTableToolbar>
        <div className="relative w-full max-w-sm">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search code, name, or type..."
            className="h-9 pl-9"
          />
        </div>
      </DataTableToolbar>

      {isLoading ? (
        <div className="border-border bg-card shadow-card overflow-hidden rounded-2xl border">
          <div className="space-y-3 p-5">
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      ) : accounts.length === 0 ? (
        <EmptyState
          title="No accounts yet"
          description="Create ledger accounts so payroll, invoices, and expenses can post to the books."
          actionLabel="Add account"
          onAction={() => {
            setEditingId(null);
            setDialogOpen(true);
          }}
        />
      ) : (
        <div className="border-border bg-card shadow-card overflow-hidden rounded-2xl border">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[96px]">Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-[120px]">Type</TableHead>
                <TableHead className="w-[160px]">Parent</TableHead>
                <TableHead className="w-[112px]">Status</TableHead>
                <TableHead className="w-[168px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-muted-foreground h-32 text-center"
                  >
                    No accounts match this search.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAccounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="text-foreground font-medium tabular-nums">
                      {account.code}
                    </TableCell>
                    <TableCell className="min-w-0 truncate font-medium">
                      {account.name}
                    </TableCell>
                    <TableCell>
                      <AccountTypeBadge type={account.type} />
                    </TableCell>
                    <TableCell className="text-muted-foreground truncate">
                      {account.parentAccountName || "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={account.isActive ? "active" : "inactive"}
                        size="sm"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          render={
                            <Link href={`/finance/accounts/${account.id}`} />
                          }
                        >
                          Ledger
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setEditingId(account.id);
                            setDialogOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <AccountForm
        mode={editingAccount ? "edit" : "create"}
        account={editingAccount}
        accounts={accounts}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaved={() => refetch()}
      />
    </PageShell>
  );
}
