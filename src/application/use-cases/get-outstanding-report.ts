import { prisma } from "@/infrastructure/db/prisma";

import type {
  AgingBucket,
  OutstandingClientSummary,
  OutstandingInvoiceItem,
  OutstandingReport,
} from "@/types/invoice";

function getAgingBucket(daysOverdue: number): AgingBucket {
  if (daysOverdue <= 0) return "current";
  if (daysOverdue <= 30) return "1-30";
  if (daysOverdue <= 60) return "31-60";
  if (daysOverdue <= 90) return "61-90";
  return "90+";
}

type AgingAmountKey =
  "current" | "days1to30" | "days31to60" | "days61to90" | "days90plus";

function bucketKey(bucket: AgingBucket): AgingAmountKey {
  switch (bucket) {
    case "current":
      return "current";
    case "1-30":
      return "days1to30";
    case "31-60":
      return "days31to60";
    case "61-90":
      return "days61to90";
    default:
      return "days90plus";
  }
}

export async function getOutstandingReport(
  branchId: string,
): Promise<OutstandingReport> {
  const asOfDate = new Date();
  asOfDate.setHours(0, 0, 0, 0);

  const invoices = await prisma.invoice.findMany({
    where: {
      branchId,
      deletedAt: null,
      amountDue: { gt: 0 },
      status: { in: ["SENT", "PARTIALLY_PAID", "OVERDUE"] },
    },
    include: {
      client: { select: { companyName: true } },
    },
    orderBy: { dueDate: "asc" },
  });

  const outstandingInvoices: OutstandingInvoiceItem[] = invoices.map(
    (invoice) => {
      const dueDate = new Date(invoice.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      const daysOverdue = Math.floor(
        (asOfDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      const bucket = getAgingBucket(daysOverdue);

      return {
        id: invoice.id,
        invoiceNo: invoice.invoiceNo,
        clientId: invoice.clientId,
        clientName: invoice.client.companyName,
        issueDate: invoice.issueDate.toISOString(),
        dueDate: invoice.dueDate.toISOString(),
        total: Number(invoice.total),
        amountDue: Number(invoice.amountDue),
        daysOverdue: Math.max(daysOverdue, 0),
        bucket,
      };
    },
  );

  const totals = {
    current: 0,
    days1to30: 0,
    days31to60: 0,
    days61to90: 0,
    days90plus: 0,
    totalOutstanding: 0,
  };

  const clientMap = new Map<string, OutstandingClientSummary>();

  for (const item of outstandingInvoices) {
    const key = bucketKey(item.bucket);
    totals[key] += item.amountDue;
    totals.totalOutstanding += item.amountDue;

    const existing = clientMap.get(item.clientId) ?? {
      clientId: item.clientId,
      clientName: item.clientName,
      current: 0,
      days1to30: 0,
      days31to60: 0,
      days61to90: 0,
      days90plus: 0,
      totalOutstanding: 0,
    };

    existing[key] += item.amountDue;
    existing.totalOutstanding += item.amountDue;
    clientMap.set(item.clientId, existing);
  }

  return {
    asOfDate: asOfDate.toISOString(),
    currency: "LKR",
    totals,
    chartData: [
      { label: "Current", value: totals.current },
      { label: "1-30 days", value: totals.days1to30 },
      { label: "31-60 days", value: totals.days31to60 },
      { label: "61-90 days", value: totals.days61to90 },
      { label: "90+ days", value: totals.days90plus },
    ],
    invoices: outstandingInvoices,
    byClient: Array.from(clientMap.values()).sort(
      (a, b) => b.totalOutstanding - a.totalOutstanding,
    ),
  };
}
