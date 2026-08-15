"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { createJobOpeningSchema } from "@/application/dto/job-opening.schema";
import { FormSection } from "@/components/shared/forms/form-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { postApiData, patchApiData } from "@/lib/api-client";

import type { JobOpeningDetail } from "@/types/recruitment";
import type { z } from "zod";

type JobOpeningFormValues = z.input<typeof createJobOpeningSchema>;

type JobOpeningFormProps = {
  mode: "create" | "edit";
  jobOpening?: JobOpeningDetail;
};

export function JobOpeningForm({ mode, jobOpening }: JobOpeningFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<JobOpeningFormValues>({
    resolver: zodResolver(createJobOpeningSchema),
    defaultValues: {
      title: jobOpening?.title ?? "",
      department: jobOpening?.department ?? "",
      clientId: jobOpening?.clientId ?? "",
      positionsAvailable: jobOpening?.positionsAvailable ?? 1,
      status: jobOpening?.status ?? "OPEN",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    try {
      if (mode === "create") {
        const created = await postApiData<JobOpeningDetail>(
          "/api/recruitment/job-openings",
          values,
        );
        router.push(`/recruitment/job-openings/${created.id}`);
        return;
      }
      if (!jobOpening) return;
      await patchApiData(
        `/api/recruitment/job-openings/${jobOpening.id}`,
        values,
      );
      router.push(`/recruitment/job-openings/${jobOpening.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      className="gap-jk-lg mx-auto flex max-w-3xl flex-col"
    >
      <FormSection title="Job opening details">
        <div className="gap-jk-md grid sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...form.register("title")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input id="department" {...form.register("department")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="positionsAvailable">Positions</Label>
            <Input
              id="positionsAvailable"
              type="number"
              min={1}
              {...form.register("positionsAvailable")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              value={form.watch("status")}
              onChange={(e) =>
                form.setValue(
                  "status",
                  e.target.value as JobOpeningFormValues["status"],
                )
              }
            >
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
              <option value="ON_HOLD">On Hold</option>
            </Select>
          </div>
        </div>
      </FormSection>
      {error ? <p className="text-destructive">{error}</p> : null}
      <div className="gap-jk-sm flex justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {mode === "create" ? "Create opening" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
