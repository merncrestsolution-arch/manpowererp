"use client";

import { Calendar, Plus } from "lucide-react";
import { useState } from "react";

import { InterviewOutcomeDialog } from "@/components/recruitment/interview-outcome-dialog";
import { InterviewScheduleDialog } from "@/components/recruitment/interview-schedule-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCandidateInterviews } from "@/hooks/use-recruitment";
import { formatColomboDate } from "@/lib/date";

import type { InterviewItem } from "@/types/recruitment";

type CandidateInterviewsTabProps = {
  candidateId: string;
};

export function CandidateInterviewsTab({
  candidateId,
}: CandidateInterviewsTabProps) {
  const { data: interviews = [], isLoading } =
    useCandidateInterviews(candidateId);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [outcomeInterview, setOutcomeInterview] =
    useState<InterviewItem | null>(null);

  if (isLoading) {
    return <p className="text-muted-foreground">Loading interviews...</p>;
  }

  return (
    <div className="space-y-jk-md">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Interviews</h3>
        <Button size="sm" onClick={() => setScheduleOpen(true)}>
          <Plus className="size-4" />
          Schedule interview
        </Button>
      </div>
      {interviews.length === 0 ? (
        <div className="p-jk-lg text-muted-foreground rounded-lg border border-dashed text-center">
          No interviews scheduled.
        </div>
      ) : (
        interviews.map((interview) => (
          <div
            key={interview.id}
            className="gap-jk-sm bg-card p-jk-md flex flex-col rounded-lg border sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="text-muted-foreground size-4" />
                <p className="font-medium">
                  {formatColomboDate(
                    new Date(interview.scheduledAt),
                    "dd MMM yyyy · HH:mm",
                  )}
                </p>
                <Badge variant="outline">
                  {interview.mode.replaceAll("_", " ")}
                </Badge>
                <Badge variant="outline">{interview.outcome}</Badge>
              </div>
              <p className="text-body-md text-muted-foreground">
                Interviewer: {interview.interviewerName}
              </p>
              {interview.notes ? (
                <p className="text-body-md mt-1">{interview.notes}</p>
              ) : null}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOutcomeInterview(interview)}
            >
              Record outcome
            </Button>
          </div>
        ))
      )}
      <InterviewScheduleDialog
        candidateId={candidateId}
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
      />
      <InterviewOutcomeDialog
        candidateId={candidateId}
        interview={outcomeInterview}
        open={Boolean(outcomeInterview)}
        onOpenChange={(open) => !open && setOutcomeInterview(null)}
      />
    </div>
  );
}
