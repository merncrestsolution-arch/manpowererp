"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ExternalLink, UserCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { CandidateInterviewsTab } from "@/components/recruitment/candidate-interviews-tab";
import { CandidateStatusBadge } from "@/components/recruitment/candidate-status-badge";
import { CandidateStatusHistoryTab } from "@/components/recruitment/candidate-status-history-tab";
import { PlaceCandidateDialog } from "@/components/recruitment/place-candidate-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { patchApiData } from "@/lib/api-client";
import { UploadDropzone } from "@/lib/uploadthing";

import type { CandidateDetail } from "@/types/recruitment";
import type { CandidateStatus } from "@prisma/client";

type CandidateProfileTabsProps = {
  candidate: CandidateDetail;
  canManage?: boolean;
};

export function CandidateProfileTabs({
  candidate,
  canManage = false,
}: CandidateProfileTabsProps) {
  const queryClient = useQueryClient();
  const [placeOpen, setPlaceOpen] = useState(false);
  const [status, setStatus] = useState<CandidateStatus>(candidate.status);
  const [remarks, setRemarks] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async () => {
    if (status === candidate.status) return;
    setIsUpdating(true);
    try {
      await patchApiData(`/api/recruitment/candidates/${candidate.id}/status`, {
        status,
        remarks,
      });
      await queryClient.invalidateQueries({
        queryKey: ["recruitment", "candidates", candidate.id],
      });
      setRemarks("");
    } finally {
      setIsUpdating(false);
    }
  };

  const fields = [
    { label: "Candidate No", value: candidate.candidateNo },
    { label: "Email", value: candidate.email ?? "—" },
    { label: "Phone", value: candidate.phone ?? "—" },
    { label: "NIC", value: candidate.nic ?? "—" },
    { label: "Job opening", value: candidate.jobOpeningTitle },
    { label: "Applied for", value: candidate.appliedFor ?? "—" },
    { label: "Source", value: candidate.source.replaceAll("_", " ") },
  ];

  return (
    <div className="space-y-jk-lg">
      <div className="gap-jk-md flex flex-col sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-headline-md">
              {candidate.firstName} {candidate.lastName}
            </h1>
            <CandidateStatusBadge status={candidate.status} />
          </div>
          <p className="text-body-md text-muted-foreground">
            {candidate.candidateNo} · {candidate.jobOpeningTitle}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {candidate.status === "OFFERED" && canManage ? (
            <Button onClick={() => setPlaceOpen(true)}>
              <UserCheck className="size-4" />
              Place candidate
            </Button>
          ) : null}
          {candidate.placedEmployeeId ? (
            <Button
              variant="outline"
              render={
                <Link href={`/employees/${candidate.placedEmployeeId}`} />
              }
            >
              View employee record
            </Button>
          ) : null}
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="resume">Resume</TabsTrigger>
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="shadow-card">
            <CardContent className="gap-jk-md grid pt-(--card-spacing) sm:grid-cols-2">
              {fields.map((field) => (
                <div key={field.label}>
                  <p className="text-label-md text-muted-foreground">
                    {field.label}
                  </p>
                  <p className="mt-0.5 font-medium">{field.value}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resume">
          <div className="space-y-jk-md">
            {candidate.resumeUrl ? (
              <Button
                variant="outline"
                render={
                  <Link
                    href={candidate.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                <ExternalLink className="size-4" />
                View / download resume
              </Button>
            ) : (
              <p className="text-muted-foreground">No resume uploaded.</p>
            )}
            {canManage && candidate.status !== "PLACED" ? (
              <UploadDropzone
                endpoint="candidateResume"
                input={{ candidateId: candidate.id }}
                onClientUploadComplete={async () => {
                  await queryClient.invalidateQueries({
                    queryKey: ["recruitment", "candidates", candidate.id],
                  });
                }}
              />
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="interviews">
          <CandidateInterviewsTab candidateId={candidate.id} />
        </TabsContent>

        <TabsContent value="status">
          {canManage && candidate.status !== "PLACED" ? (
            <Card className="shadow-card max-w-lg">
              <CardContent className="space-y-jk-md pt-(--card-spacing)">
                <div className="space-y-2">
                  <Label>Change status</Label>
                  <Select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as CandidateStatus)
                    }
                  >
                    <option value="APPLIED">Applied</option>
                    <option value="SCREENING">Screening</option>
                    <option value="INTERVIEW_SCHEDULED">
                      Interview Scheduled
                    </option>
                    <option value="INTERVIEWED">Interviewed</option>
                    <option value="OFFERED">Offered</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="WITHDRAWN">Withdrawn</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Remarks</Label>
                  <Textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button
                  onClick={handleStatusChange}
                  disabled={isUpdating || status === candidate.status}
                >
                  Update status
                </Button>
              </CardContent>
            </Card>
          ) : (
            <p className="text-muted-foreground">
              Status changes are not available for placed candidates.
            </p>
          )}
        </TabsContent>

        <TabsContent value="history">
          <CandidateStatusHistoryTab candidateId={candidate.id} />
        </TabsContent>
      </Tabs>

      <PlaceCandidateDialog
        candidate={candidate}
        open={placeOpen}
        onOpenChange={setPlaceOpen}
      />
    </div>
  );
}
