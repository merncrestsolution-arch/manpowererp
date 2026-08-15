import { postJournalEntry } from "@/application/use-cases/post-journal-entry";
import { CHART_ACCOUNT_CODES } from "@/lib/chart-account-codes";

import type { Prisma } from "@prisma/client";

type PostInvoiceJournalParams = {
  branchId: string;
  userId: string;
  invoiceId: string;
  invoiceNo: string;
  issueDate: Date;
  total: number;
  description?: string;
  tx?: Prisma.TransactionClient;
};

export async function postInvoiceJournal({
  branchId,
  userId,
  invoiceId,
  invoiceNo,
  issueDate,
  total,
  description,
  tx,
}: PostInvoiceJournalParams) {
  const amount = Number(total.toFixed(2));

  if (amount <= 0) {
    return {
      success: false as const,
      error: "Invoice total must be greater than zero",
    };
  }

  return postJournalEntry({
    branchId,
    userId,
    reference: invoiceNo,
    date: issueDate,
    description: description ?? `Invoice ${invoiceNo} issued`,
    sourceType: "INVOICE",
    sourceId: invoiceId,
    lines: [
      {
        accountCode: CHART_ACCOUNT_CODES.ACCOUNTS_RECEIVABLE,
        description: "Accounts receivable",
        debit: amount,
        credit: 0,
      },
      {
        accountCode: CHART_ACCOUNT_CODES.SERVICE_REVENUE,
        description: "Service revenue",
        debit: 0,
        credit: amount,
      },
    ],
    tx,
  });
}
