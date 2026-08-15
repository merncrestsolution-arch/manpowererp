import type { InvoiceStatus } from "@prisma/client";

type RecalculateInvoiceStatusInput = {
  status: InvoiceStatus;
  total: number;
  amountPaid: number;
  amountDue: number;
  dueDate: Date;
  asOf?: Date;
};

export function recalculateInvoiceStatus({
  status,
  total,
  amountPaid,
  dueDate,
  asOf = new Date(),
}: RecalculateInvoiceStatusInput): {
  status: InvoiceStatus;
  amountPaid: number;
  amountDue: number;
} {
  if (status === "CANCELLED" || status === "DRAFT") {
    return {
      status,
      amountPaid: Number(amountPaid.toFixed(2)),
      amountDue: Number(Math.max(total - amountPaid, 0).toFixed(2)),
    };
  }

  const paid = Number(amountPaid.toFixed(2));
  const due = Number(Math.max(total - paid, 0).toFixed(2));

  if (due <= 0) {
    return { status: "PAID", amountPaid: paid, amountDue: 0 };
  }

  if (paid > 0) {
    const dueDateOnly = new Date(dueDate);
    dueDateOnly.setHours(23, 59, 59, 999);
    if (asOf > dueDateOnly) {
      return { status: "OVERDUE", amountPaid: paid, amountDue: due };
    }
    return { status: "PARTIALLY_PAID", amountPaid: paid, amountDue: due };
  }

  const dueDateOnly = new Date(dueDate);
  dueDateOnly.setHours(23, 59, 59, 999);
  if (asOf > dueDateOnly) {
    return { status: "OVERDUE", amountPaid: paid, amountDue: due };
  }

  return {
    status: status === "SENT" ? "SENT" : status,
    amountPaid: paid,
    amountDue: due,
  };
}
