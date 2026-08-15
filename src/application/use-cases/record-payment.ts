import {
  buildPaymentReference,
  type RecordPaymentInput,
} from "@/application/dto/payment.schema";
import {
  getBillingPeriod,
  mapInvoiceToDetail,
  parseInvoiceDate,
} from "@/application/mappers/invoice-mapper";
import { postJournalEntry } from "@/application/use-cases/post-journal-entry";
import { recalculateInvoiceStatus } from "@/application/use-cases/recalculate-invoice-status";
import { prisma } from "@/infrastructure/db/prisma";
import { CHART_ACCOUNT_CODES } from "@/lib/chart-account-codes";
import { formatPaymentNo, getNextSequenceValue } from "@/lib/sequence";

import type { InvoiceDetail } from "@/types/invoice";
import type { Prisma } from "@prisma/client";

type RecordPaymentParams = {
  branchId: string;
  invoiceId: string;
  userId: string;
  input: RecordPaymentInput;
};

type RecordPaymentResult =
  { success: true; invoice: InvoiceDetail } | { success: false; error: string };

const detailInclude = {
  client: { select: { companyName: true, address: true } },
  quotation: { select: { quotationNo: true } },
  lineItems: true,
  payments: {
    include: { recordedBy: { select: { name: true } } },
  },
} as const;

async function syncClientBillingRecord(
  tx: Prisma.TransactionClient,
  params: {
    clientId: string;
    issueDate: Date;
    invoiceTotal: number;
    amountDue: number;
    userId: string;
  },
) {
  const { periodStart, periodEnd } = getBillingPeriod(params.issueDate);

  const existing = await tx.clientBillingRecord.findFirst({
    where: {
      clientId: params.clientId,
      deletedAt: null,
      periodStart,
      periodEnd,
    },
  });

  const billingStatus = params.amountDue <= 0 ? "PAID" : "INVOICED";

  if (existing) {
    await tx.clientBillingRecord.update({
      where: { id: existing.id },
      data: {
        amount: params.invoiceTotal,
        status: billingStatus,
        updatedBy: params.userId,
      },
    });
    return;
  }

  await tx.clientBillingRecord.create({
    data: {
      clientId: params.clientId,
      periodStart,
      periodEnd,
      amount: params.invoiceTotal,
      status: billingStatus,
      createdBy: params.userId,
      updatedBy: params.userId,
    },
  });
}

export async function recordPayment({
  branchId,
  invoiceId,
  userId,
  input,
}: RecordPaymentParams): Promise<RecordPaymentResult> {
  const paymentDate = parseInvoiceDate(input.paymentDate);

  if (!paymentDate) {
    return { success: false, error: "Invalid payment date" };
  }

  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, branchId, deletedAt: null },
  });

  if (!invoice) {
    return { success: false, error: "Invoice not found" };
  }

  if (invoice.status === "CANCELLED" || invoice.status === "DRAFT") {
    return {
      success: false,
      error: "Payments can only be recorded for sent invoices",
    };
  }

  if (invoice.status === "PAID") {
    return { success: false, error: "Invoice is already fully paid" };
  }

  const currentDue = Number(invoice.amountDue);
  if (input.amount > currentDue) {
    return {
      success: false,
      error: "Payment amount exceeds outstanding balance",
    };
  }

  try {
    const updatedInvoice = await prisma.$transaction(async (tx) => {
      const sequenceValue = await getNextSequenceValue(
        tx,
        branchId,
        "payment_no",
      );
      const paymentNo = formatPaymentNo(sequenceValue);

      const payment = await tx.payment.create({
        data: {
          branchId,
          paymentNo,
          invoiceId,
          amount: input.amount,
          paymentDate,
          method: input.method,
          reference: buildPaymentReference(input),
          recordedById: userId,
          createdBy: userId,
          updatedBy: userId,
        },
      });

      const newAmountPaid = Number(invoice.amountPaid) + input.amount;
      const recalculated = recalculateInvoiceStatus({
        status: invoice.status === "DRAFT" ? "SENT" : invoice.status,
        total: Number(invoice.total),
        amountPaid: newAmountPaid,
        amountDue: Number(invoice.total) - newAmountPaid,
        dueDate: invoice.dueDate,
        asOf: paymentDate,
      });

      const updated = await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          amountPaid: recalculated.amountPaid,
          amountDue: recalculated.amountDue,
          status: recalculated.status,
          updatedBy: userId,
        },
        include: detailInclude,
      });

      await syncClientBillingRecord(tx, {
        clientId: invoice.clientId,
        issueDate: invoice.issueDate,
        invoiceTotal: Number(invoice.total),
        amountDue: recalculated.amountDue,
        userId,
      });

      const cashAccountCode =
        input.method === "CASH"
          ? CHART_ACCOUNT_CODES.CASH
          : CHART_ACCOUNT_CODES.BANK;

      const journalResult = await postJournalEntry({
        branchId,
        userId,
        reference: paymentNo,
        date: paymentDate,
        description: `Payment received for invoice ${invoice.invoiceNo}`,
        sourceType: "PAYMENT",
        sourceId: payment.id,
        lines: [
          {
            accountCode: cashAccountCode,
            description: "Payment received",
            debit: input.amount,
            credit: 0,
          },
          {
            accountCode: CHART_ACCOUNT_CODES.ACCOUNTS_RECEIVABLE,
            description: "Accounts receivable cleared",
            debit: 0,
            credit: input.amount,
          },
        ],
        tx,
      });

      if (!journalResult.success) {
        throw new Error(journalResult.error);
      }

      return updated;
    });

    return { success: true, invoice: mapInvoiceToDetail(updatedInvoice) };
  } catch {
    return { success: false, error: "Failed to record payment" };
  }
}
