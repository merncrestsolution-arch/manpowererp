import { z } from "zod";

import { lineItemSchema } from "@/application/dto/quotation.schema";

export const invoiceStatusSchema = z.enum([
  "DRAFT",
  "SENT",
  "PARTIALLY_PAID",
  "PAID",
  "OVERDUE",
  "CANCELLED",
]);

export const createInvoiceSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  quotationId: z.string().optional(),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  taxAmount: z.coerce.number().min(0).default(0),
  notes: z.string().trim().optional(),
  lineItems: z
    .array(lineItemSchema)
    .min(1, "At least one line item is required"),
});

export const updateInvoiceSchema = createInvoiceSchema
  .partial()
  .extend({
    lineItems: z.array(lineItemSchema).min(1).optional(),
    status: z.enum(["DRAFT", "SENT", "CANCELLED"]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const listInvoicesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  clientId: z.string().trim().optional(),
  status: invoiceStatusSchema.optional(),
  dateFrom: z.string().trim().optional(),
  dateTo: z.string().trim().optional(),
  includeDeleted: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
  sortBy: z
    .enum([
      "invoiceNo",
      "issueDate",
      "dueDate",
      "total",
      "amountDue",
      "status",
      "createdAt",
    ])
    .default("issueDate"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type ListInvoicesQuery = z.infer<typeof listInvoicesQuerySchema>;
