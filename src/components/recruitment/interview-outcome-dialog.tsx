"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { recordInterviewOutcomeSchema } from "@/application/dto/interview.schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { patchApiData } from "@/lib/api-client";

import type { InterviewItem } from "@/types/recruitment";
import type { z } from "zod";

type OutcomeFormValues = z.input<typeof recordInterviewOutcomeSchema>;

type InterviewOutcomeDialogProps = {
  candidateId: string;
  interview: InterviewItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function InterviewOutcomeDialog({
  candidateId,
  interview,
  open,
  onOpenChange,
}: InterviewOutcomeDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<OutcomeFormValues>({
    resolver: zodResolver(recordInterviewOutcomeSchema),
    values: {
      interviewId: interview?.id ?? "",
      outcome: interview?.outcome ?? "PENDING",
      notes: interview?.notes ?? "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await patchApiData(
      `/api/recruitment/candidates/${candidateId}/interviews`,
      values,
    );
    await queryClient.invalidateQueries({
      queryKey: ["recruitment", "candidates", candidateId],
    });
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record interview outcome</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-jk-md">
          <div className="space-y-2">
            <Label htmlFor="outcome">Outcome</Label>
            <Select
              id="outcome"
              value={form.watch("outcome")}
              onChange={(e) =>
                form.setValue(
                  "outcome",
                  e.target.value as OutcomeFormValues["outcome"],
                )
              }
            >
              <option value="PENDING">Pending</option>
              <option value="PASSED">Passed</option>
              <option value="FAILED">Failed</option>
              <option value="NO_SHOW">No show</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="outcome-notes">Notes</Label>
            <Textarea id="outcome-notes" rows={3} {...form.register("notes")} />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              Save outcome
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
