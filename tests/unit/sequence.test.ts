import { describe, expect, it } from "vitest";

import {
  formatEmployeeNo,
  formatInvoiceNo,
  formatPayslipNo,
} from "@/lib/sequence";

describe("sequence formatters", () => {
  it("formats employee numbers with padding", () => {
    expect(formatEmployeeNo(1)).toBe("EMP-00001");
    expect(formatEmployeeNo(12345)).toBe("EMP-12345");
  });

  it("formats invoice numbers", () => {
    expect(formatInvoiceNo(42)).toBe("INV-00042");
  });

  it("formats payslip numbers", () => {
    expect(formatPayslipNo(7)).toBe("PSL-00007");
  });
});
