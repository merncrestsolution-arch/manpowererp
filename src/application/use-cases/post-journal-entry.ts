import { ensureDefaultChartAccounts } from "@/application/use-cases/seed-chart-accounts";
import { prisma } from "@/infrastructure/db/prisma";
import { validateJournalLines } from "@/lib/journal-validation";

import type { JournalLineInput } from "@/application/dto/journal-entry.schema";
import type { LedgerSourceType } from "@/types/finance";
import type { Prisma } from "@prisma/client";

type PostJournalEntryParams = {
  branchId: string;
  userId: string;
  reference: string;
  date: Date;
  description: string;
  sourceType: LedgerSourceType;
  sourceId: string;
  lines: JournalLineInput[];
  tx?: Prisma.TransactionClient;
};

type PostJournalEntryResult =
  | { success: true; journalId: string; skipped: boolean }
  | { success: false; error: string };

async function executePostJournalEntry(
  tx: Prisma.TransactionClient,
  params: PostJournalEntryParams,
): Promise<PostJournalEntryResult> {
  const existing = await tx.ledgerEntry.findFirst({
    where: {
      branchId: params.branchId,
      sourceType: params.sourceType,
      sourceId: params.sourceId,
    },
    select: { journalId: true },
  });

  if (existing) {
    return {
      success: true,
      journalId: existing.journalId,
      skipped: true,
    };
  }

  const validation = validateJournalLines(params.lines);

  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const journal = await tx.journal.create({
    data: {
      branchId: params.branchId,
      reference: params.reference,
      date: params.date,
      description: params.description,
      postedById: params.userId,
      status: "POSTED",
      createdBy: params.userId,
      updatedBy: params.userId,
    },
  });

  for (const line of params.lines) {
    const account = await tx.chartAccount.findFirst({
      where: {
        branchId: params.branchId,
        code: line.accountCode,
        deletedAt: null,
        isActive: true,
      },
      select: { id: true },
    });

    if (!account) {
      return {
        success: false,
        error: `Chart account ${line.accountCode} not found`,
      };
    }

    await tx.ledgerEntry.create({
      data: {
        branchId: params.branchId,
        accountId: account.id,
        entryDate: params.date,
        description: line.description,
        debit: line.debit,
        credit: line.credit,
        sourceType: params.sourceType,
        sourceId: params.sourceId,
        journalId: journal.id,
        createdBy: params.userId,
        updatedBy: params.userId,
      },
    });
  }

  return { success: true, journalId: journal.id, skipped: false };
}

export async function postJournalEntry(
  params: PostJournalEntryParams,
): Promise<PostJournalEntryResult> {
  await ensureDefaultChartAccounts(params.branchId, params.userId);

  if (params.tx) {
    return executePostJournalEntry(params.tx, params);
  }

  return prisma.$transaction((tx) => executePostJournalEntry(tx, params));
}
