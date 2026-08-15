"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { assignWorkerToClientSchema } from "@/application/dto/client-worker-assignment.schema";
import { EntitySearchCombobox } from "@/components/shared/combobox/entity-search-combobox";
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
import { postApiData } from "@/lib/api-client";

import type { z } from "zod";

type AssignWorkerFormValues = z.input<typeof assignWorkerToClientSchema>;

type AssignWorkerDialogProps = {
  clientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AssignWorkerDialog({
  clientId,
  open,
  onOpenChange,
}: AssignWorkerDialogProps) {
  const queryClient = useQueryClient();
  const [selectedEmployeeLabel, setSelectedEmployeeLabel] = useState("");

  const form = useForm<AssignWorkerFormValues>({
    resolver: zodResolver(assignWorkerToClientSchema),
    defaultValues: {
      employeeId: "",
      role: "",
      assignedFrom: "",
      assignedTo: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await postApiData(`/api/clients/${clientId}/assignments`, values);
    await queryClient.invalidateQueries({
      queryKey: ["clients", clientId, "assignments"],
    });
    form.reset();
    setSelectedEmployeeLabel("");
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign worker</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-jk-md">
          <div className="space-y-2">
            <Label>Employee</Label>
            <EntitySearchCombobox
              value={form.watch("employeeId")}
              selectedLabel={selectedEmployeeLabel}
              searchUrl="/api/employees/search"
              placeholder="Search employees..."
              onChange={(value, option) => {
                form.setValue("employeeId", value);
                setSelectedEmployeeLabel(option?.label ?? "");
              }}
            />
            {form.formState.errors.employeeId ? (
              <p className="text-label-md text-destructive">
                {form.formState.errors.employeeId.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="assignment-role">Role</Label>
            <Input id="assignment-role" {...form.register("role")} />
          </div>
          <div className="gap-jk-md grid sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="assigned-from">Assigned from</Label>
              <Input
                id="assigned-from"
                type="date"
                {...form.register("assignedFrom")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assigned-to">Assigned to (optional)</Label>
              <Input
                id="assigned-to"
                type="date"
                {...form.register("assignedTo")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              Assign worker
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
