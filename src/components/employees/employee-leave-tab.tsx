"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  createLeaveRequestSchema,
  type CreateLeaveRequestInput,
} from "@/application/dto/leave-request.schema";
import { LeaveStatusBadge } from "@/components/employees/employee-status-badge";
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
import { Textarea } from "@/components/ui/textarea";
import { useEmployeeLeave } from "@/hooks/use-employees";
import { patchApiData, postApiData } from "@/lib/api-client";
import { formatColomboDate } from "@/lib/date";

type EmployeeLeaveTabProps = {
  employeeId: string;
  canApprove?: boolean;
};

export function EmployeeLeaveTab({
  employeeId,
  canApprove = false,
}: EmployeeLeaveTabProps) {
  const queryClient = useQueryClient();
  const { data: leaves = [], isLoading } = useEmployeeLeave(employeeId);
  const [open, setOpen] = useState(false);

  const form = useForm<CreateLeaveRequestInput>({
    resolver: zodResolver(createLeaveRequestSchema),
    defaultValues: {
      type: "ANNUAL",
      startDate: "",
      endDate: "",
      reason: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await postApiData(`/api/employees/${employeeId}/leave`, values);
    setOpen(false);
    form.reset();
    await queryClient.invalidateQueries({
      queryKey: ["employees", employeeId, "leave"],
    });
  });

  const handleStatusUpdate = async (
    leaveId: string,
    status: "APPROVED" | "REJECTED",
  ) => {
    await patchApiData(`/api/employees/${employeeId}/leave`, {
      leaveId,
      status,
    });
    await queryClient.invalidateQueries({
      queryKey: ["employees", employeeId, "leave"],
    });
    await queryClient.invalidateQueries({
      queryKey: ["employees", employeeId],
    });
  };

  return (
    <div className="space-y-jk-md">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-title-lg">Leave requests</h3>
          <p className="text-body-md text-muted-foreground">
            Track and manage employee leave applications.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>Request leave</Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading leave requests...</p>
      ) : leaves.length === 0 ? (
        <div className="bg-muted/30 p-jk-xl text-muted-foreground rounded-xl border border-dashed text-center">
          No leave requests yet.
        </div>
      ) : (
        <div className="space-y-jk-sm">
          {leaves.map((leave) => (
            <div
              key={leave.id}
              className="bg-card px-jk-md py-jk-sm rounded-lg border"
            >
              <div className="gap-jk-sm flex flex-wrap items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{leave.type} leave</p>
                    <LeaveStatusBadge status={leave.status} />
                  </div>
                  <p className="text-body-md text-muted-foreground">
                    {formatColomboDate(
                      new Date(leave.startDate),
                      "dd MMM yyyy",
                    )}{" "}
                    –{" "}
                    {formatColomboDate(new Date(leave.endDate), "dd MMM yyyy")}
                  </p>
                  <p className="text-body-md mt-1">{leave.reason}</p>
                </div>
                {canApprove && leave.status === "PENDING" ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleStatusUpdate(leave.id, "APPROVED")}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate(leave.id, "REJECTED")}
                    >
                      Reject
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New leave request</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-jk-md">
            <div className="space-y-2">
              <Label htmlFor="leave-type">Leave type</Label>
              <Select id="leave-type" {...form.register("type")}>
                <option value="ANNUAL">Annual</option>
                <option value="CASUAL">Casual</option>
                <option value="SICK">Sick</option>
                <option value="UNPAID">Unpaid</option>
              </Select>
            </div>
            <div className="gap-jk-sm grid sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start date</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...form.register("startDate")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End date</Label>
                <Input id="endDate" type="date" {...form.register("endDate")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea id="reason" {...form.register("reason")} />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Submit request</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
