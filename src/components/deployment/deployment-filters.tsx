"use client";

import { Select } from "@/components/ui/select";

import type { DeploymentFilterOptions } from "@/types/deployment";

type DeploymentFiltersProps = {
  filters: {
    clientId: string;
    status: string;
    includeDeleted: boolean;
  };
  filterOptions?: DeploymentFilterOptions;
  isAdmin: boolean;
  onChange: (filters: {
    clientId: string;
    status: string;
    includeDeleted: boolean;
  }) => void;
};

export function DeploymentFilters({
  filters,
  filterOptions,
  isAdmin,
  onChange,
}: DeploymentFiltersProps) {
  return (
    <div className="gap-jk-sm flex flex-wrap items-center">
      <Select
        value={filters.clientId}
        onChange={(event) =>
          onChange({ ...filters, clientId: event.target.value })
        }
        className="w-[180px]"
      >
        <option value="">All clients</option>
        {filterOptions?.clients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.companyName}
          </option>
        ))}
      </Select>

      <Select
        value={filters.status}
        onChange={(event) =>
          onChange({ ...filters, status: event.target.value })
        }
        className="w-[160px]"
      >
        <option value="">All statuses</option>
        {filterOptions?.statuses.map((status) => (
          <option key={status} value={status}>
            {status.charAt(0) + status.slice(1).toLowerCase()}
          </option>
        ))}
      </Select>

      {isAdmin ? (
        <label className="text-label-md flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.includeDeleted}
            onChange={(event) =>
              onChange({ ...filters, includeDeleted: event.target.checked })
            }
          />
          Include deleted
        </label>
      ) : null}
    </div>
  );
}
