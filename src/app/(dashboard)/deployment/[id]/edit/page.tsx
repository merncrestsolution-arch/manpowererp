"use client";

import { use } from "react";

import { DeploymentForm } from "@/components/deployment/deployment-form";
import { PageShell } from "@/components/shared/page-shell";
import { useDeployment } from "@/hooks/use-deployment";

type EditDeploymentPageProps = {
  params: Promise<{ id: string }>;
};

export default function EditDeploymentPage({
  params,
}: EditDeploymentPageProps) {
  const { id } = use(params);
  const { data: deployment, isLoading, error } = useDeployment(id);

  if (isLoading) {
    return (
      <PageShell title="Edit Deployment" description="Loading deployment...">
        <p className="text-body-md text-muted-foreground">
          Loading deployment...
        </p>
      </PageShell>
    );
  }

  if (error || !deployment) {
    return (
      <PageShell
        title="Edit Deployment"
        description="Update deployment details."
      >
        <p className="text-body-md text-destructive">Deployment not found</p>
      </PageShell>
    );
  }

  return (
    <PageShell title="Edit Deployment" description={deployment.deploymentNo}>
      <DeploymentForm mode="edit" deployment={deployment} />
    </PageShell>
  );
}
