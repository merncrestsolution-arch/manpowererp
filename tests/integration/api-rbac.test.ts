import { describe, expect, it, vi, beforeEach } from "vitest";

import { POST as approveExpensePost } from "@/app/api/expenses/[id]/approve/route";
import { POST as finalizePayslipPost } from "@/app/api/payroll/payslips/[id]/finalize/route";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";

vi.mock("@/infrastructure/auth/api-auth", () => ({
  getAuthenticatedContext: vi.fn(),
}));

vi.mock("@/application/use-cases/finalize-payslip", () => ({
  finalizePayslip: vi.fn(),
}));

vi.mock("@/application/use-cases/approve-expense", () => ({
  approveExpense: vi.fn(),
}));

describe("API RBAC enforcement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects payroll finalize for employee role", async () => {
    vi.mocked(getAuthenticatedContext).mockResolvedValue({
      userId: "user-1",
      role: "EMPLOYEE",
      branchId: "branch-1",
    });

    const response = await finalizePayslipPost(
      new Request("http://localhost/api/payroll/payslips/ps-1/finalize", {
        method: "POST",
      }),
      { params: Promise.resolve({ id: "ps-1" }) },
    );

    expect(response.status).toBe(401);
  });

  it("rejects expense approval for employee role", async () => {
    vi.mocked(getAuthenticatedContext).mockResolvedValue({
      userId: "user-1",
      role: "EMPLOYEE",
      branchId: "branch-1",
    });

    const response = await approveExpensePost(
      new Request("http://localhost/api/expenses/exp-1/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remarks: "Approved" }),
      }),
      { params: Promise.resolve({ id: "exp-1" }) },
    );

    expect(response.status).toBe(401);
  });
});
