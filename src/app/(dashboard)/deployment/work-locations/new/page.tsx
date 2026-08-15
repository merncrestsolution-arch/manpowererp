import { WorkLocationForm } from "@/components/deployment/work-location-form";
import { PageShell } from "@/components/shared/page-shell";

export default function NewWorkLocationPage() {
  return (
    <PageShell
      title="New Work Location"
      description="Add a client site for worker deployment"
    >
      <WorkLocationForm mode="create" />
    </PageShell>
  );
}
