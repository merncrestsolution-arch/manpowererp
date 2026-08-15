"use client";

import { useSession } from "next-auth/react";
import { use } from "react";

import { EmployeeProfileTabs } from "@/components/employees/employee-profile-tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmployee } from "@/hooks/use-employees";
import { canApproveLeave } from "@/infrastructure/auth/roles";

type EmployeeProfilePageProps = {
  params: Promise<{ id: string }>;
};

export default function EmployeeProfilePage({
  params,
}: EmployeeProfilePageProps) {
  const { id } = use(params);
  const { data: session } = useSession();
  const { data: employee, isLoading, isError } = useEmployee(id);

  if (isLoading) {
    return (
      <div className="max-w-container space-y-jk-md mx-auto">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !employee) {
    return (
      <div className="max-w-container bg-card p-jk-lg mx-auto rounded-xl border text-center">
        <p className="font-medium">Employee not found</p>
        <p className="text-body-md text-muted-foreground">
          The employee record may have been removed or you may not have access.
        </p>
      </div>
    );
  }

  const role = session?.user?.role;

  return (
    <div className="max-w-container mx-auto">
      <EmployeeProfileTabs
        employee={employee}
        canApproveLeave={role ? canApproveLeave(role) : false}
      />
    </div>
  );
}
