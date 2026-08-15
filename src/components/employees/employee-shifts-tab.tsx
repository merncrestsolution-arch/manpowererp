"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  assignEmployeeShiftSchema,
  type AssignEmployeeShiftInput,
} from "@/application/dto/employee-shift.schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useEmployeeShifts } from "@/hooks/use-employees";
import { postApiData } from "@/lib/api-client";
import { formatColomboDate } from "@/lib/date";

type EmployeeShiftsTabProps = {
  employeeId: string;
};

export function EmployeeShiftsTab({ employeeId }: EmployeeShiftsTabProps) {
  const queryClient = useQueryClient();
  const { data: shiftsData, isLoading } = useEmployeeShifts(employeeId);
  const [open, setOpen] = useState(false);

  const form = useForm<AssignEmployeeShiftInput>({
    resolver: zodResolver(assignEmployeeShiftSchema),
    defaultValues: {
      shiftId: "",
      effectiveFrom: "",
      effectiveTo: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await postApiData(`/api/employees/${employeeId}/shifts`, values);
    setOpen(false);
    form.reset();
    await queryClient.invalidateQueries({
      queryKey: ["employees", employeeId, "shifts"],
    });
  });

  return (
    <div className="space-y-jk-md">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-title-lg">Shift assignments</h3>
          <p className="text-body-md text-muted-foreground">
            Current and historical shift schedules.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>Assign shift</Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading shifts...</p>
      ) : !shiftsData?.assignments.length ? (
        <div className="bg-muted/30 p-jk-xl text-muted-foreground rounded-xl border border-dashed text-center">
          No shift assignments yet.
        </div>
      ) : (
        <div className="space-y-jk-sm">
          {shiftsData.assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="bg-card px-jk-md py-jk-sm flex items-center justify-between rounded-lg border"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{assignment.shiftName}</p>
                  {assignment.isCurrent ? (
                    <Badge variant="secondary">Current</Badge>
                  ) : null}
                </div>
                <p className="text-body-md text-muted-foreground">
                  {assignment.startTime} – {assignment.endTime}
                </p>
                <p className="text-label-md text-muted-foreground">
                  {formatColomboDate(
                    new Date(assignment.effectiveFrom),
                    "dd MMM yyyy",
                  )}
                  {assignment.effectiveTo
                    ? ` – ${formatColomboDate(new Date(assignment.effectiveTo), "dd MMM yyyy")}`
                    : " – Present"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign shift</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-jk-md">
            <div className="space-y-2">
              <Label htmlFor="shiftId">Shift</Label>
              <Select id="shiftId" {...form.register("shiftId")}>
                <option value="">Select shift</option>
                {shiftsData?.availableShifts.map((shift) => (
                  <option key={shift.id} value={shift.id}>
                    {shift.name} ({shift.startTime} – {shift.endTime})
                  </option>
                ))}
              </Select>
            </div>
            <div className="gap-jk-sm grid sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="effectiveFrom">Effective from</Label>
                <Input
                  id="effectiveFrom"
                  type="date"
                  {...form.register("effectiveFrom")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="effectiveTo">Effective to</Label>
                <Input
                  id="effectiveTo"
                  type="date"
                  {...form.register("effectiveTo")}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Assign shift</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
