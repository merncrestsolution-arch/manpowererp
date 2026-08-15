"use client";

import { use } from "react";

import { DeploymentDetailTabs } from "@/components/deployment/deployment-detail-tabs";
import { useDeployment } from "@/hooks/use-deployment";

type DeploymentDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default function DeploymentDetailPage({
  params,
}: DeploymentDetailPageProps) {
  const { id } = use(params);
  const { data: deployment, isLoading, error } = useDeployment(id);

  if (isLoading) {
    return (
      <p className="text-body-md text-muted-foreground">
        Loading deployment...
      </p>
    );
  }

  if (error || !deployment) {
    return (
      <p className="text-body-md text-destructive">Deployment not found</p>
    );
  }

  return <DeploymentDetailTabs deployment={deployment} />;
}
