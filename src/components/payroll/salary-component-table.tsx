"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { configureSalaryComponentSchema } from "@/application/dto/salary-component.schema";
import { PageShell } from "@/components/shared/page-shell";
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
import { postApiData } from "@/lib/api-client";
import { formatCurrency } from "@/lib/format";

import type { ConfigureSalaryComponentInput } from "@/application/dto/salary-component.schema";
import type { z } from "zod";

type SalaryComponentFormValues = z.input<typeof configureSalaryComponentSchema>;

export function SalaryComponentTable() {
  const queryClient = useQueryClient();
  const { data: components, isLoading } = useSalaryComponents(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ConfigureSalaryComponentInput | null>(
    null,
  );

  const form = useForm<SalaryComponentFormValues>({
    resolver: zodResolver(configureSalaryComponentSchema),
    defaultValues: {
      name: "",
      type: "ALLOWANCE",
      calculationType: "FIXED",
      defaultValue: 0,
      isTaxable: false,
      isActive: true,
    },
  });

  const openCreate = () => {
    setEditing(null);
    form.reset({
      name: "",
      type: "ALLOWANCE",
      calculationType: "FIXED",
      defaultValue: 0,
      isTaxable: false,
      isActive: true,
    });
    setOpen(true);
  };

  const openEdit = (component: NonNullable<typeof components>[number]) => {
    setEditing({
      id: component.id,
      name: component.name,
      type: component.type,
      calculationType: component.calculationType,
      defaultValue: component.defaultValue,
      isTaxable: component.isTaxable,
      isActive: component.isActive,
    });
    form.reset({
      id: component.id,
      name: component.name,
      type: component.type,
      calculationType: component.calculationType,
      defaultValue: component.defaultValue,
      isTaxable: component.isTaxable,
      isActive: component.isActive,
    });
    setOpen(true);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    await postApiData(
      "/api/payroll/components",
      configureSalaryComponentSchema.parse(values),
    );
    setOpen(false);
    await queryClient.invalidateQueries({
      queryKey: ["payroll", "components"],
    });
  });

  return (
    <PageShell
      title="Salary components"
      description="Configure allowances and deductions for payroll"
      actions={
        <Button className="h-9" onClick={openCreate}>
          Add component
        </Button>
      }
    >
      {isLoading ? (
        <p className="text-muted-foreground">Loading components...</p>
      ) : !components?.length ? (
        <div className="bg-muted/30 p-jk-xl text-muted-foreground rounded-xl border border-dashed text-center">
          No salary components configured yet.
        </div>
      ) : (
        <div className="space-y-jk-sm">
          {components.map((component) => (
            <div
              key={component.id}
              className="gap-jk-sm bg-card px-jk-md py-jk-sm flex flex-col rounded-lg border sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{component.name}</p>
                  <Badge variant="outline">{component.type}</Badge>
                  {!component.isActive ? (
                    <Badge variant="outline">Inactive</Badge>
                  ) : null}
                </div>
                <p className="text-body-md text-muted-foreground">
                  {component.calculationType === "PERCENTAGE_OF_BASIC"
                    ? `${component.defaultValue}% of basic`
                    : formatCurrency(component.defaultValue)}
                  {component.isTaxable ? " · Taxable" : ""}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEdit(component)}
              >
                Edit
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit salary component" : "Add salary component"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-jk-md">
            <div className="space-y-jk-sm">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...form.register("name")} />
            </div>
            <div className="gap-jk-md grid sm:grid-cols-2">
              <div className="space-y-jk-sm">
                <Label>Type</Label>
                <Select {...form.register("type")}>
                  <option value="ALLOWANCE">Allowance</option>
                  <option value="DEDUCTION">Deduction</option>
                </Select>
              </div>
              <div className="space-y-jk-sm">
                <Label>Calculation</Label>
                <Select {...form.register("calculationType")}>
                  <option value="FIXED">Fixed amount</option>
                  <option value="PERCENTAGE_OF_BASIC">% of basic</option>
                </Select>
              </div>
            </div>
            <div className="space-y-jk-sm">
              <Label htmlFor="defaultValue">Default value</Label>
              <Input
                id="defaultValue"
                type="number"
                step="0.01"
                {...form.register("defaultValue")}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...form.register("isTaxable")} />
              Taxable
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...form.register("isActive")} />
              Active
            </label>
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
