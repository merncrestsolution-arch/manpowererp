import { Plus } from "lucide-react";
import Link from "next/link";

import { JobOpeningTable } from "@/components/recruitment/job-opening-table";
import { PageShell } from "@/components/shared/page-shell";
import { Button } from "@/components/ui/button";

export default function JobOpeningsPage() {
  return (
    <PageShell
      title="Job openings"
      description="Manage open roles and link candidates."
      actions={
        <Button
          className="h-9"
          render={<Link href="/recruitment/job-openings/new" />}
        >
          <Plus className="size-4" />
          Add opening
        </Button>
      }
    >
      <JobOpeningTable />
    </PageShell>
  );
}
