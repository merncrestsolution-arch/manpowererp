"use client";

import Link from "next/link";
import { useMemo } from "react";

import {
  AvailabilityStatusBadge,
  availabilityColumnColors,
} from "@/components/deployment/availability-status-badge";
import { PageShell } from "@/components/shared/page-shell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import { useAvailabilityBoard } from "@/hooks/use-deployment";
import { formatColomboDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import { useAvailabilityStore } from "@/store/availability-store";

import type {
  EmployeeAvailabilityItem,
  EmployeeAvailabilityStatus,
} from "@/types/deployment";

function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

const columns: Array<{
  key: EmployeeAvailabilityStatus;
  title: string;
}> = [
  { key: "AVAILABLE", title: "Available" },
  { key: "DEPLOYED", title: "Deployed" },
  { key: "ON_LEAVE", title: "On Leave" },
];

function EmployeeCard({ employee }: { employee: EmployeeAvailabilityItem }) {
  return (
    <div className="bg-background p-jk-sm rounded-lg border">
      <div className="gap-jk-sm flex items-start">
        <Avatar size="sm">
          <AvatarFallback>
            {getInitials(employee.firstName, employee.lastName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">
            {employee.firstName} {employee.lastName}
          </p>
          <p className="text-label-md text-muted-foreground truncate">
            {employee.employeeNo}
            {employee.designation ? ` · ${employee.designation}` : ""}
          </p>
          {employee.currentClientName ? (
            <p className="text-label-md text-muted-foreground mt-1">
              {employee.currentClientName}
            </p>
          ) : null}
          {employee.leaveType ? (
            <p className="text-label-md text-muted-foreground mt-1">
              {employee.leaveType} until{" "}
              {employee.leaveEndDate
                ? formatColomboDate(new Date(employee.leaveEndDate))
                : "—"}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function AvailabilityBoard() {
  const {
    department,
    designation,
    search,
    viewMode,
    setDepartment,
    setDesignation,
    setSearch,
    setViewMode,
  } = useAvailabilityStore();

  const debouncedSearch = useDebounce(search);
  const { data: board, isLoading } = useAvailabilityBoard({
    department: department || undefined,
    designation: designation || undefined,
    search: debouncedSearch || undefined,
  });

  const grouped = useMemo(
    () => ({
      AVAILABLE: board?.available ?? [],
      DEPLOYED: board?.deployed ?? [],
      ON_LEAVE: board?.onLeave ?? [],
    }),
    [board],
  );

  const departments = useMemo(() => {
    const values = new Set<string>();
    for (const list of Object.values(grouped)) {
      for (const employee of list) {
        if (employee.department) {
          values.add(employee.department);
        }
      }
    }
    return Array.from(values).sort();
  }, [grouped]);

  const designations = useMemo(() => {
    const values = new Set<string>();
    for (const list of Object.values(grouped)) {
      for (const employee of list) {
        if (employee.designation) {
          values.add(employee.designation);
        }
      }
    }
    return Array.from(values).sort();
  }, [grouped]);

  if (isLoading) {
    return (
      <p className="text-body-md text-muted-foreground">
        Loading availability...
      </p>
    );
  }

  return (
    <PageShell
      title="Workforce availability"
      description="Live status computed from deployments and approved leave"
      actions={
        <Button
          variant="outline"
          className="h-9"
          render={<Link href="/deployment" />}
        >
          Deployments
        </Button>
      }
    >
      <div className="gap-jk-sm grid sm:grid-cols-4">
        {[
          { label: "Available", value: board?.summary.available ?? 0 },
          { label: "Deployed", value: board?.summary.deployed ?? 0 },
          { label: "On leave", value: board?.summary.onLeave ?? 0 },
          { label: "Total", value: board?.summary.total ?? 0 },
        ].map((item) => (
          <Card key={item.label} className="shadow-card">
            <CardContent className="pt-(--card-spacing)">
              <p className="text-label-md text-muted-foreground">
                {item.label}
              </p>
              <p className="font-heading text-headline-sm">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="gap-jk-sm flex flex-wrap items-center">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search employees..."
          className="max-w-sm"
        />
        <Select
          value={department}
          onChange={(event) => setDepartment(event.target.value)}
          className="w-[180px]"
        >
          <option value="">All departments</option>
          {departments.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </Select>
        <Select
          value={designation}
          onChange={(event) => setDesignation(event.target.value)}
          className="w-[180px]"
        >
          <option value="">All designations</option>
          {designations.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </Select>
        <div className="gap-jk-sm ml-auto flex">
          <Button
            variant={viewMode === "board" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("board")}
          >
            Board
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            List
          </Button>
        </div>
      </div>

      {viewMode === "board" ? (
        <div className="gap-jk-md flex overflow-x-auto pb-2">
          {columns.map((column) => (
            <div key={column.key} className="min-w-[280px] flex-1">
              <Card
                className={cn(
                  "shadow-card border-t-4",
                  availabilityColumnColors[column.key],
                )}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-body-md font-medium">
                      <AvailabilityStatusBadge status={column.key} />
                    </CardTitle>
                    <Badge variant="secondary">
                      {grouped[column.key].length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-jk-sm">
                  {grouped[column.key].length === 0 ? (
                    <p className="text-label-md text-muted-foreground py-4 text-center">
                      No employees
                    </p>
                  ) : (
                    grouped[column.key].map((employee) => (
                      <EmployeeCard key={employee.id} employee={employee} />
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <Card className="shadow-card">
          <CardContent className="overflow-x-auto pt-(--card-spacing)">
            <table className="text-body-md w-full text-left">
              <thead>
                <tr className="text-label-md text-muted-foreground border-b">
                  <th className="py-2 pr-4">Employee</th>
                  <th className="py-2 pr-4">Department</th>
                  <th className="py-2 pr-4">Designation</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2">Details</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ...grouped.AVAILABLE,
                  ...grouped.DEPLOYED,
                  ...grouped.ON_LEAVE,
                ].map((employee) => (
                  <tr key={employee.id} className="border-b">
                    <td className="py-3 pr-4">
                      {employee.firstName} {employee.lastName}
                      <p className="text-label-md text-muted-foreground">
                        {employee.employeeNo}
                      </p>
                    </td>
                    <td className="py-3 pr-4">{employee.department ?? "—"}</td>
                    <td className="py-3 pr-4">{employee.designation ?? "—"}</td>
                    <td className="py-3 pr-4">
                      <AvailabilityStatusBadge status={employee.status} />
                    </td>
                    <td className="py-3">
                      {employee.currentClientName ??
                        (employee.leaveType
                          ? `${employee.leaveType} leave`
                          : "—")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </PageShell>
  );
}
