"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { createDeploymentSchema } from "@/application/dto/deployment.schema";
import { EntitySearchCombobox } from "@/components/shared/combobox/entity-search-combobox";
import { FormSection } from "@/components/shared/forms/form-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  useBranchShifts,
  useWorkLocationOptions,
} from "@/hooks/use-deployment";
import { fetchApiData, patchApiData, postApiData } from "@/lib/api-client";

import type { DeploymentDetail } from "@/types/deployment";
import type { z } from "zod";

type DeploymentFormProps = {
  mode: "create" | "edit";
  deployment?: DeploymentDetail;
};

type DeploymentFormValues = z.input<typeof createDeploymentSchema>;

type ClientSearchResult = {
  id: string;
  clientNo: string;
  companyName: string;
  city: string | null;
};

export function DeploymentForm({ mode, deployment }: DeploymentFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [clientLabel, setClientLabel] = useState(deployment?.clientName ?? "");
  const [employeeLabel, setEmployeeLabel] = useState(
    deployment?.employeeName ?? "",
  );

  const form = useForm<DeploymentFormValues>({
    resolver: zodResolver(createDeploymentSchema),
    defaultValues: {
      employeeId: deployment?.employeeId ?? "",
      clientId: deployment?.clientId ?? "",
      workLocationId: deployment?.workLocationId ?? "",
      shiftId: deployment?.shiftId ?? "",
      contractRefId: deployment?.contractRefId ?? "",
      startDate: deployment?.startDate ? deployment.startDate.slice(0, 10) : "",
      endDate: deployment?.endDate ? deployment.endDate.slice(0, 10) : "",
      status: deployment?.status ?? "SCHEDULED",
      assignmentRole: deployment?.assignmentRole ?? "",
    },
  });

  const clientId = form.watch("clientId");
  const { data: workLocations = [] } = useWorkLocationOptions(clientId);
  const { data: shifts = [] } = useBranchShifts();

  useEffect(() => {
    if (mode === "create") {
      form.setValue("workLocationId", "");
    }
  }, [clientId, form, mode]);

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);

    try {
      if (mode === "create") {
        const created = await postApiData<DeploymentDetail>(
          "/api/deployment",
          values,
        );
        router.push(`/deployment/${created.id}`);
        return;
      }

      if (!deployment) {
        return;
      }

      await patchApiData<DeploymentDetail>(
        `/api/deployment/${deployment.id}`,
        values,
      );
      router.push(`/deployment/${deployment.id}`);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to save deployment",
      );
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      className="gap-jk-lg mx-auto flex max-w-3xl flex-col"
    >
      <FormSection
        title="Assignment details"
        description="Assign an employee to a client work location and shift"
      >
        <div className="gap-jk-md grid sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Employee</Label>
            <EntitySearchCombobox
              value={form.watch("employeeId")}
              onChange={(value, option) => {
                form.setValue("employeeId", value);
                setEmployeeLabel(option?.label ?? "");
              }}
              searchUrl="/api/employees/search"
              placeholder="Search employee..."
              selectedLabel={employeeLabel}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>Client</Label>
            <ClientSearchCombobox
              value={form.watch("clientId")}
              selectedLabel={clientLabel}
              onChange={(value, label) => {
                form.setValue("clientId", value);
                setClientLabel(label);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workLocationId">Work location</Label>
            <Select
              id="workLocationId"
              value={form.watch("workLocationId")}
              onChange={(event) =>
                form.setValue("workLocationId", event.target.value)
              }
              disabled={!clientId}
            >
              <option value="">Select location</option>
              {workLocations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                  {location.city ? ` · ${location.city}` : ""}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shiftId">Shift</Label>
            <Select
              id="shiftId"
              value={form.watch("shiftId")}
              onChange={(event) => form.setValue("shiftId", event.target.value)}
            >
              <option value="">Select shift</option>
              {shifts.map((shift) => (
                <option key={shift.id} value={shift.id}>
                  {shift.name} ({shift.startTime}–{shift.endTime})
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignmentRole">Assignment role</Label>
            <Input
              id="assignmentRole"
              {...form.register("assignmentRole")}
              placeholder="e.g. Machine Operator"
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
                  event.target.value as DeploymentFormValues["status"],
                )
              }
            >
              <option value="SCHEDULED">Scheduled</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start date</Label>
            <Input id="startDate" type="date" {...form.register("startDate")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End date</Label>
            <Input id="endDate" type="date" {...form.register("endDate")} />
          </div>
        </div>
      </FormSection>

      {error ? <p className="text-label-md text-destructive">{error}</p> : null}

      <div className="gap-jk-sm flex justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {mode === "create" ? "Create deployment" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

function ClientSearchCombobox({
  value,
  selectedLabel,
  onChange,
}: {
  value: string;
  selectedLabel: string;
  onChange: (value: string, label: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<ClientSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open || query.trim().length < 2) {
      setOptions([]);
      return;
    }

    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const results = await fetchApiData<ClientSearchResult[]>(
          `/api/deployment/clients/search?q=${encodeURIComponent(query)}&limit=10`,
        );
        if (!cancelled) {
          setOptions(results);
        }
      } catch {
        if (!cancelled) {
          setOptions([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [open, query]);

  return (
    <div className="relative">
      <Input
        value={open ? query : selectedLabel || query}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        placeholder="Search client..."
      />
      {open ? (
        <div className="bg-popover absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border p-1 shadow-md">
          {isLoading ? (
            <p className="text-label-md text-muted-foreground px-3 py-2">
              Searching...
            </p>
          ) : options.length === 0 ? (
            <p className="text-label-md text-muted-foreground px-3 py-2">
              No clients found
            </p>
          ) : (
            options.map((option) => (
              <button
                key={option.id}
                type="button"
                className="hover:bg-muted w-full rounded px-3 py-2 text-left"
                onClick={() => {
                  onChange(option.id, option.companyName);
                  setQuery("");
                  setOpen(false);
                }}
              >
                <p className="font-medium">{option.companyName}</p>
                <p className="text-label-md text-muted-foreground">
                  {option.clientNo}
                  {option.city ? ` · ${option.city}` : ""}
                </p>
              </button>
            ))
          )}
        </div>
      ) : null}
      {value ? <input type="hidden" value={value} readOnly /> : null}
    </div>
  );
}
