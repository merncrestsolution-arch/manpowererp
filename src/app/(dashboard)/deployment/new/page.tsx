import { DeploymentForm } from "@/components/deployment/deployment-form";
import { PageShell } from "@/components/shared/page-shell";

export default function NewDeploymentPage() {
  return (
    <PageShell
      title="New Deployment"
      description="Assign a worker to a client location and shift"
    >
      <DeploymentForm mode="create" />
    </PageShell>
  );
}
