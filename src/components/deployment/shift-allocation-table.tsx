"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { useShiftCoverage } from "@/hooks/use-deployment";
import { postApiData } from "@/lib/api-client";

import type { DeploymentDetail } from "@/types/deployment";

type ShiftAllocationTableProps = {
  deployment?: DeploymentDetail;
  workLocationId?: string;
  workLocationName?: string;
  shifts: Array<{
    id: string;
    name: string;
    startTime: string;
    endTime: string;
  }>;
  viewOnly?: boolean;
};

export function ShiftAllocationTable({
  deployment,
  workLocationId,
  workLocationName,
  shifts,
  viewOnly = false,
}: ShiftAllocationTableProps) {
  const [selectedShiftId, setSelectedShiftId] = useState(
    deployment?.shiftId ?? shifts[0]?.id ?? "",
  );
  const [isSaving, setIsSaving] = useState(false);
  const coverageLocationId = deployment?.workLocationId ?? workLocationId ?? "";
  const { data: coverage, isLoading } = useShiftCoverage(coverageLocationId);

  const handleReassign = async () => {
    if (!deployment) {
      return;
    }

    setIsSaving(true);
    try {
      await postApiData(`/api/deployment/${deployment.id}`, {
        action: "reassign-shift",
        shiftId: selectedShiftId,
      });
      window.location.reload();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-jk-md">
      {!viewOnly && deployment ? (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-body-lg">Reassign shift</CardTitle>
          </CardHeader>
          <CardContent className="gap-jk-md flex flex-wrap items-end">
            <div className="min-w-[220px]">
              <Select
                value={selectedShiftId}
                onChange={(event) => setSelectedShiftId(event.target.value)}
                disabled={
                  deployment.status !== "ACTIVE" &&
                  deployment.status !== "SCHEDULED"
                }
              >
                {shifts.map((shift) => (
                  <option key={shift.id} value={shift.id}>
                    {shift.name} ({shift.startTime}–{shift.endTime})
                  </option>
                ))}
              </Select>
            </div>
            <Button
              onClick={handleReassign}
              disabled={
                isSaving ||
                selectedShiftId === deployment.shiftId ||
                (deployment.status !== "ACTIVE" &&
                  deployment.status !== "SCHEDULED")
              }
            >
              Reassign shift
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-body-lg">
            Shift coverage —{" "}
            {coverage?.workLocationName ??
              workLocationName ??
              deployment?.workLocationName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-body-md text-muted-foreground">
              Loading coverage...
            </p>
          ) : !coverage?.coverage.length ? (
            <p className="text-body-md text-muted-foreground">
              No active deployments at this location.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="text-body-md w-full text-left">
                <thead>
                  <tr className="text-label-md text-muted-foreground border-b">
                    <th className="py-2 pr-4">Shift</th>
                    <th className="py-2 pr-4">Hours</th>
                    <th className="py-2 pr-4">Assigned</th>
                    <th className="py-2">Workers</th>
                  </tr>
                </thead>
                <tbody>
                  {coverage.coverage.map((row) => (
                    <tr key={row.shiftId} className="border-b align-top">
                      <td className="py-3 pr-4 font-medium">{row.shiftName}</td>
                      <td className="py-3 pr-4">
                        {row.startTime}–{row.endTime}
                      </td>
                      <td className="py-3 pr-4">{row.assignedCount}</td>
                      <td className="py-3">
                        <div className="space-y-1">
                          {row.employees.map((employee) => (
                            <p key={employee.deploymentId}>
                              {employee.employeeName}{" "}
                              <span className="text-label-md text-muted-foreground">
                                ({employee.employeeNo})
                              </span>
                            </p>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
