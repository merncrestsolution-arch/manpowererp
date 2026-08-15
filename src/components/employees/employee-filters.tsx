"use client";

import { Filter, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Select } from "@/components/ui/select";
import { defaultEmployeeFilters } from "@/hooks/use-debounce";

import type { EmployeeFiltersState } from "@/hooks/use-debounce";
import type { EmployeeFilterOptions } from "@/types/employee";

type EmployeeFiltersProps = {
  filters: EmployeeFiltersState;
  filterOptions?: EmployeeFilterOptions;
  onChange: (filters: EmployeeFiltersState) => void;
  showDeletedToggle?: boolean;
};

export function EmployeeFilters({
  filters,
  filterOptions,
  onChange,
  showDeletedToggle = false,
}: EmployeeFiltersProps) {
  const activeCount = [
    filters.department,
    filters.designation,
    filters.employmentType,
    filters.status,
    filters.includeDeleted,
  ].filter(Boolean).length;

  const update = (patch: Partial<EmployeeFiltersState>) => {
    onChange({ ...filters, ...patch });
  };

  return (
    <div className="gap-jk-sm flex flex-wrap items-center">
      <Popover>
        <PopoverTrigger
          render={
            <Button variant="outline" size="sm">
              <Filter className="size-4" />
              Filters
              {activeCount > 0 ? (
                <Badge variant="secondary" className="ml-1">
                  {activeCount}
                </Badge>
              ) : null}
            </Button>
          }
        />
        <PopoverContent className="space-y-jk-md w-80">
          <div className="space-y-2">
            <Label htmlFor="department-filter">Department</Label>
            <Select
              id="department-filter"
              value={filters.department}
              onChange={(event) => update({ department: event.target.value })}
            >
              <option value="">All departments</option>
              {filterOptions?.departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="designation-filter">Designation</Label>
            <Select
              id="designation-filter"
              value={filters.designation}
              onChange={(event) => update({ designation: event.target.value })}
            >
              <option value="">All designations</option>
              {filterOptions?.designations.map((designation) => (
                <option key={designation} value={designation}>
                  {designation}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="employment-type-filter">Employment type</Label>
            <Select
              id="employment-type-filter"
              value={filters.employmentType}
              onChange={(event) =>
                update({
                  employmentType: event.target
                    .value as EmployeeFiltersState["employmentType"],
                })
              }
            >
              <option value="">All types</option>
              <option value="PERMANENT">Permanent</option>
              <option value="CONTRACT">Contract</option>
              <option value="TEMPORARY">Temporary</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status-filter">Status</Label>
            <Select
              id="status-filter"
              value={filters.status}
              onChange={(event) =>
                update({
                  status: event.target.value as EmployeeFiltersState["status"],
                })
              }
            >
              <option value="">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="ON_LEAVE">On Leave</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="TERMINATED">Terminated</option>
            </Select>
          </div>
          {showDeletedToggle ? (
            <label className="text-body-md flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.includeDeleted}
                onChange={(event) =>
                  update({ includeDeleted: event.target.checked })
                }
              />
              Include deleted employees
            </label>
          ) : null}
        </PopoverContent>
      </Popover>
      {activeCount > 0 ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange(defaultEmployeeFilters)}
        >
          <X className="size-4" />
          Clear filters
        </Button>
      ) : null}
      {filters.department ? (
        <Badge variant="outline">Dept: {filters.department}</Badge>
      ) : null}
      {filters.designation ? (
        <Badge variant="outline">Role: {filters.designation}</Badge>
      ) : null}
      {filters.employmentType ? (
        <Badge variant="outline">Type: {filters.employmentType}</Badge>
      ) : null}
      {filters.status ? (
        <Badge variant="outline">Status: {filters.status}</Badge>
      ) : null}
    </div>
  );
}
