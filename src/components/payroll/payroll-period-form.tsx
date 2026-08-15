"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import {
  createPayrollPeriodSchema,
  type CreatePayrollPeriodInput,
} from "@/application/dto/payroll-period.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { postApiData } from "@/lib/api-client";

export function PayrollPeriodForm() {
  const router = useRouter();
  const form = useForm<CreatePayrollPeriodInput>({
    resolver: zodResolver(createPayrollPeriodSchema),
    defaultValues: {
      periodStart: "",
      periodEnd: "",
      payDate: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const period = await postApiData<{ id: string }>(
      "/api/payroll/periods",
      values,
    );
    router.push(`/payroll/periods/${period.id}`);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-jk-md mx-auto max-w-xl">
      <div className="space-y-jk-sm">
        <Label htmlFor="periodStart">Period start</Label>
        <Input id="periodStart" type="date" {...form.register("periodStart")} />
        {form.formState.errors.periodStart ? (
          <p className="text-destructive text-sm">
            {form.formState.errors.periodStart.message}
          </p>
        ) : null}
      </div>
      <div className="space-y-jk-sm">
        <Label htmlFor="periodEnd">Period end</Label>
        <Input id="periodEnd" type="date" {...form.register("periodEnd")} />
        {form.formState.errors.periodEnd ? (
          <p className="text-destructive text-sm">
            {form.formState.errors.periodEnd.message}
          </p>
        ) : null}
      </div>
      <div className="space-y-jk-sm">
        <Label htmlFor="payDate">Pay date</Label>
        <Input id="payDate" type="date" {...form.register("payDate")} />
        {form.formState.errors.payDate ? (
          <p className="text-destructive text-sm">
            {form.formState.errors.payDate.message}
          </p>
        ) : null}
      </div>
      <div className="gap-jk-sm flex">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          Create period
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/payroll")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
