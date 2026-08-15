import { describe, expect, it, vi, beforeEach } from "vitest";

import { recordPayment } from "@/application/use-cases/record-payment";
import { prisma } from "@/infrastructure/db/prisma";

vi.mock("@/infrastructure/db/prisma", () => ({
  prisma: {
    invoice: {
      findFirst: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

describe("recordPayment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects invalid payment dates", async () => {
    const result = await recordPayment({
      branchId: "branch-1",
      invoiceId: "inv-1",
      userId: "user-1",
      input: {
        amount: 100,
        paymentDate: "not-a-date",
        method: "BANK_TRANSFER",
        reference: "",
      },
    });

    expect(result).toEqual({ success: false, error: "Invalid payment date" });
    expect(prisma.invoice.findFirst).not.toHaveBeenCalled();
  });

  it("rejects payments exceeding outstanding balance", async () => {
    vi.mocked(prisma.invoice.findFirst).mockResolvedValue({
      id: "inv-1",
      branchId: "branch-1",
      status: "SENT",
      total: 1000,
      amountPaid: 0,
      amountDue: 500,
      dueDate: new Date("2026-02-01"),
      issueDate: new Date("2026-01-01"),
      clientId: "client-1",
      invoiceNo: "INV-00001",
      deletedAt: null,
    } as never);

    const result = await recordPayment({
      branchId: "branch-1",
      invoiceId: "inv-1",
      userId: "user-1",
      input: {
        amount: 600,
        paymentDate: "2026-01-15",
        method: "CASH",
        reference: "",
      },
    });

    expect(result).toEqual({
      success: false,
      error: "Payment amount exceeds outstanding balance",
    });
  });

  it("rejects payments on cancelled invoices", async () => {
    vi.mocked(prisma.invoice.findFirst).mockResolvedValue({
      id: "inv-1",
      branchId: "branch-1",
      status: "CANCELLED",
      total: 1000,
      amountPaid: 0,
      amountDue: 1000,
      dueDate: new Date("2026-02-01"),
      issueDate: new Date("2026-01-01"),
      clientId: "client-1",
      invoiceNo: "INV-00001",
      deletedAt: null,
    } as never);

    const result = await recordPayment({
      branchId: "branch-1",
      invoiceId: "inv-1",
      userId: "user-1",
      input: {
        amount: 100,
        paymentDate: "2026-01-15",
        method: "CASH",
        reference: "",
      },
    });

    expect(result).toEqual({
      success: false,
      error: "Payments can only be recorded for sent invoices",
    });
  });
});
