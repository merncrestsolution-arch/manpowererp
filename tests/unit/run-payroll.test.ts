import { describe, expect, it, vi, beforeEach } from "vitest";

import { runPayroll } from "@/application/use-cases/run-payroll";
import { prisma } from "@/infrastructure/db/prisma";

vi.mock("@/infrastructure/db/prisma", () => ({
  prisma: {
    payrollPeriod: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    employee: {
      findMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

describe("runPayroll", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns failure when payroll period is not found", async () => {
    vi.mocked(prisma.payrollPeriod.findFirst).mockResolvedValue(null);

    const result = await runPayroll({
      branchId: "branch-1",
      periodId: "period-missing",
      userId: "user-1",
    });

    expect(result.failed).toBe(1);
    expect(result.errors).toContain("Payroll period not found");
    expect(prisma.employee.findMany).not.toHaveBeenCalled();
  });

  it("rejects finalized or paid periods", async () => {
    vi.mocked(prisma.payrollPeriod.findFirst).mockResolvedValue({
      id: "period-1",
      branchId: "branch-1",
      status: "FINALIZED",
      periodStart: new Date("2026-01-01"),
      periodEnd: new Date("2026-01-31"),
      deletedAt: null,
    } as never);

    const result = await runPayroll({
      branchId: "branch-1",
      periodId: "period-1",
      userId: "user-1",
    });

    expect(result.failed).toBe(1);
    expect(result.errors).toContain(
      "Cannot run payroll for a finalized or paid period",
    );
    expect(prisma.payrollPeriod.update).not.toHaveBeenCalled();
  });
});
