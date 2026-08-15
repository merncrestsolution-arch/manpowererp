import { z } from "zod";

export const interviewModeSchema = z.enum(["IN_PERSON", "PHONE", "VIDEO"]);

export const interviewOutcomeSchema = z.enum([
  "PENDING",
  "PASSED",
  "FAILED",
  "NO_SHOW",
]);

export const scheduleInterviewSchema = z.object({
  scheduledAt: z.string().min(1, "Date and time are required"),
  interviewerId: z.string().min(1, "Interviewer is required"),
  mode: interviewModeSchema.default("IN_PERSON"),
  notes: z.string().trim().optional().or(z.literal("")),
});

export const recordInterviewOutcomeSchema = z.object({
  interviewId: z.string().min(1),
  outcome: interviewOutcomeSchema,
  notes: z.string().trim().optional().or(z.literal("")),
});

export type ScheduleInterviewInput = z.infer<typeof scheduleInterviewSchema>;
export type RecordInterviewOutcomeInput = z.infer<
  typeof recordInterviewOutcomeSchema
>;
