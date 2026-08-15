"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { manualAttendanceSchema } from "@/application/dto/manual-attendance.schema";
import { FormSection } from "@/components/shared/forms/form-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { submitManualAttendance } from "@/hooks/use-attendance";
import { getColomboDateKey } from "@/lib/date";

import type { z } from "zod";

type ManualEntryFormValues = z.infer<typeof manualAttendanceSchema>;

export function ManualEntryForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<ManualEntryFormValues>({
    resolver: zodResolver(manualAttendanceSchema),
    defaultValues: {
      employeeId: "",
      date: getColomboDateKey(),
      checkInAt: "",
      checkOutAt: "",
      status: "PRESENT",
      manualReason: "",
      deploymentId: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);

    try {
      await submitManualAttendance(values);
      router.push("/attendance");
      router.refresh();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to save attendance",
      );
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-jk-lg mx-auto max-w-2xl">
      <FormSection
        title="Manual attendance entry"
        description="Record or correct attendance on behalf of an employee"
      >
        <div className="gap-jk-md grid md:grid-cols-2">
          <div className="space-y-jk-xs">
            <Label htmlFor="employeeId">Employee ID</Label>
            <Input id="employeeId" {...form.register("employeeId")} />
          </div>
          <div className="space-y-jk-xs">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" {...form.register("date")} />
          </div>
          <div className="space-y-jk-xs">
            <Label htmlFor="checkInAt">Check-in</Label>
            <Input
              id="checkInAt"
              type="datetime-local"
              {...form.register("checkInAt")}
            />
          </div>
          <div className="space-y-jk-xs">
            <Label htmlFor="checkOutAt">Check-out</Label>
            <Input
              id="checkOutAt"
              type="datetime-local"
              {...form.register("checkOutAt")}
            />
          </div>
          <div className="space-y-jk-xs">
            <Label htmlFor="status">Status</Label>
            <Select id="status" {...form.register("status")}>
              <option value="PRESENT">Present</option>
              <option value="LATE">Late</option>
              <option value="ABSENT">Absent</option>
              <option value="HALF_DAY">Half day</option>
              <option value="ON_LEAVE">On leave</option>
            </Select>
          </div>
          <div className="space-y-jk-xs">
            <Label htmlFor="deploymentId">Deployment ID (optional)</Label>
            <Input id="deploymentId" {...form.register("deploymentId")} />
          </div>
        </div>

        <div className="mt-jk-md space-y-jk-xs">
          <Label htmlFor="manualReason">Reason</Label>
          <Textarea
            id="manualReason"
            rows={4}
            {...form.register("manualReason")}
          />
        </div>

        {submitError ? (
          <p className="mt-jk-sm text-destructive text-sm">{submitError}</p>
        ) : null}

        <div className="mt-jk-md gap-jk-sm flex">
          <Button type="submit">Save attendance</Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/attendance")}
          >
            Cancel
          </Button>
        </div>
      </FormSection>
    </form>
  );
}
