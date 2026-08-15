"use client";

import { Pencil } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { DeploymentContractTab } from "@/components/deployment/deployment-contract-tab";
import { DeploymentStatusBadge } from "@/components/deployment/deployment-status-badge";
import { ShiftAllocationTable } from "@/components/deployment/shift-allocation-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBranchShifts } from "@/hooks/use-deployment";
import { postApiData } from "@/lib/api-client";
import { formatColomboDate } from "@/lib/date";

import type { DeploymentDetail } from "@/types/deployment";

type DeploymentDetailTabsProps = {
  deployment: DeploymentDetail;
};

export function DeploymentDetailTabs({
  deployment,
}: DeploymentDetailTabsProps) {
  const [isEnding, setIsEnding] = useState(false);
  const { data: shifts = [] } = useBranchShifts();

  const handleEndDeployment = async () => {
    setIsEnding(true);
    try {
      await postApiData(`/api/deployment/${deployment.id}`, {
        action: "end",
      });
      window.location.reload();
    } finally {
      setIsEnding(false);
    }
  };

  const overviewFields = [
    { label: "Deployment No", value: deployment.deploymentNo },
    {
      label: "Employee",
      value: `${deployment.employeeName} (${deployment.employeeNo})`,
    },
    {
      label: "Client",
      value: `${deployment.clientName} (${deployment.clientNo})`,
    },
    { label: "Work location", value: deployment.workLocationName },
    {
      label: "Shift",
      value: `${deployment.shiftName} (${deployment.shiftStartTime}–${deployment.shiftEndTime})`,
    },
    { label: "Assignment role", value: deployment.assignmentRole ?? "—" },
    {
      label: "Start date",
      value: formatColomboDate(new Date(deployment.startDate)),
    },
    {
      label: "End date",
      value: deployment.endDate
        ? formatColomboDate(new Date(deployment.endDate))
        : "Ongoing",
    },
    {
      label: "Client contract ref",
      value: deployment.contractRefTitle ?? "—",
    },
  ];

  return (
    <div className="max-w-container gap-jk-md mx-auto flex flex-col">
      <div className="gap-jk-sm flex flex-wrap items-start justify-between">
        <div>
          <div className="gap-jk-sm flex items-center">
            <h1 className="font-heading text-headline-md text-foreground">
              {deployment.deploymentNo}
            </h1>
            <DeploymentStatusBadge status={deployment.status} />
          </div>
          <p className="text-body-md text-muted-foreground">
            {deployment.employeeName} at {deployment.clientName}
          </p>
        </div>
        <div className="gap-jk-sm flex">
          <Button
            variant="outline"
            render={<Link href={`/deployment/${deployment.id}/edit`} />}
          >
            <Pencil className="size-4" />
            Edit
          </Button>
          {deployment.status === "ACTIVE" ||
          deployment.status === "SCHEDULED" ? (
            <Button
              variant="destructive"
              onClick={handleEndDeployment}
              disabled={isEnding}
            >
              End deployment
            </Button>
          ) : null}
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="shift">Shift allocation</TabsTrigger>
          <TabsTrigger value="contracts">Work orders</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="shadow-card">
            <CardContent className="gap-jk-md grid pt-(--card-spacing) sm:grid-cols-2">
              {overviewFields.map((field) => (
                <div key={field.label}>
                  <p className="text-label-md text-muted-foreground">
                    {field.label}
                  </p>
                  <p className="text-body-md mt-0.5 font-medium">
                    {field.value}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shift">
          <ShiftAllocationTable deployment={deployment} shifts={shifts} />
        </TabsContent>

        <TabsContent value="contracts">
          <DeploymentContractTab deploymentId={deployment.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
