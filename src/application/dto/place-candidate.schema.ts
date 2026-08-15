import { z } from "zod";

export const placeCandidateSchema = z.object({
  department: z.string().trim().min(1, "Department is required"),
  designation: z.string().trim().min(1, "Designation is required"),
  joinedAt: z.string().min(1, "Joining date is required"),
  basicSalary: z.coerce.number().min(0, "Salary must be zero or greater"),
  employmentType: z
    .enum(["PERMANENT", "CONTRACT", "TEMPORARY"])
    .default("PERMANENT"),
});

export type PlaceCandidateInput = z.infer<typeof placeCandidateSchema>;
