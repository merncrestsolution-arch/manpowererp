"use client";

import { Pencil } from "lucide-react";
import Link from "next/link";

import { EmployeeAttendanceTab } from "@/components/employees/employee-attendance-tab";
import { EmployeeDocumentsTab } from "@/components/employees/employee-documents-tab";
import { EmployeeLeaveTab } from "@/components/employees/employee-leave-tab";
import { EmployeeShiftsTab } from "@/components/employees/employee-shifts-tab";
import { EmployeeStatusBadge } from "@/components/employees/employee-status-badge";
import { EmployeeSalaryComponentsTab } from "@/components/payroll/employee-salary-components-tab";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatColomboDate } from "@/lib/date";
import { formatCurrency } from "@/lib/format";

import type { EmployeeDetail } from "@/types/employee";

type EmployeeProfileTabsProps = {
  employee: EmployeeDetail;
  canApproveLeave?: boolean;
};

function OverviewTab({ employee }: { employee: EmployeeDetail }) {
  const fields = [
    { label: "Employee No", value: employee.employeeNo },
    { label: "Email", value: employee.email ?? "—" },
    { label: "Phone", value: employee.phone ?? "—" },
    { label: "NIC", value: employee.nic ?? "—" },
    {
      label: "Date of birth",
      value: employee.dateOfBirth
        ? formatColomboDate(new Date(employee.dateOfBirth), "dd MMM yyyy")
        : "—",
    },
    { label: "Gender", value: employee.gender ?? "—" },
    { label: "Department", value: employee.department ?? "—" },
    { label: "Designation", value: employee.designation ?? "—" },
    {
      label: "Employment type",
      value: employee.employmentType.replaceAll("_", " ").toLowerCase(),
    },
    {
      label: "Joined",
      value: employee.joinedAt
        ? formatColomboDate(new Date(employee.joinedAt), "dd MMM yyyy")
        : "—",
    },
    {
      label: "Basic salary",
      value:
        employee.basicSalary !== null
          ? formatCurrency(employee.basicSalary)
          : "—",
    },
    { label: "Address", value: employee.address ?? "—" },
  ];

  return (
    <Card className="shadow-card">
      <CardContent className="gap-jk-md grid pt-(--card-spacing) sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.label}>
            <p className="text-label-md text-muted-foreground">{field.label}</p>
            <p className="text-body-md mt-0.5 font-medium">{field.value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function AuditHistoryTab({ employee }: { employee: EmployeeDetail }) {
  const entries = [
    {
      label: "Created",
      value: formatColomboDate(new Date(employee.createdAt)),
      by: employee.createdBy ?? "System",
    },
    {
      label: "Last updated",
      value: formatColomboDate(new Date(employee.updatedAt)),
      by: employee.updatedBy ?? "System",
    },
    ...(employee.deletedAt
      ? [
          {
            label: "Deleted",
            value: formatColomboDate(new Date(employee.deletedAt)),
            by: employee.updatedBy ?? "System",
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-jk-sm">
      {entries.map((entry) => (
        <div
          key={entry.label}
          className="bg-card px-jk-md py-jk-sm rounded-lg border"
        >
          <p className="font-medium">{entry.label}</p>
          <p className="text-body-md text-muted-foreground">
            {entry.value} · {entry.by}
          </p>
        </div>
      ))}
    </div>
  );
}

export function EmployeeProfileTabs({
  employee,
  canApproveLeave = false,
}: EmployeeProfileTabsProps) {
  return (
    <div className="space-y-jk-lg">
      <div className="gap-jk-md flex flex-col sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-headline-md">
              {employee.firstName} {employee.lastName}
            </h1>
            <EmployeeStatusBadge status={employee.status} />
          </div>
          <p className="text-body-md text-muted-foreground">
            {employee.employeeNo}
            {employee.designation ? ` · ${employee.designation}` : ""}
            {employee.department ? ` · ${employee.department}` : ""}
          </p>
        </div>
        <Button render={<Link href={`/employees/${employee.id}/edit`} />}>
          <Pencil className="size-4" />
          Edit profile
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="leave">Leave</TabsTrigger>
          <TabsTrigger value="shifts">Shifts</TabsTrigger>
          <TabsTrigger value="salary">Salary</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="audit">Audit History</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <OverviewTab employee={employee} />
        </TabsContent>
        <TabsContent value="documents">
          <EmployeeDocumentsTab employeeId={employee.id} />
        </TabsContent>
        <TabsContent value="leave">
          <EmployeeLeaveTab
            employeeId={employee.id}
            canApprove={canApproveLeave}
          />
        </TabsContent>
        <TabsContent value="shifts">
          <EmployeeShiftsTab employeeId={employee.id} />
        </TabsContent>
        <TabsContent value="salary">
          <EmployeeSalaryComponentsTab employeeId={employee.id} />
        </TabsContent>
        <TabsContent value="attendance">
          <EmployeeAttendanceTab employeeId={employee.id} />
        </TabsContent>
        <TabsContent value="audit">
          <AuditHistoryTab employee={employee} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
