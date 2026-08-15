import { describe, expect, it } from "vitest";

import { validateJournalLines } from "@/lib/journal-validation";

describe("validateJournalLines", () => {
  it("accepts balanced journal lines", () => {
    const result = validateJournalLines([
      { accountCode: "1000", description: "Cash", debit: 1000, credit: 0 },
      { accountCode: "4000", description: "Revenue", debit: 0, credit: 1000 },
    ]);

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.totalDebit).toBe(1000);
      expect(result.totalCredit).toBe(1000);
    }
  });

  it("rejects unbalanced journal lines", () => {
    const result = validateJournalLines([
      { accountCode: "1000", description: "Cash", debit: 1000, credit: 0 },
      { accountCode: "4000", description: "Revenue", debit: 0, credit: 900 },
    ]);

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain("unbalanced");
    }
  });

  it("rejects journals without debits and credits", () => {
    const result = validateJournalLines([
      { accountCode: "1000", description: "Cash", debit: 0, credit: 0 },
    ]);

    expect(result.valid).toBe(false);
  });
});
