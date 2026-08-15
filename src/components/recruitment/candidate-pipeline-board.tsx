"use client";

import Link from "next/link";

import {
  CandidateStatusBadge,
  pipelineColumnColors,
} from "@/components/recruitment/candidate-status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCandidatePipeline } from "@/hooks/use-recruitment";
import { cn } from "@/lib/utils";

function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

export function CandidatePipelineBoard() {
  const { data: columns = [], isLoading } = useCandidatePipeline();

  if (isLoading) {
    return (
      <p className="text-body-md text-muted-foreground">Loading pipeline...</p>
    );
  }

  return (
    <div className="gap-jk-md flex overflow-x-auto pb-2">
      {columns.map((column) => (
        <div key={column.status} className="min-w-[280px] flex-1">
          <Card
            className={cn(
              "shadow-card border-t-4",
              pipelineColumnColors[column.status],
            )}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-body-md font-medium">
                  <CandidateStatusBadge status={column.status} />
                </CardTitle>
                <Badge variant="secondary">{column.count}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-jk-sm">
              {column.candidates.length === 0 ? (
                <p className="text-label-md text-muted-foreground py-4 text-center">
                  No candidates
                </p>
              ) : (
                column.candidates.map((candidate) => (
                  <Link
                    key={candidate.id}
                    href={`/recruitment/candidates/${candidate.id}`}
                    className="border-border bg-muted/30 hover:border-primary/30 hover:bg-muted/50 block rounded-lg border p-3 transition-colors"
                  >
                    <div className="gap-jk-sm flex items-start">
                      <Avatar size="sm">
                        <AvatarFallback>
                          {getInitials(candidate.firstName, candidate.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">
                          {candidate.firstName} {candidate.lastName}
                        </p>
                        <p className="text-label-md text-muted-foreground truncate">
                          {candidate.appliedFor ?? candidate.jobOpeningTitle}
                        </p>
                        <p className="text-label-md text-muted-foreground mt-1">
                          {candidate.daysInStage}d in stage
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
