"use client";

import Link from "next/link";

import { RecruitmentFunnelChart } from "@/components/reports/recruitment-funnel-chart";
import { ReportsHubNav } from "@/components/reports/reports-hub-nav";
import { SourceOfHireChart } from "@/components/reports/source-of-hire-chart";
import { PageShell } from "@/components/shared/page-shell";
import { Button } from "@/components/ui/button";
import { useRecruitmentFunnelReport } from "@/hooks/use-reports";

const recruitmentLinks = [
  { label: "Pipeline", href: "/reports/recruitment/pipeline" },
  { label: "Source of hire", href: "/reports/recruitment/source-of-hire" },
];

export default function SourceOfHirePage() {
  const { data, isLoading } = useRecruitmentFunnelReport();

  return (
    <PageShell
      title="Source of hire"
      description="Candidate volume and placements by recruitment source"
      actions={
        <Button variant="outline" render={<Link href="/reports" />}>
          Back to reports
        </Button>
      }
    >
      <ReportsHubNav items={recruitmentLinks} />
      <SourceOfHireChart report={data} isLoading={isLoading} />
      <RecruitmentFunnelChart report={data} isLoading={isLoading} />
    </PageShell>
  );
}
