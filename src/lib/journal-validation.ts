import type { JournalLineInput } from "@/application/dto/journal-entry.schema";

export type JournalValidationResult =
  | { valid: true; totalDebit: number; totalCredit: number }
  | { valid: false; error: string };

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function validateJournalLines(
  lines: JournalLineInput[],
): JournalValidationResult {
  const totalDebit = roundMoney(
    lines.reduce((sum, line) => sum + line.debit, 0),
  );
  const totalCredit = roundMoney(
    lines.reduce((sum, line) => sum + line.credit, 0),
  );

  if (totalDebit <= 0 || totalCredit <= 0) {
    return {
      valid: false,
      error: "Journal lines must include debits and credits",
    };
  }

  if (totalDebit !== totalCredit) {
    return {
      valid: false,
      error: `Journal is unbalanced: debits ${totalDebit} != credits ${totalCredit}`,
    };
  }

  return { valid: true, totalDebit, totalCredit };
}
