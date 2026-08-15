"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Smartphone } from "lucide-react";
import { useForm } from "react-hook-form";

import { updateCompanySettingsSchema } from "@/application/dto/company-settings.schema";
import { ApkDownloadButton } from "@/components/layout/apk-download-button";
import { FormSection } from "@/components/shared/forms/form-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCompanySettings,
  useUpdateCompanySettings,
} from "@/hooks/use-settings";

import type { z } from "zod";

type FormValues = z.input<typeof updateCompanySettingsSchema>;

export function MobileAppSettingsPanel() {
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
      mobileApkUrl: settings?.mobileApkUrl ?? "",
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
        Could not load mobile app settings
        {error instanceof Error ? `: ${error.message}` : "."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border bg-[linear-gradient(135deg,#041433_0%,#0b3d91_58%,#2563eb_100%)] p-6 text-white shadow-lg">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <Smartphone className="size-6" aria-hidden="true" />
            </span>
            <h2 className="font-heading mt-4 text-2xl tracking-tight">
              JK Manpower Android app
            </h2>
            <p className="mt-2 text-sm text-blue-100">
              High-fidelity field app for attendance, shifts, and payslips.
              Publish the APK URL below, then share the download page with
              staff.
            </p>
          </div>
          <ApkDownloadButton
            variant="secondary"
            size="lg"
            className="h-12 rounded-xl bg-white text-[#041433] hover:bg-blue-50"
            label="Download APK"
          />
        </div>
      </section>

      <form onSubmit={(event) => void onSubmit(event)}>
        <FormSection
          title="Android installer"
          description="Paste a public HTTPS URL. Recommended: upload the APK to a Supabase Storage bucket named mobile-releases and make the object public."
        >
          <div className="space-y-2">
            <Label htmlFor="mobileApkUrl">APK URL</Label>
            <Input
              id="mobileApkUrl"
              placeholder="https://PROJECT.supabase.co/storage/v1/object/public/mobile-releases/jk-manpower.apk"
              {...form.register("mobileApkUrl")}
            />
            {form.formState.errors.mobileApkUrl ? (
              <p className="text-destructive text-sm">
                {form.formState.errors.mobileApkUrl.message}
              </p>
            ) : null}
          </div>

          <div className="mt-jk-lg border-border/60 pt-jk-md flex flex-wrap items-center justify-between gap-3 border-t">
            <p className="text-muted-foreground text-sm">
              Staff can also open{" "}
              <a
                href="/download/android"
                className="text-primary font-medium hover:underline"
              >
                /download/android
              </a>
            </p>
            <Button
              type="submit"
              className="h-9"
              disabled={updateSettings.isPending}
            >
              {updateSettings.isPending ? "Saving…" : "Save APK URL"}
            </Button>
          </div>
        </FormSection>
      </form>
    </div>
  );
}
