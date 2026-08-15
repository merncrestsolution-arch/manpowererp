"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

import type { InvoiceFiltersState } from "@/hooks/use-invoices";

type InvoiceFiltersProps = {
  filters: InvoiceFiltersState;
  filterOptions?: {
    clients: { id: string; name: string }[];
    statuses: string[];
  };
  isAdmin: boolean;
  onChange: (filters: InvoiceFiltersState) => void;
};

export function InvoiceFilters({
  filters,
  filterOptions,
  isAdmin,
  onChange,
}: InvoiceFiltersProps) {
  return (
    <div className="gap-jk-sm flex flex-wrap items-center">
      <Select
        value={filters.clientId}
        onChange={(e) => onChange({ ...filters, clientId: e.target.value })}
        className="h-9 w-[160px]"
      >
        <option value="">All clients</option>
        {filterOptions?.clients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.name}
          </option>
        ))}
      </Select>

      <Select
        value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value })}
        className="h-9 w-[140px]"
      >
        <option value="">All statuses</option>
        {filterOptions?.statuses.map((status) => (
          <option key={status} value={status}>
            {status.replaceAll("_", " ")}
          </option>
        ))}
      </Select>

      <Input
        type="date"
        value={filters.dateFrom}
        onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
        className="h-9 w-[150px]"
      />
      <Input
        type="date"
        value={filters.dateTo}
        onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
        className="h-9 w-[150px]"
      />

      {isAdmin ? (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.includeDeleted}
            onChange={(e) =>
              onChange({ ...filters, includeDeleted: e.target.checked })
            }
          />
          Include deleted
        </label>
      ) : null}
    </div>
  );
}
