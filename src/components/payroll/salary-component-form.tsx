"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { configureSalaryComponentSchema } from "@/application/dto/salary-component.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { postApiData } from "@/lib/api-client";

import type { z } from "zod";

type SalaryComponentFormValues = z.input<typeof configureSalaryComponentSchema>;

type SalaryComponentFormProps = {
  defaultValues?: SalaryComponentFormValues;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function SalaryComponentForm({
  defaultValues,
  onSuccess,
  onCancel,
}: SalaryComponentFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<SalaryComponentFormValues>({
    resolver: zodResolver(configureSalaryComponentSchema),
    defaultValues: defaultValues ?? {
      name: "",
      type: "ALLOWANCE",
      calculationType: "FIXED",
      defaultValue: 0,
      isTaxable: false,
      isActive: true,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await postApiData(
      "/api/payroll/components",
      configureSalaryComponentSchema.parse(values),
    );
    await queryClient.invalidateQueries({
      queryKey: ["payroll", "components"],
    });
    onSuccess?.();
  });

  return (
    <form onSubmit={onSubmit} className="space-y-jk-md">
      <div className="space-y-jk-sm">
        <Label htmlFor="component-name">Name</Label>
        <Input id="component-name" {...form.register("name")} />
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
      <div className="gap-jk-sm flex">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          Save component
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
