"use client";

import { use } from "react";

import { JobOpeningForm } from "@/components/recruitment/job-opening-form";
import { PageShell } from "@/components/shared/page-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { useJobOpening } from "@/hooks/use-recruitment";

type JobOpeningDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default function JobOpeningDetailPage({
  params,
}: JobOpeningDetailPageProps) {
  const { id } = use(params);
  const { data: jobOpening, isLoading, isError } = useJobOpening(id);

  if (isLoading) {
    return (
      <PageShell title="Edit job opening" description="Loading job opening.">
        <Skeleton className="h-64 w-full" />
      </PageShell>
    );
  }

  if (isError || !jobOpening) {
    return (
      <PageShell
        title="Edit job opening"
        description="Update job opening details."
      >
        <p className="text-muted-foreground">Job opening not found.</p>
      </PageShell>
    );
  }

  return (
    <PageShell title="Edit job opening" description={jobOpening.title}>
      <JobOpeningForm mode="edit" jobOpening={jobOpening} />
    </PageShell>
  );
}
