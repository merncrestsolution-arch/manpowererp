"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Plus, UserRound } from "lucide-react";
import { useState } from "react";

import { AssignWorkerDialog } from "@/components/clients/assign-worker-dialog";
import { AssignmentStatusBadge } from "@/components/clients/client-status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useClientAssignments } from "@/hooks/use-clients";
import { patchApiData } from "@/lib/api-client";
import { formatColomboDate } from "@/lib/date";

type ClientWorkerAssignmentsTabProps = {
  clientId: string;
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ClientWorkerAssignmentsTab({
  clientId,
}: ClientWorkerAssignmentsTabProps) {
  const queryClient = useQueryClient();
  const { data: assignments = [], isLoading } = useClientAssignments(clientId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [endingId, setEndingId] = useState<string | null>(null);

  const handleEndAssignment = async (assignmentId: string) => {
    setEndingId(assignmentId);
    try {
      await patchApiData(`/api/clients/${clientId}/assignments`, {
        assignmentId,
      });
      await queryClient.invalidateQueries({
        queryKey: ["clients", clientId, "assignments"],
      });
    } finally {
      setEndingId(null);
    }
  };

  if (isLoading) {
    return (
      <p className="text-body-md text-muted-foreground">
        Loading assignments...
      </p>
    );
  }

  const currentAssignments = assignments.filter((item) => item.isCurrent);
  const historicalAssignments = assignments.filter((item) => !item.isCurrent);

  return (
    <div className="space-y-jk-lg">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Worker assignments</h3>
          <p className="text-body-md text-muted-foreground">
            Assign employees to this client with roles and date ranges.
          </p>
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" />
          Assign worker
        </Button>
      </div>

      <AssignmentSection
        title="Current assignments"
        emptyMessage="No active worker assignments."
        assignments={currentAssignments}
        onEndAssignment={handleEndAssignment}
        endingId={endingId}
        showEndAction
      />

      <AssignmentSection
        title="Assignment history"
        emptyMessage="No historical assignments."
        assignments={historicalAssignments}
        onEndAssignment={handleEndAssignment}
        endingId={endingId}
      />

      <AssignWorkerDialog
        clientId={clientId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}

type AssignmentSectionProps = {
  title: string;
  emptyMessage: string;
  assignments: ReturnType<typeof useClientAssignments>["data"];
  onEndAssignment: (assignmentId: string) => void;
  endingId: string | null;
  showEndAction?: boolean;
};

function AssignmentSection({
  title,
  emptyMessage,
  assignments = [],
  onEndAssignment,
  endingId,
  showEndAction = false,
}: AssignmentSectionProps) {
  return (
    <div className="space-y-jk-sm">
      <h4 className="text-body-md font-medium">{title}</h4>
      {assignments.length === 0 ? (
        <div className="p-jk-md text-muted-foreground rounded-lg border border-dashed text-center">
          {emptyMessage}
        </div>
      ) : (
        assignments.map((assignment) => (
          <div
            key={assignment.id}
            className="gap-jk-sm bg-card p-jk-md flex flex-col rounded-lg border sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="gap-jk-sm flex items-start">
              <Avatar size="sm">
                <AvatarFallback>
                  {getInitials(assignment.employeeName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{assignment.employeeName}</p>
                  <AssignmentStatusBadge status={assignment.status} />
                  {assignment.isCurrent ? (
                    <Badge variant="outline">Current</Badge>
                  ) : null}
                </div>
                <p className="text-label-md text-muted-foreground">
                  {assignment.employeeNo} · {assignment.role}
                </p>
                <p className="text-body-md text-muted-foreground">
                  {formatColomboDate(
                    new Date(assignment.assignedFrom),
                    "dd MMM yyyy",
                  )}
                  {" – "}
                  {assignment.assignedTo
                    ? formatColomboDate(
                        new Date(assignment.assignedTo),
                        "dd MMM yyyy",
                      )
                    : "Ongoing"}
                </p>
              </div>
            </div>
            {showEndAction && assignment.status === "ACTIVE" ? (
              <Button
                variant="outline"
                size="sm"
                disabled={endingId === assignment.id}
                onClick={() => onEndAssignment(assignment.id)}
              >
                <UserRound className="size-4" />
                End assignment
              </Button>
            ) : null}
          </div>
        ))
      )}
    </div>
  );
}
