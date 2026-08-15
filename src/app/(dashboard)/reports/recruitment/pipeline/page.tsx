"use client";

import Link from "next/link";

import { RecruitmentFunnelChart } from "@/components/reports/recruitment-funnel-chart";
import { ReportsHubNav } from "@/components/reports/reports-hub-nav";
import { TimeToHireReportView } from "@/components/reports/time-to-hire-report";
import { PageShell } from "@/components/shared/page-shell";
import { Button } from "@/components/ui/button";
import {
  useRecruitmentFunnelReport,
  useTimeToHireReport,
} from "@/hooks/use-reports";

const recruitmentLinks = [
  { label: "Pipeline", href: "/reports/recruitment/pipeline" },
  { label: "Source of hire", href: "/reports/recruitment/source-of-hire" },
];

export default function RecruitmentPipelinePage() {
  const { data: funnel, isLoading: funnelLoading } =
    useRecruitmentFunnelReport();
  const { data: timeToHire, isLoading: timeLoading } = useTimeToHireReport();

  return (
    <PageShell
      title="Recruitment pipeline"
      description="Conversion funnel and time-to-hire metrics"
      actions={
        <Button variant="outline" render={<Link href="/reports" />}>
          Back to reports
        </Button>
      }
    >
      <ReportsHubNav items={recruitmentLinks} />
      <RecruitmentFunnelChart report={funnel} isLoading={funnelLoading} />
      <TimeToHireReportView report={timeToHire} isLoading={timeLoading} />
    </PageShell>
  );
}
