"use client";

import Link from "next/link";

import { BillingStatusBadge } from "@/components/clients/client-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useClientBilling } from "@/hooks/use-clients";
import { formatColomboDate } from "@/lib/date";
import { formatCurrency } from "@/lib/format";

type ClientBillingHistoryTabProps = {
  clientId: string;
};

export function ClientBillingHistoryTab({
  clientId,
}: ClientBillingHistoryTabProps) {
  const { data: records = [], isLoading } = useClientBilling(clientId);

  if (isLoading) {
    return (
      <p className="text-body-md text-muted-foreground">
        Loading billing history...
      </p>
    );
  }

  return (
    <div className="space-y-jk-md">
      <div className="gap-jk-sm flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-medium">Billing history</h3>
          <p className="text-body-md text-muted-foreground">
            Read-only billing records for this client. Invoice generation is
            available in the Invoices module.
          </p>
        </div>
        <Link
          href="/invoices"
          className="text-body-md text-jk-primary underline-offset-4 hover:underline"
        >
          Go to Invoices
        </Link>
      </div>

      {records.length === 0 ? (
        <div className="p-jk-lg text-muted-foreground rounded-lg border border-dashed text-center">
          No billing records yet.
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    {formatColomboDate(
                      new Date(record.periodStart),
                      "dd MMM yyyy",
                    )}{" "}
                    –{" "}
                    {formatColomboDate(
                      new Date(record.periodEnd),
                      "dd MMM yyyy",
                    )}
                  </TableCell>
                  <TableCell>
                    <BillingStatusBadge status={record.status} />
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(record.amount)}
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
