"use client";

import { MapPin, QrCode, Search } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";

import { createAttendanceColumns } from "@/components/attendance/attendance-table-columns";
import { QrCheckpointGenerator } from "@/components/attendance/qr-checkpoint-generator";
import { DataTable } from "@/components/shared/data-table/data-table";
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar";
import { PageShell } from "@/components/shared/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  defaultAttendanceFilters,
  useAttendanceList,
} from "@/hooks/use-attendance";
import { useDebounce } from "@/hooks/use-debounce";
import { canManageAttendance } from "@/infrastructure/auth/roles";

import type { SortingState } from "@tanstack/react-table";

export function AttendanceTable() {
  const { data: session } = useSession();
  const isManager = session?.user?.role
    ? canManageAttendance(session.user.role)
    : false;
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([
    { id: "date", desc: true },
  ]);
  const [filters, setFilters] = useState(defaultAttendanceFilters);
  const [searchInput, setSearchInput] = useState("");

  const debouncedSearch = useDebounce(searchInput);
  const activeFilters = { ...filters, search: debouncedSearch };
  const sortBy = sorting[0]?.id ?? "date";
  const sortOrder = sorting[0]?.desc ? "desc" : "asc";

  const { data, isLoading, isError } = useAttendanceList({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    filters: activeFilters,
    sortBy,
    sortOrder,
  });

  const columns = useMemo(() => createAttendanceColumns(), []);

  return (
    <PageShell
      title="Attendance"
      description="Track check-ins, timesheets, and overtime."
      actions={
        <>
          <Button
            variant="outline"
            className="h-9"
            render={<Link href="/attendance/check-in/qr" />}
          >
            <QrCode className="size-4" />
            QR check-in
          </Button>
          <Button
            variant="outline"
            className="h-9"
            render={<Link href="/attendance/check-in/gps" />}
          >
            <MapPin className="size-4" />
            GPS check-in
          </Button>
          {isManager ? (
            <>
              <Button
                variant="outline"
                className="h-9"
                render={<Link href="/attendance/manual" />}
              >
                Manual entry
              </Button>
              <Button
                variant="outline"
                className="h-9"
                render={<Link href="/attendance/timesheets" />}
              >
                Timesheets
              </Button>
              <Button
                variant="outline"
                className="h-9"
                render={<Link href="/attendance/overtime" />}
              >
                Overtime
              </Button>
            </>
          ) : null}
        </>
      }
    >
      {isManager ? (
        <>
          <DataTableToolbar>
            <div className="relative w-full max-w-sm">
              <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                className="h-9 pl-9"
                placeholder="Search employees..."
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
            </div>
            <Select
              className="h-9 w-full max-w-[180px]"
              value={filters.status}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  status: event.target.value,
                }))
              }
            >
              <option value="">All statuses</option>
              <option value="PRESENT">Present</option>
              <option value="LATE">Late</option>
              <option value="ABSENT">Absent</option>
              <option value="HALF_DAY">Half day</option>
              <option value="ON_LEAVE">On leave</option>
            </Select>
          </DataTableToolbar>

          <DataTable
            columns={columns}
            data={data?.items ?? []}
            pageCount={data?.totalPages ?? 1}
            totalRows={data?.total ?? 0}
            pagination={pagination}
            onPaginationChange={setPagination}
            sorting={sorting}
            onSortingChange={setSorting}
            isLoading={isLoading}
            errorMessage={
              isError
                ? "Couldn't load attendance. Refresh the page and try again."
                : null
            }
            emptyMessage="No attendance records found."
          />

          <QrCheckpointGenerator />
        </>
      ) : (
        <div className="border-border bg-card shadow-card rounded-2xl border p-8 text-center">
          <p className="font-heading text-foreground text-[16px] font-semibold">
            Record today’s attendance
          </p>
          <p className="text-muted-foreground mt-1 text-[14px]">
            Use QR or GPS check-in to clock in for your shift.
          </p>
        </div>
      )}
    </PageShell>
  );
}
