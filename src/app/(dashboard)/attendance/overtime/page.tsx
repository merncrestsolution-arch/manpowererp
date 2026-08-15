import Link from "next/link";

import { OvertimeApprovalTable } from "@/components/attendance/overtime-approval-table";
import { PageShell } from "@/components/shared/page-shell";
import { Button } from "@/components/ui/button";

export default function OvertimePage() {
  return (
    <PageShell
      title="Overtime approvals"
      description="Review and approve overtime generated from attendance records."
      actions={
        <Button variant="outline" render={<Link href="/attendance" />}>
          Back
        </Button>
      }
    >
      <OvertimeApprovalTable />
    </PageShell>
  );
}
