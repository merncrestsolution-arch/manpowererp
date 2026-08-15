"use client";

import { use } from "react";

import { EmployeeForm } from "@/components/employees/employee-form";
import { PageShell } from "@/components/shared/page-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmployee } from "@/hooks/use-employees";

type EditEmployeePageProps = {
  params: Promise<{ id: string }>;
};

export default function EditEmployeePage({ params }: EditEmployeePageProps) {
  const { id } = use(params);
  const { data: employee, isLoading, isError } = useEmployee(id);

  if (isLoading) {
    return (
      <PageShell title="Edit employee" description="Loading employee details.">
        <div className="space-y-jk-md">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-96 w-full" />
        </div>
      </PageShell>
    );
  }

  if (isError || !employee) {
    return (
      <PageShell title="Edit employee" description="Update employee details.">
        <div className="bg-card p-jk-lg rounded-xl border text-center">
          <p className="font-medium">Employee not found</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Edit employee"
      description={`Update details for ${employee.firstName} ${employee.lastName}.`}
    >
      <EmployeeForm mode="edit" employee={employee} />
    </PageShell>
  );
}
