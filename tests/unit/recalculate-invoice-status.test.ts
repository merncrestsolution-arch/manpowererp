import { describe, expect, it } from "vitest";

import { recalculateInvoiceStatus } from "@/application/use-cases/recalculate-invoice-status";

describe("recalculateInvoiceStatus", () => {
  const dueDate = new Date("2026-08-31T00:00:00.000Z");

  it("marks invoice as paid when fully paid", () => {
    const result = recalculateInvoiceStatus({
      status: "SENT",
      total: 1000,
      amountPaid: 1000,
      amountDue: 0,
      dueDate,
      asOf: new Date("2026-08-10T00:00:00.000Z"),
    });

    expect(result.status).toBe("PAID");
    expect(result.amountDue).toBe(0);
  });

  it("marks partially paid invoice as overdue after due date", () => {
    const result = recalculateInvoiceStatus({
      status: "SENT",
      total: 1000,
      amountPaid: 400,
      amountDue: 600,
      dueDate,
      asOf: new Date("2026-09-05T00:00:00.000Z"),
    });

    expect(result.status).toBe("OVERDUE");
    expect(result.amountDue).toBe(600);
  });

  it("keeps draft invoices unchanged", () => {
    const result = recalculateInvoiceStatus({
      status: "DRAFT",
      total: 1000,
      amountPaid: 0,
      amountDue: 1000,
      dueDate,
    });

    expect(result.status).toBe("DRAFT");
  });
});
