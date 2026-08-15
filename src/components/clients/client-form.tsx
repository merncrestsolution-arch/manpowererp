"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { createClientSchema } from "@/application/dto/client.schema";
import { FormSection } from "@/components/shared/forms/form-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { patchApiData, postApiData } from "@/lib/api-client";

import type { ClientDetail } from "@/types/client";
import type { z } from "zod";

type ClientFormProps = {
  mode: "create" | "edit";
  client?: ClientDetail;
  canBlacklist?: boolean;
};

type ClientFormValues = z.input<typeof createClientSchema>;

export function ClientForm({
  mode,
  client,
  canBlacklist = false,
}: ClientFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      companyName: client?.companyName ?? "",
      registrationNo: client?.registrationNo ?? "",
      industry: client?.industry ?? "",
      address: client?.address ?? "",
      city: client?.city ?? "",
      status: client?.status ?? "ACTIVE",
      creditTermDays: client?.creditTermDays ?? 30,
      notes: client?.notes ?? "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);

    try {
      if (mode === "create") {
        const created = await postApiData<ClientDetail>("/api/clients", values);
        router.push(`/clients/${created.id}`);
        return;
      }

      if (!client) {
        return;
      }

      await patchApiData<ClientDetail>(`/api/clients/${client.id}`, values);
      router.push(`/clients/${client.id}`);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to save client",
      );
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      className="gap-jk-lg mx-auto flex max-w-3xl flex-col"
    >
      <FormSection
        title="Company information"
        description="Basic client account details"
      >
        <div className="gap-jk-md grid sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="companyName">Company name</Label>
            <Input id="companyName" {...form.register("companyName")} />
            {form.formState.errors.companyName ? (
              <p className="text-label-md text-destructive">
                {form.formState.errors.companyName.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="registrationNo">Registration no</Label>
            <Input id="registrationNo" {...form.register("registrationNo")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Input id="industry" {...form.register("industry")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" {...form.register("city")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="creditTermDays">Credit terms (days)</Label>
            <Input
              id="creditTermDays"
              type="number"
              min={0}
              {...form.register("creditTermDays")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              value={form.watch("status")}
              onChange={(event) =>
                form.setValue(
                  "status",
                  event.target.value as ClientFormValues["status"],
                )
              }
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              {canBlacklist ? (
                <option value="BLACKLISTED">Blacklisted</option>
              ) : null}
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" rows={3} {...form.register("address")} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={3} {...form.register("notes")} />
          </div>
        </div>
      </FormSection>

      {error ? <p className="text-body-md text-destructive">{error}</p> : null}

      <div className="gap-jk-sm flex justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {mode === "create" ? "Create client" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
