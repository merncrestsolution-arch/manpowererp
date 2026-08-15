"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { scheduleInterviewSchema } from "@/application/dto/interview.schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useInterviewers } from "@/hooks/use-recruitment";
import { postApiData } from "@/lib/api-client";

import type { z } from "zod";

type ScheduleFormValues = z.input<typeof scheduleInterviewSchema>;

type InterviewScheduleDialogProps = {
  candidateId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function InterviewScheduleDialog({
  candidateId,
  open,
  onOpenChange,
}: InterviewScheduleDialogProps) {
  const queryClient = useQueryClient();
  const { data: interviewers = [] } = useInterviewers();

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleInterviewSchema),
    defaultValues: {
      scheduledAt: "",
      interviewerId: "",
      mode: "IN_PERSON",
      notes: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await postApiData(
      `/api/recruitment/candidates/${candidateId}/interviews`,
      values,
    );
    await queryClient.invalidateQueries({
      queryKey: ["recruitment", "candidates", candidateId],
    });
    form.reset();
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule interview</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-jk-md">
          <div className="space-y-2">
            <Label htmlFor="scheduledAt">Date & time</Label>
            <Input
              id="scheduledAt"
              type="datetime-local"
              {...form.register("scheduledAt")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interviewerId">Interviewer</Label>
            <Select
              id="interviewerId"
              value={form.watch("interviewerId")}
              onChange={(e) => form.setValue("interviewerId", e.target.value)}
            >
              <option value="">Select interviewer</option>
              {interviewers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="mode">Mode</Label>
            <Select
              id="mode"
              value={form.watch("mode")}
              onChange={(e) =>
                form.setValue(
                  "mode",
                  e.target.value as ScheduleFormValues["mode"],
                )
              }
            >
              <option value="IN_PERSON">In person</option>
              <option value="PHONE">Phone</option>
              <option value="VIDEO">Video</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={3} {...form.register("notes")} />
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
              Schedule
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
