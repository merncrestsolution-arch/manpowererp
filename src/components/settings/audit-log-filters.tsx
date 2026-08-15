"use client";

import { Search } from "lucide-react";

import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuditLogFiltersProps = {
  filters: {
    action: string;
    entityType: string;
    dateFrom: string;
    dateTo: string;
  };
  onChange: (filters: AuditLogFiltersProps["filters"]) => void;
};

export function AuditLogFilters({ filters, onChange }: AuditLogFiltersProps) {
  const hasFilters = Boolean(
    filters.action || filters.entityType || filters.dateFrom || filters.dateTo,
  );

  return (
    <DataTableToolbar className="items-end">
      <div className="grid w-full gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-1.5">
          <Label
            htmlFor="audit-action"
            className="text-muted-foreground text-[12px]"
          >
            Action
          </Label>
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              id="audit-action"
              placeholder="BACKUP_COMPLETED"
              value={filters.action}
              onChange={(event) =>
                onChange({ ...filters, action: event.target.value })
              }
              className="h-9 pl-9"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="audit-entity"
            className="text-muted-foreground text-[12px]"
          >
            Entity type
          </Label>
          <Input
            id="audit-entity"
            placeholder="Invoice, Employee…"
            value={filters.entityType}
            onChange={(event) =>
              onChange({ ...filters, entityType: event.target.value })
            }
            className="h-9"
          />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="audit-from"
            className="text-muted-foreground text-[12px]"
          >
            From
          </Label>
          <Input
            id="audit-from"
            type="date"
            value={filters.dateFrom}
            onChange={(event) =>
              onChange({ ...filters, dateFrom: event.target.value })
            }
            className="h-9"
          />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="audit-to"
            className="text-muted-foreground text-[12px]"
          >
            To
          </Label>
          <Input
            id="audit-to"
            type="date"
            value={filters.dateTo}
            onChange={(event) =>
              onChange({ ...filters, dateTo: event.target.value })
            }
            className="h-9"
          />
        </div>
      </div>
      {hasFilters ? (
        <Button
          type="button"
          variant="outline"
          className="h-9"
          onClick={() =>
            onChange({
              action: "",
              entityType: "",
              dateFrom: "",
              dateTo: "",
            })
          }
        >
          Clear
        </Button>
      ) : null}
    </DataTableToolbar>
  );
}
