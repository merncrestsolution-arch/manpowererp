import { describe, expect, it, vi, beforeEach } from "vitest";

import { postJournalEntry } from "@/application/use-cases/post-journal-entry";
import { prisma } from "@/infrastructure/db/prisma";

vi.mock("@/application/use-cases/seed-chart-accounts", () => ({
  ensureDefaultChartAccounts: vi.fn(),
}));

vi.mock("@/infrastructure/db/prisma", () => ({
  prisma: {
    $transaction: vi.fn(),
  },
}));

function createTxMock(existingEntry: { journalId: string } | null = null) {
  return {
    ledgerEntry: {
      findFirst: vi.fn().mockResolvedValue(existingEntry),
    },
    journal: {
      create: vi.fn(),
    },
    chartAccount: {
      findFirst: vi.fn(),
    },
    ledgerEntryCreate: vi.fn(),
  };
}

describe("postJournalEntry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unbalanced journal lines", async () => {
    const tx = createTxMock();

    vi.mocked(prisma.$transaction).mockImplementation(async (callback) =>
      callback(tx as never),
    );

    const result = await postJournalEntry({
      branchId: "branch-1",
      userId: "user-1",
      reference: "JE-001",
      date: new Date("2026-01-01"),
      description: "Test entry",
      sourceType: "MANUAL",
      sourceId: "src-1",
      lines: [
        { accountCode: "1000", description: "Cash", debit: 100, credit: 0 },
        { accountCode: "2000", description: "Payable", debit: 0, credit: 50 },
      ],
    });

    expect(result).toEqual({
      success: false,
      error: "Journal is unbalanced: debits 100 != credits 50",
    });
    expect(tx.journal.create).not.toHaveBeenCalled();
  });

  it("skips duplicate posting for the same source", async () => {
    const tx = createTxMock({ journalId: "journal-existing" });

    vi.mocked(prisma.$transaction).mockImplementation(async (callback) =>
      callback(tx as never),
    );

    const result = await postJournalEntry({
      branchId: "branch-1",
      userId: "user-1",
      reference: "JE-002",
      date: new Date("2026-01-01"),
      description: "Duplicate source",
      sourceType: "PAYMENT",
      sourceId: "payment-1",
      lines: [
        { accountCode: "1000", description: "Cash", debit: 100, credit: 0 },
        { accountCode: "1100", description: "AR", debit: 0, credit: 100 },
      ],
    });

    expect(result).toEqual({
      success: true,
      journalId: "journal-existing",
      skipped: true,
    });
    expect(tx.journal.create).not.toHaveBeenCalled();
  });
});
