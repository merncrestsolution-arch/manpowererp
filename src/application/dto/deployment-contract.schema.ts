import { z } from "zod";

export const createDeploymentContractSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  fileUrl: z.string().url("Valid file URL is required"),
  signedAt: z.string().optional().or(z.literal("")),
  expiresAt: z.string().optional().or(z.literal("")),
});

export type CreateDeploymentContractInput = z.infer<
  typeof createDeploymentContractSchema
>;
