"use client";

import Link from "next/link";

import { HeadcountReportView } from "@/components/reports/headcount-report";
import { ReportsHubNav } from "@/components/reports/reports-hub-nav";
import { PageShell } from "@/components/shared/page-shell";
import { Button } from "@/components/ui/button";
import { useHeadcountReport } from "@/hooks/use-reports";

const hrLinks = [
  { label: "Headcount", href: "/reports/hr/headcount" },
  { label: "Attendance", href: "/reports/hr/attendance" },
  { label: "Leave", href: "/reports/hr/leave" },
];

export default function HeadcountReportPage() {
  const { data, isLoading } = useHeadcountReport();

  return (
    <PageShell
      title="Headcount report"
      description="Employee counts by department, designation, and status"
      actions={
        <Button variant="outline" render={<Link href="/reports" />}>
          Back to reports
        </Button>
      }
    >
      <ReportsHubNav items={hrLinks} />
      <HeadcountReportView report={data} isLoading={isLoading} />
    </PageShell>
  );
}
