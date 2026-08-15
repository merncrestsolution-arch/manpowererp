import { z } from "zod";

export const paymentMethodSchema = z.enum([
  "BANK_TRANSFER",
  "CHEQUE",
  "CASH",
  "CARD",
  "OTHER",
]);

export const recordPaymentSchema = z
  .object({
    amount: z.coerce.number().positive("Amount must be greater than zero"),
    paymentDate: z.string().min(1, "Payment date is required"),
    method: paymentMethodSchema,
    reference: z.string().trim().optional(),
    chequeNumber: z.string().trim().optional(),
    chequeBank: z.string().trim().optional(),
    chequeBranch: z.string().trim().optional(),
    chequeDate: z.string().optional(),
    bankName: z.string().trim().optional(),
    accountNumber: z.string().trim().optional(),
    transactionId: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.method === "CHEQUE") {
      if (!data.chequeNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["chequeNumber"],
          message: "Cheque number is required",
        });
      }
      if (!data.chequeBank) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["chequeBank"],
          message: "Bank name is required",
        });
      }
    }

    if (data.method === "BANK_TRANSFER") {
      if (!data.transactionId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["transactionId"],
          message: "Transaction ID is required",
        });
      }
      if (!data.bankName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["bankName"],
          message: "Bank name is required",
        });
      }
    }
  });

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;

export function buildPaymentReference(
  input: RecordPaymentInput,
): string | null {
  const parts: string[] = [];

  if (input.method === "CHEQUE") {
    if (input.chequeNumber) {
      parts.push(`Cheque ${input.chequeNumber}`);
    }
    if (input.chequeBank) {
      parts.push(input.chequeBank);
    }
    if (input.chequeBranch) {
      parts.push(input.chequeBranch);
    }
    if (input.chequeDate) {
      parts.push(`dated ${input.chequeDate}`);
    }
  }

  if (input.method === "BANK_TRANSFER") {
    if (input.transactionId) {
      parts.push(`Txn ${input.transactionId}`);
    }
    if (input.bankName) {
      parts.push(input.bankName);
    }
    if (input.accountNumber) {
      parts.push(`Acc ${input.accountNumber}`);
    }
  }

  if (input.reference) {
    parts.push(input.reference);
  }

  return parts.length ? parts.join(" · ") : null;
}
