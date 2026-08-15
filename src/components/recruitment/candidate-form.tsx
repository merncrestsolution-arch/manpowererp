"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { createCandidateSchema } from "@/application/dto/candidate.schema";
import { FormSection } from "@/components/shared/forms/form-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useJobOpeningOptions } from "@/hooks/use-recruitment";
import { postApiData, patchApiData } from "@/lib/api-client";

import type { CandidateDetail } from "@/types/recruitment";
import type { z } from "zod";

type CandidateFormValues = z.input<typeof createCandidateSchema>;

type CandidateFormProps = {
  mode: "create" | "edit";
  candidate?: CandidateDetail;
};

export function CandidateForm({ mode, candidate }: CandidateFormProps) {
  const router = useRouter();
  const { data: jobOptions = [] } = useJobOpeningOptions();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CandidateFormValues>({
    resolver: zodResolver(createCandidateSchema),
    defaultValues: {
      firstName: candidate?.firstName ?? "",
      lastName: candidate?.lastName ?? "",
      email: candidate?.email ?? "",
      phone: candidate?.phone ?? "",
      nic: candidate?.nic ?? "",
      jobOpeningId: candidate?.jobOpeningId ?? "",
      appliedFor: candidate?.appliedFor ?? "",
      source: candidate?.source ?? "OTHER",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    try {
      if (mode === "create") {
        const created = await postApiData<CandidateDetail>(
          "/api/recruitment/candidates",
          values,
        );
        router.push(`/recruitment/candidates/${created.id}`);
        return;
      }
      if (!candidate) return;
      await patchApiData<CandidateDetail>(
        `/api/recruitment/candidates/${candidate.id}`,
        values,
      );
      router.push(`/recruitment/candidates/${candidate.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      className="gap-jk-lg mx-auto flex max-w-3xl flex-col"
    >
      <FormSection title="Candidate details">
        <div className="gap-jk-md grid sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" {...form.register("firstName")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" {...form.register("lastName")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...form.register("email")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...form.register("phone")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nic">NIC</Label>
            <Input id="nic" {...form.register("nic")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="source">Source</Label>
            <Select
              id="source"
              value={form.watch("source")}
              onChange={(e) =>
                form.setValue(
                  "source",
                  e.target.value as CandidateFormValues["source"],
                )
              }
            >
              <option value="WEBSITE">Website</option>
              <option value="REFERRAL">Referral</option>
              <option value="AGENCY">Agency</option>
              <option value="WALK_IN">Walk-in</option>
              <option value="OTHER">Other</option>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="jobOpeningId">Job opening</Label>
            <Select
              id="jobOpeningId"
              value={form.watch("jobOpeningId")}
              onChange={(e) => form.setValue("jobOpeningId", e.target.value)}
            >
              <option value="">Select job opening</option>
              {jobOptions.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                  {job.department ? ` · ${job.department}` : ""}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="appliedFor">Applied for (optional override)</Label>
            <Input id="appliedFor" {...form.register("appliedFor")} />
          </div>
        </div>
      </FormSection>
      {error ? <p className="text-destructive">{error}</p> : null}
      <div className="gap-jk-sm flex justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {mode === "create" ? "Create candidate" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
