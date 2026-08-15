import { z } from "zod";

export const ledgerSourceTypeSchema = z.enum([
  "PAYROLL",
  "EXPENSE",
  "INVOICE",
  "PAYMENT",
  "MANUAL",
]);

export const journalLineSchema = z.object({
  accountCode: z.string().min(1),
  description: z.string().min(1),
  debit: z.number().min(0),
  credit: z.number().min(0),
});

export const postJournalEntrySchema = z.object({
  reference: z.string().min(1),
  date: z.string().min(1),
  description: z.string().min(1),
  sourceType: ledgerSourceTypeSchema,
  sourceId: z.string().min(1),
  lines: z.array(journalLineSchema).min(2),
});

export type JournalLineInput = z.infer<typeof journalLineSchema>;
export type PostJournalEntryInput = z.infer<typeof postJournalEntrySchema>;
