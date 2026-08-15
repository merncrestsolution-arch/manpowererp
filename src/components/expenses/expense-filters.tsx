"use client";

import { Select } from "@/components/ui/select";

import type { ExpenseFiltersState } from "@/hooks/use-expenses";
import type { ExpenseFilterOptions } from "@/types/expense";

type ExpenseFiltersProps = {
  filters: ExpenseFiltersState;
  filterOptions?: ExpenseFilterOptions;
  isAdmin: boolean;
  onChange: (filters: ExpenseFiltersState) => void;
};

export function ExpenseFilters({
  filters,
  filterOptions,
  isAdmin,
  onChange,
}: ExpenseFiltersProps) {
  return (
    <div className="gap-jk-sm flex flex-wrap items-center">
      <Select
        value={filters.categoryId}
        onChange={(event) =>
          onChange({ ...filters, categoryId: event.target.value })
        }
        className="w-[180px]"
      >
        <option value="">All categories</option>
        {filterOptions?.categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
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

      <Select
        value={filters.paidById}
        onChange={(event) =>
          onChange({ ...filters, paidById: event.target.value })
        }
        className="w-[180px]"
      >
        <option value="">All submitters</option>
        {filterOptions?.submitters.map((submitter) => (
          <option key={submitter.id} value={submitter.id}>
            {submitter.name}
          </option>
        ))}
      </Select>

      <input
        type="date"
        value={filters.dateFrom}
        onChange={(event) =>
          onChange({ ...filters, dateFrom: event.target.value })
        }
        className="border-input bg-background h-9 rounded-md border px-3 text-sm"
      />
      <input
        type="date"
        value={filters.dateTo}
        onChange={(event) =>
          onChange({ ...filters, dateTo: event.target.value })
        }
        className="border-input bg-background h-9 rounded-md border px-3 text-sm"
      />

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
