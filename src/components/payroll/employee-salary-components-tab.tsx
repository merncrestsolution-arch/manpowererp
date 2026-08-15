"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  assignEmployeeSalaryComponentSchema,
  type AssignEmployeeSalaryComponentInput,
} from "@/application/dto/employee-salary-component.schema";
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
import { useSalaryComponents } from "@/hooks/use-payroll";
import { fetchApiData, postApiData } from "@/lib/api-client";
import { formatColomboDate } from "@/lib/date";
import { formatCurrency } from "@/lib/format";

import type { EmployeeSalaryComponentItem } from "@/types/payroll";

type EmployeeSalaryComponentsTabProps = {
  employeeId: string;
};

export function EmployeeSalaryComponentsTab({
  employeeId,
}: EmployeeSalaryComponentsTabProps) {
  const queryClient = useQueryClient();
  const { data: components } = useSalaryComponents(false);
  const { data, isLoading } = useQuery({
    queryKey: ["employees", employeeId, "salary-components"],
    queryFn: () =>
      fetchApiData<{ assignments: EmployeeSalaryComponentItem[] }>(
        `/api/employees/${employeeId}/salary-components`,
      ),
  });
  const [open, setOpen] = useState(false);

  const form = useForm<AssignEmployeeSalaryComponentInput>({
    resolver: zodResolver(assignEmployeeSalaryComponentSchema),
    defaultValues: {
      salaryComponentId: "",
      value: null,
      effectiveFrom: "",
      effectiveTo: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await postApiData(`/api/employees/${employeeId}/salary-components`, {
      ...values,
      effectiveTo: values.effectiveTo || null,
    });
    setOpen(false);
    form.reset();
    await queryClient.invalidateQueries({
      queryKey: ["employees", employeeId, "salary-components"],
    });
  });

  return (
    <div className="space-y-jk-md">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-title-lg">Salary components</h3>
          <p className="text-body-md text-muted-foreground">
            Employee-specific allowances and deductions.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>Assign component</Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading assignments...</p>
      ) : !data?.assignments.length ? (
        <div className="bg-muted/30 p-jk-xl text-muted-foreground rounded-xl border border-dashed text-center">
          No salary component assignments yet.
        </div>
      ) : (
        <div className="space-y-jk-sm">
          {data.assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="gap-jk-sm bg-card px-jk-md py-jk-sm flex flex-col rounded-lg border sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{assignment.componentName}</p>
                  <Badge variant="outline">{assignment.componentType}</Badge>
                </div>
                <p className="text-body-md text-muted-foreground">
                  {assignment.value !== null
                    ? assignment.calculationType === "PERCENTAGE_OF_BASIC"
                      ? `${assignment.value}%`
                      : formatCurrency(assignment.value)
                    : "Uses catalog default"}
                  {" · "}
                  {formatColomboDate(new Date(assignment.effectiveFrom))}
                  {assignment.effectiveTo
                    ? ` – ${formatColomboDate(new Date(assignment.effectiveTo))}`
                    : " – ongoing"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign salary component</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-jk-md">
            <div className="space-y-jk-sm">
              <Label>Component</Label>
              <Select {...form.register("salaryComponentId")}>
                <option value="">Select component</option>
                {components?.map((component) => (
                  <option key={component.id} value={component.id}>
                    {component.name} ({component.type})
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-jk-sm">
              <Label htmlFor="value">Override value (optional)</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                {...form.register("value")}
              />
            </div>
            <div className="gap-jk-md grid sm:grid-cols-2">
              <div className="space-y-jk-sm">
                <Label htmlFor="effectiveFrom">Effective from</Label>
                <Input
                  id="effectiveFrom"
                  type="date"
                  {...form.register("effectiveFrom")}
                />
              </div>
              <div className="space-y-jk-sm">
                <Label htmlFor="effectiveTo">Effective to</Label>
                <Input
                  id="effectiveTo"
                  type="date"
                  {...form.register("effectiveTo")}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Assign
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
