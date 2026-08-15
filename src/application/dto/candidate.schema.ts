import { z } from "zod";

export const candidateSourceSchema = z.enum([
  "WEBSITE",
  "REFERRAL",
  "AGENCY",
  "WALK_IN",
  "OTHER",
]);

export const candidateStatusSchema = z.enum([
  "APPLIED",
  "SCREENING",
  "INTERVIEW_SCHEDULED",
  "INTERVIEWED",
  "OFFERED",
  "PLACED",
  "REJECTED",
  "WITHDRAWN",
]);

export const createCandidateSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  nic: z.string().trim().optional().or(z.literal("")),
  jobOpeningId: z.string().min(1, "Job opening is required"),
  appliedFor: z.string().trim().optional().or(z.literal("")),
  source: candidateSourceSchema.default("OTHER"),
  resumeUrl: z.string().trim().optional().or(z.literal("")),
});

export const updateCandidateSchema = createCandidateSchema.partial();

export const changeCandidateStatusSchema = z.object({
  status: candidateStatusSchema.refine((status) => status !== "PLACED", {
    message: "Use placement flow to mark candidate as placed",
  }),
  remarks: z.string().trim().optional().or(z.literal("")),
});

export const listCandidatesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  status: candidateStatusSchema.optional(),
  source: candidateSourceSchema.optional(),
  jobOpeningId: z.string().trim().optional(),
  includeDeleted: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
  sortBy: z
    .enum(["candidateNo", "firstName", "lastName", "status", "createdAt"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateCandidateInput = z.infer<typeof createCandidateSchema>;
export type UpdateCandidateInput = z.infer<typeof updateCandidateSchema>;
export type ChangeCandidateStatusInput = z.infer<
  typeof changeCandidateStatusSchema
>;
export type ListCandidatesQuery = z.infer<typeof listCandidatesQuerySchema>;
