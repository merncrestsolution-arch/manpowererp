import { JobOpeningForm } from "@/components/recruitment/job-opening-form";
import { PageShell } from "@/components/shared/page-shell";

export default function NewJobOpeningPage() {
  return (
    <PageShell title="Add job opening">
      <JobOpeningForm mode="create" />
    </PageShell>
  );
}
