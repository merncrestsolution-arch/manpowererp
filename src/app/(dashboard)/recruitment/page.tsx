"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { CandidatePipelineBoard } from "@/components/recruitment/candidate-pipeline-board";
import { CandidateTable } from "@/components/recruitment/candidate-table";
import { PageShell } from "@/components/shared/page-shell";
import { Button } from "@/components/ui/button";

export default function RecruitmentPage() {
  const [view, setView] = useState<"list" | "pipeline">("list");

  return (
    <PageShell
      title="Recruitment"
      description="Manage candidates, interviews, and placements."
      actions={
        <>
          <div className="border-border bg-card shadow-card inline-flex h-9 items-center rounded-xl border p-0.5">
            <Button
              variant={view === "list" ? "default" : "ghost"}
              className="h-8 px-3"
              onClick={() => setView("list")}
            >
              List
            </Button>
            <Button
              variant={view === "pipeline" ? "default" : "ghost"}
              className="h-8 px-3"
              onClick={() => setView("pipeline")}
            >
              Pipeline
            </Button>
          </div>
          <Button
            variant="outline"
            className="h-9"
            render={<Link href="/recruitment/job-openings" />}
          >
            Job openings
          </Button>
          <Button
            className="h-9"
            render={<Link href="/recruitment/candidates/new" />}
          >
            <Plus className="size-4" />
            Add candidate
          </Button>
        </>
      }
    >
      {view === "list" ? <CandidateTable /> : <CandidatePipelineBoard />}
    </PageShell>
  );
}
