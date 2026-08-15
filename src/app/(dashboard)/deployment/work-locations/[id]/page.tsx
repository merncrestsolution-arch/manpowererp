"use client";

import { Pencil } from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";

import { ShiftAllocationTable } from "@/components/deployment/shift-allocation-table";
import { WorkLocationForm } from "@/components/deployment/work-location-form";
import { PageShell } from "@/components/shared/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useBranchShifts, useWorkLocation } from "@/hooks/use-deployment";
import { formatColomboDate } from "@/lib/date";

type WorkLocationDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default function WorkLocationDetailPage({
  params,
}: WorkLocationDetailPageProps) {
  const { id } = use(params);
  const { data: workLocation, isLoading, error } = useWorkLocation(id);
  const { data: shifts = [] } = useBranchShifts();
  const [isEditing, setIsEditing] = useState(false);

  if (isLoading) {
    return (
      <PageShell title="Work location" description="Loading location...">
        <p className="text-body-md text-muted-foreground">
          Loading location...
        </p>
      </PageShell>
    );
  }

  if (error || !workLocation) {
    return (
      <PageShell
        title="Work location"
        description="View work location details."
      >
        <p className="text-body-md text-destructive">Work location not found</p>
      </PageShell>
    );
  }

  if (isEditing) {
    return (
      <PageShell title="Edit Work Location" description={workLocation.name}>
        <WorkLocationForm mode="edit" workLocation={workLocation} />
      </PageShell>
    );
  }

  const fields = [
    { label: "Client", value: workLocation.clientName },
    { label: "City", value: workLocation.city ?? "—" },
    { label: "Address", value: workLocation.address ?? "—" },
    {
      label: "Coordinates",
      value:
        workLocation.geoLat !== null && workLocation.geoLng !== null
          ? `${workLocation.geoLat}, ${workLocation.geoLng}`
          : "—",
    },
    { label: "Status", value: workLocation.status },
    {
      label: "Created",
      value: formatColomboDate(new Date(workLocation.createdAt)),
    },
  ];

  return (
    <PageShell
      title={workLocation.name}
      description={workLocation.clientName}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            render={<Link href="/deployment/work-locations" />}
          >
            Back
          </Button>
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Pencil className="mr-2 size-4" />
            Edit
          </Button>
        </div>
      }
    >
      <Card className="shadow-card">
        <CardContent className="gap-jk-md grid pt-(--card-spacing) sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.label}>
              <p className="text-label-md text-muted-foreground">
                {field.label}
              </p>
              <p className="text-body-md mt-0.5 font-medium">{field.value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <ShiftAllocationTable
        workLocationId={workLocation.id}
        workLocationName={workLocation.name}
        shifts={shifts}
        viewOnly
      />
    </PageShell>
  );
}
