"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { createEmployeeSchema } from "@/application/dto/employee.schema";
import { FormSection } from "@/components/shared/forms/form-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { postApiData, patchApiData } from "@/lib/api-client";

import type { EmployeeDetail } from "@/types/employee";
import type { z } from "zod";

type EmployeeFormProps = {
  mode: "create" | "edit";
  employee?: EmployeeDetail;
};

function toDateInputValue(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

type EmployeeFormValues = z.input<typeof createEmployeeSchema>;

export function EmployeeForm({ mode, employee }: EmployeeFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      firstName: employee?.firstName ?? "",
      lastName: employee?.lastName ?? "",
      email: employee?.email ?? "",
      phone: employee?.phone ?? "",
      nic: employee?.nic ?? "",
      dateOfBirth: toDateInputValue(employee?.dateOfBirth),
      gender: employee?.gender ?? undefined,
      address: employee?.address ?? "",
      department: employee?.department ?? "",
      designation: employee?.designation ?? "",
      employmentType: employee?.employmentType ?? "PERMANENT",
      status: employee?.status ?? "ACTIVE",
      joinedAt: toDateInputValue(employee?.joinedAt),
      basicSalary: employee?.basicSalary ?? undefined,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);

    try {
      if (mode === "create") {
        const created = await postApiData<EmployeeDetail>(
          "/api/employees",
          values,
        );
        router.push(`/employees/${created.id}`);
        return;
      }

      if (!employee) {
        return;
      }

      await patchApiData<EmployeeDetail>(
        `/api/employees/${employee.id}`,
        values,
      );
      router.push(`/employees/${employee.id}`);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to save employee",
      );
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      className="gap-jk-lg mx-auto flex max-w-3xl flex-col"
    >
      <FormSection
        title="Personal information"
        description="Basic employee details"
      >
        <div className="gap-jk-md grid sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" {...form.register("firstName")} />
            {form.formState.errors.firstName ? (
              <p className="text-label-md text-destructive">
                {form.formState.errors.firstName.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" {...form.register("lastName")} />
            {form.formState.errors.lastName ? (
              <p className="text-label-md text-destructive">
                {form.formState.errors.lastName.message}
              </p>
            ) : null}
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
            <Label htmlFor="dateOfBirth">Date of birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              {...form.register("dateOfBirth")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select id="gender" {...form.register("gender")}>
              <option value="">Select gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </Select>
          </div>
        </div>
        <div className="mt-jk-md space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea id="address" {...form.register("address")} />
        </div>
      </FormSection>

      <FormSection
        title="Employment details"
        description="Role and compensation"
      >
        <div className="gap-jk-md grid sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input id="department" {...form.register("department")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="designation">Designation</Label>
            <Input id="designation" {...form.register("designation")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="employmentType">Employment type</Label>
            <Select id="employmentType" {...form.register("employmentType")}>
              <option value="PERMANENT">Permanent</option>
              <option value="CONTRACT">Contract</option>
              <option value="TEMPORARY">Temporary</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select id="status" {...form.register("status")}>
              <option value="ACTIVE">Active</option>
              <option value="ON_LEAVE">On Leave</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="TERMINATED">Terminated</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="joinedAt">Joined date</Label>
            <Input id="joinedAt" type="date" {...form.register("joinedAt")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="basicSalary">Basic salary (LKR)</Label>
            <Input
              id="basicSalary"
              type="number"
              min={0}
              {...form.register("basicSalary", { valueAsNumber: true })}
            />
          </div>
        </div>
      </FormSection>

      {error ? <p className="text-body-md text-destructive">{error}</p> : null}

      <div className="gap-jk-sm flex justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {mode === "create" ? "Create employee" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
