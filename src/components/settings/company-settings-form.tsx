"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { updateCompanySettingsSchema } from "@/application/dto/company-settings.schema";
import { FormSection } from "@/components/shared/forms/form-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useCompanySettings,
  useUpdateCompanySettings,
} from "@/hooks/use-settings";

import type { z } from "zod";

type FormValues = z.input<typeof updateCompanySettingsSchema>;

export function CompanySettingsForm() {
  const { data: settings, isLoading, isError, error } = useCompanySettings();
  const updateSettings = useUpdateCompanySettings();

  const form = useForm<FormValues>({
    resolver: zodResolver(updateCompanySettingsSchema),
    values: {
      name: settings?.name ?? "",
      registrationNo: settings?.registrationNo ?? "",
      address: settings?.address ?? "",
      city: settings?.city ?? "",
      phone: settings?.phone ?? "",
      email: settings?.email ?? "",
      logoUrl: settings?.logoUrl ?? "",
      taxId: settings?.taxId ?? "",
      fiscalYearStart: settings?.fiscalYearStart ?? 1,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const parsed = updateCompanySettingsSchema.parse(values);
    await updateSettings.mutateAsync(parsed);
  });

  if (isLoading) {
    return <div className="bg-muted/40 h-64 animate-pulse rounded-lg border" />;
  }

  if (isError) {
    return (
      <div className="border-destructive/30 bg-destructive/5 p-jk-md text-body-md text-destructive rounded-lg border">
        Could not load company settings
        {error instanceof Error ? `: ${error.message}` : "."}
      </div>
    );
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)}>
      <FormSection
        title="Organization details"
        description="Basic company information used across invoices, payslips, and reports."
      >
        <input type="hidden" {...form.register("logoUrl")} />
        <div className="gap-jk-md grid sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Company name</Label>
            <Input id="name" {...form.register("name")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="registrationNo">Registration no.</Label>
            <Input id="registrationNo" {...form.register("registrationNo")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxId">Tax ID</Label>
            <Input id="taxId" {...form.register("taxId")} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" rows={3} {...form.register("address")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" {...form.register("city")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...form.register("phone")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...form.register("email")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fiscalYearStart">Fiscal year start month</Label>
            <Select
              id="fiscalYearStart"
              value={String(form.watch("fiscalYearStart"))}
              onChange={(event) =>
                form.setValue("fiscalYearStart", Number(event.target.value))
              }
            >
              {Array.from({ length: 12 }, (_, index) => (
                <option key={index + 1} value={index + 1}>
                  {new Date(2000, index, 1).toLocaleString("en", {
                    month: "long",
                  })}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="mt-jk-lg border-border/60 pt-jk-md flex justify-end border-t">
          <Button
            type="submit"
            className="h-9"
            disabled={updateSettings.isPending}
          >
            {updateSettings.isPending ? "Saving…" : "Save company settings"}
          </Button>
        </div>
      </FormSection>
    </form>
  );
}
