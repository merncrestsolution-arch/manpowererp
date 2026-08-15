"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { createWorkLocationSchema } from "@/application/dto/work-location.schema";
import { FormSection } from "@/components/shared/forms/form-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { patchApiData, postApiData } from "@/lib/api-client";

import type { WorkLocationDetail } from "@/types/deployment";
import type { z } from "zod";

type WorkLocationFormProps = {
  mode: "create" | "edit";
  workLocation?: WorkLocationDetail;
  defaultClientId?: string;
  defaultClientName?: string;
};

type WorkLocationFormValues = z.input<typeof createWorkLocationSchema>;

export function WorkLocationForm({
  mode,
  workLocation,
  defaultClientId,
  defaultClientName,
}: WorkLocationFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<WorkLocationFormValues>({
    resolver: zodResolver(createWorkLocationSchema),
    defaultValues: {
      clientId: workLocation?.clientId ?? defaultClientId ?? "",
      name: workLocation?.name ?? "",
      address: workLocation?.address ?? "",
      city: workLocation?.city ?? "",
      geoLat: workLocation?.geoLat ?? "",
      geoLng: workLocation?.geoLng ?? "",
      status: workLocation?.status ?? "ACTIVE",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);

    try {
      if (mode === "create") {
        const created = await postApiData<WorkLocationDetail>(
          "/api/deployment/work-locations",
          values,
        );
        router.push(`/deployment/work-locations/${created.id}`);
        return;
      }

      if (!workLocation) {
        return;
      }

      const { clientId: omittedClientId, ...updateValues } = values;
      void omittedClientId;
      await patchApiData<WorkLocationDetail>(
        `/api/deployment/work-locations/${workLocation.id}`,
        updateValues,
      );
      router.push(`/deployment/work-locations/${workLocation.id}`);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to save work location",
      );
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      className="gap-jk-lg mx-auto flex max-w-3xl flex-col"
    >
      <FormSection
        title="Location details"
        description="Work sites for client deployments and future GPS attendance"
      >
        <div className="gap-jk-md grid sm:grid-cols-2">
          {mode === "create" ? (
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="clientId">Client ID</Label>
              <Input
                id="clientId"
                {...form.register("clientId")}
                placeholder="Client ID"
              />
              {defaultClientName ? (
                <p className="text-label-md text-muted-foreground">
                  Client: {defaultClientName}
                </p>
              ) : null}
            </div>
          ) : (
            <div className="space-y-2 sm:col-span-2">
              <Label>Client</Label>
              <p className="text-body-md font-medium">
                {workLocation?.clientName}
              </p>
            </div>
          )}

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Location name</Label>
            <Input id="name" {...form.register("name")} />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...form.register("address")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" {...form.register("city")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              value={form.watch("status")}
              onChange={(event) =>
                form.setValue(
                  "status",
                  event.target.value as WorkLocationFormValues["status"],
                )
              }
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="geoLat">Latitude</Label>
            <Input
              id="geoLat"
              type="number"
              step="any"
              {...form.register("geoLat")}
              placeholder="6.9271"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="geoLng">Longitude</Label>
            <Input
              id="geoLng"
              type="number"
              step="any"
              {...form.register("geoLng")}
              placeholder="79.8612"
            />
          </div>
        </div>
      </FormSection>

      {error ? <p className="text-label-md text-destructive">{error}</p> : null}

      <div className="gap-jk-sm flex justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {mode === "create" ? "Create location" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
