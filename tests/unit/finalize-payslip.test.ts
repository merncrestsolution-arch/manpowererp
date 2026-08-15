import { describe, expect, it, vi, beforeEach } from "vitest";

import { finalizePayslip } from "@/application/use-cases/finalize-payslip";
import { prisma } from "@/infrastructure/db/prisma";

vi.mock("@/infrastructure/db/prisma", () => ({
  prisma: {
    payslip: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    branch: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock("@/infrastructure/pdf/payslip-pdf-generator", () => ({
  generatePayslipPdf: vi.fn(),
}));

vi.mock("@/application/use-cases/post-journal-entry", () => ({
  postJournalEntry: vi.fn(),
}));

describe("finalizePayslip", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when payslip is not found", async () => {
    vi.mocked(prisma.payslip.findFirst).mockResolvedValue(null);

    const result = await finalizePayslip({
      branchId: "branch-1",
      payslipId: "ps-missing",
      userId: "user-1",
    });

    expect(result).toEqual({ success: false, error: "Payslip not found" });
  });

  it("rejects non-draft payslips", async () => {
    vi.mocked(prisma.payslip.findFirst).mockResolvedValue({
      id: "ps-1",
      status: "FINALIZED",
      payslipNo: "PSL-00001",
      basicSalary: 1000,
      totalAllowances: 0,
      totalDeductions: 0,
      overtimePay: 0,
      grossSalary: 1000,
      netSalary: 1000,
      employee: {
        employeeNo: "EMP-00001",
        firstName: "Jane",
        lastName: "Doe",
        department: "Ops",
      },
      payrollPeriod: {
        periodStart: new Date("2026-01-01"),
        periodEnd: new Date("2026-01-31"),
        payDate: new Date("2026-02-01"),
      },
      lineItems: [],
    } as never);

    const result = await finalizePayslip({
      branchId: "branch-1",
      payslipId: "ps-1",
      userId: "user-1",
    });

    expect(result).toEqual({
      success: false,
      error: "Only draft payslips can be finalized",
    });
  });
});
